import type { Request } from "express";
import type { PrimaryGoal, UserType } from "./schema.types";
import type { UserProfileRecord, UserPublicRecord } from "./models.types";

export interface AuthRegistrationInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthRefreshInput {
  refreshToken: string;
}

export interface AuthPasswordResetRequestInput {
  email: string;
}

export interface AuthPasswordResetInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthOnboardingInput {
  userType?: UserType;
  primaryGoal?: PrimaryGoal;
  reminderTime?: string;
  timezone?: string;
  notificationsEnabled?: boolean;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthSessionUser extends UserPublicRecord {
  profile?: UserProfileRecord | null;
}

export interface AuthJwtPayload {
  sub: string;
  email: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  user: AuthSessionUser;
  tokens: AuthTokenPair;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthSessionUser;
}
