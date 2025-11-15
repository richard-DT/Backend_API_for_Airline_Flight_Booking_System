// routes/ticket.routes.js
import express from "express";
import { generateBoardingPassPDF } from "../controllers/ticket.controller.js";


const router = express.Router();

router.get("/:bookingId/:passengerId", generateBoardingPassPDF);

export default router;