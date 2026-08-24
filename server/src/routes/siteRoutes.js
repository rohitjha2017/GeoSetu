import { Router } from "express";
import { listSites, getSite } from "../controllers/siteController.js";

const router = Router();
router.get("/sites/:id", getSite);
router.get("/sites", listSites);

export default router;
