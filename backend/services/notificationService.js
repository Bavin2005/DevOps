const express = require("express");
const Ticket = require("../models/Ticket");
const { protect } = require("../middleware/authMiddleware");
const { logAudit } = require("../services/auditLogger");
const { sendNotification } = require("../services/notificationService");

const router = express.Router();

/* =========================
   CREATE TICKET (EMPLOYEE)
   + SLA AUTO-CALCULATION
========================= */
router.post("/create", protect, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    // SLA calculation
    let slaHours = 8;
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

    await logAudit({
      action: "Ticket Created",
      entityType: "Ticket",
      entityId: ticket._id,
      performedBy: req.user.id,
      details: `Ticket titled "${ticket.title}" created`
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
   VIEW TICKETS
========================= */
router.get("/", protect, async (req, res) => {
  try {
    let tickets;

    if (req.user.role === "Employee") {
      tickets = await Ticket.find({ createdBy: req.user.id });
    } else {
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

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.assignedTo = assignedTo;
    ticket.status = "Assigned";
    await ticket.save();

    // Audit log
    await logAudit({
      action: "Ticket Assigned",
      entityType: "Ticket",
      entityId: ticket._id,
      performedBy: req.user.id,
      details: `Ticket assigned to user ID ${assignedTo}`
    });

    // Notification to IT staff
    await sendNotification(
      assignedTo,
      `A new ticket "${ticket.title}" has been assigned to you`,
      "INFO"
    );

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
router.put("/update-status/:ticketId", protect, async (req, res) => {
  try {
    if (req.user.role !== "IT" && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    const { status } = req.body;

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = status;
    await ticket.save();

    // Audit log
    await logAudit({
      action: "Ticket Status Updated",
      entityType: "Ticket",
      entityId: ticket._id,
      performedBy: req.user.id,
      details: `Ticket status changed to "${status}"`
    });

    // Notify ticket creator
    await sendNotification(
      ticket.createdBy,
      `Your ticket "${ticket.title}" status changed to ${status}`,
      "INFO"
    );

    res.json({
      message: "Ticket status updated successfully",
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   CHECK SLA BREACHES (ADMIN)
========================= */
router.post("/check-sla", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const now = new Date();

    const breachedTickets = await Ticket.find({
      slaDeadline: { $lt: now },
      slaBreached: false
    });

    for (const ticket of breachedTickets) {
      ticket.slaBreached = true;
      await ticket.save();

      await logAudit({
        action: "SLA Breached",
        entityType: "Ticket",
        entityId: ticket._id,
        performedBy: req.user.id,
        details: `SLA deadline crossed for ticket "${ticket.title}"`
      });

      // Notify admin
      await sendNotification(
        req.user.id,
        `SLA breached for ticket "${ticket.title}"`,
        "SLA"
      );
    }

    res.json({
      message: "SLA check completed",
      breachedCount: breachedTickets.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
