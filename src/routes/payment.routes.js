import express from "express";
import {
  chargePayment, generatePaymentReceiptPDF,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus
} from "../controllers/payment.controller.js";
import { optionalVerify, verify, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/", verify, verifyAdmin, getAllPayments);
router.get("/:id", verify, verifyAdmin, getPaymentById);
router.patch("/:id/status", verify, verifyAdmin, updatePaymentStatus);

// User routes

// Charge Payment
router.post("/charge", optionalVerify, chargePayment);

// Download payment receipt
router.get("/receipt/:paymentId", generatePaymentReceiptPDF);

export default router;


