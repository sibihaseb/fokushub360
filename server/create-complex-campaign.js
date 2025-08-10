import { db } from './db.ts';
import { campaigns, campaignAssets, campaignQuestions } from '../shared/schema.js';

async function createComplexCampaign() {
  console.log('Creating complex campaign with various question types...');
  
  try {
    // Create comprehensive campaign
    const [complexCampaign] = await db.insert(campaigns).values({
      title: 'Complete Product Launch Research Study',
      description: 'Comprehensive market research study for our new smart home security system. This study includes product concept testing, brand perception analysis, pricing research, and user experience evaluation across multiple media formats.',
      category: 'Technology',
      targetAudience: 'Homeowners aged 25-55, tech-savvy consumers, security-conscious individuals with household income $50K+',
      budget: 5000,
      status: 'active',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      clientId: 1,
      createdAt: new Date()
    }).returning();

    // Create mixed media assets
    const complexAssets = [
      {
        campaignId: complexCampaign.id,
        fileName: 'product-hero-shot.jpg',
        fileType: 'image/jpeg',
        fileSize: 1200000,
        fileUrl: 'https://via.placeholder.com/800x600/1f2937/ffffff?text=Smart+Security+System+Hero+Shot',
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        fileName: 'app-interface-demo.jpg',
        fileType: 'image/jpeg',
        fileSize: 800000,
        fileUrl: 'https://via.placeholder.com/600x800/3b82f6/ffffff?text=Mobile+App+Interface',
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        fileName: 'product-demo-video.mp4',
        fileType: 'video/mp4',
        fileSize: 25000000,
        fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        fileName: 'customer-testimonial.mp4',
        fileType: 'video/mp4',
        fileSize: 15000000,
        fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        fileName: 'brand-jingle.mp3',
        fileType: 'audio/mpeg',
        fileSize: 2200000,
        fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        fileName: 'installation-guide.pdf',
        fileType: 'application/pdf',
        fileSize: 5000000,
        fileUrl: 'https://www.example.com/installation-guide.pdf',
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        fileName: 'company-website',
        fileType: 'text/html',
        fileSize: 0,
        fileUrl: 'https://www.example.com',
        createdAt: new Date()
      }
    ];

    await db.insert(campaignAssets).values(complexAssets);

    // Create comprehensive questions with all types
    const complexQuestions = [
      // Demographics & Screening
      {
        campaignId: complexCampaign.id,
        questionText: 'Do you currently own your home?',
        questionType: 'yes_no',
        required: true,
        orderIndex: 1,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'What is your age range?',
        questionType: 'multiple_choice',
        options: JSON.stringify(['18-24', '25-34', '35-44', '45-54', '55-64', '65+']),
        required: true,
        orderIndex: 2,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'What is your annual household income?',
        questionType: 'multiple_choice',
        options: JSON.stringify(['Under $25,000', '$25,000-$49,999', '$50,000-$74,999', '$75,000-$99,999', '$100,000-$149,999', '$150,000+']),
        required: true,
        orderIndex: 3,
        createdAt: new Date()
      },
      
      // Product Concept Testing
      {
        campaignId: complexCampaign.id,
        questionText: 'After viewing the product images, how interested are you in this smart security system?',
        questionType: 'rating',
        options: JSON.stringify({ scale: 7, labels: ['Not at all interested', 'Slightly interested', 'Somewhat interested', 'Moderately interested', 'Very interested', 'Extremely interested', 'Definitely would purchase'] }),
        required: true,
        orderIndex: 4,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'What features of this security system appeal to you most?',
        questionType: 'checkbox',
        options: JSON.stringify(['24/7 Professional Monitoring', 'Mobile App Control', 'Smart Home Integration', 'Wireless Installation', 'HD Video Recording', 'Motion Detection', 'Two-Way Audio', 'Cloud Storage', 'DIY Setup']),
        required: true,
        orderIndex: 5,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'What concerns, if any, do you have about this product?',
        questionType: 'checkbox',
        options: JSON.stringify(['Price/Cost', 'Installation Complexity', 'Privacy/Security', 'Reliability', 'Customer Support', 'Technology Learning Curve', 'Maintenance Requirements', 'No Concerns']),
        required: false,
        orderIndex: 6,
        createdAt: new Date()
      },
      
      // Brand Perception
      {
        campaignId: complexCampaign.id,
        questionText: 'How would you describe this brand based on what you\'ve seen?',
        questionType: 'checkbox',
        options: JSON.stringify(['Innovative', 'Trustworthy', 'Professional', 'Modern', 'Reliable', 'Expensive', 'User-friendly', 'Cutting-edge', 'Established', 'Premium']),
        required: true,
        orderIndex: 7,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'Please describe your overall impression of the brand and product in your own words.',
        questionType: 'long_text',
        required: true,
        orderIndex: 8,
        createdAt: new Date()
      },
      
      // Pricing Research
      {
        campaignId: complexCampaign.id,
        questionText: 'What would you expect to pay for this complete security system?',
        questionType: 'multiple_choice',
        options: JSON.stringify(['Under $200', '$200-$399', '$400-$599', '$600-$799', '$800-$999', '$1000-$1499', '$1500+']),
        required: true,
        orderIndex: 9,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'Would you be willing to pay a monthly monitoring fee?',
        questionType: 'yes_no',
        required: true,
        orderIndex: 10,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'If yes, what monthly fee would be acceptable?',
        questionType: 'multiple_choice',
        options: JSON.stringify(['$0 (Free)', '$5-$15', '$16-$25', '$26-$35', '$36-$50', '$51+']),
        required: false,
        orderIndex: 11,
        createdAt: new Date()
      },
      
      // Video Content Evaluation
      {
        campaignId: complexCampaign.id,
        questionText: 'After watching the product demo video, rate how well it explains the product benefits.',
        questionType: 'rating',
        options: JSON.stringify({ scale: 5, labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'] }),
        required: true,
        orderIndex: 12,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'What did you like most about the product demonstration?',
        questionType: 'long_text',
        required: true,
        orderIndex: 13,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'How could the product video be improved?',
        questionType: 'long_text',
        required: false,
        orderIndex: 14,
        createdAt: new Date()
      },
      
      // Audio/Sound Evaluation
      {
        campaignId: complexCampaign.id,
        questionText: 'How do you feel about the brand jingle/sound?',
        questionType: 'rating',
        options: JSON.stringify({ scale: 5, labels: ['Dislike strongly', 'Dislike', 'Neutral', 'Like', 'Like very much'] }),
        required: true,
        orderIndex: 15,
        createdAt: new Date()
      },
      
      // Purchase Intent & Behavior
      {
        campaignId: complexCampaign.id,
        questionText: 'How likely are you to purchase this product within the next 6 months?',
        questionType: 'rating',
        options: JSON.stringify({ scale: 10, labels: ['Extremely unlikely', 'Very unlikely', 'Unlikely', 'Slightly unlikely', 'Neither likely nor unlikely', 'Slightly likely', 'Likely', 'Very likely', 'Extremely likely', 'Definitely will purchase'] }),
        required: true,
        orderIndex: 16,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'Where would you most likely purchase this product?',
        questionType: 'multiple_choice',
        options: JSON.stringify(['Company Website', 'Amazon', 'Best Buy', 'Home Depot', 'Costco', 'Local Security Company', 'Other Online Retailer']),
        required: true,
        orderIndex: 17,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'What factors would influence your purchase decision?',
        questionType: 'checkbox',
        options: JSON.stringify(['Price', 'Brand Reputation', 'Features', 'Customer Reviews', 'Professional Installation', 'Warranty', 'Customer Support', 'Referral/Recommendation']),
        required: true,
        orderIndex: 18,
        createdAt: new Date()
      },
      
      // Competition & Market Position
      {
        campaignId: complexCampaign.id,
        questionText: 'Do you currently have a home security system?',
        questionType: 'yes_no',
        required: true,
        orderIndex: 19,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'If yes, which brand do you currently use?',
        questionType: 'multiple_choice',
        options: JSON.stringify(['ADT', 'Ring', 'SimpliSafe', 'Vivint', 'Brinks', 'Abode', 'Other', 'N/A']),
        required: false,
        orderIndex: 20,
        createdAt: new Date()
      },
      
      // Open-ended Feedback
      {
        campaignId: complexCampaign.id,
        questionText: 'What additional features would you like to see in a smart security system?',
        questionType: 'long_text',
        required: false,
        orderIndex: 21,
        createdAt: new Date()
      },
      {
        campaignId: complexCampaign.id,
        questionText: 'Any other comments or suggestions about the product, marketing materials, or overall concept?',
        questionType: 'long_text',
        required: false,
        orderIndex: 22,
        createdAt: new Date()
      },
      
      // Final Recommendation
      {
        campaignId: complexCampaign.id,
        questionText: 'Would you recommend this product to friends or family?',
        questionType: 'rating',
        options: JSON.stringify({ scale: 10, labels: ['0 - Not at all likely', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10 - Extremely likely'] }),
        required: true,
        orderIndex: 23,
        createdAt: new Date()
      }
    ];

    await db.insert(campaignQuestions).values(complexQuestions);

    console.log(`✅ Complex campaign created with ID: ${complexCampaign.id}`);
    
    return complexCampaign;
  } catch (error) {
    console.error('Error creating complex campaign:', error);
    throw error;
  }
}

export { createComplexCampaign };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createComplexCampaign().catch(console.error);
}