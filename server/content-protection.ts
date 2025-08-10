import { createHash } from "crypto";
import { storage } from "./storage";
import { nanoid } from "nanoid";

export interface WatermarkConfig {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
  rotation: number;
  enabled: boolean;
}

export interface ContentProtectionOptions {
  watermark: WatermarkConfig;
  downloadProtection: boolean;
  viewTracking: boolean;
  expirationDate?: Date;
  allowedViewers?: number[];
  maxViews?: number;
}

export interface ContentUsageEvent {
  id: string;
  assetId: number;
  campaignId: number;
  userId: number;
  eventType: 'view' | 'download' | 'share' | 'watermark_removed';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
}

export interface ContentSecurityReport {
  assetId: number;
  totalViews: number;
  uniqueViewers: number;
  downloadAttempts: number;
  securityViolations: number;
  lastAccessed: Date;
  topViewers: Array<{
    userId: number;
    viewCount: number;
    lastView: Date;
  }>;
  usageTimeline: Array<{
    date: string;
    views: number;
    downloads: number;
  }>;
}

export class ContentProtectionEngine {
  private readonly defaultWatermark: WatermarkConfig = {
    text: "FokusHub360 - Confidential",
    position: 'bottom-right',
    opacity: 0.3,
    fontSize: 24,
    color: '#ffffff',
    rotation: -45,
    enabled: true
  };

  async generateWatermarkId(assetId: number, userId: number): Promise<string> {
    const timestamp = Date.now();
    const data = `${assetId}-${userId}-${timestamp}`;
    return createHash('sha256').update(data).digest('hex').substring(0, 12);
  }

  async createDynamicWatermark(
    assetId: number,
    userId: number,
    config?: Partial<WatermarkConfig>
  ): Promise<WatermarkConfig> {
    const user = await storage.getUser(userId);
    const watermarkId = await this.generateWatermarkId(assetId, userId);
    
    const watermarkConfig: WatermarkConfig = {
      ...this.defaultWatermark,
      ...config,
      text: `${config?.text || this.defaultWatermark.text} - ${user?.firstName} ${user?.lastName} - ID: ${watermarkId}`
    };

    // Store watermark configuration
    await storage.storeWatermarkConfig(assetId, userId, watermarkConfig);
    
    return watermarkConfig;
  }

  async applyImageWatermark(
    imageBuffer: Buffer,
    watermarkConfig: WatermarkConfig
  ): Promise<Buffer> {
    // This would integrate with an image processing library like Sharp
    // For now, we'll return the original buffer but log the watermark application
    console.log('Applying watermark:', watermarkConfig);
    
    // In a real implementation, this would:
    // 1. Load the image using Sharp
    // 2. Create a watermark overlay with the specified text and styling
    // 3. Composite the watermark onto the image
    // 4. Return the watermarked image buffer
    
    return imageBuffer;
  }

  async applyVideoWatermark(
    videoPath: string,
    watermarkConfig: WatermarkConfig
  ): Promise<string> {
    // This would integrate with FFmpeg for video watermarking
    console.log('Applying video watermark:', watermarkConfig);
    
    // In a real implementation, this would:
    // 1. Use FFmpeg to overlay text watermark on video
    // 2. Apply dynamic positioning and styling
    // 3. Return path to watermarked video
    
    return videoPath;
  }

  async trackContentUsage(
    assetId: number,
    campaignId: number,
    userId: number,
    eventType: ContentUsageEvent['eventType'],
    request: any
  ): Promise<void> {
    const usageEvent: ContentUsageEvent = {
      id: nanoid(),
      assetId,
      campaignId,
      userId,
      eventType,
      timestamp: new Date(),
      ipAddress: request.ip || request.connection.remoteAddress || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown',
      metadata: {
        referrer: request.headers.referer,
        sessionId: request.sessionID,
        deviceType: this.detectDeviceType(request.headers['user-agent'])
      }
    };

    await storage.storeContentUsage(usageEvent);
    
    // Check for security violations
    await this.checkSecurityViolations(assetId, userId, eventType);
  }

  private detectDeviceType(userAgent: string): string {
    if (!userAgent) return 'unknown';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'mobile';
    if (/Tablet|iPad/.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private async checkSecurityViolations(
    assetId: number,
    userId: number,
    eventType: ContentUsageEvent['eventType']
  ): Promise<void> {
    // Check for rapid successive downloads (potential scraping)
    if (eventType === 'download') {
      const recentDownloads = await storage.getRecentContentUsage(
        assetId,
        userId,
        'download',
        5 // last 5 minutes
      );
      
      if (recentDownloads.length > 10) {
        await this.flagSecurityViolation(assetId, userId, 'rapid_downloads');
      }
    }

    // Check for watermark removal attempts
    if (eventType === 'watermark_removed') {
      await this.flagSecurityViolation(assetId, userId, 'watermark_tampering');
    }
  }

  private async flagSecurityViolation(
    assetId: number,
    userId: number,
    violationType: string
  ): Promise<void> {
    await storage.storeSecurityViolation({
      assetId,
      userId,
      violationType,
      timestamp: new Date(),
      severity: 'high'
    });

    // Optionally notify admins
    console.log(`Security violation detected: ${violationType} for asset ${assetId} by user ${userId}`);
  }

  async validateContentAccess(
    assetId: number,
    userId: number,
    campaignId: number
  ): Promise<boolean> {
    const asset = await storage.getCampaignAsset(assetId);
    if (!asset) return false;

    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) return false;

    // Check if user has access to this campaign
    const hasAccess = await storage.checkCampaignAccess(campaignId, userId);
    if (!hasAccess) return false;

    // Check expiration date
    const protection = await storage.getContentProtection(assetId);
    if (protection?.expirationDate && protection.expirationDate < new Date()) {
      return false;
    }

    // Check view limits
    if (protection?.maxViews) {
      const viewCount = await storage.getAssetViewCount(assetId, userId);
      if (viewCount >= protection.maxViews) return false;
    }

    return true;
  }

  async generateSecureUrl(
    assetId: number,
    userId: number,
    campaignId: number,
    expiresIn: number = 3600 // 1 hour
  ): Promise<string> {
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    await storage.storeSecureToken({
      token,
      assetId,
      userId,
      campaignId,
      expiresAt,
      used: false
    });

    return `/api/secure/content/${token}`;
  }

  async generateContentSecurityReport(assetId: number): Promise<ContentSecurityReport> {
    const usage = await storage.getContentUsageAnalytics(assetId);
    
    return {
      assetId,
      totalViews: usage.totalViews,
      uniqueViewers: usage.uniqueViewers,
      downloadAttempts: usage.downloadAttempts,
      securityViolations: usage.securityViolations,
      lastAccessed: usage.lastAccessed,
      topViewers: usage.topViewers,
      usageTimeline: usage.usageTimeline
    };
  }

  async enableContentProtection(
    assetId: number,
    options: ContentProtectionOptions
  ): Promise<void> {
    await storage.storeContentProtection(assetId, options);
  }

  async disableContentProtection(assetId: number): Promise<void> {
    await storage.removeContentProtection(assetId);
  }

  async getProtectionStatus(assetId: number): Promise<ContentProtectionOptions | null> {
    return await storage.getContentProtection(assetId);
  }
}

export const contentProtectionEngine = new ContentProtectionEngine();