import { Request, Response } from "express";
import catchAsync from "../../helpars/catchAsync";
import sendResponse from "../../helpars/sendResponse";
import httpStatus from "http-status";
import { MapService } from "./map.service";

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

export const MapController = {
  getNearbyTechnicians,
  getNearbyTasks,
};