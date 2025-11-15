import express from "express";
import {
  bookFlight,
  getAllBookings,
  getBookingById,
  getBookingHistory,
  getCurrentBooking,
  updateBookingStatus,
} from "../controllers/booking.controller.js";
import { optionalVerify, verify, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// --- Admin Routes ---
router.get("/admin", verify, verifyAdmin, getAllBookings);
router.get("/admin/:id", verify, verifyAdmin, getBookingById);
router.put("/admin/:id/status", verify, verifyAdmin, updateBookingStatus);

// --- User Routes ---
router.post("/", optionalVerify, bookFlight);
router.get("/current", verify, getCurrentBooking);
router.get("/history", verify, getBookingHistory);

export default router;
