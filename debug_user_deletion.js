// Debug script to identify user deletion blockers
import { db } from './server/db.js';
import { eq } from 'drizzle-orm';
import { 
  users, participantProfiles, campaigns, campaignAssets, campaignParticipants, 
  reports, participantResponses, adminSettings, notifications, userWarnings,
  behavioralAnalysis, matchingHistory, campaignMatching, verificationSubmissions,
  passwordResetTokens, emailSegments, emailCampaigns, userLegalAcceptances
} from './shared/schema.js';

async function debugUserDeletion(userId) {
  console.log(`\n=== DEBUGGING USER ${userId} DELETION ===`);
  
  try {
    // Check user exists
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user.length) {
      console.log(`❌ User ${userId} does not exist`);
      return;
    }
    console.log(`✅ User ${userId} exists: ${user[0].email} (${user[0].role})`);

    // Check all related records
    const checks = [
      { table: 'participantProfiles', query: () => db.select().from(participantProfiles).where(eq(participantProfiles.userId, userId)) },
      { table: 'participantResponses', query: () => db.select().from(participantResponses).where(eq(participantResponses.userId, userId)) },
      { table: 'campaignParticipants (as participant)', query: () => db.select().from(campaignParticipants).where(eq(campaignParticipants.participantId, userId)) },
      { table: 'campaignParticipants (invited by)', query: () => db.select().from(campaignParticipants).where(eq(campaignParticipants.invitedBy, userId)) },
      { table: 'campaigns (as client)', query: () => db.select().from(campaigns).where(eq(campaigns.clientId, userId)) },
      { table: 'campaigns (as manager)', query: () => db.select().from(campaigns).where(eq(campaigns.managerId, userId)) },
      { table: 'reports', query: () => db.select().from(reports).where(eq(reports.clientId, userId)) },
      { table: 'notifications', query: () => db.select().from(notifications).where(eq(notifications.userId, userId)) },
      { table: 'userWarnings (user)', query: () => db.select().from(userWarnings).where(eq(userWarnings.userId, userId)) },
      { table: 'userWarnings (issued by)', query: () => db.select().from(userWarnings).where(eq(userWarnings.issuedBy, userId)) },
      { table: 'behavioralAnalysis', query: () => db.select().from(behavioralAnalysis).where(eq(behavioralAnalysis.participantId, userId)) },
      { table: 'matchingHistory', query: () => db.select().from(matchingHistory).where(eq(matchingHistory.participantId, userId)) },
      { table: 'campaignMatching', query: () => db.select().from(campaignMatching).where(eq(campaignMatching.participantId, userId)) },
      { table: 'verificationSubmissions', query: () => db.select().from(verificationSubmissions).where(eq(verificationSubmissions.userId, userId)) },
      { table: 'passwordResetTokens', query: () => db.select().from(passwordResetTokens).where(eq(passwordResetTokens.userId, userId)) },
      { table: 'adminSettings', query: () => db.select().from(adminSettings).where(eq(adminSettings.updatedBy, userId)) },
      { table: 'emailSegments (created)', query: () => db.select().from(emailSegments).where(eq(emailSegments.createdBy, userId)) },
      { table: 'emailSegments (updated)', query: () => db.select().from(emailSegments).where(eq(emailSegments.updatedBy, userId)) },
      { table: 'emailCampaigns', query: () => db.select().from(emailCampaigns).where(eq(emailCampaigns.createdBy, userId)) },
      { table: 'userLegalAcceptances', query: () => db.select().from(userLegalAcceptances).where(eq(userLegalAcceptances.userId, userId)) }
    ];

    let totalRelatedRecords = 0;
    for (const check of checks) {
      try {
        const records = await check.query();
        if (records.length > 0) {
          console.log(`⚠️  ${check.table}: ${records.length} records`);
          totalRelatedRecords += records.length;
        } else {
          console.log(`✅ ${check.table}: 0 records`);
        }
      } catch (error) {
        console.log(`❌ ${check.table}: Error checking - ${error.message}`);
      }
    }

    console.log(`\n📊 Total related records: ${totalRelatedRecords}`);
    
    // Test actual deletion
    console.log(`\n🧪 Testing deletion process...`);
    
  } catch (error) {
    console.error(`❌ Debug failed:`, error);
  }
}

// Test with a few user IDs
const testUserIds = [1, 2, 3, 4, 5];
for (const userId of testUserIds) {
  await debugUserDeletion(userId);
}