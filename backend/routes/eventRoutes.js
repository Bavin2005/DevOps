const express = require("express");
const Event = require("../models/Event");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.startDate = {};
      if (from) query.startDate.$gte = new Date(from);
      if (to) query.startDate.$lte = new Date(to);
    }
    const events = await Event.find(query).sort({ startDate: 1 }).populate("createdBy", "name");
    res.json({ count: events.length, events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { title, description, startDate, endDate, type, location, allDay } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "title, startDate, endDate required" });
    }
    const event = await Event.create({
      title,
      description: description || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type: type || "Other",
      location: location || "",
      allDay: !!allDay,
      createdBy: req.user.id
    });
    res.status(201).json({ message: "Event created", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
