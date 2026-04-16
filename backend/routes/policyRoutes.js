const express = require("express");
const Policy = require("../models/Policy");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const policies = await Policy.find(query).sort({ createdAt: -1 }).populate("createdBy", "name");
    res.json({ count: policies.length, policies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).populate("createdBy", "name");
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { title, content, category } = req.body;
    if (!title || !content) return res.status(400).json({ message: "title and content required" });
    const policy = await Policy.create({
      title,
      content,
      category: category || "General",
      createdBy: req.user.id
    });
    res.status(201).json({ message: "Policy created", policy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
