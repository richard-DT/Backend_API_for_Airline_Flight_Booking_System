import mongoose from "mongoose";
import Counter from "./counter.js";

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "GCash", "PayPal", "MockGateway"],
      default: "Credit Card",
    },

    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },

    billingInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      contactNumber: { type: String, required: true },
      email: { type: String, required: true },
    },
    cardInfo: {
      last4: { type: String, required: true },   // Last 4 only
      expDate: { type: String, required: true },
    }
  },
  {
    timestamps: true,
    collection: "payments",
  }
);


PaymentSchema.pre("save", async function (next) {
  if (this.paymentId) return next(); // already set

  const datePrefix = new Date().toISOString().split("T")[0].replace(/-/g, ""); // e.g. 20251104
  const prefix = `PAY-${datePrefix}`;

  const counter = await Counter.findOneAndUpdate(
    { prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNumber = counter.seq.toString().padStart(4, "0");
  this.paymentId = `${prefix}-${seqNumber}`;

  next();
});



const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;