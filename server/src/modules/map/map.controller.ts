import { Request, Response } from "express";
import catchAsync from "../../helpars/catchAsync";
import sendResponse from "../../helpars/sendResponse";
import httpStatus from "http-status";
import { MapService } from "./map.service";
import { IAuthUser } from "../../types";
import ApiError from "../../helpars/ApiError";

const getNearbyTechnicians = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MapService.listNearbyTechnicians({
      latitude: Number(req.query.latitude),
      longitude: Number(req.query.longitude),
      radiusKm: Number(req.query.radiusKm),
      categoryId: req.query.categoryId as string | undefined,
      q: req.query.q as string | undefined,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Nearby technicians fetched successfully!",
      data: result,
    });
  },
);

const getNearbyTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await MapService.listNearbyTasks({
    latitude: Number(req.query.latitude),
    longitude: Number(req.query.longitude),
    radiusKm: Number(req.query.radiusKm),
    categoryId: req.query.categoryId as string | undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Nearby tasks fetched successfully!",
    data: result,
  });
});

const postLocation = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await MapService.saveLocation({
      userId: req.user.id,
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      address: req.body.address,
      label: req.body.label,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Location saved successfully!",
      data: result,
    });
  },
);

const getLastLocation = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await MapService.getLastLocation(req.user.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Last location fetched successfully!",
      data: result,
    });
  },
);

const getLocationHistory = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await MapService.getLocationHistory(req.user.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Location history fetched successfully!",
      data: result,
    });
  },
);

const getNearbyUsers = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await MapService.listNearbyUsers({
      latitude: Number(req.query.latitude),
      longitude: Number(req.query.longitude),
      radiusKm: Number(req.query.radiusKm),
      categoryId: req.query.categoryId as string | undefined,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Nearby users fetched successfully!",
      data: result,
    });
  },
);

export const MapController = {
  getNearbyTechnicians,
  getNearbyTasks,
  postLocation,
  getLastLocation,
  getLocationHistory,
  getNearbyUsers,
};