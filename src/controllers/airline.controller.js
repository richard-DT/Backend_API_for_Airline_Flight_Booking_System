import Airline from "../models/airline.model.js";
import Flight from "../models/flight.model.js";
import AppError from "../utils/AppError.js";

// Create new airline
export const createAirline = async (req, res, next) => {
  try {
    const airline = await Airline.create(req.body);
    res.status(201).json({ message: "Airline created", airline });
  } catch (err) {
    next(err);
  }
};

// Update airline
export const updateAirline = async (req, res, next) => {
  try {
    const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!airline) throw new AppError("Airline not found", 404);
    res.status(200).json({ message: "Airline updated", airline });
  } catch (err) {
    next(err);
  }
};

// Delete airline (only if no active flights)
export const deleteAirline = async (req, res, next) => {
  try {
    const activeFlights = await Flight.find({ airline: req.params.id });
    if (activeFlights.length) throw new AppError("Cannot delete airline with active flights", 400);
    const airline = await Airline.findByIdAndDelete(req.params.id);
    if (!airline) throw new AppError("Airline not found", 404);
    res.status(200).json({ message: "Airline deleted" });
  } catch (err) {
    next(err);
  }
};

// Get airline by id (optional)
export const getAirlineById = async (req, res, next) => {
  try {
    const airline = await Airline.findById(req.params.id);
    if (!airline) throw new AppError("Airline not found", 404);
    res.status(200).json(airline);
  } catch (err) {
    next(err);
  }
};

export const getAllAirlines = async (req, res, next) => {
  try {
    const airlines = await Airline.find();
    if (!airlines.length) throw new AppError("No airlines found", 404);
    res.status(200).json(airlines);
  } catch (err) {
    next(err);
  }
};

