import { db } from "./db";
import { pricingConfig, campaigns, adminSettings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface PricingCalculation {
  baseCost: number;
  participantCost: number;
  participantCount: number;
  includedParticipants: number;
  extraParticipants: number;
  extraParticipantCost: number;
  totalCost: number;
  campaignType: string;
  contentType: string;
  features: string[];
}

export class PricingService {
  async calculateCampaignCost(
    campaignType: string,
    contentType: string,
    participantCount: number
  ): Promise<PricingCalculation> {
    // Get pricing configuration
    const pricing = await db
      .select()
      .from(pricingConfig)
      .where(
        and(
          eq(pricingConfig.campaignType, campaignType),
          eq(pricingConfig.contentType, contentType),
          eq(pricingConfig.isActive, true)
        )
      )
      .limit(1);

    if (!pricing.length) {
      throw new Error(`No pricing configuration found for ${campaignType} ${contentType}`);
    }

    const config = pricing[0];
    const includedParticipants = config.includedParticipants || 10;
    const extraParticipants = Math.max(0, participantCount - includedParticipants);
    const extraParticipantCost = extraParticipants * parseFloat(config.participantCost.toString());
    const totalCost = parseFloat(config.baseCost.toString()) + extraParticipantCost;

    return {
      baseCost: parseFloat(config.baseCost.toString()),
      participantCost: parseFloat(config.participantCost.toString()),
      participantCount,
      includedParticipants,
      extraParticipants,
      extraParticipantCost,
      totalCost,
      campaignType,
      contentType,
      features: config.features ? Object.keys(config.features) : []
    };
  }

  async getAllPricingConfigs() {
    return await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.isActive, true));
  }

  async updatePricingConfig(
    campaignType: string,
    contentType: string,
    updates: Partial<{
      baseCost: number;
      participantCost: number;
      includedParticipants: number;
      maxParticipants: number;
      features: any;
    }>
  ) {
    await db
      .update(pricingConfig)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(pricingConfig.campaignType, campaignType),
          eq(pricingConfig.contentType, contentType)
        )
      );

    return await this.calculateCampaignCost(campaignType, contentType, 10);
  }

  async getDefaultPricing() {
    const settings = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.category, "pricing"));

    const defaultConfig = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    return {
      baseCost: parseFloat(defaultConfig.default_base_cost || "299"),
      participantCost: parseFloat(defaultConfig.default_participant_cost || "15"),
      includedParticipants: parseInt(defaultConfig.default_included_participants || "10"),
      maxParticipants: parseInt(defaultConfig.default_max_participants || "100")
    };
  }

  async getPricingOptions() {
    const configs = await this.getAllPricingConfigs();
    
    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.campaignType]) {
        acc[config.campaignType] = [];
      }
      acc[config.campaignType].push(config);
      return acc;
    }, {} as Record<string, any[]>);

    return grouped;
  }

  async validatePricing(campaignType: string, contentType: string, participantCount: number) {
    const config = await db
      .select()
      .from(pricingConfig)
      .where(
        and(
          eq(pricingConfig.campaignType, campaignType),
          eq(pricingConfig.contentType, contentType),
          eq(pricingConfig.isActive, true)
        )
      )
      .limit(1);

    if (!config.length) {
      return { valid: false, error: "Invalid pricing configuration" };
    }

    const maxParticipants = config[0].maxParticipants || 100;
    if (participantCount > maxParticipants) {
      return { 
        valid: false, 
        error: `Participant count exceeds maximum of ${maxParticipants} for ${campaignType} ${contentType}` 
      };
    }

    if (participantCount < 1) {
      return { valid: false, error: "Participant count must be at least 1" };
    }

    return { valid: true };
  }

  async getCampaignPricing(campaignId: number) {
    const campaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign.length) {
      throw new Error("Campaign not found");
    }

    const c = campaign[0];
    
    return {
      baseCost: parseFloat(c.baseCost?.toString() || "0"),
      participantCost: parseFloat(c.participantCost?.toString() || "0"),
      totalCost: parseFloat(c.totalCost?.toString() || "0"),
      participantCount: c.participantCount || 0,
      campaignType: c.campaignType || "standard",
      contentType: c.contentType || "text",
      paymentStatus: c.paymentStatus || "pending"
    };
  }
}

export const pricingService = new PricingService();