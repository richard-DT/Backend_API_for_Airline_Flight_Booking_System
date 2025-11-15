import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../middleware/auth.js";

// [GET] All Users (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// [POST] Register a User
export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, mobileNumber, dateOfBirth, role } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNumber,
      dateOfBirth,
      role,
    });

    const userWithoutPassword = { ...newUser._doc };
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// [POST] Login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = createAccessToken(user);

    res.status(200).json({ token, user: { userId: user.userId, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

// [GET] Get profile (Authenticated user)
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// [PATCH] Update user role (for now: accessible by logged-in users)
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};



