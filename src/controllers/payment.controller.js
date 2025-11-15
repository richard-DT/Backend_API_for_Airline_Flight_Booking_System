import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import AppError from "../utils/AppError.js";
import { isExpired, isValidCardNumber } from "../utils/cardvalidators.js";



export const chargePayment = async (req, res, next) => {
    try {
        const {
            bookingId,
            amount,
            paymentMethod,
            billingInfo,
            cardInfo, // contains cardNumber, cvv, expDate from frontend
        } = req.body;

        //Validate required fields
        if (!bookingId || !amount || !billingInfo || !cardInfo) {
            throw new AppError("Missing required payment details", 400);
        }

        const { cardNumber, cvv, expDate } = cardInfo;

        // Basic Card Validation
        if (!/^\d{13,19}$/.test(cardNumber)) {
            throw new AppError("Invalid card number format.", 400);
        }

        if (!isValidCardNumber(cardNumber)) {
            throw new AppError("Invalid card number (failed Luhn check).", 400);
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            throw new AppError("Invalid CVV format.", 400);
        }

        if (isExpired(expDate)) {
            throw new AppError("Card has expired.", 400);
        }

        //Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        //Mock result
        const isSuccess = Math.random() > 0.01;
        const status = isSuccess ? "Success" : "Failed";

        // Mask card number (only store last 4)
        const safeCardInfo = {
            last4: cardNumber.slice(-4),
            expDate,
        };

        //Save payment record
        const payment = await Payment.create({
            bookingId,
            amount,
            paymentMethod: paymentMethod || "Credit Card",
            status,
            billingInfo,
            cardInfo: safeCardInfo,
        });

        // Populate booking details with nested relations
        const populatedPayment = await payment.populate({
            path: "bookingId",
            populate: [
                {
                    path: "flights",
                    populate: [
                        { path: "origin" },
                        { path: "destination" },
                        { path: "airline" },
                    ],
                },
                { path: "flightPrices" },
                { path: "passengers" },
            ],
        });

        //Respond
        if (!isSuccess) {
            return res.status(402).json({
                status: "Failed",
                message: "Payment could not be processed (mock failure).",
                payment,
            });
        }

        // Update booking status to 'confirmed'
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: "confirmed" },
            { new: true }
        );

        if (!updatedBooking) {
            throw new AppError("Booking not found while confirming payment.", 404);
        }

        res.status(201).json({
            status: "Success",
            message: "Payment processed successfully.",
            payment: populatedPayment,
        });
    } catch (error) {
        next(error);
    }
};



export const generatePaymentReceiptPDF = async (req, res, next) => {
    try {
        const { paymentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            throw new AppError("Invalid payment ID format", 400);
        }

        const payment = await Payment.findById(paymentId).populate({
            path: "bookingId",
            populate: [
                {
                    path: "flights",
                    populate: [{ path: "origin" }, { path: "destination" }, { path: "airline" }],
                },
                {
                    path: "flightPrices",
                    populate: { path: "flightId", model: "Flight" },
                },
                { path: "passengers" },
            ],
        });

        if (!payment) throw new AppError("Payment not found", 404);

        const booking = payment.bookingId;
        const flight = booking.flights?.[0];
        const passenger = booking.passengers?.[0];
        const billing = payment.billingInfo;
        const flightPrices = booking.flightPrices || [];

        // --- PDF SETUP ---
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=receipt-${payment.paymentId}.pdf`);
        doc.pipe(res);

        const lineColor = "#e0e0e0";
        const brandColor = "#092C4C";
        const textGray = "#555";

        // ===== HEADER =====
        doc
            .fillColor(brandColor)
            .fontSize(22)
            .text("Flyx", { align: "center" });
        doc.moveDown(0.2);
        doc.fontSize(14).fillColor("black").text("Payment Receipt", { align: "center" });
        doc.moveDown(0.2);
        doc.fontSize(11).fillColor(textGray).text(`Receipt No: ${payment.paymentId}`, { align: "center" });
        doc.fontSize(11).fillColor(textGray).text(`Booking No: ${booking.bookingId}`, { align: "center" });
        doc.text(`Date: ${new Date(payment.paymentDate).toLocaleString()}`, { align: "center" });
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(lineColor).stroke();
        doc.moveDown(1);

        // ===== BILLING + FLIGHT DETAILS (SIDE BY SIDE) =====
        const startY = doc.y;
        const col1X = 50;
        const col2X = 300;

        // --- BILLING INFO ---
        doc.fillColor("black").fontSize(13).text("Billing Information", col1X, startY, { underline: true });
        doc.fontSize(11).moveDown(0.3);
        doc.text(`${billing.firstName} ${billing.lastName}`);
        doc.text(billing.streetAddress);
        doc.text(`${billing.city}, ${billing.country}`);
        doc.text(`Contact: ${billing.contactNumber}`);
        doc.text(`Email: ${billing.email}`);

        // --- FLIGHT DETAILS ---
        if (flight) {
            doc.fillColor("black").fontSize(13).text("Flight Details", col2X, startY, { underline: true });
            doc.fontSize(11).moveDown(0.3);
            doc.text(`Airline: ${flight.airline.name}`, col2X);
            doc.text(`Flight: ${flight.flightNumber}`, col2X);
            doc.text(`From: ${flight.origin.city} (${flight.origin.airportId})`, col2X);
            doc.text(`To: ${flight.destination.city} (${flight.destination.airportId})`, col2X);
            doc.text(`Departure: ${new Date(flight.departureTime).toLocaleString()}`, col2X);
            doc.text(`Arrival: ${new Date(flight.arrivalTime).toLocaleString()}`, col2X);
        }

        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(lineColor).stroke();
        doc.moveDown(1);

        // ===== PASSENGER INFO =====
        if (passenger) {
            doc.fontSize(13).fillColor("black").text("Passenger Information", col1X, doc.y, { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(11);
            doc.text(`${passenger.title} ${passenger.firstName} ${passenger.lastName}`);
            doc.text(`Nationality: ${passenger.nationality}`);
            doc.moveDown();
        }

        // ===== PRICE BREAKDOWN =====
        doc.fontSize(13).fillColor("black").text("Price Breakdown", { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11);

        flightPrices.forEach((price, index) => {
            doc.font("Helvetica-Bold").text(`Flight ${index + 1}`);
            doc.font("Helvetica").moveDown(0.2);
            doc.text(`Cabin: ${price.cabin}`);
            doc.text(`Base Fare: PHP ${price.basePrice.toFixed(2)}`);

            if (price.addOns?.length) {
                doc.text("Add-ons:");
                price.addOns.forEach((add) => {
                    doc.text(`  - ${add.name}: PHP ${add.price.toFixed(2)}`);
                });
            }

            if (price.taxes) {
                const { subtotal, _id, ...taxBreakdown } = price.taxes;
                doc.text("Taxes & Fees:");
                Object.entries(taxBreakdown._doc)
                    .filter(([key, value]) => typeof value === "number")
                    .forEach(([key, value]) => {
                        const label = key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (c) => c.toUpperCase());
                        doc.text(`  • ${label}: PHP ${value.toFixed(2)}`);
                    });
            }

            doc.text(`Passenger Count: ${price.passengerCount}`);
            doc.moveDown(0.2);
            doc.font("Helvetica-Bold").text(`Flight Total: PHP ${price.totalPrice.toFixed(2)}`, { align: "right" });
            doc.font("Helvetica");
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(lineColor).stroke();
            doc.moveDown();
        });

        // ===== PAYMENT SUMMARY =====
        doc.moveDown(1);
        doc.fontSize(13).fillColor("black").text("Payment Summary", { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11);

        doc.text(`Payment Method: ${payment.paymentMethod}`);
        doc.text(`Card Ending: **** **** **** ${payment.cardInfo.last4}`);

        // Highlighted total box
        const boxY = doc.y + 10;
        doc.rect(50, boxY, 500, 30).fillOpacity(0.1).fill(brandColor).fillOpacity(1);
        doc.fillColor("black").fontSize(13).text(`Total Amount Paid: PHP ${payment.amount.toFixed(2)}`, 60, boxY + 8);
        doc.moveDown(3);

        // ===== FOOTER =====
        doc.moveDown(2);
        doc.fontSize(10).fillColor(textGray);
        doc.text("Thank you for choosing Flyx", { align: "center" });
        doc.text("Track your booking anytime at your user account page", { align: "center" });

        doc.end();
    } catch (error) {
        next(error);
    }
};


// Get all payments (admin)
export const getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: "bookingId",
                populate: [
                    { path: "userId", select: "email" },
                    { path: "flights" },
                    { path: "passengers" },
                ],
            })
            .sort({ createdAt: -1 });

        res.status(200).json(payments);
    } catch (err) {
        next(err);
    }
};

// Get payment by ID
export const getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id).populate({
            path: "bookingId",
            populate: [
                { path: "userId", select: "email" },
                { path: "flights" },
                { path: "passengers" },
            ],
        });

        if (!payment) throw new AppError("Payment not found", 404);
        res.status(200).json(payment);
    } catch (err) {
        next(err);
    }
};

// Update payment status (admin)
export const updatePaymentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!payment) throw new AppError("Payment not found", 404);
        res.status(200).json(payment);
    } catch (err) {
        next(err);
    }
};

