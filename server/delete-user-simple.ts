import { db } from "./db";
import { eq, or, sql } from "drizzle-orm";
import {
  users, participantProfiles, participantResponses, campaignParticipants,
  notifications, userWarnings, passwordResetTokens, verificationSubmissions,
  campaigns, reports, adminSettings, emailSegments, emailCampaigns, messages
} from "../shared/schema";

export async function simpleDeleteUser(userId: number): Promise<void> {
  console.log(`🗑️ SIMPLE DELETE USER ${userId} - Starting...`);
  console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Check if user exists first
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user.length) {
      console.error(`❌ User ${userId} does not exist`);
      throw new Error(`User ${userId} does not exist`);
    }
    console.log(`✅ User exists: ${user[0].email} (${user[0].role})`);

    // Delete in simple order with error handling for each step
    const deletions = [
      { name: 'messages', fn: () => db.delete(messages).where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId))) },
      { name: 'participant_responses', fn: () => db.delete(participantResponses).where(eq(participantResponses.userId, userId)) },
      { name: 'campaign_participants', fn: () => db.delete(campaignParticipants).where(eq(campaignParticipants.participantId, userId)) },
      { name: 'notifications', fn: () => db.delete(notifications).where(eq(notifications.userId, userId)) },
      { name: 'user_warnings', fn: () => db.delete(userWarnings).where(eq(userWarnings.userId, userId)) },
      { name: 'password_reset_tokens', fn: () => db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId)) },
      { name: 'verification_submissions', fn: () => db.delete(verificationSubmissions).where(eq(verificationSubmissions.userId, userId)) },
      { name: 'participant_profiles', fn: () => db.delete(participantProfiles).where(eq(participantProfiles.userId, userId)) },
      { name: 'campaigns', fn: () => db.delete(campaigns).where(eq(campaigns.clientId, userId)) },
      { name: 'reports', fn: () => db.execute(sql`DELETE FROM reports WHERE campaign_id IN (SELECT id FROM campaigns WHERE client_id = ${userId})`) },
      { name: 'admin_settings', fn: () => db.delete(adminSettings).where(eq(adminSettings.updatedBy, userId)) },
      { name: 'email_segments', fn: () => db.delete(emailSegments).where(eq(emailSegments.createdBy, userId)) },
      { name: 'email_campaigns', fn: () => db.delete(emailCampaigns).where(eq(emailCampaigns.createdBy, userId)) },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const deletion of deletions) {
      try {
        console.log(`🔄 Attempting to delete ${deletion.name}...`);
        await deletion.fn();
        console.log(`✅ Successfully deleted ${deletion.name}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ FAILED deleting ${deletion.name}:`, error?.message || error);
        console.error(`❌ Full error for ${deletion.name}:`, error);
        errorCount++;
        // Continue with next deletion - don't fail entire process
      }
    }

    // Finally delete the user
    try {
      await db.delete(users).where(eq(users.id, userId));
      console.log(`✅ Deleted user ${userId}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed to delete user:`, error?.message || error);
      throw error;
    }

    console.log(`🎉 DELETION COMPLETE: ${successCount} successful, ${errorCount} errors`);
    
  } catch (error: any) {
    console.error(`💥 SIMPLE DELETE FAILED:`, error?.message || error);
    throw error;
  }
}