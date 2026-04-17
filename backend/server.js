require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const knowledgeBaseRoutes = require("./routes/knowledgeBaseRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const aiRoutes = require("./routes/aiRoutes");
const eventRoutes = require("./routes/eventRoutes");
const policyRoutes = require("./routes/policyRoutes");
const companyInfoRoutes = require("./routes/companyInfoRoutes");
const upcomingRoutes = require("./routes/upcomingRoutes");
const meetingRoomRoutes = require("./routes/meetingRoomRoutes");
const cafeteriaRoutes = require("./routes/cafeteriaRoutes");
const emergencyContactRoutes = require("./routes/emergencyContactRoutes");
const transportRoutes = require("./routes/transportRoutes");
const chatRoutes = require("./routes/chatRoutes");

const { protect } = require("./middleware/authMiddleware");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: true, // Allow any origin in dev (Vite can use various ports)
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/knowledge-base", knowledgeBaseRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/company-info", companyInfoRoutes);
app.use("/api/upcoming", upcomingRoutes);
app.use("/api/meeting-rooms", meetingRoomRoutes);
app.use("/api/cafeteria", cafeteriaRoutes);
app.use("/api/emergency-contacts", emergencyContactRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/chat", chatRoutes);

// Protected test route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
