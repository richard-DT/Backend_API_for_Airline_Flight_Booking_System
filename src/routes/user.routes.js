import express from "express";
import { registerUser, loginUser, getProfile, getUsers } from "../controllers/user.controller.js";
import { verify, verifyAdmin } from "../middleware/auth.js";
import { updateUserRole } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verify, getProfile);
router.get("/", verify, verifyAdmin, getUsers);
router.patch("/:userId/role", verify, verifyAdmin, updateUserRole);

export default router;
