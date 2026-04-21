import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
dotenv.config();

import adminRoutes from "./routes/admin";



const app: Application = express();

app.use(
    cors({
        origin: "http://localhost:8081",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => console.log("MongoDB connected"))
    .catch((err: Error) => console.log(err));

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});