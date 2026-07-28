import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";

import httpStatus from "http-status";
import ApiError from "../helpars/ApiError";
import config from "../config";
import { verifyJwtToken } from "../helpars/jwtHelpers";

const auth = (...roles: string[]) => {
  const errorMessage = "You are not authorized";
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { accessToken: token } = req.cookies;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, errorMessage);
      }
      const verifyUser = verifyJwtToken(token, config.jwt_access_secret);
      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, errorMessage);
      }
      req.user = verifyUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
