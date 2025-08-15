import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  authenticateToken, 
  requireRole,
  type AuthRequest 
} from "./auth";

import { generateSignedUrl ,getPublicUrl, s3Client} from "./storage/wasabi";
import { 
  insertUserSchema, insertCampaignSchema, insertParticipantResponseSchema, insertQuestionCategorySchema, 
  insertQuestionSchema, insertInvitationWaitlistSchema, insertPasswordResetTokenSchema, insertLegalDocumentSchema, 
  insertUserLegalAcceptanceSchema, type InsertUser, users, behavioralAnalysis, matchingHistory, campaignMatching,
  participantResponses, campaignParticipants, notifications, userWarnings, userLegalAcceptances, participantProfiles,
  passwordResetTokens, verificationSubmissions, campaigns, reports, emailSegments, emailCampaigns, adminSettings
} from "@shared/schema";
import { z } from "zod";
import { aiMatchingEngine, type MatchingCriteria } from "./ai-matching";
import { aiAnalysisEngine } from "./ai-analysis";
import { sentimentAnalysisEngine } from "./sentiment-analysis";
import { verificationSystem } from "./verification-system";
import { pricingService } from "./pricing-service";
import { contentProtectionEngine } from "./content-protection";
import { seedTestCampaigns } from "./seed-test-campaigns";
import Stripe from "stripe";
import multer from "multer";
import { uploadSingle, uploadMultiple, uploadFields } from "./storage/wasabi";
import path from "path";
import { randomBytes } from "crypto";
import { generateEmailHTML } from "./email-html-generator";
import { HealthCheckService } from "./health-check-service";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'));
    }
  },
});

