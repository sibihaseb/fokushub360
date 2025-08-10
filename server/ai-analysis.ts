import OpenAI from "openai";
import { storage } from "./storage";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MediaAnalysisResult {
  id: string;
  mediaType: 'image' | 'video';
  fileName: string;
  analysisType: 'comprehensive' | 'sentiment' | 'demographic' | 'content';
  results: {
    overview: {
      description: string;
      primarySubjects: string[];
      setting: string;
      mood: string;
      visualStyle: string;
    };
    demographics: {
      estimatedAge: string;
      gender: string;
      ethnicity: string;
      clothing: string;
      accessories: string[];
    };
    emotions: {
      primaryEmotion: string;
      confidence: number;
      secondaryEmotions: string[];
      facialExpressions: string[];
      bodyLanguage: string[];
    };
    content: {
      objects: string[];
      text: string[];
      brands: string[];
      colors: string[];
      composition: string;
      lighting: string;
    };
    insights: {
      targetAudience: string[];
      marketingPotential: string;
      brandAlignment: string;
      improvementSuggestions: string[];
      keyTakeaways: string[];
    };
    sentiment: {
      overall: 'positive' | 'negative' | 'neutral';
      score: number;
      reasoning: string;
      marketRelevance: string;
    };
  };
  metadata: {
    analysisDate: Date;
    confidence: number;
    processingTime: number;
    model: string;
  };
}

export interface VideoAnalysisResult extends MediaAnalysisResult {
  results: MediaAnalysisResult['results'] & {
    temporal: {
      duration: number;
      keyFrames: Array<{
        timestamp: number;
        description: string;
        significance: string;
      }>;
      transitions: string[];
      pacing: string;
    };
    audio: {
      hasAudio: boolean;
      musicStyle?: string;
      voiceOver?: string;
      soundEffects?: string[];
      audioQuality?: string;
    };
  };
}

export class AIAnalysisEngine {
  private modelName = "gpt-4o"; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

  async analyzeImage(
    imageBase64: string,
    fileName: string,
    analysisType: 'comprehensive' | 'sentiment' | 'demographic' | 'content' = 'comprehensive'
  ): Promise<MediaAnalysisResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildImageAnalysisPrompt(analysisType);
      
      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const analysisData = JSON.parse(response.choices[0].message.content || '{}');
      const processingTime = Date.now() - startTime;

