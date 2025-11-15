import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { fileURLToPath } from "url";
import Booking from "../models/booking.model.js";
import Passenger from "../models/passenger.model.js";
import AppError from "../utils/AppError.js";
import { formatDateTime, formatTime } from "../utils/date.js";
import { capitalize } from "../utils/string.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateBoardingPassPDF = async (req, res, next) => {
    try {
        const { bookingId, passengerId } = req.params;
        const passengerIndex = req.query.passengerIndex || 0;


        const bookingDetails = await Booking.findById(bookingId)
            .populate({
                path: "flights",
                populate: [
                    { path: "origin", model: "Airport" },
                    { path: "destination", model: "Airport" },
                    { path: "airline", model: "Airline" }
                ]
            })
            .populate({
                path: "flightPrices",
                populate: { path: "flightId", model: "Flight" },
            })
            .populate("passengers")
            .exec();


        if (!bookingDetails) throw new AppError("Booking not found", 404);

        const passenger = await Passenger.findById(passengerId);
        if (!passenger) throw new AppError("Passenger not found", 404);

        const departureDate = new Date(bookingDetails.flights[0].departureTime);
        const boardingTime = new Date(departureDate.getTime() - 30 * 60 * 1000);

        const booking = {
            bookingId: bookingDetails.bookingId,
            airline: bookingDetails.flights[0].airline.name,
            passengerName: `${passenger.firstName} ${passenger.lastName}`,
            flightNumber: bookingDetails.flights[0].flightNumber,
            origin: bookingDetails.flights[0].origin.airportId,
            destination: bookingDetails.flights[0].destination.airportId,
            departureDate: formatDateTime(bookingDetails.flights[0].departureTime),
            terminal: bookingDetails.departureTerminal,
            gate: bookingDetails.departureGate,
            seat: bookingDetails.seatNumbers[passengerIndex],
            boardingTime: formatTime(boardingTime),
            class: capitalize(bookingDetails.flightPrices[0].cabin) || 'Economy',
        };

        const doc = new PDFDocument({
            size: [600, 250], // more ticket-like
            margin: 0,
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="boardingpass-${booking.bookingId}.pdf"`
        );

        doc.pipe(res);

        // COLORS & STYLES
        const primaryColor = "#092C4C";
        const lightBg = "#F1F3F4";
        const textColor = "#212121";
        const grayText = "#555";

        // BACKGROUND
        doc.rect(0, 0, 600, 250).fill(lightBg);

        // LEFT SECTION (main ticket)
        doc.rect(0, 0, 420, 250).fill("#FFFFFF");

        // CUT LINE
        doc.moveTo(420, 0).lineTo(420, 250).dash(5, { space: 5 }).strokeColor("#aaa").stroke().undash();

        // RIGHT SECTION (stub)
        doc.rect(420, 0, 180, 250).fill("#FFFFFF");

        // --- LOGO ---
        const logoPath = path.join(__dirname, "../public/flyx_logo.png");
        try {
            doc.image(logoPath, 20, 20, { width: 80 });
        } catch {
            doc.fontSize(20).fillColor(primaryColor).text("Flyx", 20, 25);
        }

        // --- FLIGHT TITLE ---
        doc.fontSize(14).fillColor(primaryColor).text(`Booking No: ${booking.bookingId}`, 120, 30);

        // --- MAIN INFO ---
        doc.fontSize(24).fillColor(textColor).text(`${booking.origin}`, 30, 80);

        // Draw a right arrow between origin and destination
        doc.save();
        doc.lineWidth(2);
        doc.moveTo(95, 90)          // start point of arrow shaft
            .lineTo(115, 90)         // arrow shaft length
            .moveTo(115, 90)         // arrowhead start
            .lineTo(110, 85)         // upper arrowhead line
            .moveTo(115, 90)
            .lineTo(110, 95)         // lower arrowhead line
            .strokeColor(textColor)
            .stroke();
        doc.restore();

        doc.fontSize(24).fillColor(textColor).text(`${booking.destination}`, 130, 80);

        doc.fontSize(10).fillColor(grayText).text("From", 30, 110);
        doc.text("To", 130, 110);

        // --- Flight & Seat & Gate & Class & Terminal ---
        doc.fontSize(12).fillColor(grayText).text("Flight", 30, 140);
        doc.fontSize(14).fillColor(textColor).text(booking.flightNumber, 30, 155);

        doc.fontSize(12).fillColor(grayText).text("Seat", 110, 140);
        doc.fontSize(14).fillColor(textColor).text(booking.seat, 110, 155);

        doc.fontSize(12).fillColor(grayText).text("Gate", 180, 140);
        doc.fontSize(14).fillColor(textColor).text(booking.gate, 180, 155);

        doc.fontSize(12).fillColor(grayText).text("Terminal", 250, 140);
        doc.fontSize(14).fillColor(textColor).text(booking.terminal, 250, 155);

        doc.fontSize(12).fillColor(grayText).text("Class", 320, 140);
        doc.fontSize(14).fillColor(textColor).text(booking.class, 320, 155);

        // --- Passenger Name ---
        doc.fontSize(10).fillColor(grayText).text("Passenger", 30, 190);
        doc.fontSize(14).fillColor(textColor).text(booking.passengerName, 30, 205);

        // --- Date / Time ---
        doc.fontSize(10).fillColor(grayText).text("Departure", 250, 190);
        doc.fontSize(12).fillColor(textColor).text(booking.departureDate, 250, 205);

        // --- QR CODE ---
        const qrData = `BookingID:${booking.bookingId}\nPassenger:${booking.passengerName}\nFlight:${booking.flightNumber}`;
        const qrImage = await QRCode.toDataURL(qrData, { margin: 0 });
        const qrBuffer = Buffer.from(qrImage.split(",")[1], "base64");
        doc.image(qrBuffer, 460, 50, { width: 100 });

        // --- Stub Info ---
        doc.fontSize(12).fillColor(textColor).text(booking.flightNumber, 450, 170);
        doc.fontSize(10).fillColor(grayText).text("Flight", 450, 185);

        doc.fontSize(12).fillColor(textColor).text(booking.seat, 520, 170);
        doc.fontSize(10).fillColor(grayText).text("Seat", 520, 185);

        doc.fontSize(10).fillColor(textColor).text(booking.passengerName, 450, 205);
        doc.fontSize(8).fillColor(grayText).text(booking.boardingTime, 450, 220);

        // --- Footer Bar ---
        doc.rect(0, 240, 600, 10).fill(primaryColor);

        doc.end();

    } catch (error) {
        next(error);
    }
};
