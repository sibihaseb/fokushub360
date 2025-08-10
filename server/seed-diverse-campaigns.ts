import { db } from './db';
import { campaigns, campaignAssets } from '@shared/schema';

const diverseCampaigns = [
  {
    clientId: 1,
    title: 'Fashion Brand Logo Redesign Study',
    description: 'Review our new logo designs and provide feedback on which resonates best with young professionals. This is a comprehensive brand identity evaluation focusing on visual appeal, brand personality, and trust factors.',
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
      'What industry would you associate with each logo?'
    ]),
    assets: [
      { type: 'image', url: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Modern+Logo+Design', name: 'Modern Logo Design Option' },
      { type: 'image', url: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Classic+Logo+Design', name: 'Classic Logo Design Option' },
      { type: 'image', url: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Minimalist+Logo+Design', name: 'Minimalist Logo Design Option' },
      { type: 'image', url: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Creative+Logo+Design', name: 'Creative Logo Design Option' }
    ]
  },
  {
    clientId: 1,
    title: 'Premium Product Advertisement Video Analysis',
    description: 'Watch our new 60-second advertisement and share your thoughts on its effectiveness, emotional impact, and purchasing influence. This is a comprehensive video marketing evaluation.',
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
      'What target audience do you think this ad is aimed at?'
    ]),
    assets: [
      { type: 'video', url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', name: 'Premium Product Advertisement' },
      { type: 'link', url: 'https://example.com/product-info', name: 'Product Information Page' }
    ]
  },
  {
    clientId: 1,
    title: 'Interactive Website User Experience Testing',
    description: 'Navigate through our new website and provide comprehensive feedback on usability, design, navigation flow, and overall user experience. This includes testing on both desktop and mobile views.',
    category: 'tech',
    targetAudience: 'Tech-savvy users aged 20-40',
    rewardAmount: 65,
    rewardType: 'cash',
    status: 'active',
    campaignType: 'website_testing',
    contentType: 'link',
    priorityLevel: 'normal',
    estimatedDuration: 45,
    participantCount: 12,
    specialInstructions: 'Please test the website on both desktop and mobile devices if possible. Document any bugs or usability issues you encounter.',
    questions: JSON.stringify([
      'How easy was it to find what you were looking for?',
      'Rate the overall design and layout (1-10)',
      'Any suggestions for improvement?',
      'How was the mobile experience compared to desktop?',
      'Would you recommend this website to others?'
    ]),
    assets: [
      { type: 'link', url: 'https://example.com/demo-site', name: 'Demo Website Link' },
      { type: 'link', url: 'https://example.com/mobile-demo', name: 'Mobile Demo Link' }
    ]
  },
  {
    clientId: 1,
    title: 'Podcast Content & Audio Quality Evaluation',
    description: 'Listen to our new podcast episode and share your thoughts on the content quality, presentation style, audio clarity, and overall engagement factor. This is part of our content optimization strategy.',
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
      'What did you think of the host\'s presentation style?',
      'Would you listen to future episodes?',
      'How was the audio quality and clarity?',
      'What topics would you like to hear covered in future episodes?'
    ]),
    assets: [
      { type: 'audio', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', name: 'Podcast Episode Sample' },
      { type: 'link', url: 'https://example.com/podcast-notes', name: 'Episode Show Notes' }
    ]
  },
  {
    clientId: 1,
    title: 'E-commerce Product Photography Gallery Assessment',
    description: 'Review our comprehensive product photo gallery and provide detailed feedback on image quality, presentation, lighting, angles, and overall visual appeal. This evaluation will guide our photography standards.',
    category: 'product',
    targetAudience: 'Online shoppers aged 20-45',
    rewardAmount: 35,
    rewardType: 'cash',
    status: 'active',
    campaignType: 'image_gallery',
    contentType: 'image',
    priorityLevel: 'normal',
    estimatedDuration: 20,
    participantCount: 25,
    specialInstructions: 'Please view each image in full resolution. Consider how these would appear in an online store setting.',
    questions: JSON.stringify([
      'How appealing are these product photos?',
      'Do the images accurately represent the product?',
      'Which photo would make you most likely to purchase?',
      'How is the lighting and image quality?',
      'What additional angles or views would be helpful?'
    ]),
    assets: [
      { type: 'image', url: 'https://via.placeholder.com/600x400/8b5cf6/ffffff?text=Product+Main+View', name: 'Product Main View' },
      { type: 'image', url: 'https://via.placeholder.com/600x400/f59e0b/ffffff?text=Product+Detail+Shot', name: 'Product Detail Shot' },
      { type: 'image', url: 'https://via.placeholder.com/600x400/ec4899/ffffff?text=Product+Lifestyle+Photo', name: 'Product Lifestyle Photo' },
      { type: 'image', url: 'https://via.placeholder.com/600x400/06b6d4/ffffff?text=Product+Packaging', name: 'Product Packaging' },
      { type: 'image', url: 'https://via.placeholder.com/600x400/84cc16/ffffff?text=Product+Size+Comparison', name: 'Product Size Comparison' }
    ]
  },
  {
    clientId: 1,
    title: 'Multi-Media Marketing Campaign Review',
    description: 'Comprehensive evaluation of our integrated marketing campaign including video content, image galleries, promotional materials, and website integration. This is a high-value strategic assessment.',
    category: 'marketing',
    targetAudience: 'Marketing professionals and consumers aged 25-50',
    rewardAmount: 75,
    rewardType: 'cash',
    status: 'active',
    campaignType: 'multimedia_campaign',
    contentType: 'mixed',
    priorityLevel: 'high',
    estimatedDuration: 60,
    participantCount: 10,
    specialInstructions: 'This is a comprehensive review requiring detailed analysis of all provided materials. Please allocate sufficient time for thorough evaluation.',
    urgencyNotes: 'Premium campaign with extended timeline - quality over speed is essential.',
    questions: JSON.stringify([
      'How well do all the materials work together as a cohesive campaign?',
      'Which element of the campaign is most effective?',
      'How would you rate the overall brand consistency?',
      'What improvements would you suggest for maximum impact?',
      'Would this campaign motivate you to learn more about the brand?'
    ]),
    assets: [
      { type: 'video', url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', name: 'Campaign Video' },
      { type: 'image', url: 'https://via.placeholder.com/800x600/6366f1/ffffff?text=Campaign+Banner', name: 'Campaign Banner' },
      { type: 'image', url: 'https://via.placeholder.com/400x600/f43f5e/ffffff?text=Print+Advertisement', name: 'Print Advertisement' },
      { type: 'link', url: 'https://example.com/campaign-landing', name: 'Campaign Landing Page' },
      { type: 'link', url: 'https://example.com/social-media', name: 'Social Media Content' }
    ]
  }
];

export async function seedDiverseCampaigns() {
  try {
    console.log('Seeding diverse test campaigns...');
    
    for (const campaignData of diverseCampaigns) {
      const { assets, ...campaignInfo } = campaignData;
      
      // Create campaign
      const [campaign] = await db.insert(campaigns).values(campaignInfo).returning();
      
      // Create campaign assets
      if (assets && assets.length > 0) {
        const assetPromises = assets.map(asset => 
          db.insert(campaignAssets).values({
            campaignId: campaign.id,
            type: asset.type,
            name: asset.name,
            url: asset.url,
            fileSize: 0,
            uploadedAt: new Date()
          })
        );
        
        await Promise.all(assetPromises);
      }
      
      console.log(`Created campaign: ${campaign.title}`);
    }
    
    console.log('Diverse campaigns seeded successfully!');
  } catch (error) {
    console.error('Error seeding diverse campaigns:', error);
  }
}