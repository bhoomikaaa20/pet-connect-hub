import express from "express";
import { verifyUser } from "../middleware/auth";
import { getNotifications, markAsRead } from "../controllers/notificationController";

const router = express.Router();

router.get("/", verifyUser, getNotifications);
router.put("/:id", verifyUser, markAsRead);

export default router;