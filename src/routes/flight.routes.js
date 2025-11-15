import express from "express";
import {
  searchFlights,
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/flight.controller.js";

const router = express.Router();

// Public search endpoint
router.get("/search", searchFlights);

// ADMIN
router.get("/", getAllFlights);
router.get("/:id", getFlightById);
router.post("/", createFlight);
router.patch("/:id", updateFlight);
router.delete("/:id", deleteFlight);

export default router;
