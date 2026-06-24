import { Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { UserService } from "./user.service";
import { AuthenticatedRequest } from "@/types/auth.types";
import {sendSuccess, sendError, sendCreated} from "@/utils/apiResponse";
const userService = new UserService();

export const userController = {
  getProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
     return sendError(res, 401, "Unauthorized");
    }

    const data = await userService.getProfile(req.user.id);
     sendSuccess(res, 200, "Profile retrieved successfully", data);
  }),

  updateProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const data = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, 200, "Profile updated successfully", data);
  }),

  completeOnboarding: asyncHandler(
     async (req: AuthenticatedRequest, res: Response) => {
       if (!req.user) {
         return sendError(res, 401, "Unauthorized");
       }
 
       await userService.completeOnboarding(req.user.id, req.body);
       return sendSuccess(res, 200, "Onboarding completed");
     },
   ),
 
  updateReminder: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const data = await userService.updateReminder(req.user.id, req.body);
    return sendSuccess(res, 200, "Reminder settings updated", data);
  }),
};
