import Passenger from "../models/passenger.model.js";
import AppError from "../utils/AppError.js";

// Get all passengers
export const getAllPassengers = async (req, res, next) => {
  try {
    const passengers = await Passenger.find()
      .populate("bookingId", "bookingId") // show booking reference
      .select("passengerId bookingId firstName lastName nationality dateOfBirth"); // only required fields

    if (!passengers.length) {
      throw new AppError("No passengers found", 404);
    }

    res.status(200).json(passengers);
  } catch (err) {
    next(err);
  }
};

// Get a single passenger by ID
export const getPassengerById = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.params.id)
      .populate("bookingId", "bookingId")
      .select("passengerId bookingId firstName lastName nationality dateOfBirth");

    if (!passenger) {
      throw new AppError("Passenger not found", 404);
    }

    res.status(200).json(passenger);
  } catch (err) {
    next(err);
  }
};

// Update passenger details
export const updatePassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("passengerId bookingId firstName lastName nationality dateOfBirth");

    if (!passenger) {
      throw new AppError("Passenger not found", 404);
    }

    res.status(200).json(passenger);
  } catch (err) {
    next(err);
  }
};
