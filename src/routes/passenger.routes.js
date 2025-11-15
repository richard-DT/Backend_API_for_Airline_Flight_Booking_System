import express from "express";
import {
  getAllPassengers,
  getPassengerById,
  updatePassenger,
} from "../controllers/passenger.controller.js";
import { verify, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin-only routes
router.get("/", verify, verifyAdmin, getAllPassengers);
router.get("/:id", verify, verifyAdmin, getPassengerById);
router.patch("/:id", verify, verifyAdmin, updatePassenger);

export default router;
