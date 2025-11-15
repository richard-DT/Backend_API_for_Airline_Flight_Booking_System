import mongoose from "mongoose";
import Counter from "./counter.js";

const passengerSchema = new mongoose.Schema(
  {
    passengerId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    title: {
      type: String,
      enum: ["Mr", "Ms"],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "passengers",
  }
);

// Helper function to generate passengerId
async function generatePassengerId() {
  const datePrefix = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const prefix = `PAX-${datePrefix}`;

  const counter = await Counter.findOneAndUpdate(
    { prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNumber = counter.seq.toString().padStart(4, "0");
  return `${prefix}-${seqNumber}`;
}

// Pre-save for individual inserts
passengerSchema.pre("save", async function (next) {
  if (!this.passengerId) {
    this.passengerId = await generatePassengerId();
  }
  next();
});

//Pre-insertMany for batch inserts
passengerSchema.pre("insertMany", async function (next, docs) {
  for (const doc of docs) {
    if (!doc.passengerId) {
      doc.passengerId = await generatePassengerId();
    }
  }
  next();
});

const Passenger = mongoose.model("Passenger", passengerSchema);
export default Passenger;
