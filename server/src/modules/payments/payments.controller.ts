import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpars/catchAsync";
import sendResponse from "../../helpars/sendResponse";
import { PaymentsService } from "./payments.service";
import { IAuthUser } from "../../types";

const create = catchAsync(async (req: Request, res: Response) => {
  const data = await PaymentsService.create(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment created successfully!",
    data,
  });
});
const confirm = catchAsync(async (req: Request, res: Response) => {
  const data = await PaymentsService.confirm(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment confirmed successfully!",
    data,
  });
});
const GetPaymentHistory = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const data = await PaymentsService.GetPaymentHistory(req.user?.id!);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment history retrieved successfully!",
      data,
    });
  },
);
const GetPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const data = await PaymentsService.GetPaymentDetails(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment details retrieved successfully!",
    data,
  });
});

export const PaymentsController = {
  create,
  confirm,
  GetPaymentHistory,
  GetPaymentDetails,
};
