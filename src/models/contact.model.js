import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    trim: true
  },

  message: {
    type: String,
    required: true,
    trim: true
  },
},
  {
    timestamps: true,
    collection: 'contacts'
  }
);

export const Contact = mongoose.model("Contact", contactSchema);
