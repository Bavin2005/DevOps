const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: {
      type: String,
      enum: ["Meeting", "Holiday", "Team Event", "Training", "Other"],
      default: "Other"
    },
    location: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    allDay: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
