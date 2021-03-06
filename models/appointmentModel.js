const mongoose = require("./connection");

const appointmentSchema = new mongoose.Schema(
  {
    // doctor_id is required to check which doctor is available for this appointment.
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    // Appointment Slot defines the date and time of the appoinment
    appointment_slot: {
      start_time: { type: Date, required: true },
      end_time: { type: Date, required: true },
    },
    // Current booking status or availability status of the appointment
    booked: {
      type: Boolean,
      required: true,
      default: false,
    },
    // UserId who has booked the appointment
    booked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
    },
  },
  {
    timestamps: true,
  }
);

const appointmentModel = mongoose.model("Appointment", appointmentSchema);

module.exports = appointmentModel;
