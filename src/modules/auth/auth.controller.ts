import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "@/types/auth.types";
import { setRefreshCookie, clearRefreshCookie } from "@/utils/helpers";
import { sendSuccess, sendError, sendCreated } from "@/utils/apiResponse";
const authService = new AuthService();

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    setRefreshCookie(res, result.tokens.refreshToken ?? "");
    return sendCreated(res, "User created successfully", result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.tokens.refreshToken ?? "");
    return sendSuccess(res, 200, "Login successful", result);
  }),

  googleAuth: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.googleAuth(req.body.token);
    setRefreshCookie(res, result.tokens.refreshToken ?? "");
    return sendSuccess(res, 200, "Google authentication successful", result);
  }),

  requestPasswordReset: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.requestPasswordReset(req.body);
    return  sendSuccess(res, 200, "Password reset requested", result);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);
    return sendSuccess(res, 200, "Password reset successfully", result);
  }),

  changePassword: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        return sendError(res, 401, "Unauthorized");
      }

      await authService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword,
        req.body.confirmPassword,
      );
      return sendSuccess(res, 200, "Password changed successfully");
    },
  ),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    clearRefreshCookie(res);
    return sendSuccess(res, 200, "Logged out successfully");
  }),
};
