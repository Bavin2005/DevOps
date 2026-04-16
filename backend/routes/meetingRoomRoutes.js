const express = require("express");
const MeetingRoom = require("../models/MeetingRoom");
const RoomBooking = require("../models/RoomBooking");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET all meeting rooms */
router.get("/rooms", protect, async (req, res) => {
  try {
    const rooms = await MeetingRoom.find({ isActive: true }).sort({ name: 1 });
    res.json({ count: rooms.length, rooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* POST create meeting room (Admin/IT only) */
router.post("/rooms", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { name, capacity, floor, amenities } = req.body;
    if (!name || capacity == null) {
      return res.status(400).json({ message: "name and capacity required" });
    }
    const room = await MeetingRoom.create({
      name,
      capacity: Number(capacity) || 4,
      floor: floor || "",
      amenities: Array.isArray(amenities) ? amenities : [],
    });
    res.status(201).json({ message: "Room created", room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* GET bookings for a room (or all) within date range */
router.get("/bookings", protect, async (req, res) => {
  try {
    const { roomId, from, to } = req.query;
    const query = {};
    if (roomId) query.room = roomId;
    if (from) query.endTime = { $gte: new Date(from) };
    if (to) query.startTime = { $lte: new Date(to) };
    const bookings = await RoomBooking.find(query)
      .populate("room", "name capacity floor amenities")
      .populate("user", "name email")
      .sort({ startTime: 1 });
    res.json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* POST create booking */
router.post("/bookings", protect, async (req, res) => {
  try {
    const { roomId, title, startTime, endTime, description } = req.body;
    if (!roomId || !title || !startTime || !endTime) {
      return res.status(400).json({ message: "roomId, title, startTime, endTime required" });
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ message: "Invalid date range" });
    }
    const room = await MeetingRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    const overlap = await RoomBooking.findOne({
      room: roomId,
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });
    if (overlap) {
      return res.status(400).json({ message: "Room already booked for this time slot" });
    }
    const booking = await RoomBooking.create({
      room: roomId,
      user: req.user.id,
      title,
      startTime: start,
      endTime: end,
      description: description || "",
    });
    const populated = await RoomBooking.findById(booking._id)
      .populate("room", "name capacity floor amenities")
      .populate("user", "name email");
    res.status(201).json({ message: "Booking created", booking: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* DELETE booking (own only, or Admin/IT) */
router.delete("/bookings/:id", protect, async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === "Admin" || req.user.role === "IT";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    await RoomBooking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
