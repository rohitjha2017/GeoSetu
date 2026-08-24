import { Router } from "express";
import { listServices, listHistoricalDisasters } from "../controllers/servicesController.js";

const router = Router();
router.get("/services", listServices);
router.get("/historical-disasters", listHistoricalDisasters);

export default router;
