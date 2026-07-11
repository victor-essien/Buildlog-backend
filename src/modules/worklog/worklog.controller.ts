import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { WorkLogService } from "./worklog.service";
import { sendSuccess, sendCreated } from "@/utils/apiResponse";
import { AuthenticatedRequest } from "@/types/auth.types";
const workLogService = new WorkLogService();

export const worklogController = {
  getWorklogs: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const worklogs = await workLogService.getWorklogsByUserId(req.user.id);
      return sendSuccess(res, 200, "Worklogs retrieved successfully", worklogs);
    },
  ),

  getWorklogById: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      let { id } = req.params;
      let workLogId = id as string;

      if (!id) {
        return res.status(400).json({ message: "Worklog ID is required" });
      }
      // params can be string or string[]; ensure we pass a string

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const worklog = await workLogService.getWorklogById(workLogId);
      return sendSuccess(res, 200, "Worklog retrieved successfully", worklog);
    },
  ),

  getTodaysWorklogs: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const todaysWorklogs = await workLogService.getTodaysWorklogs(
        req.user.id,
      );
      return sendSuccess(
        res,
        200,
        "Worklogs retrieved successfully",
        todaysWorklogs,
      );
    },
  ),

  createWorklog: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const worklogInput = req.body;
      const newWorklog = await workLogService.createWorklog(
        req.user.id,
        worklogInput,
      );
      return sendCreated(res, "Worklog created successfully", newWorklog);
    },
  ),

  generatePosts: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      const workLogId = id as string; // Ensure workLogId is a string
      if (!workLogId) {
        return res.status(400).json({ message: "Worklog ID is required" });
      }
      await workLogService.generatePosts(workLogId, req.user.id);
      return sendSuccess(res, 200, "Posts generated successfully");
    },
  ),
};
