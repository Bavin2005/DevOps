/**
 * Seed All - Clears all data and seeds the database with sample data.
 * Uses institutional email format: name@company.com
 *
 * Run: node backend/seedAll.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Ticket = require("./models/Ticket");
const Message = require("./models/Message");
const Announcement = require("./models/Announcement");
const Policy = require("./models/Policy");
const KnowledgeBase = require("./models/KnowledgeBase");
const MeetingRoom = require("./models/MeetingRoom");
const RoomBooking = require("./models/RoomBooking");
const Leave = require("./models/Leave");
const Event = require("./models/Event");
const CafeteriaMenu = require("./models/CafeteriaMenu");
const TransportRoute = require("./models/TransportRoute");
const EmergencyContact = require("./models/EmergencyContact");
const Notification = require("./models/Notification");
const Upcoming = require("./models/Upcoming");
const AuditLog = require("./models/AuditLog");

const DOMAIN = "company.com";
const DEMO_PASSWORD = "password123";

const users = [
  { name: "John Employee", email: `john@${DOMAIN}`, role: "Employee", department: "Engineering" },
  { name: "Sarah IT Staff", email: `sarah@${DOMAIN}`, role: "IT", department: "IT Support" },
  { name: "Mike Admin", email: `mike@${DOMAIN}`, role: "Admin", department: "Administration" },
  { name: "Priya Sharma", email: `priya@${DOMAIN}`, role: "Employee", department: "Marketing" },
  { name: "Alex Chen", email: `alex@${DOMAIN}`, role: "Employee", department: "Sales" },
];

async function clearAll() {
  console.log("Clearing all collections...");
  await Message.deleteMany({});
  await Notification.deleteMany({});
  await Ticket.deleteMany({});
  await Leave.deleteMany({});
  await RoomBooking.deleteMany({});
  await Announcement.deleteMany({});
  await Policy.deleteMany({});
  await KnowledgeBase.deleteMany({});
  await Event.deleteMany({});
  await Upcoming.deleteMany({});
  await AuditLog.deleteMany({});
  await MeetingRoom.deleteMany({});
  await CafeteriaMenu.deleteMany({});
  await TransportRoute.deleteMany({});
  await EmergencyContact.deleteMany({});
  await User.deleteMany({});
  console.log("All collections cleared.");
}

async function seedUsers() {
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
  const created = [];
  for (const u of users) {
    const user = await User.create({
      name: u.name,
      email: u.email,
      password: hashed,
      role: u.role,
      department: u.department,
      birthDate: new Date(1990, 0, 15),
      joiningDate: new Date(2024, 0, 1),
    });
    created.push({ ...u, _id: user._id });
  }
  console.log(`Seeded ${created.length} users`);
  return created;
}

async function seedAnnouncements(userIds) {
  const admin = userIds.find((u) => u.role === "Admin");
  if (!admin) return;
  await Announcement.insertMany([
    {
      title: "Office Closure – Republic Day",
      content: "The office will be closed on January 26 for Republic Day. Please plan accordingly.",
      createdBy: admin._id,
      pinned: true,
    },
    {
      title: "New VPN Policy",
      content: "All remote employees must use the updated VPN client. Contact IT for installation support.",
      createdBy: admin._id,
      pinned: false,
    },
  ]);
  console.log("Seeded announcements");
}

async function seedPolicies(userIds) {
  const admin = userIds.find((u) => u.role === "Admin");
  if (!admin) return;
  await Policy.insertMany([
    { title: "Leave Policy", content: "Annual leave: 20 days. Sick leave: 10 days. Apply at least 3 days in advance.", category: "HR", createdBy: admin._id },
    { title: "Remote Work", content: "Remote work is allowed up to 2 days per week with manager approval.", category: "HR", createdBy: admin._id },
    { title: "Data Security", content: "Sensitive data must not be shared outside company systems. Use approved channels only.", category: "Security", createdBy: admin._id },
  ]);
  console.log("Seeded policies");
}

async function seedKnowledgeBase(userIds) {
  const itUser = userIds.find((u) => u.role === "IT");
  if (!itUser) return;
  await KnowledgeBase.insertMany([
    { title: "VPN Setup", category: "Network", keywords: ["vpn", "remote", "connection"], solution: "Download VPN client from intranet, use your company email and password to connect.", createdBy: itUser._id },
    { title: "Password Reset", category: "Other", keywords: ["password", "reset", "login"], solution: "Visit the self-service portal or contact IT for password reset.", createdBy: itUser._id },
    { title: "Outlook Sync Issues", category: "Software", keywords: ["outlook", "email", "sync"], solution: "Clear cache and restart Outlook. If persists, re-add account.", createdBy: itUser._id },
  ]);
  console.log("Seeded knowledge base");
}

async function seedMeetingRooms() {
  await MeetingRoom.insertMany([
    { name: "Conference A", capacity: 10, floor: "2", amenities: ["Projector", "Whiteboard", "Video Conferencing"] },
    { name: "Meeting Room B", capacity: 4, floor: "1", amenities: ["Whiteboard"] },
    { name: "Huddle Space C", capacity: 6, floor: "2", amenities: ["TV", "Video Conferencing"] },
  ]);
  console.log("Seeded meeting rooms");
}

async function seedCafeteria() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await CafeteriaMenu.create({
    date: today,
    items: [
      { name: "Dal Rice", type: "Veg", price: 80 },
      { name: "Chicken Curry", type: "Non-Veg", price: 120 },
      { name: "Veg Pulao", type: "Veg", price: 90 },
    ],
  });
  console.log("Seeded cafeteria menu");
}

async function seedTransport() {
  await TransportRoute.insertMany([
    {
      name: "Route A – Downtown",
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
      name: "Route B – Suburb",
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
  console.log("Seeded transport routes");
}

async function seedEmergencyContacts() {
  await EmergencyContact.insertMany([
    { name: "Security Desk", role: "Security", phone: "+91 98765 43210", email: "security@company.com", order: 0 },
    { name: "HR Helpdesk", role: "HR", phone: "+91 98765 43211", email: "hr@company.com", order: 1 },
    { name: "IT Support", role: "IT", phone: "+91 98765 43212", email: "it@company.com", order: 2 },
    { name: "Medical Room", role: "Medical", phone: "+91 98765 43213", email: "medical@company.com", order: 3 },
  ]);
  console.log("Seeded emergency contacts");
}

async function seedTicketsAndLeaves(userIds) {
  const emp1 = userIds.find((u) => u.email === `john@${DOMAIN}`);
  const emp2 = userIds.find((u) => u.email === `priya@${DOMAIN}`);
  const it = userIds.find((u) => u.role === "IT");
  const admin = userIds.find((u) => u.role === "Admin");
  if (!emp1 || !it) return;

  await Ticket.insertMany([
    { title: "Laptop won't turn on", description: "Power button does not respond.", category: "Hardware", priority: "High", status: "Open", createdBy: emp1._id },
    { title: "VPN connection issues", description: "Cannot connect from home.", category: "Network", priority: "High", status: "Assigned", createdBy: emp1._id, assignedTo: it._id },
    { title: "Need shared drive access", description: "Access to Marketing drive required.", category: "Other", priority: "Medium", status: "In Progress", createdBy: emp2._id, assignedTo: it._id },
  ]);

  const start1 = new Date();
  start1.setDate(start1.getDate() + 7);
  const end1 = new Date(start1);
  end1.setDate(end1.getDate() + 2);

  await Leave.insertMany([
    { userId: emp1._id, type: "Annual", startDate: start1, endDate: end1, reason: "Family trip", status: "Pending" },
    { userId: emp2._id, type: "Sick", startDate: new Date(), endDate: new Date(), reason: "Fever", status: "Approved", approvedBy: admin._id, approvedAt: new Date() },
  ]);
  console.log("Seeded tickets and leaves");
}

async function seedEvents(userIds) {
  const admin = userIds.find((u) => u.role === "Admin");
  if (!admin) return;

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);
  const end = new Date(nextWeek);
  end.setHours(11, 0, 0, 0);

  await Event.insertMany([
    { title: "All Hands Meeting", description: "Quarterly company update", startDate: nextWeek, endDate: end, type: "Meeting", location: "Main Hall", createdBy: admin._id, allDay: false },
    { title: "Republic Day", description: "National holiday", startDate: new Date(2026, 0, 26), endDate: new Date(2026, 0, 26), type: "Holiday", location: "", createdBy: admin._id, allDay: true },
  ]);
  console.log("Seeded events");
}

async function seedUpcoming(userIds) {
  const admin = userIds.find((u) => u.role === "Admin");
  if (!admin) return;

  await Upcoming.insertMany([
    { title: "New Intranet Launch", description: "Upgraded portal with improved UI", category: "Feature", targetDate: new Date(2026, 2, 1), createdBy: admin._id, status: "Planned" },
    { title: "Server Migration", description: "Cloud migration planned", category: "Maintenance", targetDate: new Date(2026, 1, 15), createdBy: admin._id, status: "In Progress" },
  ]);
  console.log("Seeded upcoming items");
}

async function main() {
  try {
    await connectDB();
    console.log("Connected to MongoDB\n");

    await clearAll();

    const createdUsers = await seedUsers();
    const userIds = createdUsers.map((u) => ({ ...u, _id: u._id }));

    await seedAnnouncements(userIds);
    await seedPolicies(userIds);
    await seedKnowledgeBase(userIds);
    await seedMeetingRooms();
    await seedCafeteria();
    await seedTransport();
    await seedEmergencyContacts();
    await seedTicketsAndLeaves(userIds);
    await seedEvents(userIds);
    await seedUpcoming(userIds);

    console.log("\n---------------------------------------");
    console.log("Seed complete. Demo credentials:");
    console.log("---------------------------------------");
    users.forEach((u) => {
      console.log(`${u.role.padEnd(10)} → ${u.email} / ${DEMO_PASSWORD}`);
    });
    console.log("---------------------------------------");
    console.log(`Email domain: @${DOMAIN}`);
    console.log("---------------------------------------\n");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

main();
