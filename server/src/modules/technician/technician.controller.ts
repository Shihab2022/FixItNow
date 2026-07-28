import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpars/catchAsync";
import sendResponse from "../../helpars/sendResponse";
import { TechnicianService } from "./technician.service";
import { IAuthUser } from "../../types";
import ApiError from "../../helpars/ApiError";

const UpdateProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const data = await TechnicianService.UpdateProfile(req.user.id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully!",
      data,
    });
  },
);
const UpdateAvailability = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const data = await TechnicianService.UpdateAvailability(
      req.user.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Availability updated successfully!",
      data,
    });
  },
);
const GetBookingHistory = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const data = await TechnicianService.GetBookingHistory(
      req.user.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Booking history retrieved successfully!",
      data,
    });
  },
);
const UpdateBookingStatus = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const data = await TechnicianService.UpdateBookingStatus(
      req.user.id as string,
      req.params.id as string,
      req.body.status,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Booking status updated successfully!",
      data,
    });
  },
);

export const TechnicianController = {
  UpdateProfile,
  UpdateAvailability,
  GetBookingHistory,
  UpdateBookingStatus,
};
