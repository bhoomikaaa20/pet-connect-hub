import express from "express";
import { verifyUser } from "../middleware/auth";
import {
    getUsers,
    getPets,
    deleteUser,
    deletePetAdmin,
} from "../controllers/adminController";

const router = express.Router();

router.get("/users", verifyUser, getUsers);
router.get("/pets", verifyUser, getPets);
router.delete("/user/:id", verifyUser, deleteUser);
router.delete("/pet/:id", verifyUser, deletePetAdmin);

export default router;