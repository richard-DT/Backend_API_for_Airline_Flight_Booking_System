import mongoose from "mongoose";

const AirportSchema = new mongoose.Schema(
    {
        // Custom readable airport ID (e.g. MNL, NRT, LAX)
        airportId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Full airport name
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // City where the airport is located
        city: {
            type: String,
            required: true,
            trim: true,
        },

        // Country of the airport
        country: {
            type: String,
            required: true,
            trim: true,
        },

        // Type of the airport
        type: {
            type: String,
            enum: ["international", "domestic", "regional", "military"],
            default: "international"
        },

        // IANA timezone (e.g. "Asia/Manila", "America/New_York")
        timezone: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (v) {
                    // Simple IANA timezone format validation
                    return /^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/.test(v);
                },
                message: (props) => `${props.value} is not a valid IANA timezone`,
            },
        },

        // Latitude
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90,
        },

        // Longitude
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180,
        },
    },
    {
        timestamps: true, // adds createdAt, updatedAt
        collection: "airports",
    }
);


const Airport = mongoose.model("Airport", AirportSchema);
export default Airport;
