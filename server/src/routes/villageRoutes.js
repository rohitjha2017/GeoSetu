import { Router } from "express";
import {
  listVillages,
  getVillage,
  getVillageRelocationOptions,
  getVillageComparison,
  searchVillages
} from "../controllers/villageController.js";

const router = Router();
router.get("/villages/search", searchVillages);
router.get("/villages/:id/relocation", getVillageRelocationOptions);
router.get("/villages/:id/comparison", getVillageComparison);
router.get("/villages/:id", getVillage);
router.get("/villages", listVillages);

export default router;
