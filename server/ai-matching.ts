import OpenAI from "openai";
import { storage } from "./storage";
import type { 
  ParticipantProfile, 
  Campaign, 
  User, 
  BehavioralAnalysis,
  MatchingHistory,
  CampaignMatching,
  AILearningFeedback,
  ParticipantResponse
} from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface MatchingCriteria {
  demographics?: {
    ageRange?: [number, number];
    genders?: string[];
    locations?: {
      countries?: string[];
      states?: string[];
      cities?: string[];
    };
    incomeRange?: [number, number];
    education?: string[];
    employment?: string[];
  };
  behavioral?: {
    interests?: string[];
    values?: string[];
    lifestyle?: string[];
    purchasingBehavior?: string[];
    mediaConsumption?: string[];
    techSavviness?: string[];
    decisionMakingStyle?: string[];
    socialEngagement?: string[];
    brandAffinity?: string[];
  };
  psychographic?: {
    personality?: string[];
    motivations?: string[];
    attitudes?: string[];
    opinions?: string[];
    riskTolerance?: string[];
    innovationAdoption?: string[];
    communicationStyle?: string[];
  };
  campaignSpecific?: {
    industry?: string;
    productCategory?: string;
    targetAudience?: string;
    campaignGoals?: string[];
    requiredExperience?: string[];
    contentTypes?: string[];
    expectedEngagement?: string;
  };
  qualityRequirements?: {
    minFeedbackQuality?: number;
    minResponseReliability?: number;
    minEngagementLevel?: number;
    maxWarningCount?: number;
    requiredVerificationStatus?: boolean;
  };
}

export interface MatchingResult {
  participantId: number;
  matchScore: number;
  confidence: number;
  matchReasons: string[];
  behavioralInsights: {
    strengths: string[];
    considerations: string[];
    recommendations: string[];
    riskFactors: string[];
  };
  segmentClassification: string;
  engagementPrediction: number;
  personalityProfile: {
    traits: string[];
    communicationStyle: string;
    decisionMakingStyle: string;
    motivationFactors: string[];
  };
  predictedPerformance: {
    feedbackQuality: number;
    completionRate: number;
    responseTime: number;
    engagement: number;
  };
}

export interface MatchingAnalytics {
  totalParticipants: number;
  matchedParticipants: number;
  averageMatchScore: number;
  topMatchingFactors: string[];
  segmentDistribution: Record<string, number>;
  recommendedSampleSize: number;
  diversityScore: number;
  qualityScore: number;
  riskAssessment: {
    highRiskParticipants: number;
    mediumRiskParticipants: number;
    lowRiskParticipants: number;
  };
  improvementSuggestions: string[];
}

export class AIMatchingEngine {
  private modelName = "gpt-4o";
  private algorithmVersion = "v2.1";

