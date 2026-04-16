const express = require("express");
const CompanyInfo = require("../models/CompanyInfo");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const infos = await CompanyInfo.find();
    const obj = {};
    infos.forEach((i) => { obj[i.key] = i.value; });
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") return res.status(403).json({ message: "Access denied" });
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ message: "key required" });
    const info = await CompanyInfo.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user.id },
      { upsert: true, new: true }
    );
    res.json({ message: "Company info updated", info });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
