
import { 
  users, 
  participantProfiles, 
  campaigns, 
  campaignAssets, 
  campaignParticipants, 
  reports,
  questionCategories,
  questions,
  participantResponses,
  adminSettings,
  notifications,
  userWarnings,
  messages,
  sentimentAnalysis,
  pricingConfig,
  watermarkConfigs,
  contentUsage,
  securityViolations,
  contentProtection,
  secureTokens,
  behavioralAnalysis,
  matchingHistory,
  campaignMatching,
  aiLearningFeedback,
  verificationDocuments,
  verificationSubmissions,
  invitationWaitlist,
  systemSettings,
  passwordResetTokens,
  emailSegments,
  emailCampaigns,
  legalDocuments,
  userLegalAcceptances,
  homePageContent,
  type User, 
  type InsertUser,
  type ParticipantProfile,
  type InsertParticipantProfile,
  type Campaign,
  type InsertCampaign,
  type CampaignAsset,
  type InsertCampaignAsset,
  type CampaignParticipant,
  type InsertCampaignParticipant,
  type Report,
  type QuestionCategory,
  type InsertQuestionCategory,
  type Question,
  type InsertQuestion,
  type ParticipantResponse,
  type InsertParticipantResponse,
  type AdminSetting,
  type InsertAdminSetting,
  type Notification,
  type InsertNotification,
  type UserWarning,
  type InsertUserWarning,
  type Message,
  type InsertMessage,
  type SentimentAnalysis,
  type PricingConfig,
  type BehavioralAnalysis,
  type MatchingHistory,
  type CampaignMatching,
  type AILearningFeedback,
  type VerificationDocument,
  type VerificationSubmission,
  type InvitationWaitlist,
  type InsertInvitationWaitlist,
  type SystemSettings,
  type InsertSystemSettings,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type EmailSegment,
  type InsertEmailSegment,
  type EmailCampaign,
  type InsertEmailCampaign,
  type LegalDocument,
  type InsertLegalDocument,
  type UserLegalAcceptance,
  type InsertUserLegalAcceptance,
  type HomePageContent,
  type InsertHomePageContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, isNull, isNotNull, inArray, like, not, ne, gte, lte, lt, count, sql } from "drizzle-orm";
