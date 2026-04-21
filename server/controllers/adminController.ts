import { Response } from "express";
import User from "../models/User";
import Pet from "../models/Pet";

export const getUsers = async (_: any, res: Response) => {
    const users = await User.find().select("-password");
    res.json(users);
};

export const getPets = async (_: any, res: Response) => {
    const pets = await Pet.find();
    res.json(pets);
};

export const deleteUser = async (req: any, res: Response) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
};

export const deletePetAdmin = async (req: any, res: Response) => {
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet deleted" });
};