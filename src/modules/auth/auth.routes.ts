import { Router } from "express";
import { authController } from "./auth.controller";
import { authValidator } from "./auth.validator";
import {authLimiter} from "@/middleware/rateLimiter.middleware";
import { protect } from "@/middleware/auth.middleware";

const router = Router();

router.post("/signup", authLimiter, authValidator.signup, authController.signup);
router.post("/login", authLimiter, authValidator.login, authController.login);
router.post("/google", authLimiter, authValidator.googleAuth, authController.googleAuth);
router.post(
  "/password-reset/request",
  authLimiter,
  authValidator.passwordResetRequest,
  authController.requestPasswordReset,
);
router.post(
  "/password-reset",
  authValidator.passwordReset,
  authController.resetPassword,
);
router.post("/logout", authController.logout);

// Protected routes should use authentication middleware when available
router.post(
  "/onboarding",
  authValidator.onboarding,
  protect,
  authController.completeOnboarding,
);
router.post(
  "/change-password",
  authValidator.changePassword,
  protect,
  authController.changePassword,
);

export default router;
