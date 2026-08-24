import { Router } from "express";
import { listDistricts, getRiver, getFloodZones } from "../controllers/geoController.js";

const router = Router();
router.get("/districts", listDistricts);
router.get("/river", getRiver);
router.get("/floodzones", getFloodZones);

export default router;
