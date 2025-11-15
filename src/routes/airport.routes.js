import express from "express";
import {
  getAllAirports,
  getAirportById,
  createAirport,
  updateAirport,
  deleteAirport,
} from "../controllers/airport.controller.js";
import { verify, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// --- Admin Routes ---
router.post("/", verify, verifyAdmin, createAirport);
router.put("/:id", verify, verifyAdmin, updateAirport);
router.delete("/:id", verify, verifyAdmin, deleteAirport);

// --- Public/User Routes ---
router.get("/", getAllAirports);
router.get("/:id", getAirportById);

export default router;
