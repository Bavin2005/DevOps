/**
 * Demo-mode AI Suggestion Service
 * --------------------------------
 * This simulates AI behavior by:
 * - Understanding intent (roughly)
 * - Ranking solutions
 * - Explaining WHY a solution was suggested
 *
 * Later, this file can be replaced with real OpenAI / Gemini logic
 */

function aiEnhanceSuggestions(description, articles) {
    const text = description.toLowerCase();
  
    const enhanced = articles.map(article => {
      let relevanceScore = 0;
      let reasons = [];
  
      article.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          relevanceScore += 1;
          reasons.push(`Matched keyword "${keyword}"`);
        }
      });
  
      // Simulated semantic hints (AI-like behavior)
      if (text.includes("slow") && article.category === "Network") {
        relevanceScore += 1;
        reasons.push("Detected network performance issue");
      }
  
      if (text.includes("not working") || text.includes("cannot")) {
        relevanceScore += 1;
        reasons.push("Detected failure-related issue");
      }
  
      return {
        article,
        relevanceScore,
        explanation: reasons
      };
    });
  
    return enhanced
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  module.exports = { aiEnhanceSuggestions };
  