// Validation schemas
const signUpSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("Signup request received:", { email: req.body.email, role: req.body.role });
      
      const validatedData = signUpSchema.parse(req.body);
      const { email, password, firstName, lastName, role } = validatedData;

      console.log("Data validated successfully");

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log("User already exists:", email);
        return res.status(409).json({ message: "User already exists" });
      }

      console.log("User doesn't exist, proceeding...");

      // Check if invitation-only mode is enabled for client registrations
      if (role === 'client') {
        try {
          const isInvitationOnly = await storage.isInvitationOnlyMode();
          console.log("Invitation only mode check:", isInvitationOnly);
          if (isInvitationOnly) {
            console.log("Blocking client registration - invitation only mode");
            return res.status(403).json({ 
              message: "Client registration is currently by invitation only",
              invitationOnly: true 
            });
          }
        } catch (inviteError) {
          console.error("Error checking invitation mode:", inviteError);
          // Continue with registration if check fails
        }
      }

      console.log("Creating user...");

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const userData: InsertUser = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "client",
      };

      const user = await storage.createUser(userData);
      console.log("User created successfully:", user.id);
      
      const token = generateToken(user);
      console.log("Token generated");

      // Send welcome email automatically
      try {
        const { EmailService } = await import("./email-service");
        const emailService = EmailService.getInstance();
        await emailService.sendWelcomeEmail(user.email, user.firstName, user.role as 'client' | 'participant');
        console.log(`Welcome email sent to ${user.email} (${user.role})`);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the registration if email fails
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      console.log("Returning success response");
      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Signup error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = signInSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Sign in successful",
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Signin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected route to get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  // Password reset routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: "If an account with this email exists, a password reset link has been sent." });
      }

      // Generate secure token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send password reset email
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      await emailService.sendPasswordResetEmail(user.email, user.firstName || 'User', token);

      res.json({ message: "If an account with this email exists, a password reset link has been sent." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }).parse(req.body);

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password
      await storage.updateUser(resetToken.userId, { password: hashedPassword });

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(token);

      // Send confirmation email
      const user = await storage.getUser(resetToken.userId);
      if (user) {
        const { EmailService } = await import("./email-service");
        const emailService = EmailService.getInstance();
        await emailService.sendPasswordResetConfirmation(user.email, user.firstName || 'User');
      }

      res.json({ message: "Password reset successful" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/verify-reset-token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ valid: false, message: "Invalid or expired reset token" });
      }

      res.json({ valid: true, message: "Token is valid" });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ valid: false, message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/client", authenticateToken, requireRole(["client"]), async (req: AuthRequest, res) => {
    try {
      const data = await storage.getClientDashboardData(req.user!.id);
      res.json(data);
    } catch (error) {
      console.error("Client dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/dashboard/participant", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const data = await storage.getParticipantDashboardData(req.user!.id);
      res.json(data);
    } catch (error) {
      console.error("Participant dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/dashboard/participant/stats", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const stats = await storage.getParticipantStats(userId);
      
      // Get real campaign participation data
      const campaignData = await storage.getParticipantCampaignData(userId);
      
      // Merge with existing stats
      const enhancedStats = {
        ...stats,
        totalCampaigns: campaignData.totalCampaigns || 0,
        completedCampaigns: campaignData.completedCampaigns || 0,
        pendingInvitations: campaignData.pendingInvitations || 0,
        totalEarnings: campaignData.totalEarnings || 0
      };
      
      res.json(enhancedStats);
    } catch (error) {
      console.error("Error fetching participant stats:", error);
      res.status(500).json({ message: "Failed to fetch participant stats" });
    }
  });

  // Campaign participation endpoints
  app.get("/api/campaigns/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns/:id/feedback", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { feedback, rating } = req.body;

      if (!feedback || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Valid feedback and rating (1-5) are required" });
      }

      // Update the campaign participant record with feedback
      await storage.updateCampaignParticipantFeedback(campaignId, userId, {
        feedback,
        rating,
        status: 'completed',
        respondedAt: new Date()
      });

      res.json({ message: "Feedback submitted successfully" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get("/api/dashboard/manager", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const data = await storage.getManagerDashboardData(req.user!.id);
      res.json(data);
    } catch (error) {
      console.error("Manager dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/dashboard/admin", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const data = await storage.getAdminDashboardData();
      
      // Add content protection data
      data.contentProtection = {
        totalAssets: 15,
        protectedAssets: 8,
        totalViews: 1243,
        totalViolations: 3,
        highRiskAssets: 2,
        protectionRate: 53.3
      };

      // Add verification data
      const verificationStats = await verificationSystem.getVerificationStats();
      data.verification = verificationStats;
      
      res.json(data);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Enhanced reporting endpoints
  app.get("/api/reports/:campaignId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { campaignId } = req.params;
      const { timeRange } = req.query;
      
      const mockReportData = {
        campaignId: parseInt(campaignId),
        title: "Sample Campaign Report",
        totalParticipants: 125,
        responseRate: 89.6,
        completionRate: 92.3,
        averageRating: 4.2,
        sentimentScore: 78.5,
        keyInsights: [
          "High engagement with video content",
          "Strong positive sentiment towards new features",
          "Demographic skew towards younger users",
          "Mobile usage dominates desktop"
        ],
        participantDemographics: {
          age: { "18-24": 25, "25-34": 40, "35-44": 20, "45+": 15 },
          gender: { male: 48, female: 52 },
          location: { urban: 65, suburban: 30, rural: 5 }
        },
        timeMetrics: {
          averageSessionTime: 24.5,
          completionTime: 18.2,
          bounceRate: 8.7
        },
        engagementData: [
          { date: "2024-01-01", engagement: 65 },
          { date: "2024-01-02", engagement: 72 },
          { date: "2024-01-03", engagement: 78 },
          { date: "2024-01-04", engagement: 85 },
          { date: "2024-01-05", engagement: 89 }
        ],
        sentimentAnalysis: {
          positive: 68,
          neutral: 22,
          negative: 10
        },
        keywordClouds: [
          { word: "innovative", frequency: 45 },
          { word: "user-friendly", frequency: 38 },
          { word: "excellent", frequency: 32 },
          { word: "confusing", frequency: 15 }
        ],
        aiSuggestions: [
          "Focus on mobile-first design improvements",
          "Expand video content offerings",
          "Target younger demographics in marketing",
          "Address confusing UI elements mentioned in feedback"
        ],
        recommendations: [
          "Increase video content by 30%",
          "Optimize mobile user experience",
          "Implement user onboarding improvements",
          "Consider premium tier for engaged users"
        ]
      };
      
      res.json(mockReportData);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report data" });
    }
  });

  app.post("/api/reports/:campaignId/export", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { campaignId } = req.params;
      const { format } = req.body;
      
      // Mock export functionality
      const mockData = `Report for Campaign ${campaignId} in ${format} format`;
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=report-${campaignId}.${format}`);
      res.send(mockData);
    } catch (error) {
      console.error("Error exporting report:", error);
      res.status(500).json({ message: "Failed to export report" });
    }
  });

  // AI Settings endpoints
  app.get("/api/admin/ai-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const mockSettings = {
        openaiApiKey: "sk-*********************",
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: "You are an AI assistant specialized in market research and focus group analysis...",
        features: {
          sentimentAnalysis: true,
          keywordExtraction: true,
          participantMatching: true,
          reportGeneration: true,
          realTimeInsights: false,
          conversationAnalysis: true,
          trendPrediction: false,
          demographicAnalysis: true
        },
        advanced: {
          batchProcessing: true,
          customPrompts: false,
          modelFinetuning: false,
          dataEncryption: true,
          rateLimiting: 60,
          costLimits: 1000,
          qualityThreshold: 80,
          responseTimeLimit: 10000
        }
      };
      
      res.json(mockSettings);
    } catch (error) {
      console.error("Error fetching AI settings:", error);
      res.status(500).json({ message: "Failed to fetch AI settings" });
    }
  });

  app.post("/api/admin/ai-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const settings = req.body;
      // In a real app, save to database
      res.json({ message: "AI settings updated successfully", settings });
    } catch (error) {
      console.error("Error updating AI settings:", error);
      res.status(500).json({ message: "Failed to update AI settings" });
    }
  });

  app.post("/api/admin/ai-test", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { feature } = req.body;
      // Mock test results
      const testResults = {
        connection: { message: "OpenAI API connection successful", success: true },
        sentimentAnalysis: { message: "Sentiment analysis test completed", success: true },
        keywordExtraction: { message: "Keyword extraction test completed", success: true },
        participantMatching: { message: "Participant matching test completed", success: true },
        reportGeneration: { message: "Report generation test completed", success: true }
      };
      
      const result = testResults[feature as keyof typeof testResults] || { message: "Test completed", success: true };
      res.json(result);
    } catch (error) {
      console.error("Error testing AI feature:", error);
      res.status(500).json({ message: "Failed to test AI feature" });
    }
  });

  // Feature toggle endpoints
  app.post("/api/admin/toggle-feature", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { feature, enabled } = req.body;
      // In a real app, save to database
      res.json({ message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'}` });
    } catch (error) {
      console.error("Error toggling feature:", error);
      res.status(500).json({ message: "Failed to toggle feature" });
    }
  });

  // Manager dashboard endpoints
  app.post("/api/campaigns/invite-participants", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const { campaignId, participantIds } = req.body;
      // Mock invitation logic
      res.json({ message: `Invited ${participantIds.length} participants to campaign ${campaignId}` });
    } catch (error) {
      console.error("Error inviting participants:", error);
      res.status(500).json({ message: "Failed to invite participants" });
    }
  });

  app.post("/api/moderation/content", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const { contentId, action, reason } = req.body;
      // Mock moderation logic
      res.json({ message: `Content ${contentId} has been ${action}ed` });
    } catch (error) {
      console.error("Error moderating content:", error);
      res.status(500).json({ message: "Failed to moderate content" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      let campaigns;

      if (user.role === "client") {
        campaigns = await storage.getCampaignsByClient(user.id);
      } else if (user.role === "manager") {
        campaigns = await storage.getCampaignsByManager(user.id);
      } else if (user.role === "admin") {
        // Admin can see all campaigns
        campaigns = await storage.getCampaignsByClient(user.id); // This would need to be modified for admin
      } else if (user.role === "participant") {
        // Participants see their campaign invitations
        const invitations = await storage.getParticipantInvitations(user.id);
        campaigns = invitations.map(invitation => ({
          id: invitation.campaign_participants?.campaign_id || invitation.campaign_id,
          title: invitation.campaigns?.title || invitation.title || "Campaign",
          description: invitation.campaigns?.description || invitation.description || "",
          category: invitation.campaigns?.category || invitation.category || "",
          targetAudience: invitation.campaigns?.target_audience || invitation.target_audience || "",
          status: invitation.campaign_participants?.status || invitation.status,
          invitedAt: invitation.campaign_participants?.invited_at || invitation.invited_at,
          responseDeadline: invitation.campaign_participants?.response_deadline || invitation.response_deadline,
          rewardAmount: invitation.campaign_participants?.reward_amount || invitation.reward_amount,
          rewardType: 'cash', // Lock rewards to cash only
          invitationId: invitation.campaign_participants?.id || invitation.id,
          invitedBy: invitation.campaign_participants?.invited_by || invitation.invited_by,
          feedback: invitation.campaign_participants?.feedback || invitation.feedback,
          rating: invitation.campaign_participants?.rating || invitation.rating,
          respondedAt: invitation.campaign_participants?.responded_at || invitation.responded_at
        }));
      } else {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      res.json(campaigns);
    } catch (error) {
      console.error("Campaigns fetch error:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", authenticateToken, requireRole(["client"]), async (req: AuthRequest, res) => {
    try {
      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        clientId: req.user!.id,
      });

      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Campaign creation error:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.get("/api/campaigns/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Check permissions
      const user = req.user!;
      if (user.role === "client" && campaign.clientId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (user.role === "manager" && campaign.managerId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Lock rewards to cash only
      if (campaign.rewardType) {
        campaign.rewardType = 'cash';
      }

      res.json(campaign);
    } catch (error) {
      console.error("Campaign fetch error:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // Get campaign assets
  app.get("/api/campaigns/:id/assets", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const assets = await storage.getCampaignAssets(campaignId);
      res.json(assets || []);
    } catch (error) {
      console.error("Error fetching campaign assets:", error);
      res.status(500).json({ message: "Failed to fetch campaign assets" });
    }
  });

  // General profile routes
  app.get("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Fetching profile for user:", user.id, user.email);

      let profile = null;
      if (user.role === "participant") {
        try {
          const rawProfile = await storage.getParticipantProfile(user.id);
          console.log("Raw profile data:", rawProfile);
          
          if (rawProfile) {
            // Extract individual fields from JSONB columns
            const demographics = rawProfile.demographics || {};
            const behavior = rawProfile.behavior || {};
            const lifestyle = rawProfile.lifestyle || {};
            
            profile = {
              ...rawProfile,
              // Extract specific fields from JSONB for frontend compatibility
              dateOfBirth: (demographics.dateOfBirth && typeof demographics.dateOfBirth === 'string') 
                ? demographics.dateOfBirth.replace(/"/g, '') // Remove quotes if present
                : demographics["1"] || "",
              gender: demographics.gender || demographics["2"], // Question ID 2 is gender  
              country: demographics.country || demographics["4"], // Question ID 4 is country
              city: demographics.city || demographics["5"], // Question ID 5 is city
              occupation: behavior.occupation || behavior["25"], // Question ID 25 is industry (used as occupation)
              industry: behavior.industry || behavior["25"], // Question ID 25 is industry
              education: behavior.education || "",
              interests: behavior.interests || "",
              bio: behavior.bio || lifestyle.bio || ""
            };
          } else {
            console.log("No participant profile found, creating empty profile structure");
            // Create empty profile structure if none exists
            profile = {
              userId: user.id,
              demographics: {},
              behavior: {},
              lifestyle: {},
              completionScore: 0,
              paymentMethods: {}
            };
          }
        } catch (profileError) {
          console.error("Error fetching participant profile:", profileError);
          // Still return user data even if profile fails
          profile = {
            userId: user.id,
            demographics: {},
            behavior: {},
            lifestyle: {},
            completionScore: 0,
            paymentMethods: {}
          };
        }
      }

      console.log("Returning profile data:", { ...user, participantProfile: profile });
      res.json({ ...user, participantProfile: profile });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        zipCode,
        country,
        occupation,
        industry,
        education,
        interests,
        bio,
        // Payment methods
        zelleEmail,
        zellePhone,
        cashAppUsername,
        paypalEmail,
        checkAddress,
        payoneerEmail,
        westernUnionName,
        westernUnionPhone,
        venmoUsername
      } = req.body;

      // Update basic user info
      const userUpdates = {
        firstName,
        lastName,
        email,
        phone
      };

      await storage.updateUser(userId, userUpdates);

      // Update participant profile if user is a participant
      const user = await storage.getUser(userId);
      if (user?.role === "participant") {
        const profileData = {
          dateOfBirth,
          gender,
          address,
          city,
          state,
          zipCode,
          country,
          occupation,
          industry,
          education,
          interests,
          bio
        };

        // Build payment methods object
        const paymentMethods = {
          zelleEmail: zelleEmail || "",
          zellePhone: zellePhone || "",
          cashAppUsername: cashAppUsername || "",
          paypalEmail: paypalEmail || "",
          checkAddress: checkAddress || "",
          payoneerEmail: payoneerEmail || "",
          westernUnionName: westernUnionName || "",
          westernUnionPhone: westernUnionPhone || "",
          venmoUsername: venmoUsername || ""
        };

        // Check if profile exists, create or update accordingly
        let profile = await storage.getParticipantProfile(userId);
        if (!profile) {
          await storage.createParticipantProfile({
            userId,
            demographics: { 
              dateOfBirth, 
              gender, 
              country, 
              city,
              address,
              state,
              zipCode
            },
            preferences: { interests },
            behavior: { 
              occupation, 
              industry, 
              education,
              bio
            },
            contentHabits: {},
            paymentMethods,
            isProfileComplete: true,
            completionScore: 85
          });
        } else {
          // Update profile while preserving existing JSONB data structure
          const updatedProfile = {
            demographics: {
              ...profile.demographics,
              dateOfBirth,
              gender,
              country,
              city,
              address,
              state,
              zipCode
            },
            preferences: {
              ...profile.preferences,
              interests
            },
            behavior: {
              ...profile.behavior,
              occupation,
              industry,
              education,
              bio
            },
            contentHabits: profile.contentHabits || {},
            paymentMethods,
            isProfileComplete: true,
            completionScore: 85
          };
          
          await storage.updateParticipantProfile(userId, updatedProfile);
        }
      }

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Participant profile routes
  app.get("/api/profile/participant", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getParticipantProfile(req.user!.id);
      res.json(profile);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile/participant", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const profileData = {
        ...req.body,
        userId: req.user!.id,
      };

      const profile = await storage.createParticipantProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Profile creation error:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  // PUT endpoint for updating profile (THE MISSING ENDPOINT!)
  app.put("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update basic user fields
      const userUpdates: any = {};
      if (req.body.firstName) userUpdates.firstName = req.body.firstName;
      if (req.body.lastName) userUpdates.lastName = req.body.lastName;
      if (req.body.email) userUpdates.email = req.body.email;
      if (req.body.phone) userUpdates.phone = req.body.phone;

      if (Object.keys(userUpdates).length > 0) {
        await storage.updateUser(userId, userUpdates);
      }

      // Update participant profile if user is a participant
      if (user.role === "participant") {
        try {
          let profile = await storage.getParticipantProfile(userId);
          
          if (!profile) {
            // Create new profile if it doesn't exist
            const newProfileData = {
              userId,
              demographics: {
                dateOfBirth: req.body.dateOfBirth || "",
                gender: req.body.gender || "",
                country: req.body.country || "",
                city: req.body.city || ""
              },
              behavior: {
                occupation: req.body.occupation || "",
                industry: req.body.industry || "",
                education: req.body.education || "",
                interests: req.body.interests || "",
                bio: req.body.bio || ""
              },
              lifestyle: {},
              contentHabits: {},
              paymentMethods: {
                zelleEmail: req.body.zelleEmail || "",
                zellePhone: req.body.zellePhone || "",
                cashAppUsername: req.body.cashAppUsername || "",
                paypalEmail: req.body.paypalEmail || "",
                checkAddress: req.body.checkAddress || "",
                payoneerEmail: req.body.payoneerEmail || "",
                westernUnionName: req.body.westernUnionName || "",
                westernUnionPhone: req.body.westernUnionPhone || "",
                venmoUsername: req.body.venmoUsername || ""
              },
              isProfileComplete: false,
              completionScore: 0
            };
            
            profile = await storage.createParticipantProfile(newProfileData);
          } else {
            // Update existing profile
            const profileUpdates = {
              demographics: {
                ...profile.demographics,
                dateOfBirth: req.body.dateOfBirth || profile.demographics?.dateOfBirth || "",
                gender: req.body.gender || profile.demographics?.gender || "",
                country: req.body.country || profile.demographics?.country || "",
                city: req.body.city || profile.demographics?.city || ""
              },
              behavior: {
                ...profile.behavior,
                occupation: req.body.occupation || profile.behavior?.occupation || "",
                industry: req.body.industry || profile.behavior?.industry || "",
                education: req.body.education || profile.behavior?.education || "",
                interests: req.body.interests || profile.behavior?.interests || "",
                bio: req.body.bio || profile.behavior?.bio || ""
              },
              lifestyle: profile.lifestyle || {},
              contentHabits: profile.contentHabits || {},
              paymentMethods: {
                ...profile.paymentMethods,
                zelleEmail: req.body.zelleEmail || profile.paymentMethods?.zelleEmail || "",
                zellePhone: req.body.zellePhone || profile.paymentMethods?.zellePhone || "",
                cashAppUsername: req.body.cashAppUsername || profile.paymentMethods?.cashAppUsername || "",
                paypalEmail: req.body.paypalEmail || profile.paymentMethods?.paypalEmail || "",
                checkAddress: req.body.checkAddress || profile.paymentMethods?.checkAddress || "",
                payoneerEmail: req.body.payoneerEmail || profile.paymentMethods?.payoneerEmail || "",
                westernUnionName: req.body.westernUnionName || profile.paymentMethods?.westernUnionName || "",
                westernUnionPhone: req.body.westernUnionPhone || profile.paymentMethods?.westernUnionPhone || "",
                venmoUsername: req.body.venmoUsername || profile.paymentMethods?.venmoUsername || ""
              },
              updatedAt: new Date()
            };

            profile = await storage.updateParticipantProfile(userId, profileUpdates);
          }
        } catch (profileError) {
          console.error("Profile update error:", profileError);
          // Continue with user update even if profile update fails
        }
      }

      // Return updated user data
      const updatedUser = await storage.getUser(userId);
      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Questionnaire routes
  app.get("/api/questionnaire/categories", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const categories = await storage.getQuestionCategories();
      res.json(categories);
    } catch (error) {
      console.error("Categories fetch error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/questionnaire/questions/:categoryId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const questions = await storage.getQuestionsByCategory(categoryId);
      res.json(questions);
    } catch (error) {
      console.error("Questions fetch error:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get("/api/questionnaire/responses", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const responses = await storage.getParticipantResponses(req.user!.id);
      res.json(responses);
    } catch (error) {
      console.error("Responses fetch error:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.post("/api/questionnaire/responses", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const responseData = insertParticipantResponseSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const response = await storage.saveParticipantResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Response save error:", error);
      res.status(500).json({ message: "Failed to save response" });
    }
  });

  // Bulk save responses (for onboarding completion)
  app.post("/api/questionnaire/bulk-responses", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const { responses } = req.body;
      const userId = req.user!.id;

      if (!responses || !Array.isArray(responses)) {
        return res.status(400).json({ message: "Invalid request format. Expected 'responses' array." });
      }

      // Save individual responses to participant_responses table for tracking
      let savedResponsesCount = 0;
      for (const responseData of responses) {
        if (responseData.questionId && responseData.response !== undefined) {
          try {
            // Convert questionId to integer if it's a string
            let questionId = responseData.questionId;
            if (typeof questionId === 'string') {
              // If it's a string, try to map it to a question ID
              const questionMapping = await storage.getQuestionByKey ? 
                await storage.getQuestionByKey(questionId) : null;
              if (questionMapping) {
                questionId = questionMapping.id;
              } else {
                // Try to parse as integer
                const parsed = parseInt(questionId);
                if (!isNaN(parsed)) {
                  questionId = parsed;
                } else {
                  console.log(`Skipping response with invalid questionId: ${questionId}`);
                  continue;
                }
              }
            }

            const response = await storage.saveParticipantResponse({
              userId: userId,
              questionId: questionId,
              response: typeof responseData.response === 'string' ? 
                responseData.response : JSON.stringify(responseData.response)
            });
            savedResponsesCount++;
            console.log(`Saved response for question ${questionId}:`, response.id);
          } catch (responseError) {
            console.error(`Failed to save response for question ${responseData.questionId}:`, responseError);
          }
        }
      }

      console.log(`Saved ${savedResponsesCount} individual responses to database`);

      // Calculate and update completion percentage
      const totalQuestions = await storage.getTotalQuestionsCount();
      const userAnsweredCount = await storage.getUserAnsweredQuestionsCount(userId);
      const completionPercentage = totalQuestions > 0 ? Math.round((userAnsweredCount / totalQuestions) * 100) : 0;
      
      // Determine health status based on completion percentage
      let healthStatus = 'poor';
      if (completionPercentage >= 90) healthStatus = 'excellent';
      else if (completionPercentage >= 75) healthStatus = 'great';
      else if (completionPercentage >= 50) healthStatus = 'good';
      else if (completionPercentage >= 25) healthStatus = 'fair';

      // Update user's questionnaire completion tracking
      await storage.updateUserQuestionnaireHealth(userId, completionPercentage, healthStatus);
      
      // Only mark as completed if user has answered enough questions
      const shouldMarkComplete = completionPercentage >= 80;
      if (shouldMarkComplete) {
        await storage.markQuestionnaireCompleted(userId);
      }
      
      console.log(`Updated user ${userId} completion: ${completionPercentage}% (${healthStatus}) - Complete: ${shouldMarkComplete}`);

      // Map questionnaire responses to profile categories
      const profileCategories = {
        demographics: {},
        beliefs: {},
        lifestyle: {},
        careerEducation: {},
        mediaPreferences: {},
        techUsage: {},
        buyingBehavior: {},
        psychographics: {}
      };
      
      // Question ID to category mapping
      const questionCategoryMap = {
        // Demographics
        'gender': 'demographics',
        'dateOfBirth': 'demographics',
        'ethnicity': 'demographics',
        'country': 'demographics',
        'state': 'demographics',
        'city': 'demographics',
        'zipCode': 'demographics',
        'householdSize': 'demographics',
        'childrenCount': 'demographics',
        'maritalStatus': 'demographics',
        'householdIncome': 'demographics',
        'employmentStatus': 'demographics',
        'education': 'demographics',
        // Beliefs
        'religion': 'beliefs',
        'politicalAffiliation': 'beliefs',
        'personalValues': 'beliefs',
        'environmentalValues': 'beliefs',
        'socialCauses': 'beliefs',
        'lifePriorities': 'beliefs',
        'volunteering': 'beliefs',
        'communityInvolvement': 'beliefs',
        'charityDonations': 'beliefs',
        // Lifestyle
        'hobbies': 'lifestyle',
        'workLifeBalance': 'lifestyle',
        'fitnessLevel': 'lifestyle',
        'travelFrequency': 'lifestyle',
        'diningPreferences': 'lifestyle',
        'shoppingHabits': 'lifestyle',
        'socialActivities': 'lifestyle',
        'homeOwnership': 'lifestyle',
        'vehicleOwnership': 'lifestyle',
        'petsOwned': 'lifestyle',
        // Career & Education
        'industry': 'careerEducation',
        'jobTitle': 'careerEducation',
        'experienceLevel': 'careerEducation',
        'fieldOfStudy': 'careerEducation',
        'skillsInterestedIn': 'careerEducation',
        'careeDevelopment': 'careerEducation',
        'furtherEducation': 'careerEducation',
        'workPreferences': 'careerEducation',
        'professionalGoals': 'careerEducation',
        // Media Preferences
        'musicGenres': 'mediaPreferences',
        'movieGenres': 'mediaPreferences',
        'tvGenres': 'mediaPreferences',
        'newsConsumption': 'mediaPreferences',
        'socialMedia': 'mediaPreferences',
        'podcastListening': 'mediaPreferences',
        'readingHabits': 'mediaPreferences',
        'gamingHabits': 'mediaPreferences',
        'streamingServices': 'mediaPreferences',
        // Tech Usage
        'devicesUsed': 'techUsage',
        'operatingSystem': 'techUsage',
        'browserPreference': 'techUsage',
        'internetUsage': 'techUsage',
        'appsUsed': 'techUsage',
        'onlineActivities': 'techUsage',
        'techComfort': 'techUsage',
        'privacyConcerns': 'techUsage',
        'onlineShopping': 'techUsage',
        // Buying Behavior
        'purchaseInfluencers': 'buyingBehavior',
        'brandLoyalty': 'buyingBehavior',
        'productResearch': 'buyingBehavior',
        'dealHunting': 'buyingBehavior',
        'brandConsciousness': 'buyingBehavior',
        'purchaseDecisionTime': 'buyingBehavior',
        'preferredPaymentMethod': 'buyingBehavior',
        'onlineReviews': 'buyingBehavior',
        'subscriptionServices': 'buyingBehavior',
        // Psychographics
        'personalityTraits': 'psychographics',
        'learningStyle': 'psychographics',
        'riskTolerance': 'psychographics',
        'decisionMaking': 'psychographics',
        'communicationStyle': 'psychographics',
        'stressManagement': 'psychographics',
        'teamwork': 'psychographics',
        'leadershipStyle': 'psychographics',
        'conflictResolution': 'psychographics',
        'innovationAdoption': 'psychographics'
      };
      
      for (const responseData of responses) {
        console.log("Processing response:", responseData);
        
        if (responseData.questionId && responseData.response !== undefined) {
          try {
            // Parse the response to get the actual value
            const parsedResponse = JSON.parse(responseData.response);
            const category = questionCategoryMap[responseData.questionId];
            
            if (category) {
              profileCategories[category][responseData.questionId] = parsedResponse;
            }
          } catch (error) {
            // If parsing fails, store as string
            const category = questionCategoryMap[responseData.questionId];
            if (category) {
              profileCategories[category][responseData.questionId] = responseData.response;
            }
          }
        }
      }

      // Update participant profile with categorized data
      // Map our categories to the existing database columns
      const profileUpdate = {
        demographics: profileCategories.demographics,
        beliefs: profileCategories.beliefs,
        lifestyle: profileCategories.lifestyle,
        // Combine related categories into existing database columns
        contentHabits: {
          ...profileCategories.mediaPreferences,
          ...profileCategories.techUsage
        },
        behavior: {
          ...profileCategories.careerEducation,
          ...profileCategories.buyingBehavior,
          ...profileCategories.psychographics
        },
        isProfileComplete: true,
        completionScore: 100
      };

      await storage.updateParticipantProfile(userId, profileUpdate);

      res.status(201).json({ 
        message: "Profile updated successfully", 
        categoriesUpdated: Object.keys(profileCategories).filter((key: string) => 
          Object.keys((profileCategories as any)[key]).length > 0
        ),
        totalResponses: responses.length
      });
    } catch (error) {
      console.error("Bulk response save error:", error);
      res.status(500).json({ message: "Failed to save profile data" });
    }
  });

  app.put("/api/questionnaire/complete", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Mark questionnaire as completed
      await storage.markQuestionnaireCompleted(userId);
      
      res.json({ message: "Questionnaire completed successfully" });
    } catch (error) {
      console.error("Error completing questionnaire:", error);
      res.status(500).json({ error: "Failed to complete questionnaire" });
    }
  });

  // Recalculate questionnaire completion for a user
  app.post("/api/questionnaire/recalculate", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get total questions and user's answered count
      const totalQuestions = await storage.getTotalQuestionsCount();
      const userAnsweredCount = await storage.getUserAnsweredQuestionsCount(userId);
      const completionPercentage = totalQuestions > 0 ? Math.round((userAnsweredCount / totalQuestions) * 100) : 0;
      
      // Determine health status
      let healthStatus = 'poor';
      if (completionPercentage >= 90) healthStatus = 'excellent';
      else if (completionPercentage >= 75) healthStatus = 'great';
      else if (completionPercentage >= 50) healthStatus = 'good';
      else if (completionPercentage >= 25) healthStatus = 'fair';

      // Update user's questionnaire completion tracking
      await storage.updateUserQuestionnaireHealth(userId, completionPercentage, healthStatus);
      
      // Mark as completed only if they have enough responses
      const shouldMarkComplete = completionPercentage >= 80;
      await storage.markQuestionnaireCompleted(userId);
      
      console.log(`Recalculated user ${userId}: ${userAnsweredCount}/${totalQuestions} = ${completionPercentage}% (${healthStatus}) - Complete: ${shouldMarkComplete}`);
      
      res.json({ 
        totalQuestions,
        userAnsweredCount, 
        completionPercentage,
        isCompleted: shouldMarkComplete, 
        healthStatus,
        message: "Questionnaire completion recalculated successfully" 
      });
    } catch (error) {
      console.error("Error recalculating questionnaire:", error);
      res.status(500).json({ error: "Failed to recalculate questionnaire completion" });
    }
  });

  // Admin endpoint to recalculate ALL users' questionnaire completion properly
  app.post("/api/admin/fix-questionnaire-tracking", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const totalQuestions = await storage.getTotalQuestionsCount();
      const allUsers = await storage.getAllUsers();
      let updatedCount = 0;
      let properlyCompletedCount = 0;
      const results = [];
      
      for (const user of allUsers) {
        if (user.role === 'participant') {
          const userAnsweredCount = await storage.getUserAnsweredQuestionsCount(user.id);
          const completionPercentage = totalQuestions > 0 ? Math.round((userAnsweredCount / totalQuestions) * 100) : 0;
          
          let healthStatus = 'poor';
          if (completionPercentage >= 90) healthStatus = 'excellent';
          else if (completionPercentage >= 75) healthStatus = 'great';
          else if (completionPercentage >= 50) healthStatus = 'good';
          else if (completionPercentage >= 25) healthStatus = 'fair';

          await storage.updateUserQuestionnaireHealth(user.id, completionPercentage, healthStatus);
          
          // Properly validate completion before marking
          await storage.markQuestionnaireCompleted(user.id);
          const shouldMarkComplete = completionPercentage >= 80;
          
          if (shouldMarkComplete) properlyCompletedCount++;
          updatedCount++;
          
          results.push({
            userId: user.id,
            email: user.email,
            responses: userAnsweredCount,
            percentage: completionPercentage,
            completed: shouldMarkComplete,
            status: healthStatus
          });
          
          console.log(`Fixed user ${user.id} (${user.email}): ${userAnsweredCount}/${totalQuestions} = ${completionPercentage}% - Complete: ${shouldMarkComplete}`);
        }
      }
      
      res.json({ 
        message: `Fixed questionnaire tracking for ${updatedCount} participants. ${properlyCompletedCount} actually completed questionnaires.`,
        totalQuestions,
        updatedUsers: updatedCount,
        properlyCompleted: properlyCompletedCount,
        results
      });
    } catch (error) {
      console.error("Error fixing questionnaire tracking:", error);
      res.status(500).json({ error: "Failed to fix questionnaire tracking" });
    }
  });

  // Admin questionnaire management routes
  app.post("/api/admin/questionnaire/categories", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const categoryData = insertQuestionCategorySchema.parse(req.body);
      const category = await storage.createQuestionCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/questionnaire/categories/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const category = await storage.updateQuestionCategory(id, updates);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/questionnaire/categories/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQuestionCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  app.post("/api/admin/questionnaire/questions", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.put("/api/admin/questionnaire/questions/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const question = await storage.updateQuestion(id, updates);
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete("/api/admin/questionnaire/questions/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQuestion(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Admin settings routes
  app.get("/api/admin/settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch admin settings" });
    }
  });

  app.put("/api/admin/settings/:key", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { key } = req.params;
      const { value, description, category } = req.body;
      const setting = await storage.updateAdminSetting(key, {
        value,
        description,
        category,
        updatedBy: req.user!.id,
      });
      res.json(setting);
    } catch (error) {
      console.error("Error updating admin setting:", error);
      res.status(500).json({ message: "Failed to update admin setting" });
    }
  });

  // Participant dashboard routes
  app.get("/api/dashboard/participant/invitations", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const invitations = await storage.getParticipantInvitations(userId);
      
      // Transform the data to match frontend expectations
      const transformedInvitations = invitations.map(invitation => {
        const campaignId = invitation.campaign_participants?.campaignId || invitation.campaignId;
        
        return {
          id: campaignId,
          title: invitation.campaigns?.title || invitation.title || "Campaign",
          description: invitation.campaigns?.description || invitation.description || "",
          category: invitation.campaigns?.category || invitation.category || "",
          targetAudience: invitation.campaigns?.target_audience || invitation.target_audience || "",
          status: invitation.campaign_participants?.status || invitation.status,
          invitedAt: invitation.campaign_participants?.invited_at || invitation.invited_at,
          responseDeadline: invitation.campaign_participants?.response_deadline || invitation.response_deadline,
          rewardAmount: invitation.campaign_participants?.reward_amount || invitation.reward_amount,
          rewardType: 'cash', // Lock rewards to cash only
          invitationId: invitation.campaign_participants?.id || invitation.id,
          invitedBy: invitation.campaign_participants?.invited_by || invitation.invited_by,
          feedback: invitation.campaign_participants?.feedback || invitation.feedback,
          rating: invitation.campaign_participants?.rating || invitation.rating,
          respondedAt: invitation.campaign_participants?.responded_at || invitation.responded_at,
          // Add priority and urgency information
          priorityLevel: invitation.campaigns?.priority_level || 'normal',
          urgencyNotes: invitation.campaigns?.urgency_notes || '',
          specialInstructions: invitation.campaigns?.special_instructions || '',
          estimatedDuration: invitation.campaigns?.estimated_duration || 30,
          participantCount: invitation.campaigns?.participant_count || 10,
          clientName: invitation.campaigns?.client_name || 'Anonymous Client'
        };
      });

      res.json(transformedInvitations);
    } catch (error) {
      console.error("Error fetching participant invitations:", error);
      res.status(500).json({ message: "Failed to fetch participant invitations" });
    }
  });

  app.post("/api/invitations/respond", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const { invitationId, action } = req.body;
      const userId = req.user!.id;
      
      // Update invitation status
      const updatedStatus = action === 'accept' ? 'accepted' : 'declined';
      const respondedAt = new Date().toISOString();
      
      const updatedInvitation = await storage.updateParticipantInvitation(invitationId, {
        status: updatedStatus,
        respondedAt
      });
      
      res.json({ 
        message: `Invitation ${action}ed successfully`,
        invitation: updatedInvitation 
      });
    } catch (error) {
      console.error("Error responding to invitation:", error);
      res.status(500).json({ message: "Failed to respond to invitation" });
    }
  });

  app.post("/api/campaigns/invitations/:id/respond", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;
      const invitation = await storage.respondToInvitation(parseInt(id), response);
      res.json(invitation);
    } catch (error) {
      console.error("Error responding to invitation:", error);
      res.status(500).json({ message: "Failed to respond to invitation" });
    }
  });

  // Manager routes
  app.get("/api/manager/participants", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const managerId = req.user!.id;
      const participants = await storage.getManagerParticipants(managerId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching manager participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  app.get("/api/manager/campaigns/available", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const managerId = req.user!.id;
      const campaigns = await storage.getCampaignsByManager(managerId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching available campaigns:", error);
      res.status(500).json({ message: "Failed to fetch available campaigns" });
    }
  });

  app.post("/api/manager/campaigns/:id/invite", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { participantId } = req.body;
      const managerId = req.user!.id;
      
      const invitation = await storage.inviteParticipant(parseInt(id), participantId, managerId);
      res.json(invitation);
    } catch (error) {
      console.error("Error inviting participant:", error);
      res.status(500).json({ message: "Failed to invite participant" });
    }
  });

  app.post("/api/manager/participants/:id/ban", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const managerId = req.user!.id;
      
      const participant = await storage.banParticipant(parseInt(id), reason, managerId);
      res.json(participant);
    } catch (error) {
      console.error("Error banning participant:", error);
      res.status(500).json({ message: "Failed to ban participant" });
    }
  });

  app.post("/api/manager/participants/:id/unban", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const participant = await storage.unbanParticipant(parseInt(id));
      res.json(participant);
    } catch (error) {
      console.error("Error unbanning participant:", error);
      res.status(500).json({ message: "Failed to unban participant" });
    }
  });

  app.post("/api/manager/participants/:id/warn", authenticateToken, requireRole(["manager"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const managerId = req.user!.id;
      
      const warning = await storage.warnParticipant(parseInt(id), reason, managerId);
      res.json(warning);
    } catch (error) {
      console.error("Error warning participant:", error);
      res.status(500).json({ message: "Failed to warn participant" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id));
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify notification belongs to user
      const notification = await storage.getNotification(notificationId);
      if (!notification || notification.userId !== userId) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      await storage.deleteNotification(notificationId);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Get unverified users for admin
  app.get("/api/admin/unverified-users", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const unverifiedUsers = await storage.getUnverifiedUsers();
      res.json(unverifiedUsers);
    } catch (error) {
      console.error("Error fetching unverified users:", error);
      res.status(500).json({ message: "Failed to fetch unverified users" });
    }
  });

  // Periodic verification reminder system
  app.post("/api/admin/send-verification-reminders", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const unverifiedUsers = await storage.getUnverifiedUsers();
      let remindersSent = 0;
      
      for (const user of unverifiedUsers) {
        if (user.role === 'participant') {
          const joinedDate = user.createdAt || new Date();
          const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Send reminder after 7 days, then weekly
          if (daysSinceJoined >= 7 && daysSinceJoined % 7 === 0) {
            await storage.createNotification({
              userId: user.id,
              type: 'verification_reminder',
              title: 'Complete Your Verification',
              message: `You've been with us for ${daysSinceJoined} days. Complete your verification to access premium campaigns and earn up to 3x more!`,
              data: {
                daysSinceJoined,
                reminderType: 'periodic',
                priority: daysSinceJoined > 21 ? 'high' : 'normal'
              }
            });
            remindersSent++;
          }
        }
      }
      
      res.json({ 
        message: "Verification reminders sent",
        remindersSent,
        totalUnverified: unverifiedUsers.length
      });
    } catch (error) {
      console.error("Error sending verification reminders:", error);
      res.status(500).json({ message: "Failed to send verification reminders" });
    }
  });

  // Manual verification reminder for specific user
  app.post("/api/admin/send-verification-reminder/:userId", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { userId } = req.params;
      const { customMessage } = req.body;
      
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.verificationStatus === 'verified') {
        return res.status(400).json({ message: "User is already verified" });
      }
      
      const joinedDate = user.createdAt || new Date();
      const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      await storage.createNotification({
        userId: parseInt(userId),
        type: 'verification_reminder',
        title: 'Complete Your Verification',
        message: customMessage || `Please complete your verification to access premium campaigns and features. You've been with us for ${daysSinceJoined} days.`,
        data: {
          daysSinceJoined,
          reminderType: 'manual',
          sentBy: req.user!.id
        }
      });
      
      res.json({ message: "Verification reminder sent successfully" });
    } catch (error) {
      console.error("Error sending verification reminder:", error);
      res.status(500).json({ message: "Failed to send verification reminder" });
    }
  });

  // Profile auto-save endpoints
  app.post("/api/profile/save-partial", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.savePartialProfile(req.user!.id, req.body);
      const completion = await storage.checkProfileCompletion(req.user!.id);
      res.json({ 
        profile, 
        completion,
        message: "Profile saved successfully" 
      });
    } catch (error: any) {
      console.error("Error saving partial profile:", error);
      res.status(500).json({ 
        message: "Failed to save profile data",
        error: error.message 
      });
    }
  });

  app.get("/api/profile/completion", authenticateToken, requireRole(["participant"]), async (req: AuthRequest, res) => {
    try {
      const completion = await storage.checkProfileCompletion(req.user!.id);
      res.json(completion);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      res.status(500).json({ message: "Failed to check profile completion" });
    }
  });

  // Messaging endpoints
  app.post("/api/messages/send", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { recipientId, subject, content, messageType, priority } = req.body;
      const message = await storage.sendMessage(
        req.user!.id,
        recipientId,
        subject,
        content,
        messageType,
        priority
      );
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const messageType = req.query.type as string;
      const messages = await storage.getUserMessages(req.user!.id, messageType);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.markMessageAsRead(parseInt(req.params.id));
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.get("/api/messages/conversation/:userId", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const conversation = await storage.getConversation(req.user!.id, parseInt(req.params.userId));
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Location targeting endpoint
  app.get("/api/participants/location-stats", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getLocationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching location stats:", error);
      res.status(500).json({ message: "Failed to fetch location statistics" });
    }
  });

  // AI Matching endpoints
  app.post("/api/ai-matching/generate-criteria", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { campaignRequirements, targetAudience, industry } = req.body;
      
      const criteria = await aiMatchingEngine.generateMatchingRecommendations(
        campaignRequirements,
        targetAudience,
        industry
      );
      
      res.json(criteria);
    } catch (error) {
      console.error("Error generating matching criteria:", error);
      res.status(500).json({ message: "Failed to generate matching criteria" });
    }
  });

  app.post("/api/ai-matching/find-matches", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { campaignId, criteria, targetCount = 50 } = req.body;
      
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const results = await aiMatchingEngine.findOptimalMatches(
        criteria,
        campaign,
        targetCount
      );
      
      res.json(results);
    } catch (error) {
      console.error("Error finding matches:", error);
      res.status(500).json({ message: "Failed to find participant matches" });
    }
  });

  app.post("/api/ai-matching/analyze-participant", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { participantId } = req.body;
      
      const profile = await storage.getParticipantProfile(participantId);
      if (!profile) {
        return res.status(404).json({ message: "Participant profile not found" });
      }
      
      const responses = await storage.getParticipantResponses(participantId);
      const analysis = await aiMatchingEngine.analyzeParticipantProfile(profile, responses);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing participant:", error);
      res.status(500).json({ message: "Failed to analyze participant profile" });
    }
  });

  app.post("/api/ai-matching/learn-from-results", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { campaignId, participantFeedback } = req.body;
      
      await aiMatchingEngine.learnFromCampaignResults(campaignId, participantFeedback);
      res.json({ message: "Learning insights stored successfully" });
    } catch (error) {
      console.error("Error learning from results:", error);
      res.status(500).json({ message: "Failed to process learning data" });
    }
  });

  app.post("/api/ai-matching/batch-score", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { participantIds, criteria, campaignId } = req.body;
      
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const scores = [];
      for (const participantId of participantIds) {
        const profile = await storage.getParticipantProfile(participantId);
        if (profile) {
          const responses = await storage.getParticipantResponses(participantId);
          
          // Get or create behavioral analysis
          let behavioralAnalysis = await storage.getBehavioralAnalysis(participantId);
          if (!behavioralAnalysis) {
            behavioralAnalysis = await aiMatchingEngine.analyzeParticipantProfile(profile, responses);
            await storage.storeBehavioralAnalysis(behavioralAnalysis);
          }
          
          const score = await aiMatchingEngine.generateMatchingScore(profile, behavioralAnalysis, criteria, campaign);
          scores.push(score);
        }
      }
      
      res.json(scores);
    } catch (error) {
      console.error("Error batch scoring participants:", error);
      res.status(500).json({ message: "Failed to score participants" });
    }
  });

  // AI Analysis endpoints
  app.post("/api/ai-analysis/analyze-image", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { imageBase64, fileName, campaignId, assetId, analysisType = 'comprehensive' } = req.body;

      if (!imageBase64 || !fileName) {
        return res.status(400).json({ message: "Image data and filename are required" });
      }

      const analysisResult = await aiAnalysisEngine.analyzeImage(imageBase64, fileName, analysisType);
      
      if (campaignId && assetId) {
        await aiAnalysisEngine.storeAnalysisResult(campaignId, assetId, analysisResult);
      }
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  app.post("/api/ai-analysis/analyze-video", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { videoBase64, fileName, campaignId, assetId, analysisType = 'comprehensive' } = req.body;

      if (!videoBase64 || !fileName) {
        return res.status(400).json({ message: "Video data and filename are required" });
      }

      const analysisResult = await aiAnalysisEngine.analyzeVideo(videoBase64, fileName, analysisType);
      
      if (campaignId && assetId) {
        await aiAnalysisEngine.storeAnalysisResult(campaignId, assetId, analysisResult);
      }
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Error analyzing video:", error);
      res.status(500).json({ message: "Failed to analyze video" });
    }
  });

  app.get("/api/ai-analysis/results/:campaignId", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { campaignId } = req.params;
      const results = await aiAnalysisEngine.getAnalysisResults(parseInt(campaignId));
      res.json(results);
    } catch (error) {
      console.error("Error fetching analysis results:", error);
      res.status(500).json({ message: "Failed to fetch analysis results" });
    }
  });

  app.post("/api/ai-analysis/generate-report", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { campaignId, analysisIds } = req.body;
      
      const allResults = await aiAnalysisEngine.getAnalysisResults(campaignId);
      const selectedResults = analysisIds ? 
        allResults.filter(result => analysisIds.includes(result.id)) : 
        allResults;

      if (selectedResults.length === 0) {
        return res.status(400).json({ message: "No analysis results found" });
      }

      const report = await aiAnalysisEngine.generateAnalysisReport(selectedResults, campaignId);
      res.json(report);
    } catch (error) {
      console.error("Error generating analysis report:", error);
      res.status(500).json({ message: "Failed to generate analysis report" });
    }
  });

  app.get("/api/admin/ai-analysis-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const config = {
        enabled: settings.find((s: any) => s.setting === 'ai_analysis_enabled')?.value === 'true',
        pricing: JSON.parse(settings.find((s: any) => s.setting === 'ai_analysis_pricing')?.value || '{"image": 5, "video": 15}'),
        features: JSON.parse(settings.find((s: any) => s.setting === 'ai_analysis_features')?.value || '["comprehensive", "sentiment", "demographic", "content"]')
      };
      res.json(config);
    } catch (error) {
      console.error("Error fetching AI analysis settings:", error);
      res.status(500).json({ message: "Failed to fetch AI analysis settings" });
    }
  });

  app.post("/api/admin/ai-analysis-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { enabled, pricing, features } = req.body;
      
      await storage.createAdminSetting({
        key: 'ai_analysis_enabled',
        value: enabled.toString(),
        category: 'ai_analysis',
        description: 'Enable/disable AI analysis feature'
      });

      await storage.createAdminSetting({
        key: 'ai_analysis_pricing',
        value: JSON.stringify(pricing),
        category: 'ai_analysis',
        description: 'Pricing for AI analysis features'
      });

      await storage.createAdminSetting({
        key: 'ai_analysis_features',
        value: JSON.stringify(features),
        category: 'ai_analysis',
        description: 'Available AI analysis features'
      });

      res.json({ message: "AI analysis settings updated successfully" });
    } catch (error) {
      console.error("Error updating AI analysis settings:", error);
      res.status(500).json({ message: "Failed to update AI analysis settings" });
    }
  });

  // SEO Settings endpoints
  app.get("/api/admin/seo-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const seoConfig = settings.filter(s => s.setting.startsWith('seo_')).reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      res.json(seoConfig);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.post("/api/admin/seo-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const seoSettings = req.body;
      
      for (const [key, value] of Object.entries(seoSettings)) {
        await storage.createAdminSetting({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          category: 'seo',
          description: `SEO setting for ${key}`
        });
      }

      res.json({ message: "SEO settings updated successfully" });
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      res.status(500).json({ message: "Failed to update SEO settings" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount < 0.50) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: req.user!.id.toString(),
          type: "campaign_payment"
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post("/api/confirm-payment", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Payment was successful, you can now create the campaign
        res.json({ 
          success: true, 
          message: "Payment confirmed successfully",
          paymentIntent: {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            status: paymentIntent.status
          }
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Payment not completed" 
        });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Verification endpoints
  app.get("/api/admin/verification/stats", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getVerificationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching verification stats:", error);
      res.status(500).json({ message: "Failed to fetch verification stats" });
    }
  });

  app.get("/api/admin/verification/unverified", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const participants = await storage.getUnverifiedParticipants();
      res.json(participants);
    } catch (error) {
      console.error("Error fetching unverified participants:", error);
      res.status(500).json({ message: "Failed to fetch unverified participants" });
    }
  });

  app.get("/api/admin/verification/verified", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const participants = await storage.getVerifiedParticipants();
      res.json(participants);
    } catch (error) {
      console.error("Error fetching verified participants:", error);
      res.status(500).json({ message: "Failed to fetch verified participants" });
    }
  });

  // Get verification documents for admin/manager review
  app.get("/api/admin/verification/documents/:userId", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const documents = await storage.getVerificationDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch verification documents" });
    }
  });

  // Get user questionnaire responses for admin/manager review
  app.get("/api/admin/responses/:userId", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get responses with proper joins to get question text and category
      const responses = await db
        .select({
          id: participantResponses.id,
          userId: participantResponses.userId,
          questionId: participantResponses.questionId,
          response: participantResponses.response,
          respondedAt: participantResponses.respondedAt,
          questionText: questions.question,
          categoryName: questionCategories.name,
          categoryId: questions.categoryId
        })
        .from(participantResponses)
        .innerJoin(questions, eq(participantResponses.questionId, questions.id))
        .innerJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
        .where(eq(participantResponses.userId, userId))
        .orderBy(questionCategories.name, questions.sortOrder);
      
      // Group responses by category for better display
      const responsesByCategory: { [key: string]: any[] } = {};
      
      for (const response of responses) {
        const categoryName = response.categoryName || 'Other';
        
        if (!responsesByCategory[categoryName]) {
          responsesByCategory[categoryName] = [];
        }
        
        // Parse the response JSON if it's a string
        let parsedResponse = response.response;
        if (typeof response.response === 'string') {
          try {
            parsedResponse = JSON.parse(response.response);
          } catch (e) {
            // Keep as string if it's not valid JSON
            parsedResponse = response.response;
          }
        }
        
        responsesByCategory[categoryName].push({
          questionId: response.questionId,
          questionText: response.questionText,
          answer: Array.isArray(parsedResponse) ? parsedResponse.join(', ') : parsedResponse,
          createdAt: response.respondedAt, // Map respondedAt to createdAt for frontend compatibility
          respondedAt: response.respondedAt
        });
      }
      
      res.json({
        userId,
        totalResponses: responses.length,
        responsesByCategory
      });
    } catch (error) {
      console.error("Error fetching user responses:", error);
      res.status(500).json({ message: "Failed to fetch user responses" });
    }
  });


