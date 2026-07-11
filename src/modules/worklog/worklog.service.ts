import prisma from "@/config/db";
import { NotFoundError, ValidationError } from "@/middleware/error.middleware";
import { logger } from "@/utils/logger";
import {
  WorkLogRecord,
  WorkLogWithGeneratedPosts,
  WorkLogInput,
} from "@/types/models.types";

export class WorklogService {
  async getWorklogsByUserId(userId: string): Promise<WorkLogRecord[]> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const worklogs = await prisma.workLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!worklogs || worklogs.length === 0) {
      throw new NotFoundError("Worklogs for the user");
    }

    return worklogs;
  }

  async getWorklogById(worklogId: string): Promise<WorkLogWithGeneratedPosts> {
    if (!worklogId) {
      throw new ValidationError("Worklog ID is required");
    }

    const worklog = await prisma.workLog.findUnique({
      where: { id: worklogId },
    });

    if (!worklog) {
      throw new NotFoundError("Worklog");
    }

    return worklog;
  }

  async getTodaysWorklogs(userId: string): Promise<WorkLogRecord[]> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const worklogs = await prisma.workLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!worklogs || worklogs.length === 0) {
      throw new NotFoundError("Today's worklogs for the user");
    }

    return worklogs;
  }

  async createWorklog(
    userId: string,
    data: WorkLogInput,
  ): Promise<WorkLogRecord> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    return prisma.workLog.create({
      data: {
        userId,
        title: data.title || null,
        content: data.content,
        wordCount: data.content.split(/\s+/).filter(Boolean).length,
        generated: false,
      },
    });
  }

  async generatePosts(workLogId: string, userId: string) {
    const workLog = await prisma.workLog.findUnique({
      where: { id: workLogId, userId },
    });

    // Simulate AI post generation logic here
    const aiResponse = {
      linkedin: "...",
      x: "...",
      facebook: "...",
    };

    await prisma.generatedPost.createMany({
      data: [
        {
          userId,
          workLogId,
          platform: "LINKEDIN",
          content: aiResponse.linkedin,
        },
        {
          userId,
          workLogId,
          platform: "X",
          content: aiResponse.x,
        },
        {
          userId,
          workLogId,
          platform: "FACEBOOK",
          content: aiResponse.facebook,
        },
      ],
    });

    // Insert user activity
    await prisma.userActivity.create({
      data: {
        userId,
        type: "WORK_LOG_CREATED",
        metadata: workLogId,
      },
    });
  }
}
