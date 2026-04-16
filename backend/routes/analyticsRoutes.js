const express = require("express");
const Ticket = require("../models/Ticket");
const Leave = require("../models/Leave");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   ANALYTICS SUMMARY (ADMIN)
========================= */
router.get("/summary", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const totalTickets = await Ticket.countDocuments();

    const ticketsByStatus = await Ticket.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const ticketsByPriority = await Ticket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const ticketsByCategory = await Ticket.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const slaBreached = await Ticket.countDocuments({ slaBreached: true });

    res.json({
      totalTickets,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByCategory,
      slaBreached
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   TICKET TRENDS (last 30 days)
========================= */
router.get("/ticket-trends", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    const days = parseInt(req.query.days, 10) || 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const trends = await Ticket.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   LEAVE ANALYTICS
========================= */
router.get("/leave-analytics", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const leaveByType = await Leave.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const leaveByStatus = await Leave.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const total = await Leave.countDocuments();
    const approved = await Leave.countDocuments({ status: "Approved" });
    const rejected = await Leave.countDocuments({ status: "Rejected" });
    const pending = await Leave.countDocuments({ status: "Pending" });

    res.json({
      total,
      approved,
      rejected,
      pending,
      leaveByType,
      leaveByStatus,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   IT WORKLOAD ANALYTICS (ADMIN)
========================= */
router.get("/it-workload", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const workload = await Ticket.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: "$assignedTo",
          ticketCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "itUser"
        }
      },
      { $unwind: "$itUser" },
      {
        $project: {
          _id: 0,
          itUserId: "$itUser._id",
          name: "$itUser.name",
          email: "$itUser.email",
          ticketCount: 1
        }
      }
    ]);

    res.json({
      count: workload.length,
      workload
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   SLA COMPLIANCE ANALYTICS (ADMIN)
========================= */
router.get("/sla-compliance", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const total = await Ticket.countDocuments({
      slaDeadline: { $exists: true }
    });

    const breached = await Ticket.countDocuments({
      slaBreached: true
    });

    const met = total - breached;

    const compliancePercentage =
      total === 0 ? 100 : Math.round((met / total) * 100);

    res.json({
      total,
      met,
      breached,
      compliancePercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