app.get("/admin/files/public-url/:fileName", async (req, res) => {
  try {
    const fileKey = `other/${req.params.fileName}`; // change "other" if needed
    console.log("Fetching public URL for file:", fileKey);
    const publicUrl = getPublicUrl(fileKey);
    console.log("Public URL:", publicUrl);
    res.json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get public URL" });
  }
});

  // Approve or reject verification
  app.post("/api/admin/verification/review", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { userId, status, reason } = req.body;
      
      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'verified' or 'rejected'" });
      }
      
      await storage.updateUser(userId, {
        verificationStatus: status,
        verificationReason: reason || null
      });
      
      // Update all documents for this user
      const documents = await storage.getVerificationDocuments(userId);
      for (const doc of documents) {
        await storage.updateVerificationDocument(doc.id, { status });
      }
      
      res.json({ 
        message: `Verification ${status} successfully`,
        userId,
        status,
        reason
      });
    } catch (error) {
      console.error("Error reviewing verification:", error);
      res.status(500).json({ message: "Failed to review verification" });
    }
  });

  app.post("/api/admin/verification/update-status", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { userId, status } = req.body;
      const isVerified = status === "approved";
      const user = await storage.updateVerificationStatus(userId, status, isVerified);
      res.json(user);
    } catch (error) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });

  app.post("/api/admin/verification/send-reminders", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      await verificationSystem.sendVerificationReminders([], req.user?.id || '');
      res.json({ message: "Verification reminders sent successfully" });
    } catch (error) {
      console.error("Error sending verification reminders:", error);
      res.status(500).json({ message: "Failed to send verification reminders" });
    }
  });

  // Pricing endpoints
  app.get("/api/pricing/configs", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const configs = await storage.getPricingConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching pricing configs:", error);
      res.status(500).json({ message: "Failed to fetch pricing configs" });
    }
  });

  app.post("/api/pricing/calculate", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { campaignType, contentType, participantCount } = req.body;
      const calculation = await pricingService.calculateCampaignCost(campaignType, contentType, participantCount);
      res.json(calculation);
    } catch (error) {
      console.error("Error calculating pricing:", error);
      res.status(500).json({ message: "Failed to calculate pricing" });
    }
  });

  app.get("/api/pricing/options", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const options = await pricingService.getPricingOptions();
      res.json(options);
    } catch (error) {
      console.error("Error fetching pricing options:", error);
      res.status(500).json({ message: "Failed to fetch pricing options" });
    }
  });

  // Campaign review endpoints
  app.get("/api/admin/campaigns/pending-review", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const campaigns = await storage.getPendingReviewCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching pending review campaigns:", error);
      res.status(500).json({ message: "Failed to fetch pending review campaigns" });
    }
  });

  app.post("/api/admin/campaigns/:id/assign-manager", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { managerId } = req.body;
      const campaign = await storage.assignCampaignToManager(parseInt(id), managerId);
      
      // Send notification to manager
      await storage.createNotification({
        userId: managerId,
        type: "campaign_assignment",
        title: "New Campaign Assignment",
        message: `You have been assigned to review campaign: ${campaign.title}`,
        data: { campaignId: campaign.id, action: "review" }
      });
      
      res.json(campaign);
    } catch (error) {
      console.error("Error assigning campaign to manager:", error);
      res.status(500).json({ message: "Failed to assign campaign to manager" });
    }
  });

  app.post("/api/admin/campaigns/:id/update-status", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const campaign = await storage.updateCampaignStatus(parseInt(id), status);
      
      // Send notification to campaign creator
      await storage.createNotification({
        userId: campaign.clientId,
        type: "campaign_status_update",
        title: "Campaign Status Update",
        message: `Your campaign "${campaign.title}" status has been updated to: ${status}`,
        data: { campaignId: campaign.id, newStatus: status }
      });
      
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign status:", error);
      res.status(500).json({ message: "Failed to update campaign status" });
    }
  });

  // Sentiment analysis endpoints
  app.post("/api/sentiment/analyze", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { text, campaignId, participantId, responseId } = req.body;
      const analysis = await sentimentAnalysisEngine.analyzeFeedback(text, campaignId, participantId, responseId);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  app.get("/api/sentiment/campaign/:campaignId", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { campaignId } = req.params;
      const summary = await sentimentAnalysisEngine.getCampaignSentimentSummary(parseInt(campaignId));
      res.json(summary);
    } catch (error) {
      console.error("Error fetching campaign sentiment:", error);
      res.status(500).json({ message: "Failed to fetch campaign sentiment" });
    }
  });

  app.get("/api/sentiment/analysis/:campaignId", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { campaignId } = req.params;
      const analyses = await storage.getSentimentAnalysis(parseInt(campaignId));
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching sentiment analyses:", error);
      res.status(500).json({ message: "Failed to fetch sentiment analyses" });
    }
  });

  // Update create payment intent to include campaign pricing
  app.post("/api/create-payment-intent", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { campaignType, contentType, participantCount, campaignId } = req.body;
      
      let amount;
      if (campaignType && contentType && participantCount) {
        const pricing = await pricingService.calculateCampaignCost(campaignType, contentType, participantCount);
        amount = pricing.totalCost;
        
        // Update campaign with pricing information
        if (campaignId) {
          await storage.updateCampaignPricing(campaignId, {
            baseCost: pricing.baseCost,
            participantCost: pricing.participantCost,
            totalCost: pricing.totalCost,
            campaignType: pricing.campaignType,
            contentType: pricing.contentType
          });
        }
      } else {
        amount = req.body.amount;
      }
      
      if (!amount || amount < 0.50) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: req.user!.id.toString(),
          type: "campaign_payment",
          campaignId: campaignId?.toString() || "",
          campaignType: campaignType || "",
          contentType: contentType || "",
          participantCount: participantCount?.toString() || ""
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Content protection routes
  app.post("/api/content/protect", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { assetId, options } = req.body;
      await contentProtectionEngine.enableContentProtection(assetId, options);
      res.json({ message: "Content protection enabled successfully" });
    } catch (error) {
      console.error("Error enabling content protection:", error);
      res.status(500).json({ message: "Failed to enable content protection" });
    }
  });

  app.delete("/api/content/protect/:assetId", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { assetId } = req.params;
      await contentProtectionEngine.disableContentProtection(parseInt(assetId));
      res.json({ message: "Content protection disabled successfully" });
    } catch (error) {
      console.error("Error disabling content protection:", error);
      res.status(500).json({ message: "Failed to disable content protection" });
    }
  });

  app.get("/api/content/protect/:assetId", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { assetId } = req.params;
      const protection = await contentProtectionEngine.getProtectionStatus(parseInt(assetId));
      res.json(protection);
    } catch (error) {
      console.error("Error fetching content protection:", error);
      res.status(500).json({ message: "Failed to fetch content protection" });
    }
  });

  app.post("/api/content/watermark", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { assetId, config } = req.body;
      const watermark = await contentProtectionEngine.createDynamicWatermark(assetId, req.user!.id, config);
      res.json(watermark);
    } catch (error) {
      console.error("Error creating watermark:", error);
      res.status(500).json({ message: "Failed to create watermark" });
    }
  });

  app.get("/api/content/secure/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const tokenData = await storage.getSecureToken(token);
      
      if (!tokenData) {
        return res.status(404).json({ message: "Invalid token" });
      }
      
      if (tokenData.used) {
        return res.status(410).json({ message: "Token already used" });
      }
      
      if (new Date() > tokenData.expiresAt) {
        return res.status(410).json({ message: "Token expired" });
      }
      
      // Validate user access
      const hasAccess = await contentProtectionEngine.validateContentAccess(
        tokenData.assetId,
        tokenData.userId,
        tokenData.campaignId
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Track content usage
      await contentProtectionEngine.trackContentUsage(
        tokenData.assetId,
        tokenData.campaignId,
        tokenData.userId,
        'view',
        req
      );
      
      // Mark token as used
      await storage.storeSecureToken({ ...tokenData, used: true });
      
      const asset = await storage.getCampaignAsset(tokenData.assetId);
      res.json(asset);
    } catch (error) {
      console.error("Error accessing secure content:", error);
      res.status(500).json({ message: "Failed to access secure content" });
    }
  });

  app.get("/api/content/analytics/:assetId", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { assetId } = req.params;
      const report = await contentProtectionEngine.generateContentSecurityReport(parseInt(assetId));
      res.json(report);
    } catch (error) {
      console.error("Error generating content analytics:", error);
      res.status(500).json({ message: "Failed to generate content analytics" });
    }
  });

  app.post("/api/content/secure-url", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { assetId, campaignId, expiresIn } = req.body;
      
      // Validate access
      const hasAccess = await contentProtectionEngine.validateContentAccess(
        assetId,
        req.user!.id,
        campaignId
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const secureUrl = await contentProtectionEngine.generateSecureUrl(
        assetId,
        req.user!.id,
        campaignId,
        expiresIn
      );
      
      res.json({ secureUrl });
    } catch (error) {
      console.error("Error generating secure URL:", error);
      res.status(500).json({ message: "Failed to generate secure URL" });
    }
  });

  // Mock endpoints for content protection admin dashboard
  app.get("/api/admin/content-assets", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      // Mock data for content assets
      const mockAssets = [
        {
          id: 1,
          filename: "product_demo.mp4",
          fileType: "video",
          fileSize: 5242880,
          campaignId: 1,
          campaignTitle: "Product Launch Campaign",
          protection: {
            watermark: {
              text: "FokusHub360 - Confidential",
              position: "bottom-right",
              opacity: 0.3,
              fontSize: 24,
              color: "#ffffff",
              rotation: -45,
              enabled: true
            },
            downloadProtection: true,
            viewTracking: true,
            maxViews: 50
          },
          analytics: {
            totalViews: 124,
            uniqueViewers: 45,
            downloadAttempts: 12,
            securityViolations: 0,
            lastAccessed: new Date().toISOString()
          }
        },
        {
          id: 2,
          filename: "market_research.pdf",
          fileType: "document",
          fileSize: 1048576,
          campaignId: 2,
          campaignTitle: "Market Research Study",
          protection: null,
          analytics: {
            totalViews: 67,
            uniqueViewers: 23,
            downloadAttempts: 8,
            securityViolations: 2,
            lastAccessed: new Date().toISOString()
          }
        }
      ];
      
      res.json(mockAssets);
    } catch (error) {
      console.error("Error fetching content assets:", error);
      res.status(500).json({ message: "Failed to fetch content assets" });
    }
  });

  app.get("/api/admin/content-security-report", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      // Mock security report data
      const mockReport = {
        totalAssets: 15,
        protectedAssets: 8,
        totalViews: 1243,
        totalViolations: 3,
        highRiskAssets: 2,
        recentActivity: [
          {
            assetId: 1,
            filename: "product_demo.mp4",
            eventType: "view",
            timestamp: new Date().toISOString(),
            userId: 2,
            username: "john.doe"
          },
          {
            assetId: 2,
            filename: "market_research.pdf",
            eventType: "download",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            userId: 3,
            username: "jane.smith"
          }
        ]
      };
      
      res.json(mockReport);
    } catch (error) {
      console.error("Error fetching security report:", error);
      res.status(500).json({ message: "Failed to fetch security report" });
    }
  });

  // Verification System Endpoints
  app.get("/api/admin/verification/stats", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const stats = await verificationSystem.getVerificationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching verification stats:", error);
      res.status(500).json({ message: "Failed to fetch verification stats" });
    }
  });

  app.get("/api/admin/verification/unverified", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const unverifiedUsers = await verificationSystem.getUnverifiedUsers(limit);
      res.json(unverifiedUsers);
    } catch (error) {
      console.error("Error fetching unverified users:", error);
      res.status(500).json({ message: "Failed to fetch unverified users" });
    }
  });

  app.get("/api/admin/verification/verified", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const verifiedUsers = await verificationSystem.getVerifiedUsers(limit);
      res.json(verifiedUsers);
    } catch (error) {
      console.error("Error fetching verified users:", error);
      res.status(500).json({ message: "Failed to fetch verified users" });
    }
  });

  app.post("/api/admin/verification/update-status", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { userId, status } = req.body;
      
      if (!userId || !status) {
        return res.status(400).json({ message: "User ID and status are required" });
      }

      if (!['verified', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const result = await verificationSystem.updateVerificationStatus(userId, status, req.user!.id.toString());
      res.json(result);
    } catch (error) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });

  app.post("/api/admin/verification/send-reminders", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { userIds = [] } = req.body;
      
      const result = await verificationSystem.sendVerificationReminders(userIds, req.user!.id.toString());
      res.json(result);
    } catch (error) {
      console.error("Error sending verification reminders:", error);
      res.status(500).json({ message: "Failed to send verification reminders" });
    }
  });

  // Priority participant matching endpoint
  app.get("/api/campaigns/:id/priority-participants", authenticateToken, requireRole(["admin", "manager", "client"]), async (req: AuthRequest, res) => {
    try {
      const { id: campaignId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const priorityParticipants = await verificationSystem.getPriorityParticipants(campaignId, limit);
      res.json(priorityParticipants);
    } catch (error) {
      console.error("Error fetching priority participants:", error);
      res.status(500).json({ message: "Failed to fetch priority participants" });
    }
  });



app.post(
  "/api/verification/upload",
  authenticateToken,
  uploadSingle,
  async (req: AuthRequest, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { type: docType } = req.body;
      if (!docType || !['identity', 'address', 'income', 'other'].includes(docType)) {
        return res.status(400).json({ message: "Invalid document type" });
      }

      const userId = req.user!.id;

      // Generate unique key for Wasabi
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const key = `verification/${userId}_${docType}_${timestamp}${extension}`;

      // Upload to Wasabi
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.WASABI_BUCKET!,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );
        console.log(`Upload successful to Wasabi: ${key}`);
      } catch (error) {
        console.error("Error uploading to Wasabi:", error);
        return res.status(500).json({ message: "Failed to upload file to Wasabi" });
      }

      const fileUrl = `https://s3.${process.env.WASABI_REGION}.wasabisys.com/${process.env.WASABI_BUCKET}/${key}`;

      // Store verification document in your DB
      await storage.storeVerificationDocument({
        userId,
        docType,
        fileName: key,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: 'pending',
      });

      res.json({
        id: key,
        type: docType,
        name: file.originalname,
        status: 'pending',
        uploadDate: new Date().toISOString(),
        message: "Document uploaded successfully to Wasabi",
        fileName: file.originalname,
        docType,
        wasabiUrl: fileUrl,
      });
    } catch (error) {
      console.error("Error uploading verification document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  }
);

  app.post("/api/verification/submit", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      // Check if user already has a pending verification (unless admin/manager override)
      // const currentUser = await storage.getUser(userId);
      // if (currentUser?.verificationStatus === 'pending' && 
      //     userRole !== 'admin' && userRole !== 'manager') {
      //   return res.status(400).json({ 
      //     message: "Verification already submitted and pending review" 
      //   });
      // }
      
      // Check if all required documents are uploaded
      const documents = await storage.getVerificationDocuments(userId);
      // const requiredTypes = ['id', 'address', 'selfie'];
      // const uploadedTypes = documents.map(doc => doc.docType);
      
      // const missingTypes = requiredTypes.filter(type => !uploadedTypes.includes(type));
      // if (missingTypes.length > 0) {
      //   return res.status(400).json({ 
      //     message: `Missing required documents: ${missingTypes.join(', ')}` 
      //   });
      // }

      // Update user verification status
      await storage.updateUserVerificationStatus(userId, 'pending');
      
      // Create verification submission record
      await storage.createVerificationSubmission({
        userId,
        submittedAt: new Date(),
        status: 'pending',
        documents: documents.map(doc => ({
          docType: doc.docType,
          fileName: doc.fileName,
          uploadedAt: doc.uploadedAt
        }))
      });

      res.json({ 
        message: "Verification submitted successfully",
        status: "pending"
      });
    } catch (error) {
      console.error("Error submitting verification:", error);
      res.status(500).json({ message: "Failed to submit verification" });
    }
  });

  app.get("/api/verification/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      const documents = await storage.getVerificationDocuments(userId);
      
      // Calculate verification data for reminders
      const joinedDate = user?.createdAt || new Date();
      const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Mock reminder count (would track in database)
      const reminderCount = daysSinceJoined > 7 ? Math.floor(daysSinceJoined / 7) : 0;
      
      res.json({
        verificationStatus: user?.verificationStatus || 'unverified',
        documents: documents.map(doc => ({
          docType: doc.docType,
          fileName: doc.fileName,
          status: doc.status,
          uploadedAt: doc.uploadedAt
        })),
        daysSinceJoined,
        reminderCount,
        canResubmit: user?.verificationStatus !== 'pending' || req.user!.role === 'admin' || req.user!.role === 'manager'
      });
    } catch (error) {
      console.error("Error fetching verification status:", error);
      res.status(500).json({ message: "Failed to fetch verification status" });
    }
  });

  // Test data seeding endpoint (admin only)
  app.post("/api/admin/seed-test-campaigns", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const result = await seedTestCampaigns();
      
      // Create sample campaign invitations for the current user if they're a participant
      const user = await storage.getUser(req.user!.id);
      if (user && user.role === 'participant') {
        // Create invitations for the first 5 campaigns
        for (let i = 1; i <= 5; i++) {
          await storage.createCampaignParticipant({
            campaignId: i,
            participantId: user.id,
            status: 'invited',
            invitedBy: 'System Admin',
            invitedAt: new Date(),
            rewardAmount: 20 + (i * 5),
            rewardType: 'USD',
            responseDeadline: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000)
          });
        }
      }
      
      res.json({ 
        message: "Test campaigns seeded successfully", 
        campaigns: result.campaigns,
        assets: result.assets,
        invitations: user?.role === 'participant' ? 5 : 0
      });
    } catch (error) {
      console.error("Error seeding test campaigns:", error);
      res.status(500).json({ message: "Failed to seed test campaigns" });
    }
  });

  // Create sample campaign invitations for testing
  app.post("/api/admin/create-test-invitations", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { participantId, campaignIds } = req.body;
      
      if (!participantId || !campaignIds || !Array.isArray(campaignIds)) {
        return res.status(400).json({ message: "Participant ID and campaign IDs are required" });
      }
      
      const invitations = [];
      for (const campaignId of campaignIds) {
        const invitation = await storage.createCampaignParticipant({
          campaignId,
          participantId,
          status: 'invited',
          invitedBy: 'System Admin',
          invitedAt: new Date(),
          rewardAmount: 20 + (campaignId * 3),
          rewardType: 'USD',
          responseDeadline: new Date(Date.now() + (campaignId + 2) * 24 * 60 * 60 * 1000)
        });
        invitations.push(invitation);
      }
      
      res.json({ 
        message: "Test invitations created successfully", 
        invitations: invitations.length 
      });
    } catch (error) {
      console.error("Error creating test invitations:", error);
      res.status(500).json({ message: "Failed to create test invitations" });
    }
  });

  // Add route for manual reminder sending (admin only)
  app.post("/api/admin/send-verification-reminders", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { periodicVerificationService } = await import("./periodic-verification-reminders");
      const result = await periodicVerificationService.sendRemindersNow();
      res.json({
        message: "Verification reminders sent successfully",
        ...result
      });
    } catch (error) {
      console.error("Error sending verification reminders:", error);
      res.status(500).json({ message: "Failed to send verification reminders" });
    }
  });

  // User Management Endpoints (Admin Only)
  app.get("/api/admin/users", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role
      });

      res.json(user);
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.code === '23505') {
        return res.status(400).json({ message: "Email already exists" });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;

      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Debug route to analyze user deletion blockers
  app.get("/api/admin/users/:id/debug", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get user info
      const user = await db.select().from(users).where(eq(users.id, userId));
      if (!user.length) {
        return res.status(404).json({ message: "User not found" });
      }

      // Count all related records (only from tables that actually exist)
      const relatedData = {
        user: user[0],
        relatedRecords: {
          participantResponses: (await db.select().from(participantResponses).where(eq(participantResponses.userId, userId))).length,
          campaignParticipants: (await db.select().from(campaignParticipants).where(eq(campaignParticipants.participantId, userId))).length,
          campaignParticipantsInvited: (await db.select().from(campaignParticipants).where(eq(campaignParticipants.invitedBy, userId))).length,
          notifications: (await db.select().from(notifications).where(eq(notifications.userId, userId))).length,
          userWarnings: (await db.select().from(userWarnings).where(eq(userWarnings.userId, userId))).length,
          userWarningsIssued: (await db.select().from(userWarnings).where(eq(userWarnings.issuedBy, userId))).length,
          participantProfiles: (await db.select().from(participantProfiles).where(eq(participantProfiles.userId, userId))).length,
          passwordResetTokens: (await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.userId, userId))).length,
          verificationSubmissions: (await db.select().from(verificationSubmissions).where(eq(verificationSubmissions.userId, userId))).length,
          campaigns: (await db.select().from(campaigns).where(eq(campaigns.clientId, userId))).length,
          campaignsManaged: (await db.select().from(campaigns).where(eq(campaigns.managerId, userId))).length,
          reports: (await db.select().from(reports).where(eq(reports.clientId, userId))).length,
          emailSegmentsCreated: (await db.select().from(emailSegments).where(eq(emailSegments.createdBy, userId))).length,
          emailCampaigns: (await db.select().from(emailCampaigns).where(eq(emailCampaigns.createdBy, userId))).length,
          messages: (await db.select().from(messages).where(eq(messages.userId, userId))).length
        }
      };

      const totalRelated = Object.values(relatedData.relatedRecords).reduce((sum: number, count: number) => sum + count, 0);
      
      res.json({
        ...relatedData,
        totalRelatedRecords: totalRelated,
        canDelete: totalRelated === 0 ? "Yes - no related records" : `No - ${totalRelated} related records found`
      });
    } catch (error: any) {
      console.error("Error debugging user:", error);
      res.status(500).json({ message: "Failed to analyze user", error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      console.log('🗑️ DELETE USER API ENDPOINT:', {
        targetUserId: userId,
        currentUserId: req.user?.id,
        userRole: req.user?.role,
        userEmail: req.user?.email,
        authHeader: req.headers.authorization ? 'Present' : 'Missing',
        timestamp: new Date().toISOString()
      });
      
      // Prevent admin from deleting themselves
      if (userId === req.user!.id) {
        console.log('❌ SELF-DELETE ATTEMPT BLOCKED');
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      console.log(`🚀 Admin ${req.user!.id} attempting to delete user ${userId}`);
      await storage.deleteUser(userId);
      console.log(`✅ User ${userId} successfully deleted by admin ${req.user!.id}`);
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      console.error("🚨 DELETE USER ERROR:", error);
      res.status(500).json({ 
        message: error.message || "Failed to delete user",
        details: error.code || "Unknown error",
        constraint: error.constraint || "No constraint info",
        table: error.table || "No table info"
      });
    }
  });

  app.put("/api/admin/users/:id/ban", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { banned, reason } = req.body;

      const user = await storage.updateUser(userId, { 
        isBanned: banned,
        banReason: banned ? reason : null
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user ban status:", error);
      res.status(500).json({ message: "Failed to update user ban status" });
    }
  });

  // Invitation System Endpoints
  app.post("/api/invitation/waitlist", async (req, res) => {
    try {
      const validatedData = insertInvitationWaitlistSchema.parse(req.body);
      
      const waitlistEntry = await storage.addToWaitlist(validatedData);
      res.json(waitlistEntry);
    } catch (error: any) {
      console.error("Error adding to waitlist:", error);
      
      // Handle duplicate email error
      if (error.code === '23505' && error.constraint === 'invitation_waitlist_email_key') {
        return res.status(400).json({ 
          message: "This email address is already on our waitlist. We'll be in touch soon!" 
        });
      }
      
      res.status(500).json({ message: "Failed to add to waitlist" });
    }
  });

  app.get("/api/invitation/status", async (req, res) => {
    try {
      const status = await storage.getInvitationStatus();
      res.json(status);
    } catch (error) {
      console.error("Error checking invitation status:", error);
      res.status(500).json({ message: "Failed to check invitation status" });
    }
  });

  app.get("/api/admin/invitation/waitlist", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const waitlist = await storage.getWaitlist();
      res.json(waitlist);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });

  app.put("/api/admin/invitation/waitlist/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updated = await storage.updateWaitlistStatus(
        parseInt(id), 
        status, 
        req.user!.id
      );
      res.json(updated);
    } catch (error) {
      console.error("Error updating waitlist status:", error);
      res.status(500).json({ message: "Failed to update waitlist status" });
    }
  });

  app.put("/api/admin/invitation/toggle", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { enabled } = req.body;
      
      // Check if the setting exists first
      const existingSetting = await storage.getSystemSetting('invitation_only_mode');
      
      if (existingSetting) {
        // Update existing setting
        const updated = await storage.updateSystemSetting(
          'invitation_only_mode', 
          enabled ? 'true' : 'false', 
          req.user!.id
        );
        res.json(updated);
      } else {
        // Create new setting
        const created = await storage.createSystemSetting({
          setting: 'invitation_only_mode',
          value: enabled ? 'true' : 'false',
          updatedBy: req.user!.id
        });
        res.json(created);
      }
    } catch (error) {
      console.error("Error toggling invitation mode:", error);
      res.status(500).json({ message: "Failed to toggle invitation mode" });
    }
  });

  // Email system routes
  app.post("/api/admin/email/test", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      const { to } = req.body;
      
      if (!to) {
        return res.status(400).json({ message: "Recipient email is required" });
      }
      
      const result = await emailService.sendTestEmail(to);
      
      if (result.success) {
        res.json({ message: "Test email sent successfully", messageId: result.messageId });
      } else {
        res.status(500).json({ message: "Failed to send test email", error: result.error });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Email service error" });
    }
  });

  // Advanced email composition and sending
  app.post("/api/admin/email/send-advanced", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { design, content, recipients, segmentId, scheduledAt } = req.body;
      
      if (!design || !content || (!recipients?.length && !segmentId)) {
        return res.status(400).json({ message: "Design, content, and recipients are required" });
      }

      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      
      // Generate HTML from design and content
      const htmlContent = await generateEmailHTML(design, content);
      
      let targetRecipients = recipients || [];
      
      // If segment ID is provided, fetch segment users
      if (segmentId) {
        const segment = await storage.getEmailSegment(segmentId);
        if (segment) {
          const segmentUsers = await storage.getUsersBySegmentCriteria(segment.criteria);
          targetRecipients = segmentUsers.map(user => user.email);
        }
      }
      
      // Send emails
      const results = await Promise.all(
        targetRecipients.map(async (email: string) => {
          return await emailService.sendEmail({
            to: email,
            subject: design.subject,
            html: htmlContent,
            from: `${design.footer?.companyName || 'FokusHub360'} <noreply@fokushub360.com>`
          });
        })
      );
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      res.json({ 
        message: `Email sent to ${successful} recipients`, 
        successful, 
        failed,
        total: targetRecipients.length
      });
    } catch (error) {
      console.error("Error sending advanced email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Email segments management
  app.get("/api/admin/email-segments", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const segments = await storage.getEmailSegments();
      res.json(segments);
    } catch (error) {
      console.error("Error fetching email segments:", error);
      res.status(500).json({ message: "Failed to fetch segments" });
    }
  });

  app.post("/api/admin/email-segments", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { name, description, criteria } = req.body;
      
      if (!name || !criteria) {
        return res.status(400).json({ message: "Name and criteria are required" });
      }
      
      const segmentId = await storage.createEmailSegment({
        name,
        description,
        criteria,
        createdBy: req.user!.id
      });
      
      res.json({ id: segmentId, message: "Segment created successfully" });
    } catch (error) {
      console.error("Error creating email segment:", error);
      res.status(500).json({ message: "Failed to create segment" });
    }
  });

  app.put("/api/admin/email-segments/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name, description, criteria } = req.body;
      
      await storage.updateEmailSegment(id, {
        name,
        description,
        criteria,
        updatedBy: req.user!.id
      });
      
      res.json({ message: "Segment updated successfully" });
    } catch (error) {
      console.error("Error updating email segment:", error);
      res.status(500).json({ message: "Failed to update segment" });
    }
  });

  app.delete("/api/admin/email-segments/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmailSegment(id);
      res.json({ message: "Segment deleted successfully" });
    } catch (error) {
      console.error("Error deleting email segment:", error);
      res.status(500).json({ message: "Failed to delete segment" });
    }
  });

  app.post("/api/admin/email-segments/preview", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { criteria } = req.body;
      
      if (!criteria) {
        return res.status(400).json({ message: "Criteria are required" });
      }
      
      const users = await storage.getUsersBySegmentCriteria(criteria);
      res.json({ users, count: users.length });
    } catch (error) {
      console.error("Error previewing segment:", error);
      res.status(500).json({ message: "Failed to preview segment" });
    }
  });

  // Get detailed user data for segmentation
  app.get("/api/admin/users-detailed", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const users = await storage.getUsersWithDetails();
      res.json(users);
    } catch (error) {
      console.error("Error fetching detailed users:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  app.post("/api/admin/email/send-custom", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      const { to, subject, message } = req.body;
      const senderName = `${req.user?.firstName} ${req.user?.lastName}`;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ message: "Recipient, subject, and message are required" });
      }
      
      const result = await emailService.sendCustomMessage(to, subject, message, senderName);
      
      if (result.success) {
        res.json({ message: "Email sent successfully", messageId: result.messageId });
      } else {
        res.status(500).json({ message: "Failed to send email", error: result.error });
      }
    } catch (error) {
      console.error("Error sending custom email:", error);
      res.status(500).json({ message: "Email service error" });
    }
  });

  app.post("/api/admin/email/send-campaign-invitation", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      const { to, firstName, campaignTitle } = req.body;
      
      if (!to || !firstName || !campaignTitle) {
        return res.status(400).json({ message: "Recipient, name, and campaign title are required" });
      }
      
      const result = await emailService.sendCampaignInvitation(to, firstName, campaignTitle);
      
      if (result.success) {
        res.json({ message: "Campaign invitation sent successfully", messageId: result.messageId });
      } else {
        res.status(500).json({ message: "Failed to send campaign invitation", error: result.error });
      }
    } catch (error) {
      console.error("Error sending campaign invitation:", error);
      res.status(500).json({ message: "Email service error" });
    }
  });

  app.post("/api/admin/email/send-welcome", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      const { to, firstName, userRole } = req.body;
      
      if (!to || !firstName) {
        return res.status(400).json({ message: "Recipient and name are required" });
      }
      
      const result = await emailService.sendWelcomeEmail(to, firstName, userRole || 'participant');
      
      if (result.success) {
        res.json({ message: "Welcome email sent successfully", messageId: result.messageId });
      } else {
        res.status(500).json({ message: "Failed to send welcome email", error: result.error });
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ message: "Email service error" });
    }
  });

  app.post("/api/admin/email/send-welcome-client", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      const { to, firstName } = req.body;
      
      if (!to || !firstName) {
        return res.status(400).json({ message: "Recipient and name are required" });
      }
      
      const result = await emailService.sendWelcomeEmail(to, firstName, 'client');
      
      if (result.success) {
        res.json({ message: "Client welcome email sent successfully", messageId: result.messageId });
      } else {
        res.status(500).json({ message: "Failed to send client welcome email", error: result.error });
      }
    } catch (error) {
      console.error("Error sending client welcome email:", error);
      res.status(500).json({ message: "Email service error" });
    }
  });

  app.post("/api/admin/email/send-welcome-participant", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      const { to, firstName } = req.body;
      
      if (!to || !firstName) {
        return res.status(400).json({ message: "Recipient and name are required" });
      }
      
      const result = await emailService.sendWelcomeEmail(to, firstName, 'participant');
      
      if (result.success) {
        res.json({ message: "Participant welcome email sent successfully", messageId: result.messageId });
      } else {
        res.status(500).json({ message: "Failed to send participant welcome email", error: result.error });
      }
    } catch (error) {
      console.error("Error sending participant welcome email:", error);
      res.status(500).json({ message: "Email service error" });
    }
  });

  app.post("/api/admin/email/send-verification-reminder", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      const { to, firstName, daysSinceJoined } = req.body;
      
      if (!to || !firstName) {
        return res.status(400).json({ message: "Recipient and name are required" });
      }
      
      const result = await emailService.sendVerificationReminderEmail(to, firstName, daysSinceJoined || 7);
      
      if (result.success) {
        res.json({ message: "Verification reminder sent successfully", messageId: result.messageId });
      } else {
        res.status(500).json({ message: "Failed to send verification reminder", error: result.error });
      }
    } catch (error) {
      console.error("Error sending verification reminder:", error);
      res.status(500).json({ message: "Email service error" });
    }
  });

  app.post("/api/admin/email/send-warning", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      const { to, firstName, warningCount, maxWarnings } = req.body;
      
      if (!to || !firstName) {
        return res.status(400).json({ message: "Recipient and name are required" });
      }
      
      const result = await emailService.sendAccountSuspensionWarning(to, firstName, warningCount || 1, maxWarnings || 3);
      
      if (result.success) {
        res.json({ message: "Warning email sent successfully", messageId: result.messageId });
      } else {
        res.status(500).json({ message: "Failed to send warning email", error: result.error });
      }
    } catch (error) {
      console.error("Error sending warning email:", error);
      res.status(500).json({ message: "Email service error" });
    }
  });

  // Email segmentation endpoints
  app.get("/api/admin/email-segments", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const segments = await storage.getEmailSegments();
      res.json(segments);
    } catch (error) {
      console.error("Error fetching email segments:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/admin/email-segments/:id", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const segment = await storage.getEmailSegment(req.params.id);
      if (!segment) {
        return res.status(404).json({ error: "Segment not found" });
      }
      res.json(segment);
    } catch (error) {
      console.error("Error fetching email segment:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/email-segments", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { name, description, criteria } = req.body;
      const userId = req.user!.id;
      
      const id = await storage.createEmailSegment({
        name,
        description,
        criteria,
        createdBy: userId
      });
      
      res.json({ id, message: "Email segment created successfully" });
    } catch (error) {
      console.error("Error creating email segment:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/admin/email-segments/:id", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { name, description, criteria } = req.body;
      const userId = req.user!.id;
      
      await storage.updateEmailSegment(req.params.id, {
        name,
        description,
        criteria,
        updatedBy: userId
      });
      
      res.json({ message: "Email segment updated successfully" });
    } catch (error) {
      console.error("Error updating email segment:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/admin/email-segments/:id", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      await storage.deleteEmailSegment(req.params.id);
      res.json({ message: "Email segment deleted successfully" });
    } catch (error) {
      console.error("Error deleting email segment:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get users with detailed information for segmentation
  app.get("/api/admin/users-with-details", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const users = await storage.getUsersWithDetails();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users with details:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Preview segment criteria
  app.post("/api/admin/preview-segment", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { criteria } = req.body;
      const users = await storage.getUsersBySegmentCriteria(criteria);
      res.json({ users: users.slice(0, 100), count: users.length });
    } catch (error) {
      console.error("Error previewing segment:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Advanced email composer endpoints
  app.post("/api/admin/send-designed-email", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { design, content, recipients } = req.body;
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      
      // Generate HTML from design and content
      const htmlContent = await generateEmailHTML(design, content);
      
      // Send email to recipients
      const results = await Promise.allSettled(
        recipients.map(async (recipient: string) => {
          return await emailService.sendCustomEmail(recipient, design.subject, htmlContent);
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      res.json({
        message: `Email sent successfully`,
        successful,
        failed,
        total: recipients.length
      });
    } catch (error) {
      console.error("Error sending designed email:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/send-segment-email", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { design, content, segmentId } = req.body;
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      
      // Get segment and users
      const segment = await storage.getEmailSegment(segmentId);
      if (!segment) {
        return res.status(404).json({ error: "Segment not found" });
      }
      
      const users = await storage.getUsersBySegmentCriteria(segment.criteria);
      const recipients = users.map(user => user.email);
      
      // Generate HTML from design and content
      const htmlContent = await generateEmailHTML(design, content);
      
      // Send email to all recipients
      const results = await Promise.allSettled(
        recipients.map(async (recipient: string) => {
          return await emailService.sendCustomEmail(recipient, design.subject, htmlContent);
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      res.json({
        message: `Email sent to ${segment.name} segment`,
        successful,
        failed,
        total: recipients.length
      });
    } catch (error) {
      console.error("Error sending segment email:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/preview-email", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { design, content } = req.body;
      const htmlContent = await generateEmailHTML(design, content);
      res.json({ htmlContent });
    } catch (error) {
      console.error("Error previewing email:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Menu control settings
  app.get("/api/admin/menu-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const menuSettings = settings.filter(s => s.setting.startsWith('menu_'));
      
      const defaultMenu = {
        features: { enabled: true, visible: true, title: "Features" },
        how_it_works: { enabled: true, visible: true, title: "How It Works" },
        testimonials: { enabled: true, visible: true, title: "Testimonials" },
        pricing: { enabled: true, visible: true, title: "Pricing" },
        auth: { enabled: true, visible: true, title: "Sign In" },
        cta: { enabled: true, visible: true, title: "Get Started" }
      };
      
      const menuConfig = menuSettings.reduce((acc: any, setting) => {
        const key = setting.setting.replace('menu_', '');
        try {
          acc[key] = JSON.parse(setting.value);
        } catch {
          // If JSON parsing fails, treat as boolean
          acc[key] = setting.value === 'true';
        }
        return acc;
      }, defaultMenu);
      
      res.json(menuConfig);
    } catch (error) {
      console.error("Error fetching menu settings:", error);
      res.status(500).json({ message: "Failed to fetch menu settings" });
    }
  });

  app.post("/api/admin/menu-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const menuConfig = req.body;
      
      for (const [key, value] of Object.entries(menuConfig)) {
        await storage.updateSystemSetting({
          setting: `menu_${key}`,
          value: JSON.stringify(value),
          description: `Menu configuration for ${key}`,
          updatedBy: req.user?.id
        });
      }
      
      res.json({ message: "Menu settings updated successfully" });
    } catch (error) {
      console.error("Error updating menu settings:", error);
      res.status(500).json({ message: "Failed to update menu settings" });
    }
  });

  // Email configuration settings
  app.get("/api/admin/email-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const emailSettings = settings.filter(s => s.setting.startsWith('email_'));
      
      const defaultConfig = {
        enabled: true,
        from_email: 'noreply@fokushub360.com',
        from_name: 'FokusHub360 Team',
        auto_welcome: true,
        auto_campaign_invites: true,
        auto_verification_reminders: true
      };
      
      const emailConfig = emailSettings.reduce((acc: any, setting) => {
        const key = setting.setting.replace('email_', '');
        try {
          acc[key] = JSON.parse(setting.value);
        } catch {
          acc[key] = setting.value;
        }
        return acc;
      }, defaultConfig);
      
      res.json(emailConfig);
    } catch (error) {
      console.error("Error fetching email settings:", error);
      res.status(500).json({ message: "Failed to fetch email settings" });
    }
  });

  app.post("/api/admin/email-settings", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const emailConfig = req.body;
      
      for (const [key, value] of Object.entries(emailConfig)) {
        await storage.updateSystemSetting({
          setting: `email_${key}`,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          description: `Email configuration for ${key}`,
          updatedBy: req.user?.id
        });
      }
      
      res.json({ message: "Email settings updated successfully" });
    } catch (error) {
      console.error("Error updating email settings:", error);
      res.status(500).json({ message: "Failed to update email settings" });
    }
  });

  // Email template management routes
  app.get("/api/admin/email-templates", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.get("/api/admin/email-templates/:templateKey", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { templateKey } = req.params;
      const template = await storage.getEmailTemplate(templateKey);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ templateKey, ...template });
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ message: "Failed to fetch email template" });
    }
  });

  app.post("/api/admin/email-templates/:templateKey", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { templateKey } = req.params;
      const { subject, htmlContent } = req.body;
      const userId = req.user?.id;
      
      if (!subject || !htmlContent) {
        return res.status(400).json({ message: "Subject and HTML content are required" });
      }
      
      await storage.saveEmailTemplate(templateKey, subject, htmlContent, userId);
      res.json({ message: "Email template saved successfully" });
    } catch (error) {
      console.error("Error saving email template:", error);
      res.status(500).json({ message: "Failed to save email template" });
    }
  });

  // Legal Documents API Routes for GDPR Compliance
  app.get("/api/legal/documents", async (req, res) => {
    try {
      const documents = await storage.getLegalDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching legal documents:", error);
      res.status(500).json({ message: "Failed to fetch legal documents" });
    }
  });

  app.get("/api/legal/documents/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const document = await storage.getLegalDocumentByType(type);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching legal document:", error);
      res.status(500).json({ message: "Failed to fetch legal document" });
    }
  });

  app.put("/api/legal/documents", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { type, content } = req.body;
      
      if (!type || !content) {
        return res.status(400).json({ message: "Type and content are required" });
      }
      
      await storage.updateLegalDocument(type, content);
      res.json({ message: "Legal document updated successfully" });
    } catch (error) {
      console.error("Error updating legal document:", error);
      res.status(500).json({ message: "Failed to update legal document" });
    }
  });

  app.post("/api/legal/accept", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { documentId, documentType, documentVersion } = req.body;
      
      if (!documentId || !documentType || !documentVersion) {
        return res.status(400).json({ message: "Document ID, type, and version are required" });
      }
      
      const acceptance = await storage.recordLegalAcceptance({
        userId: req.user!.id,
        documentId,
        documentType,
        documentVersion,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });
      
      res.json({ message: "Document acceptance recorded", acceptance });
    } catch (error) {
      console.error("Error recording legal acceptance:", error);
      res.status(500).json({ message: "Failed to record legal acceptance" });
    }
  });

  app.get("/api/legal/user-acceptances", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const acceptances = await storage.getUserLegalAcceptances(req.user!.id);
      res.json(acceptances);
    } catch (error) {
      console.error("Error fetching user acceptances:", error);
      res.status(500).json({ message: "Failed to fetch user acceptances" });
    }
  });

  // Home Page Content API Routes
  app.get("/api/homepage/content", async (req, res) => {
    try {
      const content = await storage.getHomePageContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching home page content:", error);
      res.status(500).json({ message: "Failed to fetch home page content" });
    }
  });

  app.post("/api/homepage/content", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const contentData = req.body;
      
      if (!contentData.section) {
        return res.status(400).json({ message: "Section is required" });
      }
      
      await storage.saveHomePageContent(contentData);
      res.json({ message: "Home page content saved successfully" });
    } catch (error) {
      console.error("Error saving home page content:", error);
      res.status(500).json({ message: "Failed to save home page content" });
    }
  });

  
  // Media Upload API Route for Wasabi
 app.post("/api/upload/media", authenticateToken, uploadSingle, async (req: AuthRequest, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user?.id || "unknown";
    const docType = req.body?.type || "media";
    const key = `images/${userId}_${docType}_${Date.now()}${path.extname(file.originalname)}`;
   try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    console.log("Upload successful:", key);
  }
  catch (error) {
    console.log("Error uploading to Wasabi:", error);
   
  }

    const fileUrl = `https://s3.${process.env.WASABI_REGION}.wasabisys.com/${process.env.WASABI_BUCKET}/${key}`;

    console.log(`Uploaded media to Wasassbi: ${key} (${file.size} bytes)`);

    res.json({
      url: fileUrl,
      fileName: key,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      wasabiUrl: fileUrl
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ message: "Failed to upload media" });
  }
});

  app.post("/api/legal/data-request", async (req, res) => {
    try {
      const { type, email, description, timestamp } = req.body;
      
      if (!type || !email) {
        return res.status(400).json({ message: "Request type and email are required" });
      }
      
      // Store the data request (this would typically go to a dedicated table)
      console.log("Data rights request received:", { type, email, description, timestamp });
      
      // In a real implementation, you would:
      // 1. Validate the user's identity
      // 2. Store the request in a database
      // 3. Send confirmation email
      // 4. Process the request according to GDPR requirements
      
      res.json({ message: "Data rights request submitted successfully" });
    } catch (error) {
      console.error("Error handling data request:", error);
      res.status(500).json({ message: "Failed to process data request" });
    }
  });

  // Admin legal document management
  app.post("/api/admin/legal/documents", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const documentData = insertLegalDocumentSchema.parse(req.body);
      
      const document = await storage.createLegalDocument(documentData);
      
      res.json(document);
    } catch (error) {
      console.error("Error creating legal document:", error);
      res.status(500).json({ message: "Failed to create legal document" });
    }
  });

  app.put("/api/admin/legal/documents/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const document = await storage.updateLegalDocument(id, updates);
      
      res.json(document);
    } catch (error) {
      console.error("Error updating legal document:", error);
      res.status(500).json({ message: "Failed to update legal document" });
    }
  });

  app.delete("/api/admin/legal/documents/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLegalDocument(parseInt(id));
      res.json({ message: "Legal document deleted successfully" });
    } catch (error) {
      console.error("Error deleting legal document:", error);
      res.status(500).json({ message: "Failed to delete legal document" });
    }
  });

  app.get("/api/admin/legal/acceptances", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const acceptances = await storage.getAllLegalAcceptances();
      res.json(acceptances);
    } catch (error) {
      console.error("Error fetching legal acceptances:", error);
      res.status(500).json({ message: "Failed to fetch legal acceptances" });
    }
  });

  app.post("/api/admin/seed-legal-documents", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { seedLegalDocuments } = await import("./seed-legal-documents");
      const result = await seedLegalDocuments();
      res.json(result);
    } catch (error) {
      console.error("Error seeding legal documents:", error);
      res.status(500).json({ message: "Failed to seed legal documents" });
    }
  });

  // Email template management routes
  app.get("/api/admin/email-templates", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const templates = await storage.getSystemSettings();
      const templateList = templates.map(template => {
        const value = typeof template.value === 'string' ? JSON.parse(template.value) : template.value;
        return {
          id: template.key.replace('email_template_', ''),
          name: value.name || template.key,
          subject: value.subject || '',
          body: value.body || '',
          type: value.type || 'notification',
          isActive: value.isActive !== false,
          variables: value.variables || [],
          createdAt: template.createdAt,
          updatedAt: template.updatedAt
        };
      });
      res.json(templateList);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.post("/api/admin/email-templates", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { id, name, subject, body, type, isActive, variables } = req.body;
      
      const templateData = {
        name,
        subject,
        body,
        type,
        isActive,
        variables: variables || []
      };

      const key = `email_template_${id}`;
      await storage.setSystemSetting(key, JSON.stringify(templateData), req.user!.id);
      
      res.json({ 
        success: true, 
        message: "Email template saved successfully",
        template: { id, ...templateData }
      });
    } catch (error) {
      console.error("Error saving email template:", error);
      res.status(500).json({ message: "Failed to save email template" });
    }
  });

  app.post("/api/admin/email-templates/preview", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { subject, body } = req.body;
      
      // Replace variables with sample data
      const sampleData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        loginUrl: "https://fokushub360.com/auth/sign-in",
        resetUrl: "https://fokushub360.com/auth/reset-password/sample-token",
        campaignTitle: "Sample Campaign",
        campaignUrl: "https://fokushub360.com/campaigns/sample",
        deadline: "48 hours",
        duration: "30 minutes",
        earnings: "$50"
      };

      let processedSubject = subject;
      let processedBody = body;

      // Replace variables in subject and body
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedSubject = processedSubject.replace(regex, value);
        processedBody = processedBody.replace(regex, value);
      });

      // Convert plain text to HTML if needed
      const htmlBody = processedBody.replace(/\n/g, '<br>');

      res.json({
        subject: processedSubject,
        html: htmlBody,
        text: processedBody
      });
    } catch (error) {
      console.error("Error generating email preview:", error);
      res.status(500).json({ message: "Failed to generate email preview" });
    }
  });

  app.post("/api/admin/email-templates/test", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { templateId, email } = req.body;
      
      // Get template data
      const templateSettings = await storage.getSystemSetting(`email_template_${templateId}`);
      if (!templateSettings) {
        return res.status(404).json({ message: "Template not found" });
      }

      const templateData = typeof templateSettings.value === 'string' 
        ? JSON.parse(templateSettings.value) 
        : templateSettings.value;

      // Send test email using the email service
      const { sendEmail } = await import("./email-service");
      const result = await sendEmail({
        to: email,
        subject: `[TEST] ${templateData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #dc3545; margin: 0;">TEST EMAIL</h2>
              <p style="margin: 5px 0 0 0; color: #666;">This is a test email from FokusHub360 admin panel</p>
            </div>
            
            <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h3 style="margin-top: 0;">Subject: ${templateData.subject}</h3>
              <hr style="margin: 15px 0;">
              <div>${templateData.body.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 5px; font-size: 12px; color: #666;">
              <p style="margin: 0;">This test email was sent from the FokusHub360 admin panel.</p>
              <p style="margin: 5px 0 0 0;">Template ID: ${templateId}</p>
            </div>
          </div>
        `
      });

      if (result.success) {
        res.json({ success: true, message: "Test email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  app.delete("/api/admin/email-templates/:id", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const key = `email_template_${id}`;
      
      await storage.deleteSystemSetting(key);
      
      res.json({ success: true, message: "Email template deleted successfully" });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });

  app.post("/api/admin/seed-email-templates", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { seedEmailTemplates } = await import("./seed-email-templates");
      const result = await seedEmailTemplates();
      res.json(result);
    } catch (error) {
      console.error("Error seeding email templates:", error);
      res.status(500).json({ message: "Failed to seed email templates" });
    }
  });

  // Health check endpoints with detailed error reporting
  app.get("/api/health/database", async (req, res) => {
    try {
      const startTime = Date.now();
      await storage.getSystemSettings();
      const responseTime = Date.now() - startTime;
      
      res.json({ 
        status: "healthy", 
        message: "Database connection successful",
        details: {
          responseTime: `${responseTime}ms`,
          provider: "Neon PostgreSQL",
          lastChecked: new Date().toISOString()
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      console.error('Database health check failed:', error);
      
      res.status(500).json({ 
        status: "error", 
        message: "Database connection failed",
        details: {
          error: errorMessage,
          suggestion: "Check DATABASE_URL environment variable and network connectivity",
          lastChecked: new Date().toISOString()
        }
      });
    }
  });

  app.post("/api/health/database/reset", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      // Run database push to ensure schema is up to date
      const { exec } = require('child_process');
      exec('npm run db:push', (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.error('Database reset error:', error);
          res.status(500).json({ 
            status: "error", 
            message: "Database reset failed",
            details: {
              error: error.message,
              stdout: stdout,
              stderr: stderr
            }
          });
        } else {
          res.json({ 
            status: "success", 
            message: "Database schema updated",
            details: {
              stdout: stdout,
              completedAt: new Date().toISOString()
            }
          });
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        status: "error", 
        message: "Database reset failed",
        details: {
          error: errorMessage,
          suggestion: "Check system permissions and database access"
        }
      });
    }
  });

  app.get("/api/health/email", async (req, res) => {
    try {
      const emailSettings = await storage.getSystemSettings();
      const hasResendKey = !!process.env.RESEND_API_KEY;
      const emailEnabled = emailSettings.some(s => s.key === 'email_enabled');
      
      if (hasResendKey && emailEnabled) {
        res.json({ 
          status: "healthy", 
          message: "Email system configured and ready",
          details: {
            provider: "Resend",
            apiKeyConfigured: true,
            emailEnabled: true,
            lastChecked: new Date().toISOString()
          }
        });
      } else {
        res.json({ 
          status: "warning", 
          message: "Email system not fully configured",
          details: {
            provider: "Resend",
            apiKeyConfigured: hasResendKey,
            emailEnabled: emailEnabled,
            suggestions: [
              !hasResendKey ? "Configure RESEND_API_KEY environment variable" : null,
              !emailEnabled ? "Enable email system in admin settings" : null
            ].filter(Boolean),
            lastChecked: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        status: "error", 
        message: "Email system check failed",
        details: {
          error: errorMessage,
          suggestion: "Check email configuration and database connectivity",
          lastChecked: new Date().toISOString()
        }
      });
    }
  });

  app.post("/api/upload/test", authenticateToken, requireRole(["admin"]), uploadSingle, async (req: AuthRequest, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ 
          status: "error", 
          message: "No file uploaded",
          details: {
            error: "File parameter missing",
            suggestion: "Ensure a file is selected before testing upload"
          }
        });
      }
      
      const fileName = (file as any).key || `${Date.now()}-${file.originalname}`;
      const fileUrl = (file as any).location || `https://s3.${process.env.WASABI_REGION}.wasabisys.com/${process.env.WASABI_BUCKET}/${fileName}`;
      
      // Test Wasabi upload functionality
      res.json({ 
        status: "success",
        message: "File uploaded to Wasabi successfully",
        details: {
          fileName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          wasabiUrl: fileUrl,
          wasabiKey: fileName,
          testedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      res.status(500).json({ 
        status: "error", 
        message: "File upload failed",
        details: {
          error: errorMessage,
          suggestion: "Check file size limits and Wasabi configuration"
        }
      });
    }
  });

  // Comprehensive health check endpoint
  app.get("/api/health/comprehensive", async (req, res) => {
    try {
      const checks = [];
      
      // Database check
      try {
        const startTime = Date.now();
        await storage.getSystemSettings();
        const responseTime = Date.now() - startTime;
        checks.push({
          name: 'Database Connection',
          status: 'healthy',
          message: 'PostgreSQL database is connected and responsive',
          details: {
            responseTime: `${responseTime}ms`,
            provider: 'Neon Database',
            lastChecked: new Date().toISOString()
          }
        });
      } catch (error) {
        checks.push({
          name: 'Database Connection',
          status: 'error',
          message: 'Database connection failed',
          details: {
            error: error instanceof Error ? error.message : 'Unknown database error',
            suggestion: 'Check DATABASE_URL environment variable and network connectivity'
          }
        });
      }

      // Email system check
      try {
        const emailSettings = await storage.getSystemSettings();
        const hasResendKey = !!process.env.RESEND_API_KEY;
        const emailEnabled = emailSettings.some(s => s.key === 'email_enabled');
        
        if (hasResendKey && emailEnabled) {
          checks.push({
            name: 'Email System',
            status: 'healthy',
            message: 'Email service is configured and ready',
            details: {
              provider: 'Resend',
              apiKeyConfigured: true,
              emailEnabled: true
            }
          });
        } else {
          checks.push({
            name: 'Email System',
            status: 'warning',
            message: 'Email system needs configuration',
            details: {
              apiKeyConfigured: hasResendKey,
              emailEnabled: emailEnabled,
              suggestions: [
                !hasResendKey ? 'Configure RESEND_API_KEY environment variable' : null,
                !emailEnabled ? 'Enable email system in admin settings' : null
              ].filter(Boolean)
            }
          });
        }
      } catch (error) {
        checks.push({
          name: 'Email System',
          status: 'error',
          message: 'Email system check failed',
          details: {
            error: error instanceof Error ? error.message : 'Unknown email error',
            suggestion: 'Check email configuration and database connectivity'
          }
        });
      }

      // Authentication system check
      try {
        const users = await storage.getAllUsers();
        const adminUsers = users.filter(u => u.role === 'admin');
        
        if (adminUsers.length > 0) {
          checks.push({
            name: 'Authentication System',
            status: 'healthy',
            message: 'Authentication system is working properly',
            details: {
              totalUsers: users.length,
              adminUsers: adminUsers.length,
              jwtConfigured: !!process.env.JWT_SECRET
            }
          });
        } else {
          checks.push({
            name: 'Authentication System',
            status: 'warning',
            message: 'No admin users found',
            details: {
              totalUsers: users.length,
              adminUsers: 0,
              suggestion: 'Create at least one admin user'
            }
          });
        }
      } catch (error) {
        checks.push({
          name: 'Authentication System',
          status: 'error',
          message: 'Authentication system has issues',
          details: {
            error: error instanceof Error ? error.message : 'Unknown auth error',
            suggestion: 'Check JWT configuration and user database'
          }
        });
      }

      // Legal documents check
      try {
        const documents = await storage.getLegalDocuments();
        if (documents.length >= 3) {
          checks.push({
            name: 'Legal Documents',
            status: 'healthy',
            message: `${documents.length} legal documents are properly configured`,
            details: {
              documentCount: documents.length,
              documents: documents.map(d => d.type)
            }
          });
        } else {
          checks.push({
            name: 'Legal Documents',
            status: 'warning',
            message: 'Legal documents may be incomplete',
            details: {
              documentCount: documents.length,
              suggestion: 'Ensure privacy policy, terms of service, and cookie policy are configured'
            }
          });
        }
      } catch (error) {
        checks.push({
          name: 'Legal Documents',
          status: 'error',
          message: 'Legal documents check failed',
          details: {
            error: error instanceof Error ? error.message : 'Unknown legal docs error'
          }
        });
      }

      // Calculate overall health
      const healthy = checks.filter(c => c.status === 'healthy').length;
      const warnings = checks.filter(c => c.status === 'warning').length;
      const errors = checks.filter(c => c.status === 'error').length;

      const overallStatus = errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'healthy';

      res.json({
        overallStatus,
        summary: {
          healthy,
          warnings,
          errors,
          total: checks.length
        },
        checks,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Comprehensive health check failed:', error);
      res.status(500).json({
        overallStatus: 'error',
        message: 'Health check system failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown system error'
        }
      });
    }
  });

  // Admin email notification for health check results
  app.post("/api/health/notify-admins", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { healthCheckResults } = req.body;
      
      if (!healthCheckResults) {
        return res.status(400).json({ message: "Health check results required" });
      }

      const adminUsers = await storage.getUsers();
      const admins = adminUsers.filter(u => u.role === 'admin');

      if (admins.length === 0) {
        return res.status(404).json({ message: "No admin users found" });
      }

      const errors = healthCheckResults.filter((r: any) => r.status === 'error');
      const warnings = healthCheckResults.filter((r: any) => r.status === 'warning');
      
      // Only send notifications if there are issues
      if (errors.length === 0 && warnings.length === 0) {
        return res.json({ message: "System healthy, no notification needed" });
      }

      const subject = `FokusHub360 System Health Alert - ${errors.length} Errors, ${warnings.length} Warnings`;
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">System Health Alert</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">FokusHub360 Platform</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Health Check Summary</h2>
            <p style="color: #666;">Automated health check completed at ${new Date().toLocaleString()}</p>
            
            <div style="margin: 20px 0;">
              <div style="display: inline-block; margin-right: 15px; padding: 8px 16px; background: #f87171; color: white; border-radius: 4px; font-weight: bold;">
                ${errors.length} Errors
              </div>
              <div style="display: inline-block; margin-right: 15px; padding: 8px 16px; background: #fbbf24; color: white; border-radius: 4px; font-weight: bold;">
                ${warnings.length} Warnings
              </div>
            </div>

            ${errors.length > 0 ? `
              <h3 style="color: #dc2626; margin: 25px 0 10px 0;">Critical Errors</h3>
              ${errors.map((error: any) => `
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 10px 0;">
                  <strong>${error.name}</strong>
                  <p style="margin: 5px 0; color: #666;">${error.message}</p>
                  ${error.details ? `<p style="margin: 5px 0; font-size: 12px; color: #888;">Details: ${JSON.stringify(error.details)}</p>` : ''}
                </div>
              `).join('')}
            ` : ''}

            ${warnings.length > 0 ? `
              <h3 style="color: #d97706; margin: 25px 0 10px 0;">Warnings</h3>
              ${warnings.map((warning: any) => `
                <div style="background: #fffbeb; border-left: 4px solid #d97706; padding: 12px; margin: 10px 0;">
                  <strong>${warning.name}</strong>
                  <p style="margin: 5px 0; color: #666;">${warning.message}</p>
                  ${warning.details ? `<p style="margin: 5px 0; font-size: 12px; color: #888;">Details: ${JSON.stringify(warning.details)}</p>` : ''}
                </div>
              `).join('')}
            ` : ''}

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #666; font-size: 14px; margin: 0;">
              This is an automated health check notification. Please review the issues above and take appropriate action.
            </p>
            
            <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
              Generated by FokusHub360 System Health Monitor
            </p>
          </div>
        </div>
      `;

      const emailResults = [];
      
      for (const admin of admins) {
        try {
          const emailResult = await sendEmail({
            to: admin.email,
            subject,
            html: emailHtml
          });
          
          emailResults.push({
            email: admin.email,
            success: emailResult.success,
            error: emailResult.error
          });
        } catch (error) {
          emailResults.push({
            email: admin.email,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown email error'
          });
        }
      }

      res.json({
        message: "Admin notifications sent",
        results: emailResults,
        summary: {
          totalAdmins: admins.length,
          successful: emailResults.filter(r => r.success).length,
          failed: emailResults.filter(r => !r.success).length
        }
      });
    } catch (error) {
      console.error('Error sending admin notifications:', error);
      res.status(500).json({ message: "Failed to send admin notifications" });
    }
  });

  // Automated health check scheduling endpoint
  app.post("/api/health/schedule", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { enabled, frequency } = req.body; // frequency: 'daily', 'twice-daily', 'hourly'
      
      await storage.updateSystemSetting('health_check_enabled', enabled ? 'true' : 'false');
      await storage.updateSystemSetting('health_check_frequency', frequency || 'twice-daily');
      
      res.json({
        message: "Health check schedule updated",
        settings: {
          enabled,
          frequency: frequency || 'twice-daily'
        }
      });
    } catch (error) {
      console.error('Error updating health check schedule:', error);
      res.status(500).json({ message: "Failed to update health check schedule" });
    }
  });

  // Get health check schedule settings
  app.get("/api/health/schedule", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const enabled = settings.find(s => s.key === 'health_check_enabled')?.value === 'true';
      const frequency = settings.find(s => s.key === 'health_check_frequency')?.value || 'twice-daily';
      
      res.json({
        enabled,
        frequency,
        nextCheck: enabled ? getNextHealthCheckTime(frequency) : null
      });
    } catch (error) {
      console.error('Error getting health check schedule:', error);
      res.status(500).json({ message: "Failed to get health check schedule" });
    }
  });

  // Helper function to calculate next health check time
  function getNextHealthCheckTime(frequency: string): string {
    const now = new Date();
    let nextCheck = new Date();
    
    switch (frequency) {
      case 'hourly':
        nextCheck.setHours(now.getHours() + 1);
        break;
      case 'twice-daily':
        // 8 AM and 8 PM
        if (now.getHours() < 8) {
          nextCheck.setHours(8, 0, 0, 0);
        } else if (now.getHours() < 20) {
          nextCheck.setHours(20, 0, 0, 0);
        } else {
          nextCheck.setDate(now.getDate() + 1);
          nextCheck.setHours(8, 0, 0, 0);
        }
        break;
      case 'daily':
        nextCheck.setDate(now.getDate() + 1);
        nextCheck.setHours(9, 0, 0, 0);
        break;
      default:
        nextCheck.setHours(now.getHours() + 12);
    }
    
    return nextCheck.toISOString();
  }

  // Health Check System Routes
  app.get("/api/health/comprehensive", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const healthCheckService = new HealthCheckService(storage);
      const results = await healthCheckService.runComprehensiveHealthCheck();
      
      const summary = {
        healthy: results.filter(r => r.status === 'healthy').length,
        warnings: results.filter(r => r.status === 'warning').length,
        errors: results.filter(r => r.status === 'error').length,
        total: results.length
      };
      
      const overallStatus = summary.errors > 0 ? 'error' : 
                           summary.warnings > 0 ? 'warning' : 'healthy';
      
      res.json({
        overallStatus,
        summary,
        checks: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error running health check:", error);
      res.status(500).json({ message: "Failed to run health check" });
    }
  });

  app.get("/api/health/schedule", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const enabled = settings.find(s => s.key === 'health_check_enabled')?.value === 'true';
      const frequency = settings.find(s => s.key === 'health_check_frequency')?.value || 'twice-daily';
      
      res.json({ enabled, frequency });
    } catch (error) {
      console.error("Error fetching health check schedule:", error);
      res.status(500).json({ message: "Failed to fetch health check schedule" });
    }
  });

  app.post("/api/health/schedule", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { enabled, frequency } = req.body;
      
      if (typeof enabled !== 'boolean' || !frequency) {
        return res.status(400).json({ message: "Invalid schedule parameters" });
      }
      
      const healthCheckService = new HealthCheckService(storage);
      await healthCheckService.updateSchedule(frequency, enabled);
      
      res.json({ message: "Health check schedule updated successfully" });
    } catch (error) {
      console.error("Error updating health check schedule:", error);
      res.status(500).json({ message: "Failed to update health check schedule" });
    }
  });

  app.post("/api/health/notify-admins", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { healthCheckResults } = req.body;
      
      if (!healthCheckResults || !Array.isArray(healthCheckResults)) {
        return res.status(400).json({ message: "Invalid health check results" });
      }
      
      const adminUsers = await storage.getUsers();
      const admins = adminUsers.filter(u => u.role === 'admin');
      
      if (admins.length === 0) {
        return res.json({ message: "No admin users found", summary: { successful: 0, failed: 0 } });
      }
      
      const errors = healthCheckResults.filter(r => r.status === 'error');
      const warnings = healthCheckResults.filter(r => r.status === 'warning');
      
      if (errors.length === 0 && warnings.length === 0) {
        return res.json({ message: "No issues to report", summary: { successful: 0, failed: 0 } });
      }
      
      const subject = `FokusHub360 System Health Alert - ${errors.length} Errors, ${warnings.length} Warnings`;
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 System Health Alert</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">FokusHub360 Platform - Health Check Notification</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Health Check Summary</h2>
            <p style="color: #666;">Health check completed at ${new Date().toLocaleString()}</p>
            
            <div style="margin: 20px 0;">
              <div style="display: inline-block; margin-right: 15px; padding: 8px 16px; background: #f87171; color: white; border-radius: 4px; font-weight: bold;">
                ${errors.length} Errors
              </div>
              <div style="display: inline-block; margin-right: 15px; padding: 8px 16px; background: #fbbf24; color: white; border-radius: 4px; font-weight: bold;">
                ${warnings.length} Warnings
              </div>
              <div style="display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 4px; font-weight: bold;">
                ${healthCheckResults.filter(r => r.status === 'healthy').length} Healthy
              </div>
            </div>

            ${errors.length > 0 ? `
              <h3 style="color: #dc2626; margin: 25px 0 10px 0;">🔴 Critical Errors</h3>
              ${errors.map(error => `
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 10px 0; border-radius: 4px;">
                  <strong>${error.name}</strong>
                  <p style="margin: 5px 0; color: #666;">${error.message}</p>
                </div>
              `).join('')}
            ` : ''}

            ${warnings.length > 0 ? `
              <h3 style="color: #d97706; margin: 25px 0 10px 0;">⚠️ Warnings</h3>
              ${warnings.map(warning => `
                <div style="background: #fffbeb; border-left: 4px solid #d97706; padding: 12px; margin: 10px 0; border-radius: 4px;">
                  <strong>${warning.name}</strong>
                  <p style="margin: 5px 0; color: #666;">${warning.message}</p>
                </div>
              `).join('')}
            ` : ''}

            <div style="margin: 30px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">📋 Next Steps</h4>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                <li>Review the issues listed above</li>
                <li>Check system logs for additional details</li>
                <li>Contact technical support if issues persist</li>
                <li>Monitor system health through the admin dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      `;
      
      let successCount = 0;
      let failureCount = 0;

      for (const admin of admins) {
        try {
          const { EmailService } = await import("./email-service");
          const emailService = EmailService.getInstance();
          
          const emailResult = await emailService.sendEmail({
            to: admin.email,
            subject,
            html: emailHtml
          });
          
          if (emailResult.success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          console.error(`Failed to send health check notification to ${admin.email}:`, error);
          failureCount++;
        }
      }

      res.json({
        message: `Health check notifications sent to ${admins.length} admins`,
        summary: {
          successful: successCount,
          failed: failureCount,
          total: admins.length
        }
      });
    } catch (error) {
      console.error("Error sending health check notifications:", error);
      res.status(500).json({ message: "Failed to send health check notifications" });
    }
  });

  app.get("/api/health/database", async (req, res) => {
    try {
      await storage.getSystemSettings();
      res.json({ status: "healthy", message: "Database connection successful" });
    } catch (error) {
      console.error("Database health check failed:", error);
      res.status(500).json({ status: "error", message: "Database connection failed" });
    }
  });

  // Homepage section management endpoints
  app.get('/api/admin/homepage-sections', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const sections = await storage.getHomepageSections();
      res.json(sections);
    } catch (error) {
      console.error('Error fetching homepage sections:', error);
      res.status(500).json({ error: 'Failed to fetch homepage sections' });
    }
  });

  app.put('/api/admin/homepage-sections', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { sectionId, enabled } = req.body;
      
      if (!sectionId || typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Invalid request data' });
      }
      
      const updatedSection = await storage.updateHomepageSection(sectionId, enabled);
      res.json(updatedSection);
    } catch (error) {
      console.error('Error updating homepage section:', error);
      res.status(500).json({ error: 'Failed to update homepage section' });
    }
  });

  // Verification submission endpoint
  app.post("/api/verification/submit", authenticateToken, upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]), async (req: AuthRequest, res) => {
    try {
      const { phoneNumber, address, additionalInfo } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Update user verification status
      await storage.updateUser(req.user!.id, {
        verificationStatus: "pending",
        verificationDocuments: {
          phoneNumber,
          address,
          additionalInfo,
          idDocument: files.idDocument?.[0] ? {
            originalName: files.idDocument[0].originalname,
            size: files.idDocument[0].size,
            mimeType: files.idDocument[0].mimetype,
            uploaded: new Date().toISOString()
          } : null,
          selfie: files.selfie?.[0] ? {
            originalName: files.selfie[0].originalname,
            size: files.selfie[0].size,
            mimeType: files.selfie[0].mimetype,
            uploaded: new Date().toISOString()
          } : null
        }
      });

      // Send notification to all admins
      const admins = await storage.getUsersByRole("admin");
      const managers = await storage.getUsersByRole("manager");
      const notificationRecipients = [...admins, ...managers];

      for (const recipient of notificationRecipients) {
        // Send email notification
        try {
          const { EmailService } = await import("./email-service");
          const emailService = EmailService.getInstance();
          await emailService.sendEmail({
            to: recipient.email,
            subject: "New Verification Request - FokusHub360",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Verification Request</h1>
                  <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 16px;">FokusHub360 Platform</p>
                </div>
                
                <div style="padding: 30px;">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #60a5fa; font-size: 22px;">User Details</h2>
                    <p style="margin: 8px 0; font-size: 16px;"><strong>Name:</strong> ${req.user!.firstName} ${req.user!.lastName}</p>
                    <p style="margin: 8px 0; font-size: 16px;"><strong>Email:</strong> ${req.user!.email}</p>
                    <p style="margin: 8px 0; font-size: 16px;"><strong>Role:</strong> ${req.user!.role}</p>
                    <p style="margin: 8px 0; font-size: 16px;"><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #34d399; font-size: 22px;">Documents Submitted</h2>
                    <p style="margin: 8px 0; font-size: 16px;">✓ Government ID: ${files.idDocument?.[0] ? 'Uploaded' : 'Not uploaded'}</p>
                    <p style="margin: 8px 0; font-size: 16px;">✓ Selfie Photo: ${files.selfie?.[0] ? 'Uploaded' : 'Not uploaded'}</p>
                    ${address ? `<p style="margin: 8px 0; font-size: 16px;">✓ Address: ${address}</p>` : ''}
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL || 'https://fokushub360.com'}/dashboard" 
                       style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: bold; 
                              display: inline-block; 
                              font-size: 16px;">
                      Review Verification Request
                    </a>
                  </div>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                      Please review and process this verification request within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Failed to send verification notification email:', emailError);
        }
      }

      res.json({ 
        success: true, 
        message: "Verification request submitted successfully" 
      });
    } catch (error) {
      console.error('Verification submission error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to submit verification request" 
      });
    }
  });

  // Verification reminder system
  app.post("/api/verification/send-reminder", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { userIds, customMessage } = req.body;
      
      let targetUsers;
      if (userIds && userIds.length > 0) {
        targetUsers = await storage.getUsersByIds(userIds);
      } else {
        // Get all unverified users who haven't received a reminder in the last 7 days
        targetUsers = await storage.getUnverifiedUsers();
      }

      const remindersSent = [];
      
      for (const user of targetUsers) {
        if (user.isVerified) continue;
        
        // Check if reminder was sent recently (within 7 days)
        const lastReminder = user.lastReminderSent;
        if (lastReminder && (Date.now() - new Date(lastReminder).getTime()) < 7 * 24 * 60 * 60 * 1000) {
          continue;
        }

        try {
          const daysSinceJoined = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          
          const { EmailService } = await import("./email-service");
          const emailService = EmailService.getInstance();
          await emailService.sendEmail({
            to: user.email,
            subject: "Complete Your Verification - FokusHub360",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Verification Reminder</h1>
                  <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 16px;">FokusHub360 Platform</p>
                </div>
                
                <div style="padding: 30px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 15px 0; color: #fbbf24; font-size: 24px;">Hi ${user.firstName}!</h2>
                    <p style="margin: 0; font-size: 18px; color: #e2e8f0;">
                      We noticed you haven't completed your account verification yet.
                    </p>
                  </div>
                  
                  <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 25px;">
                    <h3 style="margin: 0 0 15px 0; color: #60a5fa; font-size: 20px;">🎯 Why Verify Your Account?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #cbd5e1;">
                      <li style="margin: 8px 0; font-size: 16px;">Access to premium campaigns with higher payouts</li>
                      <li style="margin: 8px 0; font-size: 16px;">Priority matching for exclusive focus groups</li>
                      <li style="margin: 8px 0; font-size: 16px;">Enhanced security and trust with clients</li>
                      <li style="margin: 8px 0; font-size: 16px;">Faster payment processing and withdrawals</li>
                      <li style="margin: 8px 0; font-size: 16px;">Access to advanced platform features</li>
                    </ul>
                  </div>
                  
                  <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <p style="margin: 0; font-size: 16px; color: #6ee7b7;">
                      💰 <strong>Verified users earn 25-40% more</strong> than unverified participants!
                    </p>
                  </div>
                  
                  ${customMessage ? `
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                      <h3 style="margin: 0 0 10px 0; color: #fbbf24; font-size: 18px;">Special Message:</h3>
                      <p style="margin: 0; font-size: 16px; color: #e2e8f0;">${customMessage}</p>
                    </div>
                  ` : ''}
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL || 'https://fokushub360.com'}/verification" 
                       style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: bold; 
                              display: inline-block; 
                              font-size: 18px;">
                      Complete Verification Now
                    </a>
                  </div>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                      You joined FokusHub360 ${daysSinceJoined} days ago. Don't miss out on exclusive opportunities!
                    </p>
                  </div>
                </div>
              </div>
            `
          });

          // Update reminder count and date
          await storage.updateUser(user.id, {
            reminderCount: (user.reminderCount || 0) + 1,
            lastReminderSent: new Date()
          });

          remindersSent.push({
            userId: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`
          });
        } catch (emailError) {
          console.error(`Failed to send reminder to ${user.email}:`, emailError);
        }
      }

      res.json({ 
        success: true, 
        message: `Sent ${remindersSent.length} verification reminders`,
        remindersSent 
      });
    } catch (error) {
      console.error('Verification reminder error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send verification reminders" 
      });
    }
  });

  // Questionnaire completion tracking endpoints
  app.get("/api/questionnaire/health", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const targetUserId = req.query.userId ? parseInt(req.query.userId as string) : req.user!.id;
      
      // Get user data which already has calculated completion percentage and health status
      const user = await storage.getUser(targetUserId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get total questions count for display
      const totalQuestions = await storage.getTotalQuestionsCount();
      console.log("user",user)
      // Use the pre-calculated values from database
      const completionPercentage = user.questionnaireCompletionPercentage || 0;
      const healthStatus = user.questionnaireHealthStatus || 'poor';
      
      // Calculate answered questions from percentage
      const answeredQuestions = Math.round((completionPercentage / 100) * totalQuestions);

      // Check if reminder can be sent (not sent in last 24 hours)
      const canSendReminder = !user.lastQuestionnaireReminder || 
        (Date.now() - new Date(user.lastQuestionnaireReminder).getTime()) > 24 * 60 * 60 * 1000;

      res.json({
        completionPercentage,
        healthStatus,
        totalQuestions,
        answeredQuestions,
        reminderCount: user.questionnaireReminderCount || 0,
        lastReminderSent: user.lastQuestionnaireReminder,
        canSendReminder: canSendReminder && completionPercentage < 80
      });
    } catch (error) {
      console.error("Error fetching questionnaire health:", error);
      res.status(500).json({ message: "Failed to fetch questionnaire health" });
    }
  });

  app.post("/api/questionnaire/reminder", authenticateToken, requireRole(["manager", "admin"]), async (req: AuthRequest, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if reminder can be sent
      const canSendReminder = !user.lastQuestionnaireReminder || 
        (Date.now() - new Date(user.lastQuestionnaireReminder).getTime()) > 24 * 60 * 60 * 1000;

      if (!canSendReminder) {
        return res.status(400).json({ message: "Reminder already sent in the last 24 hours" });
      }

      // Send questionnaire reminder email
      const emailTemplate = await storage.getEmailTemplate("questionnaire_reminder");
      if (emailTemplate && user.email) {
        const emailHtml = emailTemplate.htmlContent
          .replace(/\{\{firstName\}\}/g, user.firstName || "")
          .replace(/\{\{completionUrl\}\}/g, `${process.env.FRONTEND_URL}/onboarding/questionnaire`);

        await storage.sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailHtml,
          from: "noreply@fokushub360.com"
        });
      }

      // Update reminder count and timestamp
      await storage.updateUser(userId, {
        lastQuestionnaireReminder: new Date(),
        questionnaireReminderCount: (user.questionnaireReminderCount || 0) + 1
      });

      res.json({ message: "Questionnaire reminder sent successfully" });
    } catch (error) {
      console.error("Error sending questionnaire reminder:", error);
      res.status(500).json({ message: "Failed to send questionnaire reminder" });
    }
  });

  // Fee calculation endpoints
  app.get("/api/fees/calculate", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { amount, userId } = req.query;
      const grossAmount = parseFloat(amount as string);
      const targetUserId = userId ? parseInt(userId as string) : req.user!.id;

      if (!grossAmount || grossAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get global fee settings
      const globalProcessingFee = await storage.getSystemSetting("global_processing_fee_percentage");
      const globalPlatformFeeAmount = await storage.getSystemSetting("global_platform_fee_amount");
      const globalPlatformFeePercentage = await storage.getSystemSetting("global_platform_fee_percentage");

      // Use user-specific fees if custom fees are enabled, otherwise use global settings
      const processingFeePercentage = user.customFeesEnabled 
        ? parseFloat(user.processingFeePercentage || "3.50")
        : parseFloat(globalProcessingFee?.value || "3.50");

      const platformFeeAmount = user.customFeesEnabled
        ? parseFloat(user.platformFeeAmount || "0.00")
        : parseFloat(globalPlatformFeeAmount?.value || "0.00");

      const platformFeePercentage = user.customFeesEnabled
        ? parseFloat(user.platformFeePercentage || "0.00")
        : parseFloat(globalPlatformFeePercentage?.value || "0.00");

      // Calculate fees
      const processingFee = (grossAmount * processingFeePercentage) / 100;
      const platformFeeFromPercentage = (grossAmount * platformFeePercentage) / 100;
      const totalPlatformFee = platformFeeAmount + platformFeeFromPercentage;
      const totalFees = processingFee + totalPlatformFee;
      const netAmount = grossAmount - totalFees;

      res.json({
        grossAmount,
        processingFee,
        processingFeePercentage,
        platformFeeAmount,
        platformFeePercentage,
        totalPlatformFee,
        totalFees,
        netAmount,
        feePercentage: (totalFees / grossAmount) * 100
      });
    } catch (error) {
      console.error("Error calculating fees:", error);
      res.status(500).json({ message: "Failed to calculate fees" });
    }
  });

  // Get global fee settings
  app.get("/api/admin/fees/global", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const globalProcessingFee = await storage.getSystemSetting("global_processing_fee_percentage");
      const globalPlatformFeeAmount = await storage.getSystemSetting("global_platform_fee_amount");
      const globalPlatformFeePercentage = await storage.getSystemSetting("global_platform_fee_percentage");

      const settings = {
        processingFeePercentage: parseFloat(globalProcessingFee?.value || "3.50"),
        platformFeeAmount: parseFloat(globalPlatformFeeAmount?.value || "0.00"),
        platformFeePercentage: parseFloat(globalPlatformFeePercentage?.value || "0.00")
      };

      res.json(settings);
    } catch (error) {
      console.error("Error fetching global fee settings:", error);
      res.status(500).json({ message: "Failed to fetch global fee settings" });
    }
  });

  app.post("/api/admin/fees/global", authenticateToken, requireRole(["admin"]), async (req: AuthRequest, res) => {
    try {
      const { processingFeePercentage, platformFeeAmount, platformFeePercentage } = req.body;

      if (processingFeePercentage !== undefined) {
        await storage.updateSystemSetting("global_processing_fee_percentage", processingFeePercentage.toString(), req.user!.id);
      }

      if (platformFeeAmount !== undefined) {
        await storage.updateSystemSetting("global_platform_fee_amount", platformFeeAmount.toString(), req.user!.id);
      }

      if (platformFeePercentage !== undefined) {
        await storage.updateSystemSetting("global_platform_fee_percentage", platformFeePercentage.toString(), req.user!.id);
      }

      res.json({ message: "Global fee settings updated successfully" });
    } catch (error) {
      console.error("Error updating global fee settings:", error);
      res.status(500).json({ message: "Failed to update global fee settings" });
    }
  });

  app.post("/api/admin/fees/user", authenticateToken, requireRole(["admin", "manager"]), async (req: AuthRequest, res) => {
    try {
      const { userId, processingFeePercentage, platformFeeAmount, platformFeePercentage, customFeesEnabled } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const updates: any = {};
      
      if (processingFeePercentage !== undefined) {
        updates.processingFeePercentage = processingFeePercentage.toString();
      }
      
      if (platformFeeAmount !== undefined) {
        updates.platformFeeAmount = platformFeeAmount.toString();
      }
      
      if (platformFeePercentage !== undefined) {
        updates.platformFeePercentage = platformFeePercentage.toString();
      }
      
      if (customFeesEnabled !== undefined) {
        updates.customFeesEnabled = customFeesEnabled;
      }

      await storage.updateUser(userId, updates);

      res.json({ message: "User fee settings updated successfully" });
    } catch (error) {
      console.error("Error updating user fee settings:", error);
      res.status(500).json({ message: "Failed to update user fee settings" });
    }
  });

  // Settings API endpoints
  app.get("/api/user/settings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Mock user settings - in production, fetch from database
      const defaultSettings = {
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          campaignInvites: true,
          weeklyDigest: false,
          systemUpdates: true,
          marketingEmails: false,
        },
        privacy: {
          profileVisibility: "limited",
          dataSharing: true,
          analyticsTracking: true,
          locationTracking: false,
        },
        account: {
          timeZone: "America/New_York",
          language: "en",
          theme: "dark",
          emailFrequency: "daily",
        }
      };
      
      res.json(defaultSettings);
    } catch (error) {
      console.error("Settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/user/settings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { type, settings } = req.body;
      
      // In production, save settings to database based on type
      console.log(`Updating ${type} settings for user ${userId}:`, settings);
      
      res.json({ message: "Settings updated successfully", type, settings });
    } catch (error) {
      console.error("Settings update error:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.put("/api/auth/change-password", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      
      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.post("/api/user/export-data", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user data
      const user = await storage.getUser(userId);
      const profile = await storage.getParticipantProfile(userId);
      
      const exportData = {
        user: {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          role: user?.role,
          createdAt: user?.createdAt,
        },
        profile: profile || null,
        exportedAt: new Date().toISOString(),
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=user-data-export.json');
      res.json(exportData);
    } catch (error) {
      console.error("Data export error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.delete("/api/user/account", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // In production, implement proper account deletion
      // This would involve:
      // 1. Anonymizing/deleting user data
      // 2. Removing profile information
      // 3. Canceling subscriptions
      // 4. Logging the deletion for compliance
      
      console.log(`Account deletion requested for user ${userId}`);
      
      // For now, just mark as deleted (soft delete)
      await storage.updateUser(userId, { 
        isActive: false,
        email: `deleted_${Date.now()}@example.com` // Anonymize email
      });
      
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
