import OpenAI from "openai";
import { db } from "./db";
import { sentimentAnalysis } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SentimentResult {
  sentimentScore: number; // -1.0 to 1.0
  emotions: {
    primary: string;
    secondary: string[];
    confidence: number;
  };
  keywords: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  suggestions: {
    improvements: string[];
    concerns: string[];
    opportunities: string[];
  };
  confidence: number;
}

export class SentimentAnalysisEngine {
  private modelName = "gpt-4o"; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024

  async analyzeFeedback(
    text: string,
    campaignId: number,
    participantId: number,
    responseId?: number
  ): Promise<SentimentResult> {
    const prompt = `
    Analyze the sentiment of the following feedback text and provide detailed insights:

    Text: "${text}"

    Provide your analysis in the following JSON format:
    {
      "sentimentScore": <number between -1.0 and 1.0>,
      "emotions": {
        "primary": "<primary emotion detected>",
        "secondary": ["<secondary emotions>"],
        "confidence": <confidence score 0-1>
      },
      "keywords": {
        "positive": ["<positive keywords>"],
        "negative": ["<negative keywords>"],
        "neutral": ["<neutral keywords>"]
      },
      "suggestions": {
        "improvements": ["<actionable improvement suggestions>"],
        "concerns": ["<potential concerns to address>"],
        "opportunities": ["<opportunities to leverage>"]
      },
      "confidence": <overall confidence score 0-1>
    }

    Focus on:
    1. Overall sentiment polarity (-1 negative to +1 positive)
    2. Emotional undertones and intensity
    3. Key phrases that drive sentiment
    4. Actionable insights for campaign creators
    5. Potential areas of concern or opportunity
    `;

    try {
      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: "You are an expert sentiment analysis specialist focusing on market research and focus group feedback. Provide detailed, actionable insights that help campaign creators understand participant responses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Store the analysis in the database
      await db.insert(sentimentAnalysis).values({
        campaignId,
        participantId,
        responseId,
        sentimentScore: result.sentimentScore.toString(),
        emotions: result.emotions,
        keywords: result.keywords,
        suggestions: result.suggestions,
        confidence: result.confidence.toString(),
        analysisType: "realtime"
      });

      return result;
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      throw new Error("Failed to analyze sentiment");
    }
  }

  async batchAnalyze(
    feedbackItems: Array<{
      text: string;
      campaignId: number;
      participantId: number;
      responseId?: number;
    }>
  ): Promise<SentimentResult[]> {
    const results = await Promise.all(
      feedbackItems.map(item => 
        this.analyzeFeedback(item.text, item.campaignId, item.participantId, item.responseId)
      )
    );
    
    return results;
  }

  async getCampaignSentimentSummary(campaignId: number) {
    const analyses = await db
      .select()
      .from(sentimentAnalysis)
      .where({ campaignId });

    if (analyses.length === 0) {
      return {
        averageSentiment: 0,
        totalResponses: 0,
        emotionDistribution: {},
        keyInsights: [],
        recommendations: []
      };
    }

    const scores = analyses.map(a => parseFloat(a.sentimentScore || "0"));
    const averageSentiment = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Aggregate emotions
    const emotionCounts: Record<string, number> = {};
    analyses.forEach(a => {
      if (a.emotions?.primary) {
        emotionCounts[a.emotions.primary] = (emotionCounts[a.emotions.primary] || 0) + 1;
      }
    });

    // Collect key insights
    const allSuggestions = analyses.flatMap(a => a.suggestions?.improvements || []);
    const allConcerns = analyses.flatMap(a => a.suggestions?.concerns || []);
    const allOpportunities = analyses.flatMap(a => a.suggestions?.opportunities || []);

    return {
      averageSentiment,
      totalResponses: analyses.length,
      emotionDistribution: emotionCounts,
      keyInsights: {
        improvements: [...new Set(allSuggestions)].slice(0, 5),
        concerns: [...new Set(allConcerns)].slice(0, 5),
        opportunities: [...new Set(allOpportunities)].slice(0, 5)
      },
      recommendations: this.generateRecommendations(averageSentiment, emotionCounts)
    };
  }

  private generateRecommendations(averageSentiment: number, emotions: Record<string, number>) {
    const recommendations = [];

    if (averageSentiment < -0.3) {
      recommendations.push("Consider revising campaign content based on negative feedback patterns");
      recommendations.push("Implement immediate follow-up with dissatisfied participants");
    } else if (averageSentiment > 0.3) {
      recommendations.push("Leverage positive feedback in marketing materials");
      recommendations.push("Identify successful elements for future campaigns");
    }

    const topEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0];
    if (topEmotion) {
      recommendations.push(`Primary emotion "${topEmotion[0]}" suggests specific engagement strategies`);
    }

    return recommendations;
  }
}

export const sentimentAnalysisEngine = new SentimentAnalysisEngine();