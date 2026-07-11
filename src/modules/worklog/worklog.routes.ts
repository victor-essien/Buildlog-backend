import {Router} from "express";
import {worklogController} from "./worklog.controller";
import {protect} from "@/middleware/auth.middleware";
// import {worklogValidator} from "./worklog.validator";

const router = Router();

router.get("/", protect, worklogController.getWorklogs);
router.get("/today", protect, worklogController.getTodaysWorklogs);
router.get("/:id", protect, worklogController.getWorklogById);
router.post("/", protect, worklogController.createWorklog);
router.post("/:id/generate-posts", protect, worklogController.generatePosts);
export default router;