import { Booking } from "../models/booking.model.js";
import { Flight } from "../models/flight.model.js";
import { Passenger } from "../models/passenger.model.js";
import { Payment } from "../models/payment.model.js";

export const getCurrentBooking = async (req, res) => {
  try {
    const userId = req.user._id;

    const booking = await Booking.findOne({ userId, status: "Confirmed" })
      .sort({ bookingDate: 1 })
      .populate({
        path: "flightId",
        model: Flight,
        select: "flightNumber fromLocation toLocation departureDate arrivalDate airlineId"
      })
      .lean();

    if (!booking) return res.json(null);

    const passenger = await Passenger.findOne({ bookingId: booking._id }).lean();
    const payment = await Payment.findOne({ bookingId: booking._id }).lean();

    res.json({
      bookingId: booking.bookingId,
      seatNumber: booking.seatNumber,
      status: booking.status,
      flight: booking.flightId,
      passenger,
      payment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getBookingHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .sort({ bookingDate: -1 })
      .populate({
        path: "flightId",
        model: Flight,
        select: "flightNumber fromLocation toLocation departureDate arrivalDate airlineId"
      })
      .lean();

    const result = await Promise.all(
      bookings.map(async (b) => {
        const passenger = await Passenger.findOne({ bookingId: b._id }).lean();
        const payment = await Payment.findOne({ bookingId: b._id }).lean();

        return {
          bookingId: b.bookingId,
          seatNumber: b.seatNumber,
          status: b.status,
          totalAmount: b.totalAmount,
          flight: b.flightId,
          passenger,
          payment,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

