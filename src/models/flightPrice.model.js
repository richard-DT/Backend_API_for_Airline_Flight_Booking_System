import mongoose from "mongoose";
import { addOnsMultiplier, cabinMultipliers, TAX_RATES } from "../utils/priceMultipliers.js";

// Sub-schema for taxes
const taxesSchema = new mongoose.Schema({
    adminFee: { type: Number, default: 0 },
    fuelSurcharge: { type: Number, default: 0 },
    adminFeeVAT: { type: Number, default: 0 },
    domesticPassengerServiceCharge: { type: Number, default: 0 },
    airportDomesticPassengerServiceCharge: { type: Number, default: 0 },
    valueAddedTax: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
});

// Sub-schema for add-ons with detailed pricing
const addOnItemSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['travelInsurance', 'seatSelector', 'extraBaggage'],
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
}, { _id: false });

// Main flight price schema
const flightPriceSchema = new mongoose.Schema(
    {
        flightId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Flight",
            required: true,
        },
        cabin: {
            type: String,
            enum: ["economy", "business", "first"],
            default: "economy",
        },
        basePrice: {
            type: Number,
            required: true,
        },
        addOns: {
            type: [addOnItemSchema],
            default: [],
        },
        taxes: {
            type: taxesSchema,
            default: {}
        },

        passengerCount: {
            type: Number,
            required: true,
            default: 1
        }

    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        collection: 'flightPrices',
    }
);

// --- Compute Taxes ---
flightPriceSchema.methods.calculateTaxes = function () {
    if (!this.taxes) this.taxes = {};

    for (const [taxName, rate] of Object.entries(TAX_RATES)) {
        const cabinMultiplier = cabinMultipliers[this.cabin] || 1;
        this.taxes[taxName] = this.basePrice * cabinMultiplier * rate * this.passengerCount;
    }

    const taxValues = Object.values(TAX_RATES).map(rate => this.basePrice * rate * this.passengerCount);
    this.taxes.subtotal = taxValues.reduce((acc, val) => acc + val, 0);
};

// --- Compute Add-Ons ---
flightPriceSchema.methods.calculateAddOns = function () {
    this.addOns = this.addOns.map(addOn => {
        const rate = addOnsMultiplier[addOn.name] || 0;
        const cabinMultiplier = cabinMultipliers[this.cabin] || 1;
        const price = this.basePrice * cabinMultiplier * rate * this.passengerCount;
        return { name: addOn.name, price };
    });
};

// --- Pre-save Hook ---
flightPriceSchema.pre("save", function (next) {
    this.calculateTaxes();
    this.calculateAddOns();
    next();
});

// --- Virtual Total Price ---
flightPriceSchema.virtual("totalPrice").get(function () {
    const cabinMultiplier = cabinMultipliers[this.cabin] || 1;
    const addOnsTotal = (this.addOns || []).reduce((sum, a) => sum + (a.price || 0), 0);
    return this.basePrice * cabinMultiplier * this.passengerCount + (this.taxes?.subtotal || 0) + addOnsTotal;
});

const FlightPrice = mongoose.model("FlightPrice", flightPriceSchema);

export default FlightPrice;
