import express from "express";
import { saveMessage, getMessages } from "../controllers/contact.controller.js";
import { verify } from "../middleware/auth.js"; // optional, for admin-only get

const router = express.Router();

router.post("/", saveMessage);         // public
router.get("/", verify, getMessages);  // protected, admin only

export default router;
