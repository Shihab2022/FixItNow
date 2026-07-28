import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpars/catchAsync";
import sendResponse from "../../helpars/sendResponse";
import { AdminService } from "./admin.service";

const GetAllUsers = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.GetAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully!",
    data,
  });
});
const UpdateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.UpdateUserStatus({
    id: req.params.id as string,
    status: req.body.status,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully!",
    data,
  });
});
const GetAllBookings = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.GetAllBookings();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookings retrieved successfully!",
    data,
  });
});
const GetAllCategories = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.GetAllCategories();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully!",
    data,
  });
});
const CreateCategory = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.CreateCategory(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category created successfully!",
    data,
  });
});

export const AdminController = {
  GetAllUsers,
  UpdateUserStatus,
  GetAllBookings,
  GetAllCategories,
  CreateCategory,
};
