const mongoose = require("mongoose");

const upcomingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Feature", "Update", "Maintenance", "Event", "Other"],
      default: "Other"
    },
    targetDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Planned", "In Progress", "Done", "Cancelled"],
      default: "Planned"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Upcoming", upcomingSchema);
