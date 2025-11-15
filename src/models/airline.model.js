import mongoose from "mongoose";

const AirlineSchema = new mongoose.Schema(
    {
        // Unique airline code — like "FLYX", "AAL", "JAL", "PAL", etc.
        airlineId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        // Full name of the airline
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Country of registration or headquarters
        country: {
            type: String,
            required: true,
            trim: true
        },

        // IATA (2-letter) or ICAO (3-letter) official airline codes
        iataCode: {
            type: String,
            trim: true,
            maxlength: 2,
            uppercase: true
        },
        icaoCode: {
            type: String,
            trim: true,
            maxlength: 3,
            uppercase: true
        },

        // logo URL or path (could be used in UI)
        logoUrl: {
            type: String,
            trim: true
        },

        // website info
        website: {
            type: String,
            trim: true
        },
    },
    {
        timestamps: true, // automatically adds createdAt and updatedAt
        collection: 'airlines'
    }
);

const Airline = mongoose.model("Airline", AirlineSchema);
export default Airline;