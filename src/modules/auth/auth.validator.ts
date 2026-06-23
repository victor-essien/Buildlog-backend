import { Request, Response, NextFunction } from "express";
import { z, ZodTypeAny } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const googleAuthSchema = z.object({
  token: z.string().nonempty(),
});

const onboardingSchema = z.object({
  userType: z.string().optional(),
  primaryGoal: z.string().optional(),
  reminderTime: z.string().optional(),
  timezone: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetSchema = z
  .object({
    token: z.string().nonempty(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;
    return next();
  };
};

export const authValidator = {
  signup: validateBody(signupSchema),
  login: validateBody(loginSchema),
  googleAuth: validateBody(googleAuthSchema),
  onboarding: validateBody(onboardingSchema),
  passwordResetRequest: validateBody(passwordResetRequestSchema),
  passwordReset: validateBody(passwordResetSchema),
  changePassword: validateBody(changePasswordSchema),
};
