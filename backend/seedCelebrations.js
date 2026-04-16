/**
 * Seed birthDate and joiningDate for sample users
 * Run: node backend/seedCelebrations.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

async function seed() {
  await connectDB();

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const users = await User.find().limit(5);
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const birth = new Date(today.getFullYear() - 30, todayMonth, todayDay);
    const join = new Date(today.getFullYear() - (i + 1), todayMonth, todayDay);
    await User.findByIdAndUpdate(u._id, { birthDate: birth, joiningDate: join });
    console.log(`Updated ${u.name}: birthDate=${birth.toISOString().slice(0, 10)}, joiningDate=${join.toISOString().slice(0, 10)}`);
  }

  console.log("Celebrations seed done");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
