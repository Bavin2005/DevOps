const mongoose = require("mongoose");

const meetingRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    capacity: { type: Number, required: true, default: 4 },
    floor: { type: String, default: "" },
    amenities: [{ type: String }], // e.g. ["Projector", "Whiteboard", "Video Conferencing"]
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MeetingRoom", meetingRoomSchema);
