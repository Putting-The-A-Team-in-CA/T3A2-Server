const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.js");
const { roleCheck } = require("../middleware/roleCheck.js");
const AppointmentModel = require("../models/appointmentModel");
const DoctorModel = require("../models/doctorModel");
const { StatusCodes } = require("http-status-codes");
const {
  findAll,
  findById,
  create,
  findByIdAndUpdate,
} = require("../utils/dbUtils");
const {
  createAppointmentRequestValidation,
} = require("../utils/validationSchema");

// Route to Get All Appointments sorted by doctorId and appointment start time in ascending order
// valid JWT token must be provided for this route
// Supports following optional query params:
// fromTime: Find all appointments after given date time
// toTime: Find all appointments till given date time
// booked: Find all appointments which are booked or not booked yet
// doctorId: Find all appointments associated with doctorId
// userId: Find all appointments associated with doctor profile for given userId
router.get("/", auth, async (req, res) => {
  const query = {};
  const fromTime = req.query.fromTime;
  if (fromTime) {
    query["appointment_slot.start_time"] = {
      $gte: req.query.fromTime,
    };
  }
  const toTime = req.query.toTime;
  if (toTime) {
    query["appointment_slot.end_time"] = {
      $lt: new Date(req.query.toTime),
    };
  }
  const booked = req.query.booked;
  if (booked || booked === false) {
    query["booked"] = booked;
  }
  const doctorId = req.query.doctorId;
  if (doctorId) {
    query["doctor_id"] = doctorId;
  }
  const userId = req.query.userId;
  if (userId) {
    const doc = await DoctorModel.findOne({ user_id: userId });
    if (doc) {
      query["doctor_id"] = doc._id;
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: true, message: "Doctor not found for given userId." });
    }
  }

  // Sort By doctorId and appointment start time
  const sortBy = {
    doctor_id: 1,
    "appointment_slot.start_time": 1,
  };

  findAll(AppointmentModel, query, res, sortBy);
});

// Route to Get a Appointment by ID
// valid JWT token must be provided for this route
router.get("/:id", auth, (req, res) => {
  findById(AppointmentModel, req.params.id, res);
});

// Route to create new Appointment
// valid JWT token must be provided for this route
// Only users with doctor role can create new appointments
router.post("/", auth, async (req, res) => {
  // Validate appointment request
  const { error } = createAppointmentRequestValidation(req.body);
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: true, message: error.message });
  }
  // Validate appointment start time is not past date time
  const start_time = new Date(req.body.start_time);
  if (start_time < Date.now()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: `Appointment start date is in past.`,
    });
  }
  // Validate appointment end time is not past date time
  const end_time = new Date(req.body.end_time);
  if (end_time < Date.now()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: `Appointment end date is in past.`,
    });
  }
  // Validate appointment start time is not after end time
  if (end_time <= start_time) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: `Appointment start time should be earlier than end time and start and end time cannot be equal.`,
    });
  }
  // Validate doctor exists who is trying to create appointment
  const doctor = await DoctorModel.findOne({ user_id: req.user._id });
  if (!doctor) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message:
        "Cannot create appointment as failed to find doctor associated with this request.",
    });
  }

  // New appointment document to be saved in database
  const appointment = {
    doctor_id: doctor._id,
    appointment_slot: {
      start_time: new Date(req.body.start_time),
      end_time: new Date(req.body.end_time),
    },
  };

  create(AppointmentModel, appointment, appointment, res);
});

// Route to Update an Appointment with provided apppointmentId
// valid JWT token must be provided for this route
// Only users with doctor role can create new appointments
router.put("/:id", auth, roleCheck("doctor"), (req, res) => {
  findByIdAndUpdate(AppointmentModel, req.params.id, req.body, res);
});

// Route to Delete an Appointment with provided apppointmentId
// valid JWT token must be provided for this route
// Only users with doctor role can create new appointments
router.delete("/:id", auth, roleCheck("doctor"), async (req, res) => {
  const appointment = await AppointmentModel.findOne({ _id: req.params.id });

  // Check if appointment exists
  if (!appointment) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: true,
      message: `Delete Appointment failed as appointment does not exist`,
    });
  }

  // Check if apppointment is booked or not, if booked can't be deleted
  if (appointment.booked) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: `Delete Appointment failed as it is already booked`,
    });
  }

  // Delete the appointment
  AppointmentModel.deleteOne(appointment, (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: `Delete Appointment failed for appointmentId: ${req.params.id}`,
      });
    }
    res.sendStatus(StatusCodes.NO_CONTENT);
  });
});

module.exports = router;
