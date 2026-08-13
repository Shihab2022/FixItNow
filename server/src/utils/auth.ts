import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { Response } from "express";
import config from "../config";

export const createToken = (
  jwtPayload: any,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(jwtPayload, secret || (config.jwt_access_secret as string), {
    expiresIn,
  });
};

export const setTokenOnCookie = (token: string, res: Response) => {
  res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });
};

export const jwtVerify = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};
