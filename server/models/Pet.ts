import mongoose, { Document, Schema } from "mongoose";

export interface IPet extends Document {
    name: string;
    breed: string;
    description?: string;
    location?: string;
    status: "safe" | "lost" | "found";
    image_url?: string;
    user_id: string;
    lost_at?: Date | null;
}

const petSchema = new Schema(
    {
        name: String,
        breed: String,
        description: String,
        location: String,
        status: {
            type: String,
            enum: ["safe", "lost", "found"],
            default: "safe",
        },
        image_url: String,
        user_id: String,
        lost_at: Date,
    },
    { timestamps: true }
);

export default mongoose.model<IPet>("Pet", petSchema);