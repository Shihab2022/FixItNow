import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    date: new Date(),
  });
};

export const testingRoute = (req: Request, res: Response) => {
  res.send({
    message: `Hi Guys, Welcome to FixItNow Server !`,
  });
};
