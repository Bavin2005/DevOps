const express = require("express");
const KnowledgeBase = require("../models/KnowledgeBase");
const { protect } = require("../middleware/authMiddleware");
const { aiEnhanceSuggestions } = require("../services/aiSuggestionService");

const router = express.Router();

/* =========================
   ADD KNOWLEDGE BASE ARTICLE
   (ADMIN / IT ONLY)
========================= */
router.post("/add", protect, async (req, res) => {
  try {
    // allow only Admin or IT
    if (req.user.role !== "Admin" && req.user.role !== "IT") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, category, keywords, solution } = req.body;

    const article = await KnowledgeBase.create({
      title,
      category,
      keywords,
      solution,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Knowledge base article added successfully",
      article
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   VIEW ALL KNOWLEDGE BASE ARTICLES
   (ALL LOGGED-IN USERS)
========================= */
router.get("/", protect, async (req, res) => {
  try {
    const articles = await KnowledgeBase.find().sort({ createdAt: -1 });

    res.json({
      count: articles.length,
      articles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   AI-ENHANCED SUGGEST SOLUTIONS
   (DEMO-MODE, EXPLAINABLE)
========================= */
router.post("/suggest", protect, async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Step 1: Fetch all knowledge base articles
    const articles = await KnowledgeBase.find();

    // Step 2: AI-enhanced scoring & explanation
    const enhancedResults = aiEnhanceSuggestions(description, articles);

    // Step 3: Prepare clean response
    const suggestions = enhancedResults.map(item => ({
      title: item.article.title,
      category: item.article.category,
      solution: item.article.solution,
      relevanceScore: item.relevanceScore,
      explanation: item.explanation
    }));

    res.json({
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
