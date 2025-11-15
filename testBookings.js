import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./src/models/booking.model.js";
import User from "./src/models/user.model.js";
import Passenger from "./src/models/passenger.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name";

const testBookings = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    // Fetch all bookings and populate userId and passengers
    const bookings = await Booking.find()
      .populate({ path: "userId", model: "User", select: "firstName lastName email" })
      .populate("passengers")
      .exec();

    console.log(`Found ${bookings.length} booking(s)`);
    bookings.forEach((b, i) => {
      console.log(`\nBooking ${i + 1}:`);
      console.log("Booking ID:", b.bookingId);
      console.log("User:", b.userId ? `${b.userId.firstName} ${b.userId.lastName}` : "NULL");
      console.log("Passenger count:", b.passengerCount);
      console.log("Passengers:", b.passengers.map(p => `${p.firstName} ${p.lastName}`));
      console.log("Total Amount:", b.totalAmount);
      console.log("Status:", b.status);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error(err);
  }
};

testBookings();
