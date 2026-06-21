import jwt from "jsonwebtoken";
import prisma from "@/config/db";
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
  NotFoundError,
} from "@/middleware/error.middleware";
import { logger, logAuth } from "@/utils/logger";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  REFRESH_TOKEN_EXPIRES,
  ACCESS_TOKEN_EXPIRES,
} from "../../../env";
import {
  AuthRegistrationInput,
  AuthLoginInput,
  AuthRefreshInput,
  AuthPasswordResetRequestInput,
  AuthPasswordResetInput,
  AuthOnboardingInput,
  AuthTokenPair,
  AuthSessionUser,
  AuthJwtPayload,
  AuthResponse,
} from "@/types/auth.types";
import {
  comparePassword,
  compareToken,
  hashPassword,
  hashToken,
} from "@/utils/hash";
import {
  setRefreshCookie,
  clearRefreshCookie,
  verifyGoogleToken,
} from "@/utils/helpers";

export class AuthService {
  private readonly JWT_ACCESS_SECRET = JWT_ACCESS_SECRET;
  private readonly JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;
  private readonly ACCESS_TOKEN_EXPIRES = ACCESS_TOKEN_EXPIRES;
  private readonly REFRESH_TOKEN_EXPIRES = REFRESH_TOKEN_EXPIRES;

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
}
