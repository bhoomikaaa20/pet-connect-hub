import { Response } from "express";
import Pet from "../models/Pet";
import { AuthRequest } from "../middleware/auth";
import Notification from "../models/Notification";

// ✅ CREATE PET
export const createPet = async (req: AuthRequest, res: Response) => {
    try {
        const { name, breed, location, description, status, phone } = req.body;

        const pet = new Pet({
            name,
            breed,
            location,
            description,
            status,
            phone,
            image_url: req.file ? `/uploads/${req.file.filename}` : "",
            user_id: req.user?.id,
            lost_at: status === "lost" ? new Date() : null,
        });

        await pet.save();

        // 🔥 ADD THIS BLOCK
        if (status === "lost") {
            await Notification.create({
                user_id: req.user?.id,
                message: `${pet.name} is reported LOST 🐾`,
            });
        }

        if (status === "found") {
            await Notification.create({
                user_id: req.user?.id,
                message: `${pet.name} is marked FOUND 🎉`,
            });
        }

        res.status(201).json(pet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ GET MY PETS (🔥 MAIN FIX)
export const getMyPets = async (req: AuthRequest, res: Response) => {
    const pets = await Pet.find({
        user_id: req.user?.id, // ✅ FIXED
    }).sort({ createdAt: -1 });

    res.json(pets);
};

// ✅ DELETE PET
export const deletePet = async (req: AuthRequest, res: Response) => {
    await Pet.findOneAndDelete({
        _id: req.params.id,
        user_id: req.user?.id, // ✅ FIXED
    });

    res.json({ message: "Deleted" });
};

// ✅ UPDATE STATUS
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

// ✅ LOST PETS
export const getLostPets = async (_: any, res: Response) => {
    const pets = await Pet.find({ status: "lost" }).sort({ lost_at: -1 });
    res.json(pets);
};
export const updatePet = async (req: AuthRequest, res: Response) => {
    try {
        const updated = await Pet.findOneAndUpdate(
            {
                _id: req.params.id,
                user_id: req.user?.id, // ✅ ensure ownership
            },
            {
                ...req.body,
                ...(req.file && {
                    image_url: `/uploads/${req.file.filename}`,
                }),
            },
            { new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};