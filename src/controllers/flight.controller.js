import Airline from "../models/airline.model.js";
import Airport from "../models/airport.model.js";
import Flight from "../models/flight.model.js";
import AppError from "../utils/AppError.js";
import { calculateDistance } from "../utils/flightUtilities.js";


export const searchFlights = async (req, res, next) => {
    try {
        const {
            origin,
            destination,
            departureDate,
            returnDate,
            passengers = 1,
            flightType,
            tripType = "oneWayTrip",
        } = req.query;

        if (!origin || !destination || !departureDate) {
            throw new AppError("Missing required search parameters", 400);
        }

        const originAirport = await Airport.findOne({ airportId: origin.toUpperCase() });
        const destinationAirport = await Airport.findOne({ airportId: destination.toUpperCase() });

        if (!originAirport || !destinationAirport) {
            throw new AppError("Origin or destination airport not found", 404);
        }

        const existingFlights = await Flight.find({
            origin: originAirport._id,
            destination: destinationAirport._id,
            departureTime: {
                $gte: new Date(departureDate),
                $lt: new Date(new Date(departureDate).getTime() + 24 * 60 * 60 * 1000),
            },
        })
            .populate("airline")
            .populate("origin")
            .populate("destination");

        if (existingFlights.length > 0) {
            return res.json({ results: existingFlights });
        }

        if (!originAirport) {
            throw new AppError(`Origin airport ${origin} not found`, 404);
        }

        // Get available airlines
        let airlines = await Airline.find();

        if (flightType === "domestic") {
            // Filter airlines that match the origin country
            airlines = airlines.filter(
                (airline) => airline.country === originAirport.country
            );

            // Fallback: if none found, use all airlines
            if (airlines.length === 0) {
                console.warn(`No local airlines found for ${originAirport.country}, using all airlines`);
                airlines = await Airline.find();
            }
        }

        if (airlines.length === 0) {
            throw new AppError("No airlines available in the database", 404);
        }


        // Calculate distance
        const distanceKm = calculateDistance(
            originAirport.latitude,
            originAirport.longitude,
            destinationAirport.latitude,
            destinationAirport.longitude
        );

        // Generate 10 flights
        const baseTime = new Date(departureDate);
        const generatedFlights = [];

        for (let i = 0; i < 10; i++) {
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            const departureTime = new Date(baseTime.getTime() + i * 60 * 60 * 1000);

            // Approximate flight duration (assuming ~800 km/h average speed)
            const baseDurationHours = distanceKm / 800;
            const randomVariance = (Math.random() * 0.3) - 0.15; // ±15%
            const flightDurationHrs = Math.max(0.5, baseDurationHours * (1 + randomVariance));
            const flightDurationMinutes = Math.round(flightDurationHrs * 60);

            // Arrival Time
            const arrivalTime = new Date(departureTime.getTime() + flightDurationMinutes * 60 * 1000);

            // Approximate base price — e.g. ₱4 per km + random variance
            const basePricePerKm = 4;
            const basePrice = Number(
                (distanceKm * basePricePerKm * (1 + (Math.random() * 0.3 - 0.15))).toFixed(2)
            );

            const flightNumber = `${airline.iataCode || airline.airlineId}${Math.floor(Math.random() * 900 + 100)}`;

            generatedFlights.push({
                airline: airline._id,
                flightNumber,
                origin: originAirport._id,
                destination: destinationAirport._id,
                departureTime,
                arrivalTime,
                flightType,
                status: "scheduled",
                flightDuration: flightDurationMinutes,
                basePrice,
            });
        }

        const insertedFlights = await Flight.create(generatedFlights);
        const populatedFlights = await Flight.find({
            _id: { $in: insertedFlights.map((f) => f._id) },
        })
            .populate("airline")
            .populate("origin")
            .populate("destination");

        res.status(201).json({ results: populatedFlights });
    } catch (error) {
        next(error);
    }
};

// GET all flights (populated)
export const getAllFlights = async (req, res, next) => {
  try {
    const flights = await Flight.find()
      .populate("airline")
      .populate("origin")
      .populate("destination")
      .sort({ departureTime: 1 });

    res.status(200).json(flights);
  } catch (err) {
    next(err);
  }
};

// GET single flight by ID
export const getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate("airline")
      .populate("origin")
      .populate("destination");

    if (!flight) throw new AppError("Flight not found", 404);

    res.status(200).json(flight);
  } catch (err) {
    next(err);
  }
};

// CREATE a new flight
export const createFlight = async (req, res, next) => {
  try {
    const { airline, flightNumber, origin, destination, departureTime, arrivalTime, flightType, status, basePrice } = req.body;

    // Validate required fields
    if (!airline || !flightNumber || !origin || !destination || !departureTime || !arrivalTime || !flightType || !basePrice) {
      throw new AppError("Missing required fields", 400);
    }

    const flight = await Flight.create({
      airline,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      flightType,
      status: status || "scheduled",
      basePrice,
    });

    const populatedFlight = await Flight.findById(flight._id)
      .populate("airline")
      .populate("origin")
      .populate("destination");

    res.status(201).json(populatedFlight);
  } catch (err) {
    next(err);
  }
};

// UPDATE flight
export const updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) throw new AppError("Flight not found", 404);

    Object.assign(flight, req.body); // update fields
    await flight.save();

    const populatedFlight = await Flight.findById(flight._id)
      .populate("airline")
      .populate("origin")
      .populate("destination");

    res.status(200).json(populatedFlight);
  } catch (err) {
    next(err);
  }
};

// DELETE flight
export const deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);

    if (!flight) throw new AppError("Flight not found", 404);

    res.status(200).json({ message: "Flight deleted successfully" });
  } catch (err) {
    next(err);
  }
};
