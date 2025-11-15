import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Booking from "../models/booking.model.js";
import Passenger from "../models/passenger.model.js";

dotenv.config();

const clearBookings = async () => {
  try {
    await connectDB();

    // Delete all bookings
    await Booking.deleteMany();
    console.log("Cleared existing bookings");

    // Delete all passengers
    await Passenger.deleteMany();
    console.log("Cleared existing passengers");
  } catch (error) {
    console.error("Error clearing bookings:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

clearBookings();
