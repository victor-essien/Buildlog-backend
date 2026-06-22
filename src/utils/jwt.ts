import jwt from "jsonwebtoken";
import { StringValue } from "ms";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "../../env";
import { AuthenticationError } from "../middleware/error.middleware";
import { PasswordResetTokenPayload } from '@/types/auth.types';

export const signAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET as jwt.Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES as StringValue,
  });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    throw new AuthenticationError("Invalid or expired token");
  }
};

export const signRefreshToken = (payload: object) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES as StringValue,
  });
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AuthenticationError("Invalid or exprired token");
  }
};

export const verifyPasswordResetToken = (token: string): PasswordResetTokenPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as jwt.Secret);

      if (
        !decoded ||
        typeof decoded === "string" ||
        decoded.purpose !== "password_reset" ||
        typeof decoded.id !== "string" ||
        typeof decoded.email !== "string"
      ) {
        throw new AuthenticationError(
          "Invalid or expired password reset token",
        );
      }

      return decoded as PasswordResetTokenPayload;
    } catch {
      throw new AuthenticationError("Invalid or expired password reset token");
    }
  }