import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    user_id: string;
    message: string;
    read: boolean;
}

const notificationSchema = new Schema(
    {
        user_id: String,
        message: String,
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>("Notification", notificationSchema);