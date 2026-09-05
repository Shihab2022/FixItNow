import { BookingStatus, PaymentStatus } from "../../../generated/prisma/client";
import ApiError from "../../helpars/ApiError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { ssl } from "../SSL/ssl.service";
import {
  BookingPayload,
  NotificationService,
} from "../../services/notification.service";

/** Wraps email dispatch so a broken SMTP/queue never blocks the core payment flow */
const safeNotify = async (action: () => Promise<void>): Promise<void> => {
  try {
    await action();
  } catch (err) {
    console.error("[Notification] Email could not be sent:", err);
  }
};

const create = async (appointmentDetails: any) => {
  const { bookingId } = appointmentDetails;
  const paymentData = await prisma.booking.findFirst({
    where: {
      id: bookingId,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      payment: true,
    },
  });
  if (!paymentData) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment information not found!",
    );
  }

  if (paymentData.payment?.status === PaymentStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment has already been made for this booking!",
    );
  }
  if (!paymentData.payment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment information not found!",
    );
  }
  const paymentSession = await ssl.initPayment({
    amount: paymentData.totalPrice,
    name: paymentData.customer.name,
    transactionId: paymentData.payment.transactionId,
    email: paymentData.customer.email,
    address: paymentData.customer.address,
    phoneNumber: paymentData.customer.phone,
  });

  return {
    paymentUrl: paymentSession.GatewayPageURL,
  };
};

const confirm = async (payload: any) => {
  const response = payload;

  const payment = await prisma.payment.findUnique({
    where: { transactionId: response.transactionId },
    include: {
      booking: {
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, title: true } },
          technician: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found.");
  }
  if (payment.status === PaymentStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment has already been processed for this booking.",
    );
  }

  await prisma.$transaction(async (tx) => {
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: response.transactionId,
      },
      data: {
        status: PaymentStatus.COMPLETED,
        paymentGatewayData: response,
      },
    });

    const bookingUpdateData: any = { paymentStatus: PaymentStatus.COMPLETED };
    if (
      payment.booking.status !== BookingStatus.CANCELLED &&
      payment.booking.status !== BookingStatus.COMPLETED
    ) {
      bookingUpdateData.status = BookingStatus.PAID;
    }

    await tx.booking.update({
      where: {
        id: updatedPaymentData.bookingId,
      },
      data: bookingUpdateData,
    });
  });

  // Notify customer + technician that the payment was successful
  await safeNotify(async () => {
    const notifPayload: BookingPayload = {
      id: payment.booking.id,
      scheduledDate: payment.booking.scheduledDate,
      scheduledTime: payment.booking.scheduledTime,
      customerAddress: payment.booking.customerAddress,
      totalPrice: payment.booking.totalPrice,
      customer: payment.booking.customer as BookingPayload["customer"],
      technician: payment.booking.technician as BookingPayload["technician"],
      service: payment.booking.service as BookingPayload["service"],
    };
    await NotificationService.sendPaymentSuccess({
      id: payment.id,
      amount: payment.amount,
      transactionId: payment.transactionId,
      booking: notifPayload,
    });
  });

  return payment;
};
const GetPaymentHistory = async (id: string) => {
  const paymentHistory = await prisma.payment.findMany({
    where: {
      customerId: id,
    },
    orderBy: {
      createdAt: "desc", // latest payments first
    },
    include: {
      booking: {
        select: {
          id: true,
          totalPrice: true,
          status: true,
          serviceId: true,
          service: true,
          technician: true,
        },
      },
    },
  });
  return paymentHistory;
};
const GetPaymentDetails = async (bookingId: string) => {
  const paymentDetails = await prisma.payment.findUniqueOrThrow({
    where: {
      bookingId,
    },
    include: {
      booking: true,
    },
  });
  return paymentDetails;
};

export const PaymentsService = {
  create,
  confirm,
  GetPaymentHistory,
  GetPaymentDetails,
};
