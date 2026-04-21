import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
}

const userSchema = new Schema(
    {
        name: String,
        email: { type: String, unique: true },
        password: String,
        role: { type: String, default: "user" },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);