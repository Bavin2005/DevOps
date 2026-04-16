const express = require("express");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");
const { logAudit } = require("../services/auditLogger");

const router = express.Router();

/* =========================
   CREATE TICKET (EMPLOYEE)
   + SLA AUTO-CALCULATION
========================= */
router.post("/create", protect, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    // SLA calculation based on priority
    let slaHours = 8; // default for Medium
    if (priority === "High") slaHours = 4;
    if (priority === "Low") slaHours = 24;

    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user.id,
      slaDeadline
    });

    // Audit log
    await logAudit({
      action: "Ticket Created",
      entityType: "Ticket",
      entityId: ticket._id,
      performedBy: req.user.id,
      details: `Ticket titled "${ticket.title}" was created with SLA`
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   VIEW SINGLE TICKET
========================= */
router.get("/:ticketId", protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Employee → own tickets only
    if (req.user.role === "Employee") {
      const createdById = ticket.createdBy?.toString?.() || ticket.createdBy;
      if (createdById !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   VIEW TICKETS
========================= */
router.get("/", protect, async (req, res) => {
  try {
    let tickets;

    // Employee → own tickets
    if (req.user.role === "Employee") {
      tickets = await Ticket.find({ createdBy: req.user.id });
    } else {
      // IT / Admin → all tickets
      tickets = await Ticket.find();
    }

    res.json({
      count: tickets.length,
      tickets
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   ASSIGN TICKET (ADMIN)
========================= */
router.put("/assign/:ticketId", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: "assignedTo is required" });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.assignedTo = assignedTo;
    ticket.status = "Assigned";
    await ticket.save();

    // Notify assignee
    await Notification.create({
      user: assignedTo,
      message: `You have been assigned to ticket: "${ticket.title}"`,
      type: "INFO",
    });

    // Audit log
    await logAudit({
      action: "Ticket Assigned",
      entityType: "Ticket",
      entityId: ticket._id,
      performedBy: req.user.id,
      details: `Ticket assigned to user ID ${assignedTo}`
    });

    res.json({
      message: "Ticket assigned successfully",
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   UPDATE TICKET STATUS (IT / ADMIN)
========================= */
const VALID_STATUSES = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];

router.put("/update-status/:ticketId", protect, async (req, res) => {
  try {
    if (req.user.role !== "IT" && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Valid status is required (Open, Assigned, In Progress, Resolved, Closed)" });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = status;
    await ticket.save();

    // Notify creator when resolved/closed
    if ((status === "Resolved" || status === "Closed") && ticket.createdBy) {
      await Notification.create({
        user: ticket.createdBy,
        message: `Your ticket "${ticket.title}" has been ${status.toLowerCase()}.`,
        type: "INFO",
      });
    }

    // Audit log
    await logAudit({
      action: "Ticket Status Updated",
      entityType: "Ticket",
      entityId: ticket._id,
      performedBy: req.user.id,
      details: `Ticket status changed to "${status}"`
    });

    res.json({
      message: "Ticket status updated successfully",
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
