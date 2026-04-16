/**
 * Seed sample transport routes
 * Run: node backend/seedTransport.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const TransportRoute = require("./models/TransportRoute");
const connectDB = require("./config/db");

async function seed() {
  await connectDB();

  const existing = await TransportRoute.countDocuments();
  if (existing > 0) {
    console.log("Transport routes already exist, skipping seed");
    process.exit(0);
    return;
  }

  await TransportRoute.insertMany([
    {
      name: "Route A - Downtown",
      pickupPoints: ["Main Gate", "Building 1", "Building 2"],
      timings: [
        { dayOfWeek: 1, times: ["08:00", "09:00", "18:00"] },
        { dayOfWeek: 2, times: ["08:00", "09:00", "18:00"] },
        { dayOfWeek: 3, times: ["08:00", "09:00", "18:00"] },
        { dayOfWeek: 4, times: ["08:00", "09:00", "18:00"] },
        { dayOfWeek: 5, times: ["08:00", "09:00", "18:00"] },
      ],
    },
    {
      name: "Route B - Suburb",
      pickupPoints: ["Station North", "Station South"],
      timings: [
        { dayOfWeek: 1, times: ["07:30", "18:30"] },
        { dayOfWeek: 2, times: ["07:30", "18:30"] },
        { dayOfWeek: 3, times: ["07:30", "18:30"] },
        { dayOfWeek: 4, times: ["07:30", "18:30"] },
        { dayOfWeek: 5, times: ["07:30", "18:30"] },
      ],
    },
  ]);

  console.log("Transport routes seeded");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