  async analyzeParticipantProfile(
    profile: ParticipantProfile, 
    responses: ParticipantResponse[]
  ): Promise<BehavioralAnalysis> {
    try {
      // Compile comprehensive participant data
      const participantData = {
        profile: profile,
        responses: responses,
        demographics: profile.demographics || {},
        psychographics: profile.psychographics || {},
        lifestyle: profile.lifestyle || {},
        careerEducation: profile.careerEducation || {},
        mediaPreferences: profile.mediaPreferences || {},
        techUsage: profile.techUsage || {},
        buyingBehavior: profile.buyingBehavior || {},
        beliefs: profile.beliefs || {}
      };

      const prompt = `
        Analyze this participant's comprehensive profile and provide deep behavioral insights:

        Profile Data: ${JSON.stringify(participantData, null, 2)}

        Provide a detailed behavioral analysis in JSON format with:
        
        1. behavioralProfile: {
          communicationStyle: string (verbal, visual, interactive, analytical),
          decisionMakingProcess: string (analytical, intuitive, collaborative, impulsive),
          informationProcessing: string (detail-oriented, big-picture, sequential, random),
          socialInteraction: string (extroverted, introverted, ambivert, situational),
          changeAdaptability: string (early-adopter, cautious, resistant, selective),
          motivationDrivers: string[] (achievement, recognition, autonomy, security, social),
          stressResponders: string[] (problem-solving, avoidance, seeking-support, aggression),
          learningStyle: string (visual, auditory, kinesthetic, reading-writing)
        }

        2. personalityTraits: {
          bigFive: { 
            openness: number (1-100), 
            conscientiousness: number (1-100), 
            extraversion: number (1-100), 
            agreeableness: number (1-100), 
            neuroticism: number (1-100) 
          },
          dominantTraits: string[] (creative, analytical, empathetic, assertive, etc.),
          communicationPreferences: string[] (direct, diplomatic, detailed, concise, etc.),
          workStyle: string[] (collaborative, independent, structured, flexible, etc.)
        }

        3. motivationalFactors: {
          intrinsicMotivators: string[] (curiosity, mastery, purpose, autonomy),
          extrinsicMotivators: string[] (money, recognition, competition, social-approval),
          decisionInfluencers: string[] (peer-opinions, expert-advice, data-analysis, intuition),
          valueAlignment: string[] (innovation, tradition, sustainability, efficiency, etc.)
        }

        4. decisionMakingStyle: {
          primaryStyle: string (analytical, intuitive, directive, conceptual),
          informationGathering: string (extensive, minimal, focused, broad),
          riskAssessment: string (risk-averse, risk-neutral, risk-seeking, calculated),
          timeOrientation: string (immediate, short-term, long-term, flexible),
          stakeholderConsideration: string (individual, group-focused, authority-dependent, consensus-seeking)
        }

        5. communicationPreferences: {
          preferredChannels: string[] (email, phone, video, in-person, text),
          communicationTone: string (formal, casual, friendly, professional),
          feedbackStyle: string (direct, constructive, encouraging, detailed),
          responsiveness: string (immediate, same-day, flexible, scheduled),
          clarificationNeeds: string (high, medium, low, contextual)
        }

        6. brandAffinityPatterns: {
          brandLoyalty: string (high, medium, low, selective),
          brandSwitchingTriggers: string[] (price, quality, innovation, recommendations),
          influencerImpact: string (high, medium, low, contextual),
          brandDiscoveryMethods: string[] (advertising, social-media, reviews, word-of-mouth),
          valueBasedPurchasing: string[] (price, quality, sustainability, brand-reputation)
        }

        7. purchaseDecisionFactors: {
          primaryFactors: string[] (price, quality, reviews, brand, convenience),
          researchDepth: string (extensive, moderate, minimal, varies-by-product),
          socialInfluence: string (high, medium, low, product-dependent),
          impulsivityLevel: string (planned, semi-planned, impulsive, mixed),
          budgetConsciousness: string (very-conscious, moderately-conscious, flexible, varies)
        }

        8. contentConsumptionBehavior: {
          preferredFormats: string[] (text, video, audio, interactive, visual),
          attentionSpan: string (short, medium, long, varies-by-content),
          consumptionTiming: string[] (morning, afternoon, evening, night, flexible),
          devicePreferences: string[] (mobile, desktop, tablet, varies-by-context),
          sharingBehavior: string (frequent, occasional, rare, selective)
        }

        9. adaptabilityScore: number (1-100, higher = more adaptable)
        10. influenceFactors: string[] (authority, peers, experts, data, emotions)
        11. riskTolerance: string (low, medium, high, contextual)
        12. innovationAdoption: string (innovator, early-adopter, early-majority, late-majority, laggard)
        13. socialEngagementLevel: number (1-10, higher = more engaged)
        14. feedbackQuality: number (1-100, predicted feedback quality)
        15. responseReliability: number (1-100, predicted response consistency)
        16. engagementPrediction: number (1-100, predicted engagement level)
        17. confidenceScore: number (1-100, AI confidence in analysis)

        Base your analysis on observable patterns in the data. Be specific and actionable.
      `;

      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 3000,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");

      // Store the analysis in the database
      const behavioralAnalysis: BehavioralAnalysis = {
        id: 0, // Will be set by database
        participantId: profile.userId,
        analysisType: "full_profile",
        behavioralProfile: analysis.behavioralProfile,
        personalityTraits: analysis.personalityTraits,
        motivationalFactors: analysis.motivationalFactors,
        decisionMakingStyle: analysis.decisionMakingStyle,
        communicationPreferences: analysis.communicationPreferences,
        adaptabilityScore: analysis.adaptabilityScore,
        influenceFactors: analysis.influenceFactors,
        riskTolerance: analysis.riskTolerance,
        innovationAdoption: analysis.innovationAdoption,
        socialEngagementLevel: analysis.socialEngagementLevel,
        brandAffinityPatterns: analysis.brandAffinityPatterns,
        purchaseDecisionFactors: analysis.purchaseDecisionFactors,
        contentConsumptionBehavior: analysis.contentConsumptionBehavior,
        feedbackQuality: analysis.feedbackQuality,
        responseReliability: analysis.responseReliability,
        engagementPrediction: analysis.engagementPrediction,
        confidenceScore: analysis.confidenceScore,
        lastUpdated: new Date(),
        createdAt: new Date()
      };

      return behavioralAnalysis;
    } catch (error) {
      console.error("Error analyzing participant profile:", error);
      throw error;
    }
  }

