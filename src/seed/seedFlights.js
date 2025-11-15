import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Flight from "../models/flight.model.js";
import Airline from "../models/airline.model.js";
import Airport from "../models/airport.model.js";
import { cabinMultipliers } from "../utils/priceMultipliers.js";

dotenv.config();

const seedFlights = async () => {
  try {
    await connectDB();

    // Clear existing flights
    await Flight.deleteMany();
    console.log("Cleared existing flights");

    // Get all airlines and airports
    const airlines = await Airline.find();
    const airports = await Airport.find();

    if (!airlines.length || !airports.length) {
      throw new Error("No airlines or airports found. Seed them first.");
    }

    const flights = [];

    // Create 20 example flights
    for (let i = 0; i < 20; i++) {
      const airline = airlines[i % airlines.length];
      const origin = airports[i % airports.length];
      const destination = airports[(i + 1) % airports.length];

      const basePrice = 5000 + i * 100;

      flights.push({
        flightId: `FL${100 + i}`,           // unique flightId
        airline: airline._id,
        flightNumber: `FN${100 + i}`,       // unique flightNumber
        origin: origin._id,
        destination: destination._id,
        departureTime: new Date(Date.now() + i * 3600000), // staggered departure
        arrivalTime: new Date(Date.now() + (i + 2) * 3600000),
        flightType: i % 2 === 0 ? "domestic" : "international",
        status: "scheduled",
        basePrice,
        pricePerCabin: {
          economy: basePrice * cabinMultipliers.economy,
          business: basePrice * cabinMultipliers.business,
          first: basePrice * cabinMultipliers.first,
        },
      });
    }

    await Flight.insertMany(flights);
    console.log(`${flights.length} flights successfully inserted!`);
  } catch (error) {
    console.error("Error seeding flights:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedFlights();
