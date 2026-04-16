const mongoose = require("mongoose");

const cabBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true
    },

    dropLocation: {
      type: String,
      required: true,
      trim: true
    },

    pickupDate: {
      type: Date,
      required: true
    },

    pickupTime: {
      type: String, // e.g. "09:00"
      required: true
    },

    cabType: {
      type: String,
      enum: ["Sedan", "SUV", "Hatchback"],
      default: "Sedan"
    },

    passengerCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 7
    },

    purpose: {
      type: String,
      trim: true,
      default: ""
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending"
    },

    driverName: {
      type: String,
      default: ""
    },

    driverPhone: {
      type: String,
      default: ""
    },

    cabNumber: {
      type: String,
      default: ""
    },

    notes: {
      type: String,
      default: ""
    },

    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    confirmedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("CabBooking", cabBookingSchema);
