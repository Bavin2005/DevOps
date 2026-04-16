const express = require("express");
const Upcoming = require("../models/Upcoming");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    const items = await Upcoming.find(query).sort({ targetDate: 1, createdAt: -1 }).populate("createdBy", "name");
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { title, description, category, targetDate, status } = req.body;
    if (!title) return res.status(400).json({ message: "title required" });
    const item = await Upcoming.create({
      title,
      description: description || "",
      category: category || "Other",
      targetDate: targetDate ? new Date(targetDate) : null,
      status: status || "Planned",
      createdBy: req.user.id
    });
    res.status(201).json({ message: "Upcoming item created", item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { status } = req.body;
    const valid = ["Planned", "In Progress", "Done", "Cancelled"];
    if (!status || !valid.includes(status)) {
      return res.status(400).json({ message: "valid status required" });
    }
    const item = await Upcoming.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Status updated", item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
