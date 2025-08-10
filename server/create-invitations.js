import { db } from './db.js';
import { campaigns, campaignParticipants } from '../shared/schema.js';

async function createInvitations() {
  try {
    // Get all campaigns
    const allCampaigns = await db.select().from(campaigns);
    
    // Create invitations for participant user (ID 26 based on logs)
    const participantId = 26;
    const invitedBy = 1; // Admin user
    
    for (const campaign of allCampaigns) {
      // Create invitation with 48-hour deadline
      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 48);
      
      await db.insert(campaignParticipants).values({
        campaignId: campaign.id,
        participantId: participantId,
        invitedBy: invitedBy,
        responseDeadline: responseDeadline,
        status: 'invited',
        rewardAmount: campaign.rewardAmount,
        rewardType: campaign.rewardType
      });
    }
    
    console.log(`Created ${allCampaigns.length} campaign invitations for participant ${participantId}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createInvitations();