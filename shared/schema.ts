import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 20 }).notNull().default("client"), // client, participant, manager, admin
  profileImageUrl: text("profile_image_url"),
  isActive: boolean("is_active").default(true),
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: varchar("verification_status", { length: 20 }).default("unverified"), // pending, approved, rejected
  verificationDocuments: jsonb("verification_documents"), // ID, address proof, etc.
  verificationDate: timestamp("verification_date"),
  verifiedBy: integer("verified_by"), // admin who verified
  reminderCount: integer("reminder_count").default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
  lastLogin: timestamp("last_login"),
  sessionDuration: integer("session_duration").default(7200), // 2 hours in seconds
  warningCount: integer("warning_count").default(0),
  maxWarnings: integer("max_warnings").default(3),
  questionnaireCompleted: boolean("questionnaire_completed").default(false),
  questionnaireCompletionPercentage: integer("questionnaire_completion_percentage").default(0),
  questionnaireHealthStatus: varchar("questionnaire_health_status", { length: 20 }).default("poor"), // poor, fair, good, great, excellent
  lastQuestionnaireReminder: timestamp("last_questionnaire_reminder"),
  questionnaireReminderCount: integer("questionnaire_reminder_count").default(0),
  processingFeePercentage: decimal("processing_fee_percentage", { precision: 5, scale: 2 }).default("3.50"), // 3.5% default
  platformFeeAmount: decimal("platform_fee_amount", { precision: 10, scale: 2 }).default("0.00"),
  platformFeePercentage: decimal("platform_fee_percentage", { precision: 5, scale: 2 }).default("0.00"),
  customFeesEnabled: boolean("custom_fees_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Participant profiles with detailed attributes
export const participantProfiles = pgTable("participant_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  demographics: jsonb("demographics"), // age, gender, DOB, ethnicity, location, income, etc.
  beliefs: jsonb("beliefs"), // religion, political affiliation, personal values
  lifestyle: jsonb("lifestyle"), // hobbies, work-life balance, fitness, shopping habits
  contentHabits: jsonb("content_habits"), // media preferences, tech usage, content consumption
  behavior: jsonb("behavior"), // career, buying behavior, psychographics, decision-making
  paymentMethods: jsonb("payment_methods"), // payment method preferences (Zelle, CashApp, PayPal, etc.)
  tags: text("tags").array(), // searchable tags for matching
  completionScore: integer("completion_score").default(0), // profile completion percentage
  isProfileComplete: boolean("is_profile_complete").default(false), // tracks if required fields are complete
  lastSaveTime: timestamp("last_save_time").defaultNow(), // auto-save tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Question categories for admin management
export const questionCategories = pgTable("question_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual questions for the onboarding process
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => questionCategories.id).notNull(),
  question: text("question").notNull(),
  questionType: varchar("question_type", { length: 50 }).notNull(), // text, select, multiselect, scale, boolean
  options: jsonb("options"), // for select/multiselect questions
  isRequired: boolean("is_required").default(true),
  isEnabled: boolean("is_enabled").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Participant responses to questions
export const participantResponses = pgTable("participant_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  response: jsonb("response"), // flexible response format
  respondedAt: timestamp("responded_at").defaultNow(),
});

// AI-driven behavioral analysis results
export const behavioralAnalysis = pgTable("behavioral_analysis", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").references(() => users.id).notNull(),
  analysisType: varchar("analysis_type", { length: 50 }).notNull(), // full_profile, campaign_specific, periodic_update
  behavioralProfile: jsonb("behavioral_profile"), // comprehensive behavioral insights
  personalityTraits: jsonb("personality_traits"), // Big Five, DISC, etc.
  motivationalFactors: jsonb("motivational_factors"), // what drives the participant
  decisionMakingStyle: jsonb("decision_making_style"), // analytical, intuitive, etc.
  communicationPreferences: jsonb("communication_preferences"), // verbal, visual, etc.
  adaptabilityScore: integer("adaptability_score"), // 1-100 scale
  influenceFactors: jsonb("influence_factors"), // peer pressure, authority, etc.
  riskTolerance: varchar("risk_tolerance", { length: 20 }), // low, medium, high
  innovationAdoption: varchar("innovation_adoption", { length: 30 }), // innovator, early_adopter, etc.
  socialEngagementLevel: integer("social_engagement_level"), // 1-10 scale
  brandAffinityPatterns: jsonb("brand_affinity_patterns"), // brand loyalty analysis
  purchaseDecisionFactors: jsonb("purchase_decision_factors"), // price, quality, reviews, etc.
  contentConsumptionBehavior: jsonb("content_consumption_behavior"), // when, how, what type
  feedbackQuality: integer("feedback_quality"), // historical feedback quality score
  responseReliability: integer("response_reliability"), // consistency in responses
  engagementPrediction: integer("engagement_prediction"), // predicted engagement level
  confidenceScore: integer("confidence_score"), // AI confidence in analysis
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Participant matching history and results
export const matchingHistory = pgTable("matching_history", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  participantId: integer("participant_id").references(() => users.id).notNull(),
  matchScore: integer("match_score"), // 1-100 scale
  confidence: integer("confidence"), // AI confidence in match
  matchReasons: jsonb("match_reasons"), // why this participant was matched
  behavioralInsights: jsonb("behavioral_insights"), // specific insights for this match
  segmentClassification: varchar("segment_classification", { length: 50 }), // market segment
  engagementPrediction: integer("engagement_prediction"), // predicted engagement
  actualEngagement: integer("actual_engagement"), // actual engagement (for learning)
  feedbackQuality: integer("feedback_quality"), // quality of feedback provided
  completionRate: integer("completion_rate"), // percentage of tasks completed
  responseTime: integer("response_time"), // average response time in hours
  matchingAlgorithmVersion: varchar("matching_algorithm_version", { length: 20 }), // for A/B testing
  isSelected: boolean("is_selected").default(false), // was this participant selected
  selectionReason: text("selection_reason"), // why selected or not selected
  campaignOutcome: varchar("campaign_outcome", { length: 30 }), // completed, dropped_out, etc.
  learningFeedback: jsonb("learning_feedback"), // feedback for improving matching
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign-specific matching criteria and results
export const campaignMatching = pgTable("campaign_matching", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  matchingCriteria: jsonb("matching_criteria"), // criteria used for matching
  totalParticipants: integer("total_participants"), // total participants evaluated
  matchedParticipants: integer("matched_participants"), // participants that matched
  averageMatchScore: integer("average_match_score"), // average match score
  topMatchingFactors: jsonb("top_matching_factors"), // most important factors
  segmentDistribution: jsonb("segment_distribution"), // distribution across segments
  diversityScore: integer("diversity_score"), // diversity of selected participants
  qualityScore: integer("quality_score"), // overall quality of matches
  algorithmVersion: varchar("algorithm_version", { length: 20 }),
  processingTime: integer("processing_time"), // time taken to process in ms
  createdAt: timestamp("created_at").defaultNow(),
});

// AI learning feedback and model improvements
export const aiLearningFeedback = pgTable("ai_learning_feedback", {
  id: serial("id").primaryKey(),
  matchingHistoryId: integer("matching_history_id").references(() => matchingHistory.id),
  feedbackType: varchar("feedback_type", { length: 50 }), // performance, accuracy, bias, etc.
  feedbackData: jsonb("feedback_data"), // structured feedback data
  improvementSuggestions: jsonb("improvement_suggestions"), // AI-generated suggestions
  humanFeedback: text("human_feedback"), // human supervisor feedback
  actionTaken: text("action_taken"), // what actions were taken
  impactMeasured: boolean("impact_measured").default(false), // was impact measured
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaigns/Focus Groups
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  managerId: integer("manager_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetAudience: jsonb("target_audience"), // demographics, criteria
  questions: jsonb("questions"), // structured questions
  participantCount: integer("participant_count").default(10),
  rewardType: varchar("reward_type", { length: 50 }).default("cash"), // cash, gift, product
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  reportLevel: varchar("report_level", { length: 20 }).default("basic"), // basic, advanced
  status: varchar("status", { length: 20 }).default("draft"), // draft, pending_review, active, completed, cancelled
  watermarkEnabled: boolean("watermark_enabled").default(false),
  inviteDeadline: timestamp("invite_deadline"),
  completionDeadline: timestamp("completion_deadline"),
  // Pricing and payment information
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).default("299.00"),
  participantCost: decimal("participant_cost", { precision: 10, scale: 2 }).default("15.00"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, completed, failed
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  paidAt: timestamp("paid_at"),
  // Campaign type for pricing
  campaignType: varchar("campaign_type", { length: 50 }).default("standard"), // standard, premium, enterprise
  contentType: varchar("content_type", { length: 50 }), // video, image, text, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaign assets (images, videos, etc.)
export const campaignAssets = pgTable("campaign_assets", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: integer("file_size"),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign participants (many-to-many relationship)
export const campaignParticipants = pgTable("campaign_participants", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  participantId: integer("participant_id").references(() => users.id).notNull(),
  invitedBy: integer("invited_by").references(() => users.id), // manager who invited
  invitedAt: timestamp("invited_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  responseDeadline: timestamp("response_deadline"), // 48 hours from invitation
  status: varchar("status", { length: 20 }).default("invited"), // invited, accepted, declined, completed, expired
  feedback: jsonb("feedback"), // participant responses
  rating: integer("rating"), // 1-5 star rating
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  rewardType: varchar("reward_type", { length: 50 }), // cash, gift_card, points, etc.
});

// Admin settings for platform configuration
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).default("general"), // general, security, campaigns, etc.
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // campaign_invite, deadline_warning, ban_warning, etc.
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // additional data for the notification
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User warnings and infractions
export const userWarnings = pgTable("user_warnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  warningType: varchar("warning_type", { length: 50 }).notNull(), // missed_deadline, inappropriate_content, etc.
  reason: text("reason").notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  issuedBy: integer("issued_by").references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Reports and analytics
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  reportData: jsonb("report_data"), // AI-generated insights, charts, etc.
  sentimentAnalysis: jsonb("sentiment_analysis"),
  keywordInsights: jsonb("keyword_insights"),
  aiSuggestions: jsonb("ai_suggestions"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Messages table for admin/manager to participant communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 50 }).default("general"), // general, warning, campaign_invite, system
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  parentMessageId: integer("parent_message_id"), // for replies
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sentiment analysis for participant feedback
export const sentimentAnalysis = pgTable("sentiment_analysis", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  participantId: integer("participant_id").references(() => users.id).notNull(),
  responseId: integer("response_id"), // reference to specific response
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }), // -1.0 to 1.0
  emotions: jsonb("emotions"), // detected emotions with confidence scores
  keywords: jsonb("keywords"), // key phrases and their sentiment
  suggestions: jsonb("suggestions"), // actionable feedback suggestions
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0.0 to 1.0
  analysisType: varchar("analysis_type", { length: 50 }).default("realtime"), // realtime, batch, detailed
  createdAt: timestamp("created_at").defaultNow(),
});

// Content protection tables
export const watermarkConfigs = pgTable("watermark_configs", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => campaignAssets.id),
  userId: integer("user_id").references(() => users.id),
  config: jsonb("config").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentUsage = pgTable("content_usage", {
  id: varchar("id", { length: 21 }).primaryKey(),
  assetId: integer("asset_id").references(() => campaignAssets.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  userId: integer("user_id").references(() => users.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").default({}),
});

export const securityViolations = pgTable("security_violations", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => campaignAssets.id),
  userId: integer("user_id").references(() => users.id),
  violationType: varchar("violation_type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}),
});

export const contentProtection = pgTable("content_protection", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => campaignAssets.id),
  watermarkConfig: jsonb("watermark_config").notNull(),
  downloadProtection: boolean("download_protection").default(false),
  viewTracking: boolean("view_tracking").default(true),
  expirationDate: timestamp("expiration_date"),
  allowedViewers: jsonb("allowed_viewers").default([]),
  maxViews: integer("max_views"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const secureTokens = pgTable("secure_tokens", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 64 }).unique().notNull(),
  assetId: integer("asset_id").references(() => campaignAssets.id),
  userId: integer("user_id").references(() => users.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pricing configuration for different campaign types
export const pricingConfig = pgTable("pricing_config", {
  id: serial("id").primaryKey(),
  campaignType: varchar("campaign_type", { length: 50 }).notNull(), // standard, premium, enterprise
  contentType: varchar("content_type", { length: 50 }).notNull(), // video, image, text, etc.
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).notNull(),
  participantCost: decimal("participant_cost", { precision: 10, scale: 2 }).notNull(),
  includedParticipants: integer("included_participants").default(10),
  maxParticipants: integer("max_participants").default(100),
  features: jsonb("features"), // included features
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invitation system tables
export const invitationWaitlist = pgTable("invitation_waitlist", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }), // Optional phone number
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 100 }),
  message: text("message"), // Optional message from user
  isInvited: boolean("is_invited").default(false),
  invitedAt: timestamp("invited_at"),
  invitedBy: integer("invited_by").references(() => users.id), // admin who sent invitation
  status: varchar("status", { length: 20 }).default("pending"), // pending, invited, registered, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System settings for invitation control
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  setting: varchar("setting", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email templates for admin management
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  templateKey: varchar("template_key", { length: 100 }).notNull().unique(), // welcome_client, welcome_participant, password_reset, etc.
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  htmlContent: text("html_content").notNull(),
  isActive: boolean("is_active").default(true),
  variables: jsonb("variables"), // Available template variables like {firstName}, {loginUrl}, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

// Verification documents table
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  docType: varchar("doc_type", { length: 20 }).notNull(), // id, address, selfie
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Verification submissions table
export const verificationSubmissions = pgTable("verification_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  documents: jsonb("documents").notNull(), // array of document info
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
});

// Legal documents table
export const legalDocuments = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // privacy_policy, terms_of_service, data_rights
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  version: varchar("version", { length: 20 }).default("1.0"),
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Home page content management
export const homePageContent = pgTable("home_page_content", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 100 }).notNull(), // hero, features, testimonials, etc.
  title: varchar("title", { length: 255 }),
  subtitle: text("subtitle"),
  content: text("content"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  buttonText: varchar("button_text", { length: 100 }),
  buttonUrl: text("button_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  metadata: jsonb("metadata"), // Additional flexible data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  campaigns: many(campaigns, { relationName: "clientCampaigns" }),
  managedCampaigns: many(campaigns, { relationName: "managerCampaigns" }),
  participantProfile: one(participantProfiles),
  participations: many(campaignParticipants),
  notifications: many(notifications),
  warnings: many(userWarnings),
  invitedParticipants: many(campaignParticipants, { relationName: "invitedBy" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
}));

export const participantProfilesRelations = relations(participantProfiles, ({ one }) => ({
  user: one(users, {
    fields: [participantProfiles.userId],
    references: [users.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  client: one(users, {
    fields: [campaigns.clientId],
    references: [users.id],
    relationName: "clientCampaigns",
  }),
  manager: one(users, {
    fields: [campaigns.managerId],
    references: [users.id],
    relationName: "managerCampaigns",
  }),
  assets: many(campaignAssets),
  participants: many(campaignParticipants),
  reports: many(reports),
}));

export const campaignAssetsRelations = relations(campaignAssets, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignAssets.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignParticipantsRelations = relations(campaignParticipants, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignParticipants.campaignId],
    references: [campaigns.id],
  }),
  participant: one(users, {
    fields: [campaignParticipants.participantId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [campaignParticipants.invitedBy],
    references: [users.id],
    relationName: "invitedBy",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const userWarningsRelations = relations(userWarnings, ({ one }) => ({
  user: one(users, {
    fields: [userWarnings.userId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [userWarnings.campaignId],
    references: [campaigns.id],
  }),
  issuedBy: one(users, {
    fields: [userWarnings.issuedBy],
    references: [users.id],
  }),
}));

export const adminSettingsRelations = relations(adminSettings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [adminSettings.updatedBy],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [reports.campaignId],
    references: [campaigns.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
  parentMessage: one(messages, {
    fields: [messages.parentMessageId],
    references: [messages.id],
  }),
}));

// New relations for questionnaire system
export const questionCategoriesRelations = relations(questionCategories, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  category: one(questionCategories, {
    fields: [questions.categoryId],
    references: [questionCategories.id],
  }),
  responses: many(participantResponses),
}));

export const participantResponsesRelations = relations(participantResponses, ({ one }) => ({
  user: one(users, {
    fields: [participantResponses.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [participantResponses.questionId],
    references: [questions.id],
  }),
}));

// AI matching system relations
export const behavioralAnalysisRelations = relations(behavioralAnalysis, ({ one }) => ({
  participant: one(users, {
    fields: [behavioralAnalysis.participantId],
    references: [users.id],
  }),
}));

export const matchingHistoryRelations = relations(matchingHistory, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [matchingHistory.campaignId],
    references: [campaigns.id],
  }),
  participant: one(users, {
    fields: [matchingHistory.participantId],
    references: [users.id],
  }),
}));

export const campaignMatchingRelations = relations(campaignMatching, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignMatching.campaignId],
    references: [campaigns.id],
  }),
}));