      const result: MediaAnalysisResult = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mediaType: 'image',
        fileName,
        analysisType,
        results: {
          overview: {
            description: analysisData.overview?.description || "No description available",
            primarySubjects: analysisData.overview?.primarySubjects || [],
            setting: analysisData.overview?.setting || "Unknown",
            mood: analysisData.overview?.mood || "Neutral",
            visualStyle: analysisData.overview?.visualStyle || "Standard"
          },
          demographics: {
            estimatedAge: analysisData.demographics?.estimatedAge || "Unknown",
            gender: analysisData.demographics?.gender || "Unknown",
            ethnicity: analysisData.demographics?.ethnicity || "Unknown",
            clothing: analysisData.demographics?.clothing || "Unknown",
            accessories: analysisData.demographics?.accessories || []
          },
          emotions: {
            primaryEmotion: analysisData.emotions?.primaryEmotion || "Neutral",
            confidence: analysisData.emotions?.confidence || 0.5,
            secondaryEmotions: analysisData.emotions?.secondaryEmotions || [],
            facialExpressions: analysisData.emotions?.facialExpressions || [],
            bodyLanguage: analysisData.emotions?.bodyLanguage || []
          },
          content: {
            objects: analysisData.content?.objects || [],
            text: analysisData.content?.text || [],
            brands: analysisData.content?.brands || [],
            colors: analysisData.content?.colors || [],
            composition: analysisData.content?.composition || "Unknown",
            lighting: analysisData.content?.lighting || "Unknown"
          },
          insights: {
            targetAudience: analysisData.insights?.targetAudience || [],
            marketingPotential: analysisData.insights?.marketingPotential || "Unknown",
            brandAlignment: analysisData.insights?.brandAlignment || "Unknown",
            improvementSuggestions: analysisData.insights?.improvementSuggestions || [],
            keyTakeaways: analysisData.insights?.keyTakeaways || []
          },
          sentiment: {
            overall: analysisData.sentiment?.overall || 'neutral',
            score: analysisData.sentiment?.score || 0.5,
            reasoning: analysisData.sentiment?.reasoning || "No reasoning provided",
            marketRelevance: analysisData.sentiment?.marketRelevance || "Unknown"
          }
        },
        metadata: {
          analysisDate: new Date(),
          confidence: analysisData.metadata?.confidence || 0.8,
          processingTime,
          model: this.modelName
        }
      };

      return result;
    } catch (error) {
      console.error("Error in image analysis:", error);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  async analyzeVideo(
    videoBase64: string,
    fileName: string,
    analysisType: 'comprehensive' | 'sentiment' | 'demographic' | 'content' = 'comprehensive'
  ): Promise<VideoAnalysisResult> {
    const startTime = Date.now();

    try {
      // For video analysis, we'll extract key frames and analyze them
      // In a real implementation, you'd use ffmpeg or similar to extract frames
      // For now, we'll simulate this with a comprehensive analysis
      
      const prompt = this.buildVideoAnalysisPrompt(analysisType);
      
      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${videoBase64}` // This would be a frame from the video
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2500,
      });

      const analysisData = JSON.parse(response.choices[0].message.content || '{}');
      const processingTime = Date.now() - startTime;

      const result: VideoAnalysisResult = {
        id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mediaType: 'video',
        fileName,
        analysisType,
        results: {
          overview: {
            description: analysisData.overview?.description || "No description available",
            primarySubjects: analysisData.overview?.primarySubjects || [],
            setting: analysisData.overview?.setting || "Unknown",
            mood: analysisData.overview?.mood || "Neutral",
            visualStyle: analysisData.overview?.visualStyle || "Standard"
          },
          demographics: {
            estimatedAge: analysisData.demographics?.estimatedAge || "Unknown",
            gender: analysisData.demographics?.gender || "Unknown",
            ethnicity: analysisData.demographics?.ethnicity || "Unknown",
            clothing: analysisData.demographics?.clothing || "Unknown",
            accessories: analysisData.demographics?.accessories || []
          },
          emotions: {
            primaryEmotion: analysisData.emotions?.primaryEmotion || "Neutral",
            confidence: analysisData.emotions?.confidence || 0.5,
            secondaryEmotions: analysisData.emotions?.secondaryEmotions || [],
            facialExpressions: analysisData.emotions?.facialExpressions || [],
            bodyLanguage: analysisData.emotions?.bodyLanguage || []
          },
          content: {
            objects: analysisData.content?.objects || [],
            text: analysisData.content?.text || [],
            brands: analysisData.content?.brands || [],
            colors: analysisData.content?.colors || [],
            composition: analysisData.content?.composition || "Unknown",
            lighting: analysisData.content?.lighting || "Unknown"
          },
          insights: {
            targetAudience: analysisData.insights?.targetAudience || [],
            marketingPotential: analysisData.insights?.marketingPotential || "Unknown",
            brandAlignment: analysisData.insights?.brandAlignment || "Unknown",
            improvementSuggestions: analysisData.insights?.improvementSuggestions || [],
            keyTakeaways: analysisData.insights?.keyTakeaways || []
          },
          sentiment: {
            overall: analysisData.sentiment?.overall || 'neutral',
            score: analysisData.sentiment?.score || 0.5,
            reasoning: analysisData.sentiment?.reasoning || "No reasoning provided",
            marketRelevance: analysisData.sentiment?.marketRelevance || "Unknown"
          },
          temporal: {
            duration: analysisData.temporal?.duration || 0,
            keyFrames: analysisData.temporal?.keyFrames || [],
            transitions: analysisData.temporal?.transitions || [],
            pacing: analysisData.temporal?.pacing || "Unknown"
          },
          audio: {
            hasAudio: analysisData.audio?.hasAudio || false,
            musicStyle: analysisData.audio?.musicStyle,
            voiceOver: analysisData.audio?.voiceOver,
            soundEffects: analysisData.audio?.soundEffects || [],
            audioQuality: analysisData.audio?.audioQuality
          }
        },
        metadata: {
          analysisDate: new Date(),
          confidence: analysisData.metadata?.confidence || 0.8,
          processingTime,
          model: this.modelName
        }
      };

      return result;
    } catch (error) {
      console.error("Error in video analysis:", error);
      throw new Error(`Video analysis failed: ${error.message}`);
    }
  }

  private buildImageAnalysisPrompt(analysisType: string): string {
    const basePrompt = `
      Analyze this image in extreme detail and provide a comprehensive analysis in JSON format. 
      Focus on providing as much visual and contextual information as possible for market research purposes.
      
      Please provide the analysis in the following JSON structure:
      {
        "overview": {
          "description": "Detailed description of the image",
          "primarySubjects": ["main subjects in the image"],
          "setting": "location/environment description",
          "mood": "overall mood/atmosphere",
          "visualStyle": "photography/design style"
        },
        "demographics": {
          "estimatedAge": "age range of people in image",
          "gender": "gender identification",
          "ethnicity": "ethnicity if visible",
          "clothing": "detailed clothing description",
          "accessories": ["visible accessories or items"]
        },
        "emotions": {
          "primaryEmotion": "main emotion expressed",
          "confidence": 0.8,
          "secondaryEmotions": ["other emotions present"],
          "facialExpressions": ["detailed facial expressions"],
          "bodyLanguage": ["body language observations"]
        },
        "content": {
          "objects": ["all visible objects"],
          "text": ["any text visible in image"],
          "brands": ["brand names or logos visible"],
          "colors": ["dominant colors"],
          "composition": "composition and framing analysis",
          "lighting": "lighting conditions and quality"
        },
        "insights": {
          "targetAudience": ["potential target demographics"],
          "marketingPotential": "marketing analysis and potential",
          "brandAlignment": "brand alignment opportunities",
          "improvementSuggestions": ["suggestions for improvement"],
          "keyTakeaways": ["key insights for market research"]
        },
        "sentiment": {
          "overall": "positive/negative/neutral",
          "score": 0.7,
          "reasoning": "explanation of sentiment analysis",
          "marketRelevance": "relevance to market research"
        },
        "metadata": {
          "confidence": 0.85
        }
      }
    `;

    if (analysisType === 'sentiment') {
      return basePrompt + "\n\nFocus particularly on emotional analysis and sentiment detection.";
    } else if (analysisType === 'demographic') {
      return basePrompt + "\n\nFocus particularly on demographic analysis and target audience identification.";
    } else if (analysisType === 'content') {
      return basePrompt + "\n\nFocus particularly on content analysis, objects, and visual elements.";
    }

    return basePrompt;
  }

  private buildVideoAnalysisPrompt(analysisType: string): string {
    const basePrompt = `
      Analyze this video frame (representing a video) in extreme detail and provide a comprehensive analysis in JSON format.
      This is part of a video analysis, so consider temporal elements and motion.
      
      Please provide the analysis in the following JSON structure:
      {
        "overview": {
          "description": "Detailed description of the video content",
          "primarySubjects": ["main subjects in the video"],
          "setting": "location/environment description",
          "mood": "overall mood/atmosphere",
          "visualStyle": "video production style"
        },
        "demographics": {
          "estimatedAge": "age range of people in video",
          "gender": "gender identification",
          "ethnicity": "ethnicity if visible",
          "clothing": "detailed clothing description",
          "accessories": ["visible accessories or items"]
        },
        "emotions": {
          "primaryEmotion": "main emotion expressed",
          "confidence": 0.8,
          "secondaryEmotions": ["other emotions present"],
          "facialExpressions": ["detailed facial expressions"],
          "bodyLanguage": ["body language observations"]
        },
        "content": {
          "objects": ["all visible objects"],
          "text": ["any text visible in video"],
          "brands": ["brand names or logos visible"],
          "colors": ["dominant colors"],
          "composition": "composition and framing analysis",
          "lighting": "lighting conditions and quality"
        },
        "insights": {
          "targetAudience": ["potential target demographics"],
          "marketingPotential": "marketing analysis and potential",
          "brandAlignment": "brand alignment opportunities",
          "improvementSuggestions": ["suggestions for improvement"],
          "keyTakeaways": ["key insights for market research"]
        },
        "sentiment": {
          "overall": "positive/negative/neutral",
          "score": 0.7,
          "reasoning": "explanation of sentiment analysis",
          "marketRelevance": "relevance to market research"
        },
        "temporal": {
          "duration": 30,
          "keyFrames": [
            {
              "timestamp": 0,
              "description": "frame description",
              "significance": "why this frame is important"
            }
          ],
          "transitions": ["types of transitions used"],
          "pacing": "fast/medium/slow pacing description"
        },
        "audio": {
          "hasAudio": true,
          "musicStyle": "background music style",
          "voiceOver": "voice over description",
          "soundEffects": ["sound effects used"],
          "audioQuality": "audio quality assessment"
        },
        "metadata": {
          "confidence": 0.85
        }
      }
    `;

    if (analysisType === 'sentiment') {
      return basePrompt + "\n\nFocus particularly on emotional analysis and sentiment detection throughout the video.";
    } else if (analysisType === 'demographic') {
      return basePrompt + "\n\nFocus particularly on demographic analysis and target audience identification.";
    } else if (analysisType === 'content') {
      return basePrompt + "\n\nFocus particularly on content analysis, objects, and visual elements.";
    }

    return basePrompt;
  }

  async generateAnalysisReport(
    analysisResults: (MediaAnalysisResult | VideoAnalysisResult)[],
    campaignId: number
  ): Promise<{
    reportId: string;
    summary: any;
    recommendations: string[];
    insights: any;
  }> {
    try {
      const summaryPrompt = `
        Based on the following media analysis results from a focus group campaign, generate a comprehensive report summary.
        
        Analysis Results: ${JSON.stringify(analysisResults, null, 2)}
        
        Please provide a comprehensive summary and insights in JSON format:
        {
          "executiveSummary": "Overall summary of findings",
          "keyInsights": ["most important insights"],
          "demographicProfile": {
            "primaryAudience": "main demographic",
            "ageRange": "age distribution",
            "genderDistribution": "gender breakdown",
            "emotionalResponse": "emotional analysis"
          },
          "contentAnalysis": {
            "visualThemes": ["common visual themes"],
            "brandPresence": ["brand elements found"],
            "sentimentTrends": "overall sentiment patterns",
            "engagementFactors": ["factors driving engagement"]
          },
          "recommendations": ["actionable recommendations"],
          "marketingImplications": ["marketing strategy implications"],
          "nextSteps": ["suggested next steps"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "user",
            content: summaryPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const reportData = JSON.parse(response.choices[0].message.content || '{}');
      
      const reportId = `report_${campaignId}_${Date.now()}`;
      
      return {
        reportId,
        summary: reportData,
        recommendations: reportData.recommendations || [],
        insights: reportData
      };
    } catch (error) {
      console.error("Error generating analysis report:", error);
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  async storeAnalysisResult(
    campaignId: number,
    assetId: number,
    analysisResult: MediaAnalysisResult | VideoAnalysisResult
  ): Promise<void> {
    try {
      await storage.createAdminSetting({
        key: `ai_analysis_${campaignId}_${assetId}`,
        value: JSON.stringify(analysisResult),
        category: 'ai_analysis',
        description: `AI analysis for campaign ${campaignId} asset ${assetId}`
      });
    } catch (error) {
      console.error("Error storing analysis result:", error);
      throw new Error(`Failed to store analysis result: ${error.message}`);
    }
  }

  async getAnalysisResults(campaignId: number): Promise<(MediaAnalysisResult | VideoAnalysisResult)[]> {
    try {
      const settings = await storage.getAdminSettingsByCategory('ai_analysis');
      return settings
        .filter(setting => setting.key.startsWith(`ai_analysis_${campaignId}_`))
        .map(setting => JSON.parse(setting.value))
        .sort((a, b) => new Date(b.metadata.analysisDate).getTime() - new Date(a.metadata.analysisDate).getTime());
    } catch (error) {
      console.error("Error getting analysis results:", error);
      return [];
    }
  }
}

export const aiAnalysisEngine = new AIAnalysisEngine();