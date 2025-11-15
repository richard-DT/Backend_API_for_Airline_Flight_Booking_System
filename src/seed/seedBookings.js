import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Booking from "../models/booking.model.js";
import Flight from "../models/flight.model.js";
import Passenger from "../models/passenger.model.js";

dotenv.config();

const seedBookings = async () => {
  try {
    await connectDB();

    // Clear existing bookings and passengers
    await Booking.deleteMany();
    await Passenger.deleteMany();
    console.log("Cleared existing bookings and passengers");

    // Fetch some flights
    const flights = await Flight.find().limit(5); // take first 5 flights

    if (!flights.length) {
      console.log("No flights found to seed bookings");
      return;
    }

    const bookings = [];

    for (let i = 0; i < 5; i++) {
      const flight = flights[i % flights.length];

      // Create booking contact info
      const bookingContact = {
        title: "Mr",
        firstName: `User${i + 1}`,
        lastName: `Test`,
        email: `user${i + 1}@mail.com`,
        mobileNumber: `0917${1000000 + i}`,
      };

      // Create booking
      const booking = new Booking({
        userId: new mongoose.Types.ObjectId(), // random userId, can replace with real admin/user
        flights: [flight._id],
        bookingDate: new Date(),
        tripType: "oneWayTrip",
        totalAmount: flight.basePrice + 500, // sample totalAmount
        flightPrices: [
          {
            flightId: flight._id,
            cabin: "economy",
            basePrice: flight.basePrice,
            taxes: {
              adminFee: 150,
              fuelSurcharge: 400,
              adminFeeVAT: 600,
              domesticPassengerServiceCharge: 200,
              airportDomesticPassengerServiceCharge: 100,
              valueAddedTax: 250,
              subtotal: 1700,
            },
            passengerCount: 1,
            totalPrice: flight.basePrice + 1700,
          },
        ],
        passengerCount: 1,
        bookingContact,
      });

      // Save booking first to generate bookingId
      await booking.save();

      // Create passenger linked to booking
      const passenger = new Passenger({
        userId: booking.userId,
        bookingId: booking._id,
        title: "Mr",
        firstName: `Passenger${i + 1}`,
        lastName: "Test",
        nationality: "PH",
        dateOfBirth: "1990-01-01",
      });

      await passenger.save();

      // Push passenger to booking
      booking.passengers.push(passenger._id);
      await booking.save();

      bookings.push(booking);
    }

    console.log(`${bookings.length} bookings seeded successfully!`);
  } catch (error) {
    console.error("Error seeding bookings:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedBookings();
