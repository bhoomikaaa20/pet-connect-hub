import { Response } from "express";
import Pet from "../models/Pet";
import { AuthRequest } from "../middleware/auth";
import Notification from "../models/Notification";

export const createPet = async (req: any, res: any) => {
    try {
        const { name, breed, location, description, status, phone } = req.body;

        const pet = new Pet({
            name,
            breed,
            location,
            description,
            status,
            phone, // ✅ now defined
            image_url: req.file ? `/uploads/${req.file.filename}` : "",
            user: req.user.id,
        });

        await pet.save();

        res.status(201).json(pet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePet = async (req: AuthRequest, res: Response) => {
    const { name, breed, status } = req.body;

    const existingPet = await Pet.findById(req.params.id);

    const updatedPet = await Pet.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    // 🔥 CHECK STATUS CHANGE
    if (existingPet?.status !== status) {
        if (status === "lost") {
            await Notification.create({
                user_id: req.user?.id,
                message: `${updatedPet?.name} is marked as LOST 🐾`,
            });
        }

        if (status === "found") {
            await Notification.create({
                user_id: req.user?.id,
                message: `${updatedPet?.name} is marked as FOUND 🎉`,
            });
        }
    }

    res.json(updatedPet);
};

export const deletePet = async (req: AuthRequest, res: Response) => {
    await Pet.findOneAndDelete({
        _id: req.params.id,
        user_id: req.user?.id,
    });

    res.json({ message: "Deleted" });
};

export const getMyPets = async (req: AuthRequest, res: Response) => {
    const pets = await Pet.find({ user_id: req.user?.id }).sort({ createdAt: -1 });
    res.json(pets);
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
    const { status } = req.body;

    const pet = await Pet.findByIdAndUpdate(
        req.params.id,
        {
            status,
            lost_at: status === "lost" ? new Date() : null,
        },
        { new: true }
    );

    // ✅ CREATE NOTIFICATION
    if (status === "lost") {
        await Notification.create({
            user_id: req.user?.id,
            message: `${pet?.name} is marked as LOST 🐾`,
        });
    }

    if (status === "found") {
        await Notification.create({
            user_id: req.user?.id,
            message: `${pet?.name} is marked as FOUND 🎉`,
        });
    }

    res.json(pet);
};

export const getAllPets = async (_: any, res: Response) => {
    const pets = await Pet.find().sort({ createdAt: -1 });
    res.json(pets);
};


export const getLostPets = async (_: any, res: Response) => {
    try {
        const pets = await Pet.find({ status: "lost" })
            .sort({ lost_at: -1 });

        res.json(pets);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};