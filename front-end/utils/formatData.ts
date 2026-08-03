/* eslint-disable @typescript-eslint/no-explicit-any */

export const formatBookingDataForPdf = (booking: any) => {
  const payments = {
    id: booking.id,
    amount: booking.totalPrice,
    paymentGatewayData: {
      transactionId: booking.transactionId ?? "",
    },
    status: booking.paymentStatus,
    paidAt: booking.updatedAt,
    transactionId: booking.transactionId ?? "",
    bookingId: booking.id,
    customerId: booking.customerId,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    booking: {
      id: booking.id,
      status: booking.status,
      scheduledDate: booking.scheduledDate,
      totalPrice: booking.totalPrice,
      customerAddress: booking.customerAddress,
      notes: booking.notes,
      scheduledTime: booking.scheduledTime,
      paymentStatus: booking.paymentStatus,
      customerId: booking.customerId,
      technicianId: booking.technicianId,
      serviceId: booking.serviceId,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,

      service: {
        id: booking.service?.id,
        title: booking.service?.title,
        description: booking.service?.description,
        price: booking.service?.price,
        location: booking.service?.location,
        status: booking.service?.status,
      },
    },
  };

  return payments;
};
