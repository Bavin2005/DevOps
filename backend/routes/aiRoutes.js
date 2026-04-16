const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const KnowledgeBase = require("../models/KnowledgeBase");
const Policy = require("../models/Policy");

const router = express.Router();

const SYSTEM_PROMPT = `You are a helpful AI assistant for an Enterprise Portal. You ONLY answer questions related to the portal and company.

Your scope includes:
- Portal features: tickets, leave management, announcements, directory, meeting rooms, cafeteria, transport (shuttle routes + cab booking), calendar
- IT support: technical issues, troubleshooting, software/hardware problems
- Company policies: HR policies, IT policies, security policies, leave policies
- Knowledge Base: solutions to common IT and process questions
- Navigation: how to use portal features

Use the provided Knowledge Base and Policy excerpts to answer accurately. If the question is NOT related to the portal or company, politely redirect: "I'm here to help with the Enterprise Portal. I can assist with tickets, leave, announcements, directory, knowledge base, company policies, and portal features. How can I help you with the portal?"

Keep responses concise, professional, and actionable.`;

/* Simple keyword-based RAG: find relevant KB articles and policies */
function buildRAGContext(message) {
  const words = (message || "").toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return Promise.resolve({ kbContext: "", policyContext: "" });

  return Promise.all([
    KnowledgeBase.find({}).lean(),
    Policy.find({}).lean()
  ]).then(([articles, policies]) => {
    const score = (text) => {
      const t = (text || "").toLowerCase();
      return words.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
    };

    const scoredArticles = articles.map((a) => ({
      ...a,
      score: score(a.title) * 2 + score((a.keywords || []).join(" ")) * 1.5 + score(a.solution)
    })).sort((a, b) => b.score - a.score);

    const scoredPolicies = policies.map((p) => ({
      ...p,
      score: score(p.title) * 2 + score(p.content)
    })).sort((a, b) => b.score - a.score);

    const topArticles = scoredArticles.filter((a) => a.score > 0).slice(0, 8);
    const topPolicies = scoredPolicies.filter((p) => p.score > 0).slice(0, 5);

    const kbContext = topArticles.length
      ? "\n\nKnowledge Base (use this to answer IT/support questions):\n" +
        topArticles.map((a) => `- ${a.title}: ${(a.solution || "").slice(0, 400)}${(a.solution || "").length > 400 ? "..." : ""}`).join("\n\n")
      : "";

    const policyContext = topPolicies.length
      ? "\n\nCompany Policies (use this to answer policy questions):\n" +
        topPolicies.map((p) => `- ${p.title} (${p.category}): ${(p.content || "").slice(0, 350)}${(p.content || "").length > 350 ? "..." : ""}`).join("\n\n")
      : "";

    return { kbContext, policyContext };
  });
}

/* =========================
   AI CHAT (RAG: KB + Policies)
========================= */
router.post("/chat", protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "message is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const reply = await getFallbackResponse(message);
      return res.json({ reply, source: "fallback" });
    }

    const { kbContext, policyContext } = await buildRAGContext(message);
    const context = (kbContext + policyContext) || "\n\n(No relevant Knowledge Base or Policy articles found for this query.)";

    const { OpenAI } = require("openai");
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + context },
        { role: "user", content: message }
      ],
      max_tokens: 400,
      temperature: 0.6
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";
    res.json({ reply, source: "openai" });
  } catch (error) {
    console.error("AI chat error:", error);
    try {
      const reply = await getFallbackResponse(req.body?.message || "");
      return res.json({ reply, source: "fallback" });
    } catch {
      res.status(500).json({ error: "AI service unavailable. Please try again." });
    }
  }
});

async function getFallbackResponse(message) {
  const text = (message || "").toLowerCase();
  if (text.includes("ticket") || text.includes("create ticket") || text.includes("support")) {
    return "To create a ticket: Go to My Tickets → Create Ticket, fill in title, description, category (Network, Software, Hardware, Other), and priority. Our IT team will respond based on SLA.";
  }
  if (text.includes("leave") || text.includes("apply") || text.includes("vacation") || text.includes("holiday")) {
    return "To apply for leave: Go to My Leaves → Apply Leave. Choose type (Annual, Sick, Personal), start/end dates, and reason. Admin will approve or reject. Check your leave balance before applying.";
  }
  if (text.includes("announcement") || text.includes("news") || text.includes("update")) {
    return "Announcements appear on the Announcements page. Check regularly for company updates, policy changes, and important notices.";
  }
  if (text.includes("directory") || text.includes("find") || text.includes("employee") || text.includes("colleague") || text.includes("contact")) {
    return "Use the Employee Directory to search for colleagues by name, department, or role. You can also start a chat directly from the directory.";
  }
  if (text.includes("knowledge") || text.includes("kb") || text.includes("help") || text.includes("solution")) {
    return "The Knowledge Base contains articles for common IT and process questions. Use it to find solutions before creating a ticket. Categories include Network, Software, Hardware, and Other.";
  }
  if (text.includes("policy") || text.includes("policies") || text.includes("hr") || text.includes("it policy") || text.includes("rules")) {
    return "Company policies are available in Policies. Check HR, IT, Finance, Security, and General categories. You can also ask me policy questions—I'll answer from the knowledge base when available.";
  }
  if (text.includes("meeting") || text.includes("room") || text.includes("book") || text.includes("reserve")) {
    return "To book a meeting room: Go to Meeting Rooms, select a room, choose date and time, and confirm. Rooms show capacity, floor, and amenities (projector, whiteboard, video conferencing).";
  }
  if (text.includes("cafeteria") || text.includes("menu") || text.includes("food") || text.includes("lunch")) {
    return "Check the Cafeteria page for today's menu with items, prices, and veg/non-veg options. Menu updates daily.";
  }
  if (text.includes("transport") || text.includes("bus") || text.includes("route") || text.includes("pickup") || text.includes("cab") || text.includes("taxi")) {
    return "Transport page offers shuttle routes with pickup points and timings (Mon-Fri), and cab booking for point-to-point travel. Book a cab by specifying pickup/drop locations, date, time, and cab type (Sedan/SUV/Hatchback). Admin/IT will confirm bookings.";
  }
  if (text.includes("calendar") || text.includes("event") || text.includes("holiday") || text.includes("meeting schedule")) {
    return "Check the Calendar for company events, holidays, meetings, and team events. You can see all-day events and timed meetings with locations.";
  }
  if (text.includes("emergency") || text.includes("contact") || text.includes("help desk")) {
    return "Emergency contacts are available in Emergency Contacts. Includes Security, HR, IT Support, and Medical Room with phone numbers and emails.";
  }
  if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("greetings")) {
    return "Hello! I'm the Portal Assistant. I can help with tickets, leave, announcements, directory, knowledge base, company policies, meeting rooms, cafeteria, transport, calendar, and other portal features. What would you like to know?";
  }
  // For non-portal questions, redirect politely
  return "I'm here to help with the Enterprise Portal. I can assist with tickets, leave, announcements, directory, knowledge base, company policies, meeting rooms, cafeteria, transport, calendar, and portal navigation. How can I help you with the portal?";
}

module.exports = router;
