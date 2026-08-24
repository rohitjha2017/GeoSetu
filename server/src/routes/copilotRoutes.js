import { Router } from "express";
import { postCopilotQuery } from "../controllers/copilotController.js";

const router = Router();
router.post("/copilot/ask", postCopilotQuery);

export default router;
