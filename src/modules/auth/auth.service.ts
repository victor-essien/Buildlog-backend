import jwt from "jsonwebtoken";
import prisma from "@/config/db";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/middleware/error.middleware";
import { logAuth, logger } from "@/utils/logger";
import { signAccessToken, signRefreshToken, verifyPasswordResetToken } from "@/utils/jwt";
import { ACCESS_TOKEN_EXPIRES, JWT_ACCESS_SECRET } from "../../../env";
import {
  AuthRegistrationInput,
  AuthLoginInput,
  AuthPasswordResetInput,
  AuthPasswordResetRequestInput,
  AuthOnboardingInput,
  AuthJwtPayload,
  AuthResponse,
  PasswordResetRequestResult,
  PasswordResetTokenPayload,
} from "@/types/auth.types";
import { comparePassword, hashPassword } from "@/utils/hash";
import { verifyGoogleToken } from "@/utils/helpers";


export class AuthService {
  private readonly JWT_ACCESS_SECRET = JWT_ACCESS_SECRET;
  private readonly ACCESS_TOKEN_EXPIRES = ACCESS_TOKEN_EXPIRES;
  private readonly PASSWORD_RESET_TOKEN_EXPIRES = "15m";
  private verifyPasswordResetToken = verifyPasswordResetToken;

  // Register new user
  async signup(data: AuthRegistrationInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError("Email is already registered");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        onboardingCompleted: true,
      },
    });
    // Sign tokens
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
    });
    const refreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
    });

    //  TODO: Store refresh token in DB (hashed)

    logger.info(`User signup successful: ${email}`);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Login user
  async login(data: AuthLoginInput): Promise<AuthResponse> {
    const { email, password } = data;
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Sign tokens
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
    });
    const refreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
    });
    // TODO: Store refresh token in DB (hashed)
    logger.info(`User login successful: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        onboardingCompleted: user.onboardingCompleted,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async googleAuth(token: string): Promise<AuthResponse> {
    if (!token) {
      throw new ValidationError("Google token is required");
    }

    const payload = await verifyGoogleToken(token);

    if (!payload || !payload.email || !payload.name) {
      throw new AuthenticationError("Invalid Google token");
    }

    const { email, name, picture } = payload;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      // If user doesn't exist, create a new user
      const [firstName, lastName] = name.split(" ");
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: "", // No password for Google-authenticated users
          firstName: payload.given_name || firstName || null,
          lastName: payload.family_name || lastName || null,
          avatarUrl: "",
          onboardingCompleted: false,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          onboardingCompleted: true,
        },
      });
    }

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
    });
    const refreshToken = signRefreshToken({
      id: user.id,
    });
    //  TODO: Store refresh token in DB (hashed)

    logger.info(`User Google auth successful: ${email}`);
    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Complete user Onboardidng

  async completeOnboarding(
    userId: string,
    data: AuthOnboardingInput,
  ): Promise<void> {
    const {
      userType,
      primaryGoal,
      reminderTime,
      timezone,
      notificationsEnabled,
    } = data;

    // Update user profile
    await prisma.userProfile.update({
      where: { userId },
      data: {
        userType,
        primaryGoal,
        reminderTime,
        timezone,
        notificationsEnabled,
        onboardingCompleted: true,
      },
    });
    logger.info(`User onboarding completed: ${userId}`);
  }

  async requestPasswordReset(
    data: AuthPasswordResetRequestInput,
  ): Promise<PasswordResetRequestResult> {
    const { email } = data;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      logger.info(`Password reset requested for unknown email: ${email}`);
      return {
        message:
          "If an account exists for that email, a password reset link has been generated.",
      };
    }

    const resetToken = this.signPasswordResetToken({
      id: user.id,
      email: user.email,
    });

    logAuth("password_reset", user.id, {
      email: user.email,
      action: "requested",
    });

    return {
      message:
        "If an account exists for that email, a password reset link has been generated.",
      resetToken,
    };
  }

  async resetPassword(
    data: AuthPasswordResetInput,
  ): Promise<{ message: string }> {
    const { token, password, confirmPassword } = data;

    if (!token) {
      throw new ValidationError("Password reset token is required");
    }

    if (!password || !confirmPassword) {
      throw new ValidationError("Password and confirm password are required");
    }

    if (password !== confirmPassword) {
      throw new ValidationError("Passwords do not match");
    }

    const payload = this.verifyPasswordResetToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
      },
    });

    logAuth("password_reset", user.id, {
      email: user.email,
      action: "completed",
    });

    logger.info(`Password reset completed for user: ${user.id}`);

    return {
      message: "Password reset successfully",
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError(
        "Current password and new password are required",
      );
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError("New passwords do not match");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!user.passwordHash) {
      throw new AuthenticationError(
        "Password login is not enabled for this account",
      );
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AuthenticationError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
      },
    });

    logAuth("password_reset", user.id, {
      email: user.email,
      action: "changed",
    });

    logger.info(`Password changed successfully for user: ${user.id}`);
  }

  private signPasswordResetToken(
    payload: Pick<AuthJwtPayload, "id" | "email">,
  ) {
    return jwt.sign(
      {
        ...payload,
        purpose: "password_reset" as const,
      },
      this.JWT_ACCESS_SECRET as jwt.Secret,
      {
        expiresIn: this.PASSWORD_RESET_TOKEN_EXPIRES,
      },
    );
  }

  
}
