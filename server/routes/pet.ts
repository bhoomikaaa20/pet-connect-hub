import express from "express";
import multer from "multer";
import path from "path";
import { verifyUser } from "../middleware/auth";
import { getLostPets } from "../controllers/petController";

import {
    createPet,
    updatePet,
    deletePet,
    getMyPets,
    updateStatus,
    getAllPets,
} from "../controllers/petController";

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (_, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

router.post("/", verifyUser, upload.single("image"), createPet);
router.put("/:id", verifyUser, upload.single("image"), updatePet);
router.delete("/:id", verifyUser, deletePet);
router.get("/my", verifyUser, getMyPets);
router.put("/:id/status", verifyUser, updateStatus);
router.get("/", getAllPets);
router.get("/lost", getLostPets);

export default router;