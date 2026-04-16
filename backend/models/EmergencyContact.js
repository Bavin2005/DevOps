const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g. HR, Security, Medical, IT
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    order: { type: Number, default: 0 }, // for display order
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyContact", emergencyContactSchema);
