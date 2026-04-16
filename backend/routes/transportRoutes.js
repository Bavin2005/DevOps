const express = require("express");
const TransportRoute = require("../models/TransportRoute");
const CabBooking = require("../models/CabBooking");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET all routes */
router.get("/", protect, async (req, res) => {
  try {
    const routes = await TransportRoute.find().sort({ name: 1 });
    res.json({ count: routes.length, routes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* POST create route (Admin/IT only) */
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { name, pickupPoints, timings } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name required" });
    }
    const route = await TransportRoute.create({
      name,
      pickupPoints: Array.isArray(pickupPoints) ? pickupPoints : [],
      timings: Array.isArray(timings) ? timings : [],
    });
    res.status(201).json({ message: "Route created", route });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* PUT update route (Admin only) */
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const route = await TransportRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json({ message: "Route updated", route });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* DELETE route (Admin/IT only) */
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }
    const route = await TransportRoute.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json({ message: "Route deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   CAB BOOKING ROUTES
========================= */

/* POST book a cab (any authenticated user) */
router.post("/book-cab", protect, async (req, res) => {
  try {
    const { pickupLocation, dropLocation, pickupDate, pickupTime, cabType, passengerCount, purpose } = req.body;

    if (!pickupLocation || !dropLocation || !pickupDate || !pickupTime) {
      return res.status(400).json({ message: "Pickup location, drop location, date, and time are required" });
    }

    const booking = await CabBooking.create({
      user: req.user.id,
      pickupLocation,
      dropLocation,
      pickupDate,
      pickupTime,
      cabType: cabType || "Sedan",
      passengerCount: passengerCount || 1,
      purpose: purpose || "",
      status: "Pending"
    });

    const populated = await CabBooking.findById(booking._id).populate("user", "name email department");

    res.status(201).json({
      message: "Cab booking request submitted successfully",
      booking: populated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* GET my cab bookings */
router.get("/my-cab-bookings", protect, async (req, res) => {
  try {
    const bookings = await CabBooking.find({ user: req.user.id })
      .sort({ pickupDate: -1, createdAt: -1 })
      .populate("user", "name email")
      .populate("confirmedBy", "name");

    res.json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* GET all cab bookings (Admin/IT only) */
router.get("/cab-bookings", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookings = await CabBooking.find()
      .sort({ pickupDate: -1, createdAt: -1 })
      .populate("user", "name email department")
      .populate("confirmedBy", "name");

    res.json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* PATCH update cab booking (confirm/cancel) */
router.patch("/cab-bookings/:id", protect, async (req, res) => {
  try {
    const booking = await CabBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { status, driverName, driverPhone, cabNumber, notes } = req.body;

    // User can cancel their own booking
    if (status === "Cancelled" && booking.user.toString() === req.user.id) {
      booking.status = "Cancelled";
      await booking.save();
      return res.json({ message: "Booking cancelled", booking });
    }

    // Admin/IT can confirm/update booking
    if (req.user.role === "Admin" || req.user.role === "IT") {
      if (status) booking.status = status;
      if (driverName !== undefined) booking.driverName = driverName;
      if (driverPhone !== undefined) booking.driverPhone = driverPhone;
      if (cabNumber !== undefined) booking.cabNumber = cabNumber;
      if (notes !== undefined) booking.notes = notes;

      if (status === "Confirmed" && !booking.confirmedBy) {
        booking.confirmedBy = req.user.id;
        booking.confirmedAt = new Date();

        // Notify user
        await Notification.create({
          user: booking.user,
          message: `Your cab booking from ${booking.pickupLocation} to ${booking.dropLocation} on ${new Date(booking.pickupDate).toLocaleDateString()} has been confirmed.`,
          type: "INFO"
        });
      }

      await booking.save();
      const populated = await CabBooking.findById(booking._id)
        .populate("user", "name email")
        .populate("confirmedBy", "name");

      return res.json({ message: "Booking updated", booking: populated });
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* DELETE cab booking (Admin/IT only or own booking if Pending) */
router.delete("/cab-bookings/:id", protect, async (req, res) => {
  try {
    const booking = await CabBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // User can delete their own pending booking
    if (booking.user.toString() === req.user.id && booking.status === "Pending") {
      await CabBooking.findByIdAndDelete(req.params.id);
      return res.json({ message: "Booking deleted" });
    }

    // Admin/IT can delete any booking
    if (req.user.role === "Admin" || req.user.role === "IT") {
      await CabBooking.findByIdAndDelete(req.params.id);
      return res.json({ message: "Booking deleted" });
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
