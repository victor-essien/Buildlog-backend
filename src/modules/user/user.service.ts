import prisma from "@/config/db";
import { NotFoundError, ValidationError } from "@/middleware/error.middleware";
import { logger } from "@/utils/logger";
import { UserOnboardingInput, ReminderUpdateInput } from "@/types/auth.types";


export interface ProfileUpdateInput {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  userType?: string | null;
  primaryGoal?: string | null;
  timezone?: string | null;
  notificationsEnabled?: boolean ;
}

export interface RemindereUpdateInput {
  reminderTime?: string | null;
  timezone?: string | null;
  notificationsEnabled?: boolean | null;
}

export class UserService {
  private async ensureProfile(userId: string) {
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return existingProfile;
    }

    return prisma.userProfile.create({
      data: { userId },
    });
  }

  async getProfile(userId: string) {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        onboardingCompleted: user.onboardingCompleted,
      },
      profile: user.profile,
    };
  }

  async updateProfile(userId: string, data: ProfileUpdateInput) {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const {
      firstName,
      lastName,
      avatarUrl,
      userType,
      primaryGoal,
      timezone,
      notificationsEnabled,
    } = data;

    await this.ensureProfile(userId);

    const [updatedUser, updatedProfile] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(firstName !== undefined ? { firstName } : {}),
          ...(lastName !== undefined ? { lastName } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        },
      }),
      prisma.userProfile.update({
        where: { userId },
        data: {
          ...(userType !== undefined ? { userType: userType as any } : {}),
          ...(primaryGoal !== undefined
            ? { primaryGoal: primaryGoal as any }
            : {}),
          ...(timezone !== undefined ? { timezone } : {}),
          ...(notificationsEnabled !== undefined
            ? { notificationsEnabled }
            : {}),
        },
      }),
    ]);

    logger.info(`User profile updated: ${userId}`);

    return {
      user: updatedUser,
      profile: updatedProfile,
    };
  }

  // Complete user Onboardidng
  
    async completeOnboarding(
      userId: string,
      data: UserOnboardingInput,
    ): Promise<void> {
      const {
        userType,
        primaryGoal,
        reminderTime,
        timezone,
        notificationsEnabled,
      } = data;
  
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            onboardingCompleted: true,
          },
        }),
        prisma.userProfile.upsert({
          where: { userId },
          update: {
            userType,
            primaryGoal,
            reminderTime,
            timezone,
            notificationsEnabled,
          },
          create: {
            userId,
            userType,
            primaryGoal,
            reminderTime,
            timezone,
            notificationsEnabled,
          },
        }),
      ]);
      logger.info(`User onboarding completed: ${userId}`);
    }
  

  async updateReminder(userId: string, data: ReminderUpdateInput) {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const { reminderTime, timezone, notificationsEnabled } = data;

    await this.ensureProfile(userId);

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        ...(reminderTime !== undefined ? { reminderTime } : {}),
        ...(timezone !== undefined ? { timezone } : {}),
        ...(notificationsEnabled !== undefined ? { notificationsEnabled } : {}),
      },
    });

    logger.info(`User reminder settings updated: ${userId}`);

    return updatedProfile;
  }
}
