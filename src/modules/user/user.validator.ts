import { Request, Response, NextFunction } from "express";
import { z, ZodTypeAny } from "zod";

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


const onboardingSchema = z.object({
  userType: z.string().optional(),
  primaryGoal: z.string().optional(),
  reminderTime: z.string().optional(),
  timezone: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
});



export const userValidator = {
  onboarding: validateBody(onboardingSchema),
 
};
