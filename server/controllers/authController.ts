import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ message: "User exists" });

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hash });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);

        res.cookie("token", token, { httpOnly: true });

        res.json({ user });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);

        res.cookie("token", token, { httpOnly: true });

        res.json({ user });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const verify = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json({ user: null });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

        const user = await User.findById(decoded.id).select("-password");

        res.json({ user });
    } catch {
        res.json({ user: null });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};