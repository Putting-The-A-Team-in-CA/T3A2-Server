const mongoose = require("./connection");

const doctorSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    // Gender required as this is relevant information for comfort of some patients when choosing a practitioner
    gender: {
      type: String,
      required: true,
    },
    // Experience = years of practicing medicine
    experience: {
      type: Number,
      required: true,
    },
    // Specialisation/area of expertise
    specialty: {
      type: String,
      required: true,
    },
    // 'About Me' for doctor - optional
    bio: {
      type: String,
      required: false,
    },
    // Password field included but commented out due to uncertainty regarding registration
    // password: {
    //   type: String,
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

const doctorModel = mongoose.model("doctors", doctorSchema);

module.exports = doctorModel;
