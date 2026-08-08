import { Router } from "express";
import { userController } from "./user.controller";
import { protect } from "../../middleware/auth.middleware";
import {userValidator} from "./user.validator";

const router = Router();

router.get("/profile", protect, userController.getProfile);
router.patch("/profile", protect, userController.updateProfile);
router.post(
  "/onboarding",
  protect,
  userValidator.onboarding,
  userController.completeOnboarding,
);
router.patch("/profile/reminder", protect, userController.updateReminder);

export default router;
