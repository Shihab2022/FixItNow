import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpars/catchAsync";
import sendResponse from "../../helpars/sendResponse";
import { JobRequestServices } from "./jobRequests.service";
import { IAuthUser } from "../../types";

type AuthedRequest = Request & { user?: IAuthUser };

const createJobRequest = catchAsync(async (req: AuthedRequest, res: Response) => {
  const result = await JobRequestServices.createJobRequest(req.user!, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Task posted successfully!",
    data: result,
  });
});

const listJobRequests = catchAsync(async (req: AuthedRequest, res: Response) => {
  const result = await JobRequestServices.listJobRequests(
    req.user!,
    req.query as any,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks fetched successfully!",
    data: result,
  });
});

const getJobRequestById = catchAsync(async (req: Request, res: Response) => {
  const result = await JobRequestServices.getJobRequestById(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task fetched successfully!",
    data: result,
  });
});

const applyToJobRequest = catchAsync(async (req: AuthedRequest, res: Response) => {
  const result = await JobRequestServices.applyToJobRequest(
    req.user!,
    req.params.id as string,
    req.body?.message,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Application sent! The customer will be notified by email.",
    data: result,
  });
});

const getJobRequestApplications = catchAsync(
  async (req: AuthedRequest, res: Response) => {
    const result = await JobRequestServices.getJobRequestApplications(
      req.user!,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Applications fetched successfully!",
      data: result,
    });
  },
);

const acceptApplication = catchAsync(async (req: AuthedRequest, res: Response) => {
  const result = await JobRequestServices.acceptApplication(
    req.user!,
    req.params.id as string,
    req.params.applicationId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application accepted! The technician has been notified.",
    data: result,
  });
});

const getMyApplications = catchAsync(async (req: AuthedRequest, res: Response) => {
  const result = await JobRequestServices.getMyApplications(req.user!);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My applications fetched successfully!",
    data: result,
  });
});

export const JobRequestController = {
  createJobRequest,
  listJobRequests,
  getJobRequestById,
  applyToJobRequest,
  getJobRequestApplications,
  acceptApplication,
  getMyApplications,
};