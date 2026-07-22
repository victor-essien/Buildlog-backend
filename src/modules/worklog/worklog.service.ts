import prisma from "@/config/db";
import { NotFoundError, ValidationError } from "@/middleware/error.middleware";
import {
  WorkLogRecord,
  WorkLogWithGeneratedPosts,
  WorkLogInput,
} from "@/types/models.types";

export class WorkLogService {
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
  const workLog = await prisma.workLog.findFirst({
    where: {
      id: workLogId,
      userId,
    },
  });

  if (!workLog) {
    throw new NotFoundError("WorkLog");
  }

  // TODO: Replace with AI generation
  const aiResponse = {
    linkedin: "...",
    x: "...",
    facebook: "...",
  };



  await prisma.$transaction(async (tx) => {
    // Remove existing drafts for this worklog
    await tx.generatedPost.deleteMany({
      where: {
        workLogId,
      },
    });

    // Create new drafts
    await tx.generatedPost.createMany({
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

    // Mark worklog as generated
    await tx.workLog.update({
      where: {
        id: workLogId,
      },
      data: {
        generated: true,
      },
    });

    // Log activity
    await tx.userActivity.create({
      data: {
        userId,
        type: "DRAFT_GENERATED",
        metadata: {
          workLogId,
        },
      },
    });
  });

  // Fetch fresh data
  const updatedWorkLog = await prisma.workLog.findUnique({
    where: {
      id: workLogId,
    },
    include: {
      generatedPosts: true,
    },
  });

  return {
    id: updatedWorkLog!.id,
    content: updatedWorkLog!.content,
    generatedPosts: {
      linkedin: updatedWorkLog!.generatedPosts.find(
        (p) => p.platform === "LINKEDIN"
      ),
      x: updatedWorkLog!.generatedPosts.find(
        (p) => p.platform === "X"
      ),
      facebook: updatedWorkLog!.generatedPosts.find(
        (p) => p.platform === "FACEBOOK"
      ),
    },
  };
}
  async generateePosts(workLogId: string, userId: string) {
    const workLog = await prisma.workLog.findUnique({
      where: { id: workLogId, userId },
      include: { generatedPosts: true },
    });

    if (!workLog) {
      throw new NotFoundError("Worklog");
    }

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
    const response = {
      id: workLog.id,
      content: workLog.content,

      generatedPosts: {
        linkedin: workLog.generatedPosts.find((p) => p.platform === "LINKEDIN"),

        x: workLog.generatedPosts.find((p) => p.platform === "X"),

        facebook: workLog.generatedPosts.find((p) => p.platform === "FACEBOOK"),
      },
    };
    return response;
  }
}
