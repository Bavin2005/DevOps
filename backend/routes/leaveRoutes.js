const express = require("express");
const Leave = require("../models/Leave");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   APPLY LEAVE (EMPLOYEE)
========================= */
router.post("/apply", protect, async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({ message: "type, startDate, endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const user = await User.findById(req.user.id);
    const defaults = { annual: 20, sick: 10, personal: 5 };
    const bal = user?.leaveBalance || {};
    const balance = bal[type?.toLowerCase()] ?? defaults[type?.toLowerCase()] ?? 0;

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (balance < days && type !== "Unpaid") {
      return res.status(400).json({
        message: `Insufficient ${type} leave balance. Available: ${balance} days`
      });
    }

    const leave = await Leave.create({
      userId: req.user.id,
      type,
      startDate: start,
      endDate: end,
      reason: reason || "",
      status: "Pending"
    });

    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   LIST LEAVES
========================= */
router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "Employee") {
      query.userId = req.user.id;
    }

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name email department")
      .populate("approvedBy", "name");

    res.json({ count: leaves.length, leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   APPROVE / REJECT LEAVE
========================= */
router.put("/:leaveId/decision", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, rejectionReason } = req.body;
    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be Approved or Rejected" });
    }

    const leave = await Leave.findById(req.params.leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Leave already processed" });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    if (status === "Rejected") leave.rejectionReason = rejectionReason || null;

    if (status === "Approved" && leave.type !== "Unpaid") {
      const days = Math.ceil((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)) + 1;
      const user = await User.findById(leave.userId);
      const key = leave.type.toLowerCase();
      const current = user.leaveBalance?.[key] ?? 0;
      user.leaveBalance = user.leaveBalance || {};
      user.leaveBalance[key] = Math.max(0, current - days);
      await user.save();
    }

    await leave.save();

    // Notify employee
    await Notification.create({
      user: leave.userId,
      message: status === "Approved"
        ? `Your leave request (${leave.type}, ${leave.startDate.toLocaleDateString()}–${leave.endDate.toLocaleDateString()}) has been approved.`
        : `Your leave request (${leave.type}) was rejected.${leave.rejectionReason ? ` Reason: ${leave.rejectionReason}` : ""}`,
      type: status === "Approved" ? "INFO" : "WARNING",
    });

    res.json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   LEAVE BALANCE
========================= */
router.get("/balance", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("leaveBalance");
    const balance = user?.leaveBalance || { annual: 20, sick: 10, personal: 5 };
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