import { generateSignedUrl, getPublicUrl } from "./storage/wasabi";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Participant profile operations
  getParticipantProfile(userId: number): Promise<ParticipantProfile | undefined>;
  createParticipantProfile(profile: InsertParticipantProfile): Promise<ParticipantProfile>;
  updateParticipantProfile(userId: number, updates: Partial<ParticipantProfile>): Promise<ParticipantProfile>;
  
  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByClient(clientId: number): Promise<Campaign[]>;
  getCampaignsByManager(managerId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  createCampaignAsset(asset: any): Promise<CampaignAsset>;
  getCampaignAssets(campaignId: number): Promise<CampaignAsset[]>;
  
  // Dashboard operations
  getClientDashboardData(clientId: number): Promise<any>;
  getParticipantDashboardData(participantId: number): Promise<any>;
  getManagerDashboardData(managerId: number): Promise<any>;
  getAdminDashboardData(): Promise<any>;
  
  // Questionnaire operations
  getQuestionCategories(): Promise<QuestionCategory[]>;
  getQuestionsByCategory(categoryId: number): Promise<Question[]>;
  getParticipantResponses(userId: number): Promise<ParticipantResponse[]>;
  saveParticipantResponse(response: InsertParticipantResponse): Promise<ParticipantResponse>;
  updateParticipantProfile(userId: number, profile: Partial<ParticipantProfile>): Promise<ParticipantProfile>;
  
  // Admin questionnaire operations
  createQuestionCategory(category: InsertQuestionCategory): Promise<QuestionCategory>;
  updateQuestionCategory(id: number, updates: Partial<QuestionCategory>): Promise<QuestionCategory>;
  deleteQuestionCategory(id: number): Promise<void>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, updates: Partial<Question>): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;
  
  // Admin settings operations
  getAdminSettings(): Promise<AdminSetting[]>;
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  createAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  updateAdminSetting(key: string, setting: Partial<AdminSetting>): Promise<AdminSetting>;
  deleteAdminSetting(key: string): Promise<void>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  getNotification(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<void>;
  getUnverifiedUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByIds(userIds: number[]): Promise<User[]>;
  
  // Warning operations
  getUserWarnings(userId: number): Promise<UserWarning[]>;
  createUserWarning(warning: InsertUserWarning): Promise<UserWarning>;
  
  // Campaign participant operations
  inviteParticipant(campaignId: number, participantId: number, invitedBy: number): Promise<CampaignParticipant>;
  respondToInvitation(invitationId: number, response: 'accept' | 'decline'): Promise<CampaignParticipant>;
  getParticipantInvitations(participantId: number): Promise<CampaignParticipant[]>;
  createCampaignParticipant(participant: any): Promise<CampaignParticipant>;
  
  // Manager operations
  getManagerParticipants(managerId: number): Promise<User[]>;
  banParticipant(participantId: number, reason: string, bannedBy: number): Promise<User>;
  unbanParticipant(participantId: number): Promise<User>;
  warnParticipant(participantId: number, reason: string, issuedBy: number): Promise<UserWarning>;
  
  // Profile completion operations
  savePartialProfile(userId: number, profileData: any): Promise<ParticipantProfile>;
  checkProfileCompletion(userId: number): Promise<{ isComplete: boolean; completionScore: number }>;
  
  // Messaging operations
  sendMessage(senderId: number, recipientId: number, subject: string, content: string, messageType?: string, priority?: string): Promise<Message>;
  getUserMessages(userId: number, messageType?: string): Promise<Message[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  getConversation(userId1: number, userId2: number): Promise<Message[]>;
  
  // Location operations
  getLocationStats(): Promise<{
    stats: {
      total: number;
      byCountry: Record<string, number>;
      byState: Record<string, number>;
      byCity: Record<string, number>;
    };
    locations: {
      countries: string[];
      states: string[];
      cities: string[];
    };
  }>;

  // AI Matching operations
  getActiveParticipantsWithProfiles(): Promise<Array<User & { profile: ParticipantProfile }>>;
  storeMatchingInsights(campaignId: number, insights: any): Promise<void>;
  getEligibleParticipants(criteria: any): Promise<User[]>;
  getBehavioralAnalysis(participantId: number): Promise<BehavioralAnalysis | undefined>;
  storeBehavioralAnalysis(analysis: BehavioralAnalysis): Promise<BehavioralAnalysis>;
  storeMatchingHistory(history: Partial<MatchingHistory>): Promise<MatchingHistory>;
  storeCampaignMatching(matching: Partial<CampaignMatching>): Promise<CampaignMatching>;
  storeAILearningFeedback(feedback: Partial<AILearningFeedback>): Promise<AILearningFeedback>;
  updateMatchingHistory(campaignId: number, participantId: number, updates: any): Promise<MatchingHistory>;
  getMatchingHistory(campaignId: number, participantId: number): Promise<MatchingHistory | undefined>;
  getHistoricalMatchingData(targetAudience: any): Promise<any[]>;
  
  // Verification operations
  getVerificationStats(): Promise<{
    total: number;
    verified: number;
    pending: number;
    verificationRate: number;
  }>;
  getUnverifiedParticipants(): Promise<User[]>;
  getVerifiedParticipants(): Promise<User[]>;
  updateVerificationStatus(userId: number, status: string, isVerified: boolean): Promise<User>;
  
  // Pricing operations
  getPricingConfigs(): Promise<PricingConfig[]>;
  updateCampaignPricing(campaignId: number, pricing: {
    baseCost: number;
    participantCost: number;
    totalCost: number;
    campaignType: string;
    contentType: string;
  }): Promise<Campaign>;
  
  // Campaign review operations
  getPendingReviewCampaigns(): Promise<Campaign[]>;
  assignCampaignToManager(campaignId: number, managerId: number): Promise<Campaign>;
  updateCampaignStatus(campaignId: number, status: string): Promise<Campaign>;
  
  // Sentiment analysis operations
  getSentimentAnalysis(campaignId: number): Promise<SentimentAnalysis[]>;
  storeSentimentAnalysis(analysis: {
    campaignId: number;
    participantId: number;
    responseId?: number;
    sentimentScore: number;
    emotions: any;
    keywords: any;
    suggestions: any;
    confidence: number;
  }): Promise<SentimentAnalysis>;

  // Content protection operations
  storeWatermarkConfig(assetId: number, userId: number, config: any): Promise<void>;
  getWatermarkConfig(assetId: number, userId: number): Promise<any>;
  storeContentUsage(usage: any): Promise<void>;
  getRecentContentUsage(assetId: number, userId: number, eventType: string, minutes: number): Promise<any[]>;
  storeSecurityViolation(violation: any): Promise<void>;
  getCampaignAsset(assetId: number): Promise<any>;
  checkCampaignAccess(campaignId: number, userId: number): Promise<boolean>;
  getContentProtection(assetId: number): Promise<any>;
  getAssetViewCount(assetId: number, userId: number): Promise<number>;
  storeSecureToken(token: any): Promise<void>;
  getSecureToken(token: string): Promise<any>;
  getContentUsageAnalytics(assetId: number): Promise<any>;
  storeContentProtection(assetId: number, options: any): Promise<void>;
  removeContentProtection(assetId: number): Promise<void>;
  
  // Verification document operations
  storeVerificationDocument(doc: {
    userId: number;
    docType: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    status: string;
  }): Promise<VerificationDocument>;
  getVerificationDocuments(userId: number): Promise<VerificationDocument[]>;
  updateUserVerificationStatus(userId: number, status: string): Promise<User>;
  createVerificationSubmission(submission: {
    userId: number;
    submittedAt: Date;
    status: string;
    documents: any[];
  }): Promise<VerificationSubmission>;
  
  // Invitation system operations
  addToWaitlist(waitlistEntry: InsertInvitationWaitlist): Promise<InvitationWaitlist>;
  getWaitlist(): Promise<InvitationWaitlist[]>;
  updateWaitlistStatus(id: number, status: string, invitedBy?: number): Promise<InvitationWaitlist>;
  getSystemSetting(setting: string): Promise<SystemSettings | undefined>;
  getSystemSettings(): Promise<SystemSettings[]>;
  updateSystemSetting(
    settingOrData: string | { setting: string; value: string; description?: string; updatedBy?: number },
    value?: string,
    updatedBy?: number
  ): Promise<SystemSettings>;
  createSystemSetting(settingData: InsertSystemSettings): Promise<SystemSettings>;
  isInvitationOnlyMode(): Promise<boolean>;

  // Password reset token operations
  createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(token: string): Promise<void>;
  cleanupExpiredPasswordResetTokens(): Promise<void>;
  
  // Email template management
  getEmailTemplate(templateKey: string): Promise<{ subject: string; htmlContent: string } | null>;
  saveEmailTemplate(templateKey: string, subject: string, htmlContent: string, updatedBy?: number): Promise<void>;
  getAllEmailTemplates(): Promise<{ templateKey: string; subject: string; htmlContent: string; description?: string }[]>;
  
  // Email sending
  sendEmail(emailData: { to: string; subject: string; html: string; from?: string }): Promise<{ success: boolean; messageId?: string; error?: string }>;
  
  // Questionnaire completion
  markQuestionnaireCompleted(userId: number): Promise<void>;
  getTotalQuestionsCount(): Promise<number>;
  getUserAnsweredQuestionsCount(userId: number): Promise<number>;
  updateUserQuestionnaireHealth(userId: number, completionPercentage: number, healthStatus: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getParticipantProfile(userId: number): Promise<ParticipantProfile | undefined> {
    const [profile] = await db
      .select()
      .from(participantProfiles)
      .where(eq(participantProfiles.userId, userId));
    return profile;
  }

  async createParticipantProfile(profile: InsertParticipantProfile): Promise<ParticipantProfile> {
    const [newProfile] = await db.insert(participantProfiles).values(profile).returning();
    return newProfile;
  }

  async updateParticipantProfile(userId: number, updates: Partial<ParticipantProfile>): Promise<ParticipantProfile> {
    const [profile] = await db
      .update(participantProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(participantProfiles.userId, userId))
      .returning();
    return profile;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getCampaignsByClient(clientId: number): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.clientId, clientId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getCampaignsByManager(managerId: number): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.managerId, managerId))
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async createCampaignAsset(asset: any): Promise<CampaignAsset> {
    const [campaignAsset] = await db
      .insert(campaignAssets)
      .values(asset)
      .returning();
    return campaignAsset;
  }

  async getCampaignAssets(campaignId: number): Promise<CampaignAsset[]> {
    return db
      .select()
      .from(campaignAssets)
      .where(eq(campaignAssets.campaignId, campaignId));
  }

  async getClientDashboardData(clientId: number): Promise<any> {
    const userCampaigns = await this.getCampaignsByClient(clientId);
    const totalCampaigns = userCampaigns.length;
    const activeCampaigns = userCampaigns.filter(c => c.status === 'active').length;
    const completedCampaigns = userCampaigns.filter(c => c.status === 'completed').length;
    
    return {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      recentCampaigns: userCampaigns.slice(0, 5),
    };
  }

  async getParticipantDashboardData(participantId: number): Promise<any> {
    const participations = await db
      .select()
      .from(campaignParticipants)
      .where(eq(campaignParticipants.participantId, participantId))
      .orderBy(desc(campaignParticipants.invitedAt));
    
    const completedParticipations = participations.filter(p => p.status === 'completed');
    const pendingInvitations = participations.filter(p => p.status === 'invited');
    
    return {
      totalParticipations: participations.length,
      completedParticipations: completedParticipations.length,
      pendingInvitations: pendingInvitations.length,
      recentParticipations: participations.slice(0, 5),
    };
  }

  async getManagerDashboardData(managerId: number): Promise<any> {
    const managedCampaigns = await this.getCampaignsByManager(managerId);
    const totalManagedCampaigns = managedCampaigns.length;
    const activeManagedCampaigns = managedCampaigns.filter(c => c.status === 'active').length;
    
    return {
      totalManagedCampaigns,
      activeManagedCampaigns,
      recentCampaigns: managedCampaigns.slice(0, 5),
    };
  }

  async getAdminDashboardData(): Promise<any> {
    const allUsers = await db.select().from(users);
    const allCampaigns = await db.select().from(campaigns);
    
    const totalUsers = allUsers.length;
    const totalClients = allUsers.filter(u => u.role === 'client').length;
    const totalParticipants = allUsers.filter(u => u.role === 'participant').length;
    const totalManagers = allUsers.filter(u => u.role === 'manager').length;
    const totalCampaigns = allCampaigns.length;
    const activeCampaigns = allCampaigns.filter(c => c.status === 'active').length;
    
    return {
      totalUsers,
      totalClients,
      totalParticipants,
      totalManagers,
      totalCampaigns,
      activeCampaigns,
      recentUsers: allUsers.slice(0, 10),
      recentCampaigns: allCampaigns.slice(0, 10),
    };
  }

  // Questionnaire operations
  async getQuestionCategories(): Promise<QuestionCategory[]> {
    return await db.select().from(questionCategories).orderBy(asc(questionCategories.sortOrder));
  }

  async getQuestionsByCategory(categoryId: number): Promise<Question[]> {
    return await db.select().from(questions)
      .where(and(eq(questions.categoryId, categoryId), eq(questions.isEnabled, true)))
      .orderBy(asc(questions.sortOrder));
  }

  async getParticipantResponses(userId: number): Promise<ParticipantResponse[]> {
    return await db.select().from(participantResponses)
      .where(eq(participantResponses.userId, userId));
  }

  async saveParticipantResponse(response: InsertParticipantResponse): Promise<ParticipantResponse> {
    const [savedResponse] = await db.insert(participantResponses)
      .values(response)
      .onConflictDoUpdate({
        target: [participantResponses.userId, participantResponses.questionId],
        set: {
          response: response.response,
        },
      })
      .returning();
    return savedResponse;
  }

  // Admin questionnaire operations
  async createQuestionCategory(category: InsertQuestionCategory): Promise<QuestionCategory> {
    const [newCategory] = await db.insert(questionCategories).values(category).returning();
    return newCategory;
  }

  async updateQuestionCategory(id: number, updates: Partial<QuestionCategory>): Promise<QuestionCategory> {
    const [updatedCategory] = await db
      .update(questionCategories)
      .set(updates)
      .where(eq(questionCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteQuestionCategory(id: number): Promise<void> {
    // First delete all questions in this category
    await db.delete(questions).where(eq(questions.categoryId, id));
    // Then delete the category
    await db.delete(questionCategories).where(eq(questionCategories.id, id));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async updateQuestion(id: number, updates: Partial<Question>): Promise<Question> {
    const [updatedQuestion] = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<void> {
    // First delete all responses to this question
    await db.delete(participantResponses).where(eq(participantResponses.questionId, id));
    // Then delete the question
    await db.delete(questions).where(eq(questions.id, id));
  }

  // Admin settings operations
  async getAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings).orderBy(asc(adminSettings.category), asc(adminSettings.key));
  }

  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return setting;
  }

  async createAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting> {
    const [newSetting] = await db.insert(adminSettings).values(setting).returning();
    return newSetting;
  }

  async updateAdminSetting(key: string, setting: Partial<AdminSetting>): Promise<AdminSetting> {
    const [updatedSetting] = await db
      .update(adminSettings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(adminSettings.key, key))
      .returning();
    return updatedSetting;
  }

  async deleteAdminSetting(key: string): Promise<void> {
    await db.delete(adminSettings).where(eq(adminSettings.key, key));
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async getUnverifiedUsers(): Promise<User[]> {
    const unverifiedUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, 'participant'),
          or(
            eq(users.verificationStatus, 'unverified'),
            eq(users.verificationStatus, 'pending')
          )
        )
      )
      .orderBy(asc(users.createdAt));
    
    return unverifiedUsers.map(user => ({
      ...user,
      daysSinceJoined: user.createdAt ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
    }));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async getUsersByIds(userIds: number[]): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  // Warning operations
  async getUserWarnings(userId: number): Promise<UserWarning[]> {
    return await db
      .select()
      .from(userWarnings)
      .where(and(eq(userWarnings.userId, userId), eq(userWarnings.isActive, true)))
      .orderBy(desc(userWarnings.issuedAt));
  }

  async createUserWarning(warning: InsertUserWarning): Promise<UserWarning> {
    const [newWarning] = await db.insert(userWarnings).values(warning).returning();
    return newWarning;
  }

  // Campaign participant operations
  async inviteParticipant(campaignId: number, participantId: number, invitedBy: number): Promise<CampaignParticipant> {
    // Get admin setting for response deadline
    const deadlineHours = await this.getAdminSetting('default_response_deadline_hours');
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + (typeof deadlineHours?.value === 'number' ? deadlineHours.value : 48));

    const [invitation] = await db
      .insert(campaignParticipants)
      .values({
        campaignId,
        participantId,
        invitedBy,
        responseDeadline: deadline,
        status: 'invited',
      })
      .returning();

    return invitation;
  }

  async respondToInvitation(invitationId: number, response: 'accept' | 'decline'): Promise<CampaignParticipant> {
    const [updatedInvitation] = await db
      .update(campaignParticipants)
      .set({
        status: response === 'accept' ? 'accepted' : 'declined',
        respondedAt: new Date(),
      })
      .where(eq(campaignParticipants.id, invitationId))
      .returning();

    return updatedInvitation;
  }

  async getParticipantInvitations(participantId: number): Promise<any[]> {
    return await db
      .select()
      .from(campaignParticipants)
      .leftJoin(campaigns, eq(campaignParticipants.campaignId, campaigns.id))
      .where(eq(campaignParticipants.participantId, participantId))
      .orderBy(desc(campaignParticipants.invitedAt));
  }

  async updateParticipantInvitation(invitationId: number, updates: any): Promise<any> {
    const [updatedInvitation] = await db
      .update(campaignParticipants)
      .set({
        status: updates.status,
        respondedAt: updates.respondedAt ? new Date(updates.respondedAt) : null
      })
      .where(eq(campaignParticipants.id, invitationId))
      .returning();
    
    return updatedInvitation;
  }

  async getParticipantCampaignData(participantId: number): Promise<any> {
    const [result] = await db
      .select({
        totalCampaigns: sql`COUNT(*)`.mapWith(Number),
        completedCampaigns: sql`COUNT(CASE WHEN status = 'completed' THEN 1 END)`.mapWith(Number),
        acceptedCampaigns: sql`COUNT(CASE WHEN status = 'accepted' THEN 1 END)`.mapWith(Number),
        pendingInvitations: sql`COUNT(CASE WHEN status = 'invited' THEN 1 END)`.mapWith(Number),
        totalEarnings: sql`SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END)`.mapWith(Number)
      })
      .from(campaignParticipants)
      .where(eq(campaignParticipants.participantId, participantId));
    
    return result;
  }

  async getParticipantStats(participantId: number): Promise<any> {
    // Get basic campaign stats
    const campaignData = await this.getParticipantCampaignData(participantId);
    
    // Return only authentic data - no mock/fake content
    const authenticStats = {
      totalCampaigns: campaignData.totalCampaigns || 0,
      completedCampaigns: campaignData.completedCampaigns || 0,
      pendingInvitations: campaignData.pendingInvitations || 0,
      totalEarnings: campaignData.totalEarnings || 0,
      averageRating: 0, // Only show real ratings when campaigns are completed
      warningCount: 0,
      responseRate: 0, // Calculate from real data when available
      monthlyEarnings: [], // Empty until real earnings exist
      campaignsByCategory: [], // Empty until real campaigns exist
      performanceMetrics: {
        completionRate: 0,
        averageResponseTime: 0,
        qualityScore: 0,
        punctualityScore: 0
      },
      achievements: [], // Empty until real achievements are earned
      recentActivity: [] // Empty until real activities exist
    };
    
    return authenticStats;
  }

  async updateCampaignParticipantFeedback(campaignId: number, participantId: number, feedbackData: any): Promise<void> {
    await db
      .update(campaignParticipants)
      .set({
        feedback: feedbackData.feedback,
        rating: feedbackData.rating,
        status: feedbackData.status,
        respondedAt: feedbackData.respondedAt
      })
      .where(
        and(
          eq(campaignParticipants.campaignId, campaignId),
          eq(campaignParticipants.participantId, participantId)
        )
      );
  }

  async createCampaignParticipant(participant: any): Promise<CampaignParticipant> {
    const [campaignParticipant] = await db
      .insert(campaignParticipants)
      .values(participant)
      .returning();
    return campaignParticipant;
  }

  // Manager operations
  async getManagerParticipants(managerId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, 'participant'))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async banParticipant(participantId: number, reason: string, bannedBy: number): Promise<User> {
    // Update user status
    const [bannedUser] = await db
      .update(users)
      .set({
        isBanned: true,
        banReason: reason,
        isActive: false,
      })
      .where(eq(users.id, participantId))
      .returning();

    // Create warning record
    await this.createUserWarning({
      userId: participantId,
      warningType: 'ban',
      reason,
      issuedBy: bannedBy,
    });

    return bannedUser;
  }

  async unbanParticipant(participantId: number): Promise<User> {
    const [unbannedUser] = await db
      .update(users)
      .set({
        isBanned: false,
        banReason: null,
        isActive: true,
      })
      .where(eq(users.id, participantId))
      .returning();

    // Deactivate ban warning
    await db
      .update(userWarnings)
      .set({ isActive: false })
      .where(and(
        eq(userWarnings.userId, participantId),
        eq(userWarnings.warningType, 'ban')
      ));

    return unbannedUser;
  }

  async warnParticipant(participantId: number, reason: string, issuedBy: number): Promise<UserWarning> {
    // Create warning
    const warning = await this.createUserWarning({
      userId: participantId,
      warningType: 'behavior',
      reason,
      issuedBy,
    });

    // Update user warning count
    const warningCount = await db
      .select()
      .from(userWarnings)
      .where(and(
        eq(userWarnings.userId, participantId),
        eq(userWarnings.isActive, true)
      ));

    await db
      .update(users)
      .set({ warningCount: warningCount.length })
      .where(eq(users.id, participantId));

    // Check if user should be auto-banned
    const maxWarnings = await this.getAdminSetting('max_warnings_before_ban');
    if (warningCount.length >= (typeof maxWarnings?.value === 'number' ? maxWarnings.value : 3)) {
      await this.banParticipant(participantId, 'Automatic ban due to excessive warnings', issuedBy);
    }

    return warning;
  }

  // Profile completion operations
  async savePartialProfile(userId: number, profileData: any): Promise<ParticipantProfile> {
    try {
      // Check if profile exists first
      const existingProfile = await this.getParticipantProfile(userId);
      
      if (!existingProfile) {
        // Create a new profile with default values
        const newProfile = await this.createParticipantProfile({
          userId,
          demographics: profileData.demographics || {},
          behavior: profileData.behavior || {},
          lifestyle: profileData.lifestyle || {},
          contentHabits: profileData.contentHabits || {},
          paymentMethods: profileData.paymentMethods || {},

          completionScore: 0
        });
        return newProfile;
      }

      // Update existing profile
      const [profile] = await db
        .update(participantProfiles)
        .set({
          ...profileData,
          lastSaveTime: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(participantProfiles.userId, userId))
        .returning();
      
      return profile;
    } catch (error) {
      console.error("Error in savePartialProfile:", error);
      throw new Error("Failed to save profile data");
    }
  }

  async checkProfileCompletion(userId: number): Promise<{ isComplete: boolean; completionScore: number }> {
    const profile = await this.getParticipantProfile(userId);
    if (!profile) {
      return { isComplete: false, completionScore: 0 };
    }

    // Calculate completion score based on filled fields
    const fields = ['demographics', 'beliefs', 'lifestyle', 'careerEducation', 'mediaPreferences', 'techUsage', 'buyingBehavior', 'psychographics'];
    let filledFields = 0;
    
    for (const field of fields) {
      const fieldData = (profile as any)[field];
      if (fieldData && typeof fieldData === 'object' && Object.keys(fieldData).length > 0) {
        filledFields++;
      }
    }
    
    const completionScore = Math.round((filledFields / fields.length) * 100);
    const isComplete = completionScore >= 80; // 80% completion required

    // Update profile completion status
    await db
      .update(participantProfiles)
      .set({ 
        completionScore,
        isProfileComplete: isComplete,
        updatedAt: new Date()
      })
      .where(eq(participantProfiles.userId, userId));

    return { isComplete, completionScore };
  }

  // Messaging operations
  async sendMessage(senderId: number, recipientId: number, subject: string, content: string, messageType = 'general', priority = 'normal'): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        senderId,
        recipientId,
        subject,
        content,
        messageType,
        priority,
      })
      .returning();
    
    return message;
  }

  async getUserMessages(userId: number, messageType?: string): Promise<Message[]> {
    let query = db
      .select()
      .from(messages)
      .where(eq(messages.recipientId, userId))
      .orderBy(desc(messages.createdAt));
    
    if (messageType) {
      query = query.where(and(eq(messages.recipientId, userId), eq(messages.messageType, messageType)));
    }
    
    return query;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ 
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(messages.id, messageId));
  }

  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.senderId, userId1),
          eq(messages.recipientId, userId2)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getLocationStats(): Promise<{
    stats: {
      total: number;
      byCountry: Record<string, number>;
      byState: Record<string, number>;
      byCity: Record<string, number>;
    };
    locations: {
      countries: string[];
      states: string[];
      cities: string[];
    };
  }> {
    try {
      // Get all participant profiles with location data
      const profiles = await db.select({
        demographics: participantProfiles.demographics
      }).from(participantProfiles);

      const stats = {
        total: 0,
        byCountry: {} as Record<string, number>,
        byState: {} as Record<string, number>,
        byCity: {} as Record<string, number>
      };

      const locations = {
        countries: new Set<string>(),
        states: new Set<string>(),
        cities: new Set<string>()
      };

      profiles.forEach(profile => {
        if (profile.demographics) {
          const demo = typeof profile.demographics === 'string' 
            ? JSON.parse(profile.demographics) 
            : profile.demographics;
          
          stats.total++;

          if (demo.country) {
            stats.byCountry[demo.country] = (stats.byCountry[demo.country] || 0) + 1;
            locations.countries.add(demo.country);
          }

          if (demo.state) {
            stats.byState[demo.state] = (stats.byState[demo.state] || 0) + 1;
            locations.states.add(demo.state);
          }

          if (demo.city) {
            stats.byCity[demo.city] = (stats.byCity[demo.city] || 0) + 1;
            locations.cities.add(demo.city);
          }
        }
      });

      return {
        stats,
        locations: {
          countries: Array.from(locations.countries).sort(),
          states: Array.from(locations.states).sort(),
          cities: Array.from(locations.cities).sort()
        }
      };
    } catch (error) {
      console.error("Error getting location stats:", error);
      return {
        stats: { total: 0, byCountry: {}, byState: {}, byCity: {} },
        locations: { countries: [], states: [], cities: [] }
      };
    }
  }

  async getActiveParticipantsWithProfiles(): Promise<Array<User & { profile: ParticipantProfile }>> {
    const usersWithProfiles = await db
      .select()
      .from(users)
      .leftJoin(participantProfiles, eq(users.id, participantProfiles.userId))
      .where(and(
        eq(users.role, 'participant'),
        eq(users.isActive, true),
        eq(users.isBanned, false)
      ));

    return usersWithProfiles
      .filter(row => row.participant_profiles !== null)
      .map(row => ({
        ...row.users,
        profile: row.participant_profiles!
      }));
  }

  async storeMatchingInsights(campaignId: number, insights: any): Promise<void> {
    try {
      // Store insights in admin settings for now
      await this.createAdminSetting({
        key: `matching_insights_${campaignId}`,
        value: JSON.stringify(insights),
        category: 'ai_matching',
        description: `AI matching insights for campaign ${campaignId}`
      });
    } catch (error) {
      console.error("Error storing matching insights:", error);
    }
  }

  // Verification operations
  async getVerificationStats(): Promise<{
    total: number;
    verified: number;
    pending: number;
    verificationRate: number;
  }> {
    const totalParticipants = await db
      .select()
      .from(users)
      .where(eq(users.role, "participant"));

    const verifiedParticipants = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "participant"),
          eq(users.isVerified, true)
        )
      );

    const pendingVerifications = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "participant"),
          eq(users.verificationStatus, "pending")
        )
      );

    const total = totalParticipants.length;
    const verified = verifiedParticipants.length;
    const pending = pendingVerifications.length;
    const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0;

    return { total, verified, pending, verificationRate };
  }

  async getUnverifiedParticipants(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "participant"),
          eq(users.isVerified, false),
          eq(users.isActive, true)
        )
      );
  }

  async getVerifiedParticipants(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "participant"),
          eq(users.isVerified, true),
          eq(users.isActive, true)
        )
      );
  }

  async updateVerificationStatus(userId: number, status: string, isVerified: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isVerified,
        verificationStatus: status,
        verificationDate: isVerified ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Pricing operations
  async getPricingConfigs(): Promise<PricingConfig[]> {
    return await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.isActive, true));
  }

  async updateCampaignPricing(campaignId: number, pricing: {
    baseCost: number;
    participantCost: number;
    totalCost: number;
    campaignType: string;
    contentType: string;
  }): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({
        baseCost: pricing.baseCost.toString(),
        participantCost: pricing.participantCost.toString(),
        totalCost: pricing.totalCost.toString(),
        campaignType: pricing.campaignType,
        contentType: pricing.contentType,
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, campaignId))
      .returning();
    return campaign;
  }

  // Campaign review operations
  async getPendingReviewCampaigns(): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, "pending_review"))
      .orderBy(desc(campaigns.createdAt));
  }

  async assignCampaignToManager(campaignId: number, managerId: number): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({
        managerId,
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, campaignId))
      .returning();
    return campaign;
  }

  async updateCampaignStatus(campaignId: number, status: string): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, campaignId))
      .returning();
    return campaign;
  }

  // Sentiment analysis operations
  async getSentimentAnalysis(campaignId: number): Promise<SentimentAnalysis[]> {
    return await db
      .select()
      .from(sentimentAnalysis)
      .where(eq(sentimentAnalysis.campaignId, campaignId))
      .orderBy(desc(sentimentAnalysis.createdAt));
  }

  async storeSentimentAnalysis(analysis: {
    campaignId: number;
    participantId: number;
    responseId?: number;
    sentimentScore: number;
    emotions: any;
    keywords: any;
    suggestions: any;
    confidence: number;
  }): Promise<SentimentAnalysis> {
    const [result] = await db
      .insert(sentimentAnalysis)
      .values({
        campaignId: analysis.campaignId,
        participantId: analysis.participantId,
        responseId: analysis.responseId,
        sentimentScore: analysis.sentimentScore.toString(),
        emotions: analysis.emotions,
        keywords: analysis.keywords,
        suggestions: analysis.suggestions,
        confidence: analysis.confidence.toString(),
        analysisType: "realtime"
      })
      .returning();
    return result;
  }

  // Content protection operations
  async storeWatermarkConfig(assetId: number, userId: number, config: any): Promise<void> {
    await db.insert(watermarkConfigs).values({
      assetId,
      userId,
      config
    });
  }

  async getWatermarkConfig(assetId: number, userId: number): Promise<any> {
    const [config] = await db
      .select()
      .from(watermarkConfigs)
      .where(and(
        eq(watermarkConfigs.assetId, assetId),
        eq(watermarkConfigs.userId, userId)
      ))
      .orderBy(desc(watermarkConfigs.createdAt));
    return config?.config;
  }

  async storeContentUsage(usage: any): Promise<void> {
    await db.insert(contentUsage).values(usage);
  }

  async getRecentContentUsage(assetId: number, userId: number, eventType: string, minutes: number): Promise<any[]> {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return await db
      .select()
      .from(contentUsage)
      .where(and(
        eq(contentUsage.assetId, assetId),
        eq(contentUsage.userId, userId),
        eq(contentUsage.eventType, eventType),
        eq(contentUsage.timestamp, since)
      ));
  }

  async storeSecurityViolation(violation: any): Promise<void> {
    await db.insert(securityViolations).values(violation);
  }

  async getCampaignAsset(assetId: number): Promise<any> {
    const [asset] = await db
      .select()
      .from(campaignAssets)
      .where(eq(campaignAssets.id, assetId));
    return asset;
  }

  async checkCampaignAccess(campaignId: number, userId: number): Promise<boolean> {
    const participation = await db
      .select()
      .from(campaignParticipants)
      .where(and(
        eq(campaignParticipants.campaignId, campaignId),
        eq(campaignParticipants.participantId, userId),
        eq(campaignParticipants.status, 'accepted')
      ));
    return participation.length > 0;
  }

  async getContentProtection(assetId: number): Promise<any> {
    const [protection] = await db
      .select()
      .from(contentProtection)
      .where(eq(contentProtection.assetId, assetId));
    return protection;
  }

  async getAssetViewCount(assetId: number, userId: number): Promise<number> {
    const views = await db
      .select()
      .from(contentUsage)
      .where(and(
        eq(contentUsage.assetId, assetId),
        eq(contentUsage.userId, userId),
        eq(contentUsage.eventType, 'view')
      ));
    return views.length;
  }

  async storeSecureToken(token: any): Promise<void> {
    await db.insert(secureTokens).values(token);
  }

  async getSecureToken(token: string): Promise<any> {
    const [tokenRecord] = await db
      .select()
      .from(secureTokens)
      .where(eq(secureTokens.token, token));
    return tokenRecord;
  }

  async getContentUsageAnalytics(assetId: number): Promise<any> {
    const usage = await db
      .select()
      .from(contentUsage)
      .where(eq(contentUsage.assetId, assetId));

    const totalViews = usage.filter(u => u.eventType === 'view').length;
    const uniqueViewers = new Set(usage.filter(u => u.eventType === 'view').map(u => u.userId)).size;
    const downloadAttempts = usage.filter(u => u.eventType === 'download').length;
    
    const violations = await db
      .select()
      .from(securityViolations)
      .where(eq(securityViolations.assetId, assetId));

    return {
      totalViews,
      uniqueViewers,
      downloadAttempts,
      securityViolations: violations.length,
      lastAccessed: usage.length > 0 ? new Date(Math.max(...usage.map(u => u.timestamp ? new Date(u.timestamp).getTime() : 0))) : null,
      topViewers: [],
      usageTimeline: []
    };
  }

  async storeContentProtection(assetId: number, options: any): Promise<void> {
    await db.insert(contentProtection).values({
      assetId,
      watermarkConfig: options.watermark,
      downloadProtection: options.downloadProtection,
      viewTracking: options.viewTracking,
      expirationDate: options.expirationDate,
      allowedViewers: options.allowedViewers,
      maxViews: options.maxViews
    });
  }

  async removeContentProtection(assetId: number): Promise<void> {
    await db.delete(contentProtection).where(eq(contentProtection.assetId, assetId));
  }

  // AI Matching operations
  async getEligibleParticipants(criteria: any): Promise<User[]> {
    const activeUsers = await db
      .select()
      .from(users)
      .where(and(
        eq(users.role, 'participant'),
        eq(users.isActive, true),
        eq(users.isBanned, false)
      ));
    
    return activeUsers;
  }

  async getBehavioralAnalysis(participantId: number): Promise<BehavioralAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(behavioralAnalysis)
      .where(eq(behavioralAnalysis.participantId, participantId))
      .orderBy(desc(behavioralAnalysis.createdAt));
    
    return analysis;
  }

  async storeBehavioralAnalysis(analysis: BehavioralAnalysis): Promise<BehavioralAnalysis> {
    const [stored] = await db
      .insert(behavioralAnalysis)
      .values({
        participantId: analysis.participantId,
        analysisType: analysis.analysisType,
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
      })
      .returning();
    
    return stored;
  }

  async storeMatchingHistory(history: Partial<MatchingHistory>): Promise<MatchingHistory> {
    const [stored] = await db
      .insert(matchingHistory)
      .values({
        campaignId: history.campaignId!,
        participantId: history.participantId!,
        matchScore: history.matchScore,
        confidence: history.confidence,
        matchReasons: history.matchReasons,
        behavioralInsights: history.behavioralInsights,
        segmentClassification: history.segmentClassification,
        engagementPrediction: history.engagementPrediction,
        actualEngagement: history.actualEngagement,
        feedbackQuality: history.feedbackQuality,
        completionRate: history.completionRate,
        responseTime: history.responseTime,
        matchingAlgorithmVersion: history.matchingAlgorithmVersion,
        isSelected: history.isSelected,
        selectionReason: history.selectionReason,
        campaignOutcome: history.campaignOutcome,
        learningFeedback: history.learningFeedback,
        createdAt: new Date()
      })
      .returning();
    
    return stored;
  }

  async storeCampaignMatching(matching: Partial<CampaignMatching>): Promise<CampaignMatching> {
    const [stored] = await db
      .insert(campaignMatching)
      .values({
        campaignId: matching.campaignId!,
        matchingCriteria: matching.matchingCriteria,
        totalParticipants: matching.totalParticipants,
        matchedParticipants: matching.matchedParticipants,
        averageMatchScore: matching.averageMatchScore,
        topMatchingFactors: matching.topMatchingFactors,
        segmentDistribution: matching.segmentDistribution,
        diversityScore: matching.diversityScore,
        qualityScore: matching.qualityScore,
        algorithmVersion: matching.algorithmVersion,
        processingTime: matching.processingTime,
        createdAt: new Date()
      })
      .returning();
    
    return stored;
  }

  async storeAILearningFeedback(feedback: Partial<AILearningFeedback>): Promise<AILearningFeedback> {
    const [stored] = await db
      .insert(aiLearningFeedback)
      .values({
        matchingHistoryId: feedback.matchingHistoryId,
        feedbackType: feedback.feedbackType!,
        feedbackData: feedback.feedbackData,
        improvementSuggestions: feedback.improvementSuggestions,
        humanFeedback: feedback.humanFeedback,
        actionTaken: feedback.actionTaken,
        impactMeasured: feedback.impactMeasured,
        createdAt: new Date()
      })
      .returning();
    
    return stored;
  }

  async updateMatchingHistory(campaignId: number, participantId: number, updates: any): Promise<MatchingHistory> {
    const [updated] = await db
      .update(matchingHistory)
      .set(updates)
      .where(and(
        eq(matchingHistory.campaignId, campaignId),
        eq(matchingHistory.participantId, participantId)
      ))
      .returning();
    
    return updated;
  }

  async getMatchingHistory(campaignId: number, participantId: number): Promise<MatchingHistory | undefined> {
    const [history] = await db
      .select()
      .from(matchingHistory)
      .where(and(
        eq(matchingHistory.campaignId, campaignId),
        eq(matchingHistory.participantId, participantId)
      ));
    
    return history;
  }

  async getHistoricalMatchingData(targetAudience: any): Promise<any[]> {
    const historicalData = await db
      .select()
      .from(campaignMatching)
      .orderBy(desc(campaignMatching.createdAt))
      .limit(50);
    
    return historicalData;
  }

  // Verification document operations
  async storeVerificationDocument(doc: {
    userId: number;
    docType: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    status: string;
  }): Promise<VerificationDocument> {
    const [stored] = await db
      .insert(verificationDocuments)
      .values({
        userId: doc.userId,
        docType: doc.docType,
        fileName: doc.fileName,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        status: doc.status,
        uploadedAt: new Date()
      })
      .returning();
    
    return stored;
  }

  async getVerificationDocuments(userId: number): Promise<VerificationDocument[]> {
  const docs = await db
    .select()
    .from(verificationDocuments)
    .where(eq(verificationDocuments.userId, userId))
    .orderBy(desc(verificationDocuments.uploadedAt));

  const signedDocs = await Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      wasabiUrl: await generateSignedUrl(`${doc.fileName}`)
    }))
  );

  return signedDocs;
}
  async updateVerificationDocument(docId: number, updates: { status?: string; reason?: string }): Promise<VerificationDocument> {
    const [updated] = await db
      .update(verificationDocuments)
      .set(updates)
      .where(eq(verificationDocuments.id, docId))
      .returning();
    
    return updated;
  }

  async updateUserVerificationStatus(userId: number, status: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ 
        verificationStatus: status,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updated;
  }

  async createVerificationSubmission(submission: {
    userId: number;
    submittedAt: Date;
    status: string;
    documents: any[];
  }): Promise<VerificationSubmission> {
    const [stored] = await db
      .insert(verificationSubmissions)
      .values({
        userId: submission.userId,
        submittedAt: submission.submittedAt,
        status: submission.status,
        documents: submission.documents
      })
      .returning();
    
    return stored;
  }

  // User management operations
 async getAllUsers(): Promise<any[]> {
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  // Check if each user has uploaded documents
  const usersWithVerification = await Promise.all(
    allUsers.map(async (user) => {
      const docs = await db
        .select()
        .from(verificationDocuments)
        .where(eq(verificationDocuments.userId, user.id));

      return {
        ...user,
        hasVerificationDocuments: docs.length > 0, // ✅ true or false
      };
    })
  );

  return usersWithVerification;
}


  async deleteUser(userId: number): Promise<void> {
    const { simpleDeleteUser } = await import("./delete-user-simple");
    return await simpleDeleteUser(userId);
  }

  async sendEmail(emailData: { to: string; subject: string; html: string; from?: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { EmailService } = await import("./email-service");
      const emailService = EmailService.getInstance();
      
      const result = await emailService.sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        from: emailData.from || 'FokusHub360 <noreply@fokushub360.com>'
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async markQuestionnaireCompleted(userId: number): Promise<void> {
    // Validate that user actually has questionnaire responses before marking complete
    const totalQuestions = await this.getTotalQuestionsCount();
    const userAnsweredCount = await this.getUserAnsweredQuestionsCount(userId);
    const completionPercentage = totalQuestions > 0 ? Math.round((userAnsweredCount / totalQuestions) * 100) : 0;
    
    // Only mark as completed if user has answered at least 80% of questions
    const shouldMarkComplete = completionPercentage >= 80;
    
    console.log(`User ${userId}: ${userAnsweredCount}/${totalQuestions} questions (${completionPercentage}%) - Marking as complete: ${shouldMarkComplete}`);
    
    await db
      .update(users)
      .set({ 
        questionnaireCompleted: shouldMarkComplete,
        questionnaireCompletionPercentage: completionPercentage,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getTotalQuestionsCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions);
    return result.count;
  }

  async getUserAnsweredQuestionsCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(distinct ${participantResponses.questionId})` })
      .from(participantResponses)
      .where(eq(participantResponses.userId, userId));
    return result.count;
  }

  async updateUserQuestionnaireHealth(userId: number, completionPercentage: number, healthStatus: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        questionnaireCompletionPercentage: completionPercentage,
        questionnaireHealthStatus: healthStatus,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getSystemSettings(): Promise<any[]> {
    return await db.select().from(systemSettings);
  }

  async getSystemSetting(setting: string): Promise<SystemSettings | undefined> {
    const [result] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.setting, setting));
    return result;
  }

  async updateSystemSetting(
    settingOrData: string | { setting: string; value: string; description?: string; updatedBy?: number },
    value?: string,
    updatedBy?: number
  ): Promise<SystemSettings> {
    let setting: string;
    let settingValue: string;
    let settingUpdatedBy: number | undefined;
    let description: string | undefined;

    if (typeof settingOrData === 'string') {
      setting = settingOrData;
      settingValue = value!;
      settingUpdatedBy = updatedBy;
    } else {
      setting = settingOrData.setting;
      settingValue = settingOrData.value;
      settingUpdatedBy = settingOrData.updatedBy;
      description = settingOrData.description;
    }

    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.setting, setting));

    if (existing) {
      const updateData: any = {
        value: settingValue,
        updatedBy: settingUpdatedBy || null,
        updatedAt: new Date()
      };
      
      if (description !== undefined) {
        updateData.description = description;
      }

      const [updated] = await db
        .update(systemSettings)
        .set(updateData)
        .where(eq(systemSettings.setting, setting))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values({
          setting,
          value: settingValue,
          description: description || null,
          updatedBy: settingUpdatedBy || null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return created;
    }
  }

  async createSystemSetting(settingData: InsertSystemSettings): Promise<SystemSettings> {
    const [created] = await db
      .insert(systemSettings)
      .values({
        setting: settingData.setting,
        value: settingData.value,
        description: settingData.description || null,
        updatedBy: settingData.updatedBy || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async addToWaitlist(waitlistEntry: InsertInvitationWaitlist): Promise<InvitationWaitlist> {
    const [created] = await db
      .insert(invitationWaitlist)
      .values({
        email: waitlistEntry.email,
        firstName: waitlistEntry.firstName || null,
        lastName: waitlistEntry.lastName || null,
        status: waitlistEntry.status || 'pending',
        referralSource: waitlistEntry.referralSource || null,
        metadata: waitlistEntry.metadata || null,
        createdAt: new Date()
      })
      .returning();
    return created;
  }

  async updateWaitlistStatus(id: number, status: string, invitedBy?: number): Promise<InvitationWaitlist> {
    const [updated] = await db
      .update(invitationWaitlist)
      .set({
        status,
        invitedBy: invitedBy || null,
        invitedAt: status === 'invited' ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(invitationWaitlist.id, id))
      .returning();
    return updated;
  }

  async isInvitationOnlyMode(): Promise<boolean> {
    try {
      const setting = await this.getSystemSetting('invitation_only_mode');
      return setting?.value === 'true';
    } catch (error) {
      console.error('Error checking invitation only mode:', error);
      return false;
    }
  }

  // Missing invitation waitlist functions
  async getWaitlist(): Promise<any[]> {
    try {
      return await db.select().from(invitationWaitlist).orderBy(desc(invitationWaitlist.createdAt));
    } catch (error) {
      console.error('Error getting waitlist:', error);
      return [];
    }
  }

  async getInvitationStatus(): Promise<any> {
    try {
      const [setting] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.setting, 'invitation_only_mode'));
      
      return {
        enabled: setting ? setting.value === 'true' : false,
        waitlistCount: await this.getWaitlistCount()
      };
    } catch (error) {
      console.error('Error getting invitation status:', error);
      return { enabled: false, waitlistCount: 0 };
    }
  }

  async getWaitlistCount(): Promise<number> {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(invitationWaitlist);
      return result.count;
    } catch (error) {
      console.error('Error getting waitlist count:', error);
      return 0;
    }
  }

  // Password reset token operations
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [created] = await db
      .insert(passwordResetTokens)
      .values({
        userId: tokenData.userId,
        token: tokenData.token,
        expiresAt: tokenData.expiresAt,
        createdAt: new Date()
      })
      .returning();
    return created;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.isUsed, false),
        gte(passwordResetTokens.expiresAt, new Date())
      ));
    return tokenRecord;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ 
        isUsed: true
      })
      .where(eq(passwordResetTokens.token, token));
  }

  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()));
  }

  // Email template operations
  async getEmailTemplate(templateKey: string): Promise<{ subject: string; htmlContent: string } | null> {
    // Implementation depends on your email templates table structure
    // For now, return null as this might be stored in system settings or a separate table
    return null;
  }

  async saveEmailTemplate(templateKey: string, subject: string, htmlContent: string, updatedBy?: number): Promise<void> {
    // Implementation depends on your email templates table structure
    // For now, we could store in system settings or create a separate table
  }

  async getAllEmailTemplates(): Promise<{ templateKey: string; subject: string; htmlContent: string; description?: string }[]> {
    // Implementation depends on your email templates table structure
    return [];
  }
}

export const storage = new DatabaseStorage();
