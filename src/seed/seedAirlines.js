import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Airline from "../models/airline.model.js";

dotenv.config();


const airlines = [
    {
        airlineId: "PAL",
        name: "Philippine Airlines",
        country: "Philippines",
        iataCode: "PR",
        icaoCode: "PAL",
        website: "https://www.philippineairlines.com",
        logoUrl: "/images/airlines/PAL.png"
    },
    {
        airlineId: "CEB",
        name: "Cebu Pacific Air",
        country: "Philippines",
        iataCode: "5J",
        icaoCode: "CEB",
        website: "https://www.cebupacificair.com",
        logoUrl: "/images/airlines/CEB.png"
    },
    {
        airlineId: "JAL",
        name: "Japan Airlines",
        country: "Japan",
        iataCode: "JL",
        icaoCode: "JAL",
        website: "https://www.jal.co.jp",
        logoUrl: "/images/airlines/JAL.png"
    },
    {
        airlineId: "ANA",
        name: "All Nippon Airways",
        country: "Japan",
        iataCode: "NH",
        icaoCode: "ANA",
        website: "https://www.ana.co.jp",
        logoUrl: "/images/airlines/ANA.png"
    },
    {
        airlineId: "SIA",
        name: "Singapore Airlines",
        country: "Singapore",
        iataCode: "SQ",
        icaoCode: "SIA",
        website: "https://www.singaporeair.com",
        logoUrl: "/images/airlines/SIA.png"
    },
    {
        airlineId: "QFA",
        name: "Qantas Airways",
        country: "Australia",
        iataCode: "QF",
        icaoCode: "QFA",
        website: "https://www.qantas.com",
        logoUrl: "/images/airlines/QFA.png"
    },
    {
        airlineId: "AAL",
        name: "American Airlines",
        country: "United States",
        iataCode: "AA",
        icaoCode: "AAL",
        website: "https://www.aa.com",
        logoUrl: "/images/airlines/AAL.png"
    },
    {
        airlineId: "UAE",
        name: "Emirates",
        country: "United Arab Emirates",
        iataCode: "EK",
        icaoCode: "UAE",
        website: "https://www.emirates.com",
        logoUrl: "/images/airlines/UAE.png"
    },
    {
        airlineId: "QTR",
        name: "Qatar Airways",
        country: "Qatar",
        iataCode: "QR",
        icaoCode: "QTR",
        website: "https://www.qatarairways.com",
        logoUrl: "/images/airlines/QTR.png"
    },
    {
        airlineId: "BAW",
        name: "British Airways",
        country: "United Kingdom",
        iataCode: "BA",
        icaoCode: "BAW",
        website: "https://www.britishairways.com",
        logoUrl: "/images/airlines/BAW.png"
    }
];


const seedAirlines = async () => {
    try {
        // connect to db
        await connectDB();

        // clear existing airlines before inserting
        await Airline.deleteMany();
        console.log("Cleared existing airlines");

        // insert new ones
        await Airline.insertMany(airlines);
        console.log(`${airlines.length} airlines successfully inserted!`);
    } catch (error) {
        console.error("Error seeding airlines:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

seedAirlines();
