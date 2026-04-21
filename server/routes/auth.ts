import express from "express";
import { signup, login, verify, logout } from "../controllers/authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", verify);
router.get("/logout", logout);

export default router;