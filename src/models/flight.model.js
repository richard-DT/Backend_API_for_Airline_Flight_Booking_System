import mongoose from "mongoose";
import { cabinMultipliers } from "../utils/priceMultipliers.js";
import Counter from "./counter.js";

const FlightSchema = new mongoose.Schema({

    flightId: {
        type: String,
        unique: true
    },

    airline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Airline",
        required: true
    },

    flightNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },

    origin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Airport",
        required: true
    },

    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Airport",
        required: true
    },

    departureTime: {
        type: Date,
        required: true
    },

    arrivalTime: {
        type: Date,
        required: true
    },

    flightType: {
        type: String,
        enum: ["domestic", "international"],
        required: true
    },

    status: {
        type: String,
        enum: ["scheduled", "boarding", "departed", "arrived", "cancelled"],
        default: "scheduled"
    },

    flightDuration: {
        type: Number,
        min: [0, "Flight duration cannot be negative"],
    },

    basePrice: {
        type: Number,
        required: true,
        min: [0, "Base price must be a positive value"]
    },

    pricePerCabin: {
        economy: { type: Number },
        business: { type: Number },
        first: { type: Number },
    },

},
    {
        timestamps: true,
        collection: 'flights'
    }
);

FlightSchema.pre("save", async function (next) {
    if (this.flightId) return next();

    const datePrefix = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const prefix = `FL-${datePrefix}`;

    const counter = await Counter.findOneAndUpdate(
        { prefix },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const seqNumber = counter.seq.toString().padStart(4, "0");
    this.flightId = `${prefix}-${seqNumber}`;

    next();
});


FlightSchema.pre("save", function (next) {
    if (!this.basePrice) return next();

    this.pricePerCabin = {
        economy: this.basePrice * cabinMultipliers.economy,
        business: this.basePrice * cabinMultipliers.business,
        first: this.basePrice * cabinMultipliers.first,
    };

    next();
});

const Flight = mongoose.model("Flight", FlightSchema);
export default Flight;
