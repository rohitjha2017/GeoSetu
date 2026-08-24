import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, me);

export default router;
