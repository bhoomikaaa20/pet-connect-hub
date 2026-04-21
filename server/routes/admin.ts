import express, { Request, Response } from "express";
import { verifyUser, AuthRequest } from "../middleware/auth";
import User from "../models/User";
import mongoose from "mongoose";

const router = express.Router();

// Dummy Pet schema (if not created yet)
const petSchema = new mongoose.Schema({
    name: String,
    breed: String,
    status: { type: String, default: "safe" },
    location: String,
    createdAt: { type: Date, default: Date.now },
});

const Pet = mongoose.model("Pet", petSchema);

// ✅ Middleware to check admin
const isAdmin = async (req: AuthRequest, res: Response, next: any) => {
    const user = await User.findById(req.user?.id);
    if (user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

// ✅ GET all pets
router.get("/pets", verifyUser, isAdmin, async (req: Request, res: Response) => {
    const pets = await Pet.find().sort({ createdAt: -1 });
    res.json(pets);
});

// ✅ GET all users
router.get("/users", verifyUser, isAdmin, async (req: Request, res: Response) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
});

// ✅ DELETE pet
router.delete("/pet/:id", verifyUser, isAdmin, async (req: Request, res: Response) => {
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet deleted" });
});

// ✅ DELETE user
router.delete("/user/:id", verifyUser, isAdmin, async (req: Request, res: Response) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
});

// ✅ UPDATE pet status
router.put("/pet/:id", verifyUser, isAdmin, async (req: Request, res: Response) => {
    const { status } = req.body;

    await Pet.findByIdAndUpdate(req.params.id, { status });

    res.json({ message: "Status updated" });
});

export default router;