  async generateMatchingScore(
    participantProfile: ParticipantProfile,
    behavioralAnalysis: BehavioralAnalysis,
    criteria: MatchingCriteria,
    campaignContext: Campaign
  ): Promise<MatchingResult> {
    try {
      const prompt = `
        Generate a comprehensive matching score for this participant:

        Participant Profile: ${JSON.stringify(participantProfile, null, 2)}
        Behavioral Analysis: ${JSON.stringify(behavioralAnalysis, null, 2)}
        Matching Criteria: ${JSON.stringify(criteria, null, 2)}
        Campaign Context: ${JSON.stringify(campaignContext, null, 2)}

        Provide a detailed matching analysis in JSON format with:
        
        1. matchScore: number (1-100, higher = better match)
        2. confidence: number (1-100, AI confidence in the match)
        3. matchReasons: string[] (specific reasons for the match score)
        4. behavioralInsights: {
          strengths: string[] (participant's strengths for this campaign),
          considerations: string[] (factors to consider),
          recommendations: string[] (how to optimize their participation),
          riskFactors: string[] (potential risks or challenges)
        }
        5. segmentClassification: string (target market segment)
        6. engagementPrediction: number (1-100, predicted engagement level)
        7. personalityProfile: {
          traits: string[] (relevant personality traits),
          communicationStyle: string (how they communicate),
          decisionMakingStyle: string (how they make decisions),
          motivationFactors: string[] (what motivates them)
        }
        8. predictedPerformance: {
          feedbackQuality: number (1-100, predicted feedback quality),
          completionRate: number (1-100, predicted task completion),
          responseTime: number (1-100, predicted response speed),
          engagement: number (1-100, predicted engagement level)
        }

        Consider all factors including demographics, psychographics, behavioral patterns, 
        campaign requirements, and historical performance patterns.
      `;

      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      return {
        participantId: participantProfile.userId,
        matchScore: result.matchScore,
        confidence: result.confidence,
        matchReasons: result.matchReasons,
        behavioralInsights: result.behavioralInsights,
        segmentClassification: result.segmentClassification,
        engagementPrediction: result.engagementPrediction,
        personalityProfile: result.personalityProfile,
        predictedPerformance: result.predictedPerformance
      };
    } catch (error) {
      console.error("Error generating matching score:", error);
      throw error;
    }
  }

