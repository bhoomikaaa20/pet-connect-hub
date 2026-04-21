import { Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../middleware/auth";

export const getNotifications = async (req: AuthRequest, res: Response) => {
    const notifications = await Notification.find({
        user_id: req.user?.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    await Notification.findByIdAndUpdate(req.params.id, {
        read: true,
    });

    res.json({ message: "Updated" });
};