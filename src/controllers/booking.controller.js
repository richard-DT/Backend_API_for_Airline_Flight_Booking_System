import Booking from "../models/booking.model.js";
import Flight from "../models/flight.model.js";
import FlightPrice from "../models/flightPrice.model.js";
import Passenger from "../models/passenger.model.js";
import AppError from "../utils/AppError.js";

// --- Book a flight ---
export const bookFlight = async (req, res, next) => {
  try {
    const { flightId, passengers, addOns, cabin, tripType, bookingContact } = req.body;

    // Get flight details
    const flight = await Flight.findById(flightId);
    if (!flight) throw new AppError("Flight not found", 404);

    // Create flight price document
    const flightPrice = await FlightPrice.create({
      flightId,
      basePrice: flight.pricePerCabin[cabin.toLowerCase()],
      cabinClass: cabin,
      addOns,
      passengerCount: passengers.length,
    });

    // Create booking first (without passengers)
    const booking = await Booking.create({
      userId: req.user ? req.user.id : undefined,  // if no userId is present (non-authenticated user) pass in empty string
      flights: [flightId],
      bookingDate: new Date(),
      tripType,
      totalAmount: flightPrice.totalPrice,
      flightPrices: [flightPrice._id],
      passengerCount: passengers.length,
      bookingContact,
    });

    // Attach bookingId to passengers
    const passengersArray = passengers.map((p) => ({
      ...p,
      bookingId: booking._id,
      userId: req.user ? req.user.id : undefined,  // if no userId is present (non-authenticated user) pass in empty string
    }));

    // Insert passengers
    const createdPassengers = await Passenger.insertMany(passengersArray);

    // Link passengers to booking
    booking.passengers = createdPassengers.map((p) => p._id);
    await booking.save();

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("passengers")
      .populate({
        path: "flights",
        populate: [
          { path: "origin", model: "Airport" },
          { path: "destination", model: "Airport" },
          { path: "airline", model: "Airline" },
        ],
      })
      .populate({
        path: "flightPrices",
        populate: { path: "flightId", model: "Flight" },
      });

    res.status(200).json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to book flight.", error: error.message });
  }
};


// Get user's current active booking
export const getCurrentBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    const booking = await Booking.findOne({
      userId,
      status: { $in: ["created", "confirmed"] },
    })
      .sort({ bookingDate: -1 })
      .populate("passengers")
      .populate({
        path: "flights",
        populate: [
          { path: "origin", model: "Airport" },
          { path: "destination", model: "Airport" },
          { path: "airline", model: "Airline" },
        ],
      })
      .populate({
        path: "flightPrices",
        populate: { path: "flightId", model: "Flight" },
      });

    if (!booking) {
      return res.status(404).json({ message: "No active booking found." });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error getting current booking:", error);
    res.status(500).json({
      message: "Failed to fetch current booking.",
      error: error.message,
    });
  }
};

// Get booking history for user
export const getBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .sort({ bookingDate: -1 })
      .populate("passengers")
      .populate({
        path: "flights",
        populate: [
          { path: "origin", model: "Airport" },
          { path: "destination", model: "Airport" },
          { path: "airline", model: "Airline" },
        ],
      })
      .populate({
        path: "flightPrices",
        populate: { path: "flightId", model: "Flight" },
      });

    if (!bookings.length) {
      return res.status(404).json({ message: "No booking history found." });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error getting booking history:", error);
    res.status(500).json({
      message: "Failed to get booking history.",
      error: error.message,
    });
  }
};

// =======================
// ADMIN CONTROLLERS
// =======================

// Get all bookings (Admin only)

export const getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate, bookingId } = req.query;

    const query = {};

    if (status) query.status = status;
    if (bookingId) query.bookingId = bookingId;
    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) query.bookingDate.$gte = new Date(startDate);
      if (endDate) query.bookingDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate("userId", "email role")
      .populate("flights")
      .populate("passengers")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Failed to load bookings", error: error.message });
  }
};



//Get booking by ID (Admin only)
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "email role")
      .populate("flights")
      .populate("passengers");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Failed to fetch booking", error: error.message });
  }
};


// Update booking status (Admin only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;


    if (status === "cancelled") {
      booking.cancelledAt = new Date();

    }

    await booking.save();

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
};

