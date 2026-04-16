const express = require("express");
const EmergencyContact = require("../models/EmergencyContact");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET all emergency contacts */
router.get("/", protect, async (req, res) => {
  try {
    const contacts = await EmergencyContact.find().sort({ order: 1, name: 1 });
    res.json({ count: contacts.length, contacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* POST create (Admin only) */
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { name, role, phone, email, order } = req.body;
    if (!name || !role || !phone) {
      return res.status(400).json({ message: "name, role, phone required" });
    }
    const contact = await EmergencyContact.create({
      name,
      role,
      phone,
      email: email || "",
      order: Number(order) || 0,
    });
    res.status(201).json({ message: "Contact created", contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* PUT update (Admin only) */
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const contact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json({ message: "Contact updated", contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* DELETE (Admin only) */
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const contact = await EmergencyContact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