export const aiLearningFeedbackRelations = relations(aiLearningFeedback, ({ one }) => ({
  matchingHistory: one(matchingHistory, {
    fields: [aiLearningFeedback.matchingHistoryId],
    references: [matchingHistory.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

export const insertParticipantProfileSchema = createInsertSchema(participantProfiles).pick({
  userId: true,
  demographics: true,
  beliefs: true,
  lifestyle: true,
  contentHabits: true,
  behavior: true,
  paymentMethods: true,
  tags: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  clientId: true,
  title: true,
  description: true,
  targetAudience: true,
  questions: true,
  participantCount: true,
  rewardType: true,
  rewardAmount: true,
  reportLevel: true,
});

// Additional insert schemas for questionnaire system
export const insertQuestionCategorySchema = createInsertSchema(questionCategories).pick({
  name: true,
  description: true,
  isEnabled: true,
  sortOrder: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  categoryId: true,
  question: true,
  questionType: true,
  options: true,
  isRequired: true,
  isEnabled: true,
  sortOrder: true,
});

export const insertParticipantResponseSchema = createInsertSchema(participantResponses).pick({
  userId: true,
  questionId: true,
  response: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  recipientId: true,
  subject: true,
  content: true,
  messageType: true,
  priority: true,
  parentMessageId: true,
});

export const insertCampaignAssetSchema = createInsertSchema(campaignAssets).pick({
  campaignId: true,
  fileName: true,
  fileType: true,
  fileUrl: true,
  fileSize: true,
  description: true,
});

export const insertCampaignParticipantSchema = createInsertSchema(campaignParticipants).pick({
  campaignId: true,
  participantId: true,
  status: true,
  invitedAt: true,
  acceptedAt: true,
  declinedAt: true,
  completedAt: true,
  responseDeadline: true,
  responseData: true,
  rating: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ParticipantProfile = typeof participantProfiles.$inferSelect;
export type InsertParticipantProfile = z.infer<typeof insertParticipantProfileSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CampaignAsset = typeof campaignAssets.$inferSelect;
export type InsertCampaignAsset = z.infer<typeof insertCampaignAssetSchema>;
export type CampaignParticipant = typeof campaignParticipants.$inferSelect;
export type InsertCampaignParticipant = z.infer<typeof insertCampaignParticipantSchema>;
export type Report = typeof reports.$inferSelect;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type ParticipantResponse = typeof participantResponses.$inferSelect;
export type InsertParticipantResponse = z.infer<typeof insertParticipantResponseSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// New types for questionnaire system
export type QuestionCategory = typeof questionCategories.$inferSelect;
export type InsertQuestionCategory = z.infer<typeof insertQuestionCategorySchema>;

// Invitation system types
export type InvitationWaitlist = typeof invitationWaitlist.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// Insert schemas for invitation system
export const insertInvitationWaitlistSchema = createInsertSchema(invitationWaitlist).pick({
  firstName: true,
  lastName: true,
  email: true,
  company: true,
  jobTitle: true,
  message: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).pick({
  setting: true,
  value: true,
  description: true,
  updatedBy: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).pick({
  templateKey: true,
  name: true,
  subject: true,
  htmlContent: true,
  isActive: true,
  variables: true,
  description: true,
  updatedBy: true,
});

export type InsertInvitationWaitlist = z.infer<typeof insertInvitationWaitlistSchema>;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;



// AI matching system types
export type BehavioralAnalysis = typeof behavioralAnalysis.$inferSelect;
export type MatchingHistory = typeof matchingHistory.$inferSelect;
export type CampaignMatching = typeof campaignMatching.$inferSelect;
export type AILearningFeedback = typeof aiLearningFeedback.$inferSelect;

// Verification types
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type VerificationSubmission = typeof verificationSubmissions.$inferSelect;

// Legal documents and home page content types
export type LegalDocument = typeof legalDocuments.$inferSelect;
export type InsertLegalDocument = typeof legalDocuments.$inferInsert;

export type HomePageContent = typeof homePageContent.$inferSelect;
export type InsertHomePageContent = typeof homePageContent.$inferInsert;

export const insertLegalDocumentSchema = createInsertSchema(legalDocuments).pick({
  type: true,
  title: true,
  content: true,
  version: true,
  isActive: true,
  effectiveDate: true,
});

export const insertHomePageContentSchema = createInsertSchema(homePageContent).pick({
  section: true,
  title: true,
  subtitle: true,
  content: true,
  imageUrl: true,
  videoUrl: true,
  buttonText: true,
  buttonUrl: true,
  isActive: true,
  sortOrder: true,
  metadata: true,
});

// Additional insert schemas
export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  data: true,
});

export const insertUserWarningSchema = createInsertSchema(userWarnings).pick({
  userId: true,
  warningType: true,
  reason: true,
  campaignId: true,
  issuedBy: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).pick({
  key: true,
  value: true,
  description: true,
  category: true,
  updatedBy: true,
});

// New types for extended functionality
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type UserWarning = typeof userWarnings.$inferSelect;
export type InsertUserWarning = z.infer<typeof insertUserWarningSchema>;

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;



// Email segmentation and campaign management
export const emailSegments = pgTable("email_segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  criteria: jsonb("criteria").notNull(), // JSON object with segmentation criteria
  userCount: integer("user_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  updatedBy: integer("updated_by").references(() => users.id)
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  design: jsonb("design").notNull(), // EmailDesign object
  content: jsonb("content").notNull(), // EmailContent object
  segmentId: integer("segment_id").references(() => emailSegments.id),
  recipients: jsonb("recipients"), // Array of email addresses
  status: text("status").default("draft").notNull(), // draft, scheduled, sending, sent, failed
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  totalRecipients: integer("total_recipients").default(0),
  successfulDeliveries: integer("successful_deliveries").default(0),
  failedDeliveries: integer("failed_deliveries").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull()
});



// User legal document acceptances
export const userLegalAcceptances = pgTable("user_legal_acceptances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentId: integer("document_id").references(() => legalDocuments.id).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  documentVersion: varchar("document_version", { length: 20 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  acceptedAt: timestamp("accepted_at").defaultNow(),
});

// Insert schemas for email system
export const insertEmailSegmentSchema = createInsertSchema(emailSegments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userCount: true
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  totalRecipients: true,
  successfulDeliveries: true,
  failedDeliveries: true,
  openCount: true,
  clickCount: true
});

// New types for sentiment analysis and pricing
export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;
export type PricingConfig = typeof pricingConfig.$inferSelect;

// Email system types
export type EmailSegment = typeof emailSegments.$inferSelect;
export type InsertEmailSegment = z.infer<typeof insertEmailSegmentSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;

export const insertUserLegalAcceptanceSchema = createInsertSchema(userLegalAcceptances).omit({
  id: true,
  acceptedAt: true,
});

export type UserLegalAcceptance = typeof userLegalAcceptances.$inferSelect;
export type InsertUserLegalAcceptance = z.infer<typeof insertUserLegalAcceptanceSchema>;
