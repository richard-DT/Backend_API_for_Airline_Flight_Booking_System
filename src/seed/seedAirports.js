import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Airport from "../models/airport.model.js";
dotenv.config();


const airports = [
    {
        airportId: "MNL",
        name: "Ninoy Aquino International Airport",
        city: "Manila",
        country: "Philippines",
        type: "international",
        timezone: "Asia/Manila",
        latitude: 14.5086,
        longitude: 121.0197,
    },
    {
        airportId: "CEB",
        name: "Mactan-Cebu International Airport",
        city: "Cebu",
        country: "Philippines",
        type: "international",
        timezone: "Asia/Manila",
        latitude: 10.3073,
        longitude: 123.978,
    },
    {
        airportId: "DVO",
        name: "Francisco Bangoy International Airport",
        city: "Davao",
        country: "Philippines",
        type: "international",
        timezone: "Asia/Manila",
        latitude: 7.1256,
        longitude: 125.6453,
    },
    {
        airportId: "KLO",
        name: "Kalibo International Airport",
        city: "Kalibo",
        country: "Philippines",
        type: "international",
        timezone: "Asia/Manila",
        latitude: 11.6792,
        longitude: 122.3742,
    },
    {
        airportId: "ILO",
        name: "Iloilo International Airport",
        city: "Iloilo",
        country: "Philippines",
        type: "international",
        timezone: "Asia/Manila",
        latitude: 10.8252,
        longitude: 122.536,
    },
    {
        airportId: "ZAM",
        name: "Zamboanga International Airport",
        city: "Zamboanga",
        country: "Philippines",
        type: "international",
        timezone: "Asia/Manila",
        latitude: 6.9213,
        longitude: 122.0795,
    },
    {
        airportId: "NRT",
        name: "Narita International Airport",
        city: "Tokyo",
        country: "Japan",
        type: "international",
        timezone: "Asia/Tokyo",
        latitude: 35.7719,
        longitude: 140.3929,
    },
    {
        airportId: "LAX",
        name: "Los Angeles International Airport",
        city: "Los Angeles",
        country: "USA",
        type: "international",
        timezone: "America/Los_Angeles",
        latitude: 33.9416,
        longitude: -118.4085,
    },
    {
        airportId: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "USA",
        type: "international",
        timezone: "America/New_York",
        latitude: 40.6413,
        longitude: -73.7781,
    },
    {
        airportId: "SIN",
        name: "Singapore Changi Airport",
        city: "Singapore",
        country: "Singapore",
        type: "international",
        timezone: "Asia/Singapore",
        latitude: 1.3644,
        longitude: 103.9915,
    },
    {
        airportId: "DXB",
        name: "Dubai International Airport",
        city: "Dubai",
        country: "UAE",
        type: "international",
        timezone: "Asia/Dubai",
        latitude: 25.2532,
        longitude: 55.3657,
    },
    {
        airportId: "LHR",
        name: "London Heathrow Airport",
        city: "London",
        country: "UK",
        type: "international",
        timezone: "Europe/London",
        latitude: 51.47,
        longitude: -0.4543,
    },
    {
        airportId: "CDG",
        name: "Charles de Gaulle Airport",
        city: "Paris",
        country: "France",
        type: "international",
        timezone: "Europe/Paris",
        latitude: 49.0097,
        longitude: 2.5479,
    },
    {
        airportId: "SYD",
        name: "Sydney Kingsford Smith Airport",
        city: "Sydney",
        country: "Australia",
        type: "international",
        timezone: "Australia/Sydney",
        latitude: -33.9399,
        longitude: 151.1753,
    },
    {
        airportId: "HND",
        name: "Tokyo Haneda Airport",
        city: "Tokyo",
        country: "Japan",
        type: "international",
        timezone: "Asia/Tokyo",
        latitude: 35.5494,
        longitude: 139.7798,
    },
    {
        airportId: "FRA",
        name: "Frankfurt am Main Airport",
        city: "Frankfurt",
        country: "Germany",
        type: "international",
        timezone: "Europe/Berlin",
        latitude: 50.0379,
        longitude: 8.5622,
    },
    {
        airportId: "ORD",
        name: "O'Hare International Airport",
        city: "Chicago",
        country: "USA",
        type: "international",
        timezone: "America/Chicago",
        latitude: 41.9742,
        longitude: -87.9073,
    },
    {
        airportId: "ICN",
        name: "Incheon International Airport",
        city: "Seoul",
        country: "South Korea",
        type: "international",
        timezone: "Asia/Seoul",
        latitude: 37.4602,
        longitude: 126.4407,
    },
    {
        airportId: "BKK",
        name: "Suvarnabhumi Airport",
        city: "Bangkok",
        country: "Thailand",
        type: "international",
        timezone: "Asia/Bangkok",
        latitude: 13.69,
        longitude: 100.7501,
    },
    {
        airportId: "AMS",
        name: "Amsterdam Airport Schiphol",
        city: "Amsterdam",
        country: "Netherlands",
        type: "international",
        timezone: "Europe/Amsterdam",
        latitude: 52.3105,
        longitude: 4.7683,
    },
];


const seedAirports = async () => {
    try {
        // connect to db
        await connectDB();

        // clear existing airlines before inserting
        await Airport.deleteMany();
        console.log("Cleared existing airports");

        // insert new ones
        await Airport.insertMany(airports);
        console.log(`${airports.length} airports successfully!`);
    } catch (error) {
        console.error("Error seeding airports:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

seedAirports();
