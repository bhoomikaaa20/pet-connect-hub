import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import petRoutes from "./routes/pet";
import adminRoutes from "./routes/admin";
import notificationRoutes from "./routes/notification";


dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:8080",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);


mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log("MongoDB connected"));

app.listen(5000, () => console.log("Server running on 5000"));