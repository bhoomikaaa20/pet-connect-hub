import { Response } from "express";
import Pet from "../models/Pet";
import { AuthRequest } from "../middleware/auth";

export const createPet = async (req: AuthRequest, res: Response) => {
    const { name, breed, description, location, status } = req.body;

    const pet = await Pet.create({
        name,
        breed,
        description,
        location,
        status,
        image_url: req.file ? `/uploads/${req.file.filename}` : null,
        user_id: req.user?.id,
        lost_at: status === "lost" ? new Date() : null,
    });

    res.json(pet);
};

export const updatePet = async (req: AuthRequest, res: Response) => {
    const update: any = { ...req.body };

    if (req.file) {
        update.image_url = `/uploads/${req.file.filename}`;
    }

    const pet = await Pet.findByIdAndUpdate(req.params.id, update, { new: true });

    res.json(pet);
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