  async findOptimalMatches(
    criteria: MatchingCriteria,
    campaign: Campaign,
    targetCount: number = 50
  ): Promise<{
    matches: MatchingResult[];
    analytics: MatchingAnalytics;
  }> {
    try {
      // Get all eligible participants
      const participants = await storage.getEligibleParticipants(criteria);
      
      const allMatches: MatchingResult[] = [];
      
      // Process each participant
      for (const participant of participants) {
        const profile = await storage.getParticipantProfile(participant.id);
        if (!profile) continue;

        const responses = await storage.getParticipantResponses(participant.id);
        
        // Get or create behavioral analysis
        let behavioralAnalysis = await storage.getBehavioralAnalysis(participant.id);
        if (!behavioralAnalysis) {
          behavioralAnalysis = await this.analyzeParticipantProfile(profile, responses);
          await storage.storeBehavioralAnalysis(behavioralAnalysis);
        }

        // Generate matching score
        const matchResult = await this.generateMatchingScore(
          profile,
          behavioralAnalysis,
          criteria,
          campaign
        );

        allMatches.push(matchResult);
      }

      // Optimize selection for diversity and quality
      const optimizedMatches = this.optimizeMatchSelection(
        allMatches,
        targetCount,
        criteria
      );

      // Generate analytics
      const analytics = this.generateMatchingAnalytics(
        allMatches,
        optimizedMatches,
        criteria
      );

      return {
        matches: optimizedMatches,
        analytics: analytics
      };
    } catch (error) {
      console.error("Error finding optimal matches:", error);
      throw error;
    }
  }

  private optimizeMatchSelection(
    matches: MatchingResult[],
    targetCount: number,
    criteria: MatchingCriteria
  ): MatchingResult[] {
    // First, filter by minimum requirements
    const qualifiedMatches = matches.filter(match => {
      const quality = criteria.qualityRequirements;
      if (!quality) return true;
      
      return (
        (quality.minFeedbackQuality ? match.predictedPerformance.feedbackQuality >= quality.minFeedbackQuality : true) &&
        (quality.minResponseReliability ? match.predictedPerformance.responseTime >= quality.minResponseReliability : true) &&
        (quality.minEngagementLevel ? match.engagementPrediction >= quality.minEngagementLevel : true)
      );
    });

    // Sort by match score and confidence
    qualifiedMatches.sort((a, b) => {
      const scoreA = a.matchScore * (a.confidence / 100);
      const scoreB = b.matchScore * (b.confidence / 100);
      return scoreB - scoreA;
    });

    // Ensure diversity in selection
    const diversifiedMatches = this.ensureDiversity(qualifiedMatches, targetCount);

    return diversifiedMatches.slice(0, targetCount);
  }

  private ensureDiversity(matches: MatchingResult[], targetCount: number): MatchingResult[] {
    const selected: MatchingResult[] = [];
    
    // Group matches by segment
    const segmentGroups: Record<string, MatchingResult[]> = {};
    matches.forEach(match => {
      const segment = match.segmentClassification;
      if (!segmentGroups[segment]) {
        segmentGroups[segment] = [];
      }
      segmentGroups[segment].push(match);
    });

    // Calculate target distribution
    const segments = Object.keys(segmentGroups);
    const targetPerSegment = Math.floor(targetCount / segments.length);
    const remainder = targetCount % segments.length;

    // Select from each segment
    segments.forEach((segment, index) => {
      const segmentMatches = segmentGroups[segment];
      const targetForSegment = targetPerSegment + (index < remainder ? 1 : 0);
      const segmentSelection = segmentMatches.slice(0, targetForSegment);
      
      selected.push(...segmentSelection);
    });

    // Fill remaining slots with top performers
    if (selected.length < targetCount) {
      const remaining = matches.filter(m => !selected.includes(m));
      selected.push(...remaining.slice(0, targetCount - selected.length));
    }

    return selected;
  }

