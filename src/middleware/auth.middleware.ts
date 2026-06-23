import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken } from "@/utils/jwt";
import { asyncHandler } from "@/middleware/asyncHandler";
import {
  RateLimitError,
  AuthenticationError,
  AuthorizationError,
} from "./error.middleware";
import prisma from "@/config/db"
// import {AuthRequest} from "@/types/auth.types";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer")) {
    throw new AuthenticationError("Not authenticated");
  }

  const token = auth.split(" ")[1];
  if (!token) {
    throw new AuthenticationError("Token not provided");
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded as typeof req.user;
    return next();
  } catch (error) {
    return next(new AuthenticationError("Invalid or expired token"));
  }
};


