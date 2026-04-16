const express = require("express");
const CafeteriaMenu = require("../models/CafeteriaMenu");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET menu for a date */
router.get("/menu", protect, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date required (YYYY-MM-DD)" });
    }
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const menu = await CafeteriaMenu.findOne({ date: d });
    res.json({ menu: menu || null, items: menu?.items || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* POST/PUT menu for a date (Admin/IT only) */
router.put("/menu", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { date, items } = req.body;
    if (!date) return res.status(400).json({ message: "date required" });
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const menuItems = Array.isArray(items) ? items : [];
    const menu = await CafeteriaMenu.findOneAndUpdate(
      { date: d },
      { date: d, items: menuItems },
      { upsert: true, new: true }
    );
    res.json({ message: "Menu updated", menu });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
