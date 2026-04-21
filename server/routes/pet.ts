import express from "express";
import {
    createPet,
    getMyPets,
    deletePet,
    updateStatus,
    getLostPets,
    updatePet,
} from "../controllers/petController";
import { verifyUser } from "../middleware/auth";
import multer from "multer";

const router = express.Router();

// upload config
const upload = multer({ dest: "uploads/" });

// ✅ CREATE
router.post("/", verifyUser, upload.single("image"), createPet);

// ✅ GET MY PETS
router.get("/my", verifyUser, getMyPets);

// ✅ DELETE
router.delete("/:id", verifyUser, deletePet);

// ✅ UPDATE STATUS (🔥 THIS CAUSED ERROR)
router.put("/:id/status", verifyUser, updateStatus);

// ✅ UPDATE PET
router.put("/:id", verifyUser, upload.single("image"), updatePet);

// ✅ LOST PETS
router.get("/lost", getLostPets);

export default router;