  private generateMatchingAnalytics(
    allMatches: MatchingResult[],
    selectedMatches: MatchingResult[],
    criteria: MatchingCriteria
  ): MatchingAnalytics {
    const totalParticipants = allMatches.length;
    const matchedParticipants = selectedMatches.length;
    const averageMatchScore = selectedMatches.reduce((sum, match) => sum + match.matchScore, 0) / matchedParticipants;

    // Calculate segment distribution
    const segmentDistribution: Record<string, number> = {};
    selectedMatches.forEach(match => {
      const segment = match.segmentClassification;
      segmentDistribution[segment] = (segmentDistribution[segment] || 0) + 1;
    });

    // Calculate diversity score (0-100)
    const segments = Object.keys(segmentDistribution);
    const diversity = segments.length > 1 ? 
      (segments.length / Math.max(5, segments.length)) * 100 : 0;

    // Calculate quality score based on predicted performance
    const qualityScore = selectedMatches.reduce((sum, match) => 
      sum + (match.predictedPerformance.feedbackQuality + 
             match.predictedPerformance.engagement + 
             match.predictedPerformance.completionRate) / 3, 0
    ) / matchedParticipants;

    // Risk assessment
    const riskAssessment = {
      highRiskParticipants: selectedMatches.filter(m => 
        m.behavioralInsights.riskFactors.length > 2).length,
      mediumRiskParticipants: selectedMatches.filter(m => 
        m.behavioralInsights.riskFactors.length === 1 || 
        m.behavioralInsights.riskFactors.length === 2).length,
      lowRiskParticipants: selectedMatches.filter(m => 
        m.behavioralInsights.riskFactors.length === 0).length
    };

    return {
      totalParticipants,
      matchedParticipants,
      averageMatchScore,
      topMatchingFactors: this.extractTopMatchingFactors(selectedMatches),
      segmentDistribution,
      recommendedSampleSize: Math.min(targetCount, Math.floor(totalParticipants * 0.7)),
      diversityScore: diversity,
      qualityScore,
      riskAssessment,
      improvementSuggestions: []
    };
  }

  private extractTopMatchingFactors(matches: MatchingResult[]): string[] {
    const factorCounts: Record<string, number> = {};
    
    matches.forEach(match => {
      match.matchReasons.forEach(reason => {
        factorCounts[reason] = (factorCounts[reason] || 0) + 1;
      });
    });

    return Object.entries(factorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([factor]) => factor);
  }

  async generateMatchingRecommendations(
    campaignRequirements: any,
    targetAudience: any,
    industry: string
  ): Promise<{
    recommendedCriteria: MatchingCriteria;
    expectedResults: any;
    alternativeOptions: any[];
  }> {
    try {
      // Get historical data for this industry/audience
      const historicalData = await storage.getHistoricalMatchingData(targetAudience);
      
      const prompt = `
        Based on the campaign requirements and historical data, generate optimal matching criteria:

        Campaign Requirements: ${JSON.stringify(campaignRequirements, null, 2)}
        Target Audience: ${JSON.stringify(targetAudience, null, 2)}
        Industry: ${industry}
        Historical Performance: ${JSON.stringify(historicalData.slice(0, 5), null, 2)}

        Provide comprehensive matching criteria recommendations in JSON format:
        
        {
          "recommendedCriteria": {
            "demographics": {
              "ageRange": [min, max],
              "genders": ["male", "female", "other"],
              "locations": {
                "countries": ["US", "Canada"],
                "states": ["CA", "NY", "TX"],
                "cities": ["San Francisco", "New York"]
              },
              "incomeRange": [min, max],
              "education": ["high_school", "bachelor", "master", "phd"],
              "employment": ["full_time", "part_time", "student", "retired"]
            },
            "behavioral": {
              "interests": ["technology", "fashion", "sports"],
              "values": ["sustainability", "innovation", "quality"],
              "lifestyle": ["urban", "suburban", "rural"],
              "purchasingBehavior": ["online", "in_store", "research_heavy"],
              "mediaConsumption": ["social_media", "tv", "podcasts", "blogs"],
              "techSavviness": ["early_adopter", "mainstream", "late_adopter"],
              "decisionMakingStyle": ["analytical", "intuitive", "social"],
              "socialEngagement": ["highly_active", "moderately_active", "passive"],
              "brandAffinity": ["loyal", "switcher", "deal_seeker"]
            },
            "psychographic": {
              "personality": ["extroverted", "analytical", "creative"],
              "motivations": ["achievement", "recognition", "security"],
              "attitudes": ["optimistic", "skeptical", "pragmatic"],
              "opinions": ["progressive", "conservative", "moderate"],
              "riskTolerance": ["high", "medium", "low"],
              "innovationAdoption": ["innovator", "early_adopter", "mainstream"],
              "communicationStyle": ["direct", "diplomatic", "detailed"]
            },
            "campaignSpecific": {
              "industry": "${industry}",
              "productCategory": "specific_category",
              "targetAudience": "defined_segment",
              "campaignGoals": ["awareness", "feedback", "testing"],
              "requiredExperience": ["category_experience", "brand_familiarity"],
              "contentTypes": ["images", "videos", "text"],
              "expectedEngagement": "high"
            },
            "qualityRequirements": {
              "minFeedbackQuality": 75,
              "minResponseReliability": 80,
              "minEngagementLevel": 70,
              "maxWarningCount": 2,
              "requiredVerificationStatus": true
            }
          },
          "expectedResults": {
            "participantCount": 50,
            "qualityScore": 85,
            "diversityScore": 75,
            "costEstimate": 2500,
            "timeToComplete": "48 hours",
            "expectedEngagement": "high"
          },
          "alternativeOptions": [
            {
              "name": "Broader Reach",
              "description": "More inclusive criteria for larger participant pool",
              "tradeoffs": "Higher quantity, potentially lower quality match scores",
              "criteria": "modified_criteria_object",
              "expectedResults": "modified_results_object"
            },
            {
              "name": "Quality Focus",
              "description": "Stricter criteria for higher quality matches",
              "tradeoffs": "Lower quantity, higher quality match scores",
              "criteria": "modified_criteria_object",
              "expectedResults": "modified_results_object"
            },
            {
              "name": "Diversity Optimized",
              "description": "Balanced approach maximizing demographic diversity",
              "tradeoffs": "Moderate quantity and quality, maximum diversity",
              "criteria": "modified_criteria_object",
              "expectedResults": "modified_results_object"
            }
          ]
        }

        Base recommendations on industry best practices, historical performance, and campaign goals.
        Ensure criteria are specific, measurable, and aligned with the target audience requirements.
      `;

      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2000,
      });

