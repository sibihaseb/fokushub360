import { db } from './db.js';
import { campaigns, campaignAssets, campaignParticipants } from '../shared/schema.js';

async function createTestCampaigns() {
  try {
    // Clear existing campaigns and related data (in correct order due to foreign key constraints)
    await db.delete(campaignAssets);
    await db.delete(campaignParticipants);
    await db.delete(campaigns);
    
    // Create diverse campaigns with media
    const campaignData = [
      {
        clientId: 1,
        title: 'Fashion Brand Logo Gallery Review',
        description: 'Review multiple logo designs and provide detailed feedback on brand identity, visual appeal, and market positioning. This comprehensive evaluation will help shape our brand identity.',
        category: 'design',
        targetAudience: 'Young professionals aged 25-35',
        rewardAmount: 45,
        rewardType: 'cash',
        status: 'active',
        campaignType: 'brand_feedback',
        contentType: 'image',
        priorityLevel: 'high',
        estimatedDuration: 25,
        participantCount: 15,
        specialInstructions: 'Please view each logo design carefully and consider how it would appear on business cards, websites, and storefronts.',
        questions: JSON.stringify([
          'Which logo design appeals to you most and why?',
          'How would you describe the brand personality based on these logos?',
          'Would you trust a company with this logo?',
          'What industry would you associate with each logo?',
          'Rate the overall professional appearance (1-10)'
        ])
      },
      {
        clientId: 1,
        title: 'Product Advertisement Video Analysis',
        description: 'Watch our comprehensive video advertisement and provide detailed analysis on effectiveness, emotional impact, and purchasing influence. This is a high-priority marketing evaluation.',
        category: 'marketing',
        targetAudience: 'General consumers aged 18-45',
        rewardAmount: 55,
        rewardType: 'cash',
        status: 'active',
        campaignType: 'video_feedback',
        contentType: 'video',
        priorityLevel: 'urgent',
        estimatedDuration: 35,
        participantCount: 20,
        specialInstructions: 'Please watch the video in full-screen mode with sound enabled. Pay attention to both visual elements and audio quality.',
        urgencyNotes: 'This campaign has a tight deadline due to upcoming product launch. Quality feedback is essential.',
        questions: JSON.stringify([
          'How compelling is the advertisement overall?',
          'What emotions does it evoke?',
          'Would this ad influence your purchasing decision?',
          'How would you rate the video quality and production value?',
          'What target audience do you think this ad is aimed at?',
          'Any suggestions for improvement?'
        ])
      },
      {
        clientId: 1,
        title: 'Podcast Audio Content Evaluation',
        description: 'Listen to our podcast episode and provide comprehensive feedback on content quality, presentation style, and audience engagement. This evaluation will guide our content strategy.',
        category: 'entertainment',
        targetAudience: 'Podcast listeners aged 25-50',
        rewardAmount: 40,
        rewardType: 'cash',
        status: 'active',
        campaignType: 'audio_feedback',
        contentType: 'audio',
        priorityLevel: 'normal',
        estimatedDuration: 30,
        participantCount: 18,
        specialInstructions: 'Please listen with headphones for best audio quality assessment. Take notes on key topics discussed.',
        questions: JSON.stringify([
          'How engaging was the podcast content?',
          'What did you think of the host presentation style?',
          'Would you listen to future episodes?',
          'How was the audio quality and clarity?',
          'What topics would you like covered in future episodes?',
          'Rate the overall production quality (1-10)'
        ])
      }
    ];
    
    for (const campaign of campaignData) {
      const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
      
      // Add assets based on campaign type
      if (campaign.contentType === 'image') {
        const assets = [
          { campaignId: newCampaign.id, fileName: 'modern-logo.png', fileType: 'image/png', fileUrl: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Modern+Logo+Design', fileSize: 0 },
          { campaignId: newCampaign.id, fileName: 'classic-logo.png', fileType: 'image/png', fileUrl: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Classic+Logo+Design', fileSize: 0 },
          { campaignId: newCampaign.id, fileName: 'minimalist-logo.png', fileType: 'image/png', fileUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Minimalist+Logo+Design', fileSize: 0 },
          { campaignId: newCampaign.id, fileName: 'creative-logo.png', fileType: 'image/png', fileUrl: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Creative+Logo+Design', fileSize: 0 }
        ];
        await db.insert(campaignAssets).values(assets);
      } else if (campaign.contentType === 'video') {
        const assets = [
          { campaignId: newCampaign.id, fileName: 'product-ad.mp4', fileType: 'video/mp4', fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', fileSize: 1024000 },
          { campaignId: newCampaign.id, fileName: 'product-info.html', fileType: 'text/html', fileUrl: 'https://example.com/product-info', fileSize: 0 }
        ];
        await db.insert(campaignAssets).values(assets);
      } else if (campaign.contentType === 'audio') {
        const assets = [
          { campaignId: newCampaign.id, fileName: 'podcast-episode.mp3', fileType: 'audio/mpeg', fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', fileSize: 512000 },
          { campaignId: newCampaign.id, fileName: 'show-notes.html', fileType: 'text/html', fileUrl: 'https://example.com/podcast-notes', fileSize: 0 }
        ];
        await db.insert(campaignAssets).values(assets);
      }
    }
    
    console.log('Created 3 diverse campaigns with media content');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestCampaigns();