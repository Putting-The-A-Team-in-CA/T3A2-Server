const express = require('express');
const router = express.Router();

const appointmentRoutes = require("./appointment_routes");
const bookingRoutes = require("./booking_routes");
const doctorRoutes = require("./doctor_routes");
const patientRoutes = require("./patient_routes");
const userRoutes = require("./user_routes");

// Expose following routes
router.use("/appointments", appointmentRoutes);
router.use("/bookings", bookingRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);
router.use("/users", userRoutes);

module.exports = router;