      const recommendations = JSON.parse(response.choices[0].message.content || "{}");

      return {
        recommendedCriteria: recommendations.recommendedCriteria,
        expectedResults: recommendations.expectedResults,
        alternativeOptions: recommendations.alternativeOptions || []
      };
    } catch (error) {
      console.error("Error generating matching recommendations:", error);
      throw error;
    }
  }

  async learnFromCampaignResults(campaignId: number, participantFeedback: any): Promise<void> {
    try {
      // Get campaign matching history
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        throw new Error("Campaign not found");
      }

      // Process feedback for learning
      const prompt = `
        Analyze this campaign feedback to improve future matching:

        Campaign: ${JSON.stringify(campaign, null, 2)}
        Participant Feedback: ${JSON.stringify(participantFeedback, null, 2)}

        Provide learning insights in JSON format:
        {
          "matchingAccuracy": number (1-100),
          "participantSatisfaction": number (1-100),
          "feedbackQuality": number (1-100),
          "improvementSuggestions": string[],
          "criteriaAdjustments": {
            "strengthen": string[] (criteria that worked well),
            "weaken": string[] (criteria that were too strict),
            "add": string[] (new criteria to consider),
            "remove": string[] (criteria to remove)
          },
          "segmentInsights": {
            "topPerformers": string[],
            "underperformers": string[],
            "surpriseFindings": string[]
          }
        }
      `;

      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1500,
      });

      const learningInsights = JSON.parse(response.choices[0].message.content || "{}");

      // Store learning feedback
      await storage.storeAILearningFeedback({
        feedbackType: "campaign_results",
        feedbackData: learningInsights,
        improvementSuggestions: learningInsights.improvementSuggestions,
        humanFeedback: participantFeedback,
        actionTaken: "processed_for_learning",
        impactMeasured: false
      });

      console.log("Campaign learning insights stored:", learningInsights);
    } catch (error) {
      console.error("Error learning from campaign results:", error);
      throw error;
    }
  }
}

export const aiMatchingEngine = new AIMatchingEngine();