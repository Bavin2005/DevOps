const express = require("express");
const Announcement = require("../models/Announcement");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   CREATE ANNOUNCEMENT
========================= */
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, content, pinned, department } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "title and content are required" });
    }

    const announcement = await Announcement.create({
      title,
      content,
      pinned: !!pinned,
      department: department || null,
      createdBy: req.user.id
    });

    res.status(201).json({ message: "Announcement created", announcement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   LIST ANNOUNCEMENTS
========================= */
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    const dept = req.user.department;
    if (dept) {
      query = { $or: [{ department: null }, { department: dept }] };
    }

    const announcements = await Announcement.find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .populate("createdBy", "name");

    res.json({ count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
