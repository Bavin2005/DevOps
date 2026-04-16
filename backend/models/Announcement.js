const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pinned: { type: Boolean, default: false },
    department: { type: String, default: null } // null = all departments
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
