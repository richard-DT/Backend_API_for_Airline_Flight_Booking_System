import express from "express";
import {
  getAllAirlines,
  createAirline,
  updateAirline,
  deleteAirline,
  getAirlineById
} from "../controllers/airline.controller.js";
import { verify, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public route
router.get("/", getAllAirlines);

// Admin routes
router.post("/", verify, verifyAdmin, createAirline);
router.get("/:id", verify, verifyAdmin, getAirlineById);
router.put("/:id", verify, verifyAdmin, updateAirline);
router.delete("/:id", verify, verifyAdmin, deleteAirline);

export default router;
