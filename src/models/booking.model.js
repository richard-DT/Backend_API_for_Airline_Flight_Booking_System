import mongoose from "mongoose";
import Counter from "./counter.js";

const bookingContactSchema = new mongoose.Schema({
  title: {
    type: String,
    enum: ["Mr", "Ms", "Mrs", "Mx", "Dr"],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
}, { _id: false }); // _id: false prevents a nested _id inside bookingContact


const bookingSchema = new mongoose.Schema({

  // Booking Id - to be used as reference / booking number (human readable)
  bookingId: {
    type: String,
    unique: true
  },

  // User id
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // optional
  },

  // Flights Array [0] - departing flight (1 way), [1] returning flight (round trip)
  flights: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true
    }
  ],

  // Booking date
  bookingDate: {
    type: Date,
    required: true
  },

  // Trip Type
  tripType: {
    type: String,
    enum: ["oneWayTrip", "roundTrip"],
    default: "oneWayTrip"
  },

  // Total amount of booking
  totalAmount: {
    type: Number,
    required: true
  },

  // Flight Prices - includes cabin class, seat number, add-ons
  flightPrices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlightPrice",
      required: true
    }
  ],

  // Booking Status
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "completed", "created"],
    default: "created"
  },

  passengers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passenger'
    }
  ],

  // Passenger Count
  passengerCount: {
    type: Number,
    required: true
  },

  // Booking Contact Information (Lead contact - the one who booked the flight)
  bookingContact: {
    type: bookingContactSchema,
    required: true
  },

  // Randomly assigned seat, gate, and terminal
  seatNumbers: {
    type: [String],
    default: [],
  },

  departureGate: {
    type: String
  },

  departureTerminal: {
    type: String
  },

  arrivalGate: {
    type: String
  },

  arrivalTerminal: {
    type: String
  },

}, {
  timestamps: true,
  collection: 'bookings'
});


// Helper function to generate random seat
function generateSeat() {
  const row = Math.floor(Math.random() * 30) + 1; // Rows 1-30
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const column = columns[Math.floor(Math.random() * columns.length)];
  return `${row}${column}`;
}

// Helper function to generate random gate
function generateGate() {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // Gates A-F
  const number = Math.floor(Math.random() * 20) + 1; // Gate 1-20
  return `${letter}${number}`;
}

// Helper function to generate random terminal
function generateTerminal() {
  const letters = ['T1', 'T2', 'T3', 'T4'];
  return letters[Math.floor(Math.random() * letters.length)];
}


// Generate sequential bookingId and random seat/gate/terminal before saving
bookingSchema.pre("save", async function (next) {
  // Generate bookingId if not set
  if (!this.bookingId) {
    const datePrefix = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const prefix = `FLYX-${datePrefix}`;

    const counter = await Counter.findOneAndUpdate(
      { prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = counter.seq.toString().padStart(4, "0");
    this.bookingId = `${prefix}-${seqNumber}`;
  }

  // Generate multiple random seat numbers if seatNumbers is empty
  if (!this.seatNumbers || this.seatNumbers.length === 0) {
    const seats = new Set(); // ensures no duplicates
    while (seats.size < this.passengerCount) {
      seats.add(generateSeat());
    }
    this.seatNumbers = Array.from(seats);
  }

  if (!this.departureGate) this.departureGate = generateGate();
  if (!this.arrivalGate) this.arrivalGate = generateGate();
  if (!this.departureTerminal) this.departureTerminal = generateTerminal();
  if (!this.arrivalTerminal) this.arrivalTerminal = generateTerminal();

  next();
});


const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
