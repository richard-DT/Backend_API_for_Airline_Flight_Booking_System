import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const isDev = process.env.NODE_ENV === "development";

        const mongoURI = isDev
            ? process.env.MONGODB_STRING_LOCAL
            : process.env.MONGODB_STRING_PROD;

        console.log("Connecting to:", mongoURI);
        const conn = await mongoose.connect(mongoURI);

        console.log(
            `MongoDB Connected: ${conn.connection.host} (${isDev ? "Local" : "Production"})`
        );
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
