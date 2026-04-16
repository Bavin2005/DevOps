const mongoose = require("mongoose");

const knowledgeBaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: ["Network", "Software", "Hardware", "Other"],
      required: true
    },

    keywords: {
      type: [String],
      required: true
    },

    solution: {
      type: String,
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("KnowledgeBase", knowledgeBaseSchema);
