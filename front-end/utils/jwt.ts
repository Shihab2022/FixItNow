/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const getToken = () => {
  return localStorage.getItem("accessToken") || null;
};
export const jwtUtils = {
  verifyToken,
  getToken,
};
