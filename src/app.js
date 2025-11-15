import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import airportRoutes from "./routes/airport.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import flightRoutes from "./routes/flight.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import userRoutes from "./routes/user.routes.js";
import airlineRoutes from "./routes/airline.routes.js";
import passengerRoutes from "./routes/passenger.routes.js";

dotenv.config();

const app = express();

//  CORS configuration to allow both local at online testing
const allowedOrigins = [
  process.env.FRONTEND_LOCAL,
  process.env.FRONTEND_PROD,
];

app.use(
  cors({
    origin: "*",
    // origin: allowedOrigins,
    credentials: true,
  })
);

// Middleware
// app.use(cors());
app.use(express.json());


// Routess
app.use("/api/users", userRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/airlines", airlineRoutes);
app.use("/api/passengers", passengerRoutes);


// For UptimeRobot Monitoring DO NOT DELETE
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
