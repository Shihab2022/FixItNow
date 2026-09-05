import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpars/catchAsync";
import sendResponse from "../../helpars/sendResponse";
import { BookingsService } from "./bookings.services";
import { IAuthUser } from "../../types";
import ApiError from "../../helpars/ApiError";

const CreateNewBooking = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const data = await BookingsService.CreateNewBooking(req);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "New booking created successfully!",
      data,
    });
  },
);
const GetUserBookings = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const data = await BookingsService.GetUserBookings(req.user.id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User bookings retrieved successfully!",
      data,
    });
  },
);
const GetBookingDetails = catchAsync(async (req: Request, res: Response) => {
  const data = await BookingsService.GetBookingDetails(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking details retrieved successfully!",
    data,
  });
});
const GetTechnicianAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const { technicianId, date } = req.query;
    const data = await BookingsService.GetTechnicianAvailability(
      technicianId as string,
      date as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Available time slots retrieved successfully!",
      data,
    });
  },
);

const CancelBookingByCustomer = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const data = await BookingsService.CancelBookingByCustomer(
      req.user.id as string,
      req.params.id as string,
      req.body?.cancellationReason as string | undefined,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Booking cancelled successfully!",
      data,
    });
  },
);

export const BookingsController = {
  CreateNewBooking,
  GetUserBookings,
  GetBookingDetails,
  GetTechnicianAvailability,
  CancelBookingByCustomer,
};
