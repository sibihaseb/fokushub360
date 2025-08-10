import { db } from './db.ts';
import { campaigns, campaignAssets, campaignQuestions } from '../shared/schema.js';

async function createAudioCampaign() {
  console.log('Creating audio campaign...');
  
  try {
    // Create audio campaign
    const [audioCampaign] = await db.insert(campaigns).values({
      title: 'Podcast Theme Music Evaluation',
      description: 'Help us select the perfect theme music for our new business podcast series. Listen to different musical styles and provide feedback on which resonates with our target audience.',
      category: 'Entertainment',
      targetAudience: 'Business professionals, entrepreneurs, and podcast listeners aged 25-45',
      budget: 1200,
      status: 'active',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      clientId: 1,
      createdAt: new Date()
    }).returning();

    // Create audio assets
    const audioAssets = [
      {
        campaignId: audioCampaign.id,
        fileName: 'theme-upbeat.mp3',
        fileType: 'audio/mpeg',
        fileSize: 2800000,
        fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
        createdAt: new Date()
      },
      {
        campaignId: audioCampaign.id,
        fileName: 'theme-corporate.mp3',
        fileType: 'audio/mpeg',
        fileSize: 3200000,
        fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.mp3',
        createdAt: new Date()
      },
      {
        campaignId: audioCampaign.id,
        fileName: 'theme-modern.mp3',
        fileType: 'audio/mpeg',
        fileSize: 2900000,
        fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-03.mp3',
        createdAt: new Date()
      },
      {
        campaignId: audioCampaign.id,
        fileName: 'theme-ambient.mp3',
        fileType: 'audio/mpeg',
        fileSize: 3500000,
        fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-02.mp3',
        createdAt: new Date()
      }
    ];

    await db.insert(campaignAssets).values(audioAssets);

    // Create questions for the audio campaign
    const audioQuestions = [
      {
        campaignId: audioCampaign.id,
        questionText: 'Which theme music best captures the professional yet approachable tone we want for our business podcast?',
        questionType: 'multiple_choice',
        options: JSON.stringify(['Upbeat Theme', 'Corporate Theme', 'Modern Theme', 'Ambient Theme']),
        required: true,
        orderIndex: 1,
        createdAt: new Date()
      },
      {
        campaignId: audioCampaign.id,
        questionText: 'Rate the overall quality and production value of each audio track.',
        questionType: 'rating',
        options: JSON.stringify({ scale: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] }),
        required: true,
        orderIndex: 2,
        createdAt: new Date()
      },
      {
        campaignId: audioCampaign.id,
        questionText: 'Does the music make you want to listen to the podcast? Please explain your reasoning.',
        questionType: 'long_text',
        required: true,
        orderIndex: 3,
        createdAt: new Date()
      },
      {
        campaignId: audioCampaign.id,
        questionText: 'What emotions or feelings does each piece of music evoke?',
        questionType: 'long_text',
        required: true,
        orderIndex: 4,
        createdAt: new Date()
      },
      {
        campaignId: audioCampaign.id,
        questionText: 'How well does each track suit different types of business topics?',
        questionType: 'checkbox',
        options: JSON.stringify(['Finance & Investment', 'Technology & Innovation', 'Leadership & Management', 'Marketing & Sales', 'Entrepreneurship', 'Industry News']),
        required: false,
        orderIndex: 5,
        createdAt: new Date()
      },
      {
        campaignId: audioCampaign.id,
        questionText: 'Would you recommend any modifications or improvements to the selected theme?',
        questionType: 'long_text',
        required: false,
        orderIndex: 6,
        createdAt: new Date()
      }
    ];

    await db.insert(campaignQuestions).values(audioQuestions);

    console.log(`✅ Audio campaign created with ID: ${audioCampaign.id}`);
    
    return audioCampaign;
  } catch (error) {
    console.error('Error creating audio campaign:', error);
    throw error;
  }
}

export { createAudioCampaign };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAudioCampaign().catch(console.error);
}