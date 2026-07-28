import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpars/catchAsync";
import sendResponse from "../../helpars/sendResponse";
import { ReviewsService } from "./reviews.service";
import { IAuthUser } from "../../types";

const CreateReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const data = await ReviewsService.CreateReview({
      ...req.body,
      customerId: req.user?.id,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review created successfully!",
      data,
    });
  },
);

export const ReviewsController = {
  CreateReview,
};
