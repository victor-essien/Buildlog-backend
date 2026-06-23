import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "@/types/auth.types";
import { setRefreshCookie, clearRefreshCookie } from "@/utils/helpers";

const authService = new AuthService();

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    setRefreshCookie(res, result.tokens.refreshToken ?? "");
    return res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.tokens.refreshToken ?? "");
    return res.status(200).json({ success: true, data: result });
  }),

  googleAuth: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.googleAuth(req.body.token);
    setRefreshCookie(res, result.tokens.refreshToken ?? "");
    return res.status(200).json({ success: true, data: result });
  }),

  completeOnboarding: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      await authService.completeOnboarding(req.user.id, req.body);
      return res
        .status(200)
        .json({ success: true, message: "Onboarding completed" });
    },
  ),

  requestPasswordReset: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.requestPasswordReset(req.body);
    return res.status(200).json({ success: true, data: result });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);
    return res.status(200).json({ success: true, data: result });
  }),

  changePassword: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      await authService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword,
        req.body.confirmPassword,
      );
      return res
        .status(200)
        .json({ success: true, message: "Password changed successfully" });
    },
  ),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    clearRefreshCookie(res);
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  }),
};
