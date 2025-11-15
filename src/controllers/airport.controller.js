import Airport from "../models/airport.model.js";
import AppError from "../utils/AppError.js";

// Get all airports
export const getAllAirports = async (req, res, next) => {
  try {
    const airports = await Airport.find();
    if (!airports.length) throw new AppError("No airports found", 404);
    res.status(200).json(airports);
  } catch (error) {
    next(error);
  }
};

// Get single airport by ID
export const getAirportById = async (req, res, next) => {
  try {
    const airport = await Airport.findById(req.params.id);
    if (!airport) throw new AppError("Airport not found", 404);
    res.status(200).json(airport);
  } catch (error) {
    next(error);
  }
};

// Create new airport
export const createAirport = async (req, res, next) => {
  try {
    const airport = await Airport.create(req.body);
    res.status(201).json(airport);
  } catch (error) {
    next(error);
  }
};

// Update airport
export const updateAirport = async (req, res, next) => {
  try {
    const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!airport) throw new AppError("Airport not found", 404);
    res.status(200).json(airport);
  } catch (error) {
    next(error);
  }
};

// Delete airport (ensure no active flights)
export const deleteAirport = async (req, res, next) => {
  try {
    // TODO: Add logic to check active flights using this airport before deleting
    const airport = await Airport.findByIdAndDelete(req.params.id);
    if (!airport) throw new AppError("Airport not found", 404);
    res.status(200).json({ message: "Airport deleted successfully" });
  } catch (error) {
    next(error);
  }
};
