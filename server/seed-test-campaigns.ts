import { storage } from "./storage";
import { type InsertCampaign, type InsertCampaignAsset } from "@shared/schema";

export async function seedTestCampaigns() {
  console.log("Seeding test campaigns...");

  // Create test campaigns with various media types
  const testCampaigns = [
    {
      title: "Premium Smartwatch Image Analysis",
      description: "Analyze consumer reactions to our new smartwatch product images. We need feedback on design appeal, perceived value, and purchase intent.",
      clientId: 1, // Assuming admin user exists
      clientName: "TechCorp Innovations",
      targetAudience: "Tech-savvy consumers aged 25-45",
      participantCount: 15,
      estimatedDuration: 30,
      questions: [
        "What is your first impression of this smartwatch design?",
        "How would you rate the perceived quality? (1-10)",
        "What price would you expect for this product?",
        "Would you consider purchasing this smartwatch?"
      ],
      tags: ["technology", "wearables", "design", "consumer-electronics"],
      status: "active",
      rewardAmount: 25,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Food Commercial Video Testing",
      description: "Review our 30-second commercial for a new organic food product. Evaluate messaging effectiveness, emotional appeal, and brand perception.",
      clientId: 1,
      clientName: "Organic Delights Co.",
      targetAudience: "Health-conscious consumers aged 28-55",
      participantCount: 20,
      estimatedDuration: 45,
      questions: [
        "What emotions did this commercial evoke?",
        "How clear was the product message?",
        "Would this ad influence your purchase decision?",
        "What did you like/dislike about the commercial?"
      ],
      tags: ["food", "commercial", "organic", "health"],
      status: "active",
      rewardAmount: 35,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Podcast Audio Sample Feedback",
      description: "Listen to our 10-minute podcast intro and provide feedback on host voice, content flow, and overall appeal.",
      clientId: 1,
      clientName: "Audio Media Studios",
      targetAudience: "Podcast listeners aged 22-50",
      participantCount: 12,
      estimatedDuration: 25,
      questions: [
        "How engaging was the host's voice?",
        "Was the content easy to follow?",
        "Would you continue listening to this podcast?",
        "What improvements would you suggest?"
      ],
      tags: ["audio", "podcast", "entertainment", "media"],
      status: "active",
      rewardAmount: 20,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Luxury Car Advertisement Video",
      description: "Review our premium car commercial targeting high-income consumers. Focus on brand perception, emotional appeal, and purchase intent.",
      clientId: 1,
      clientName: "Prestige Motors",
      targetAudience: "High-income professionals aged 35-65",
      participantCount: 25,
      estimatedDuration: 40,
      questions: [
        "What emotions did this commercial evoke?",
        "How does this brand compare to other luxury cars?",
        "Would you consider this vehicle for your next purchase?",
        "What aspects of the ad were most compelling?"
      ],
      tags: ["automotive", "luxury", "video", "high-end"],
      status: "active",
      rewardAmount: 45,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Mobile App UI/UX Testing",
      description: "Test our new fitness app interface. Navigate through key features and provide detailed feedback on usability and design.",
      clientId: 1,
      clientName: "FitTech Solutions",
      targetAudience: "Fitness enthusiasts aged 20-45",
      participantCount: 18,
      estimatedDuration: 35,
      questions: [
        "How intuitive is the app navigation?",
        "What features did you find most useful?",
        "Were there any confusing or difficult parts?",
        "How likely are you to recommend this app?"
      ],
      tags: ["mobile", "fitness", "app", "UX", "health"],
      status: "active",
      rewardAmount: 30,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Restaurant Menu Design Survey",
      description: "Evaluate our new restaurant menu design. Focus on visual appeal, readability, and impact on ordering decisions.",
      clientId: 1,
      clientName: "Culinary Creations",
      targetAudience: "Dining enthusiasts aged 25-60",
      participantCount: 22,
      estimatedDuration: 20,
      questions: [
        "How appealing is the menu design?",
        "Is the menu easy to read and navigate?",
        "Which dishes caught your attention first?",
        "Would this menu influence your restaurant choice?"
      ],
      tags: ["food", "design", "restaurant", "menu", "hospitality"],
      status: "active",
      rewardAmount: 15,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "E-commerce Website Usability Test",
      description: "Shop on our new e-commerce platform and provide feedback on the user experience, checkout process, and overall satisfaction.",
      clientId: 1,
      clientName: "ShopSmart Online",
      targetAudience: "Online shoppers aged 18-55",
      participantCount: 30,
      estimatedDuration: 45,
      questions: [
        "How easy was it to find products?",
        "How smooth was the checkout process?",
        "What would you improve about the website?",
        "Would you shop here again?"
      ],
      tags: ["e-commerce", "website", "UX", "shopping", "online"],
      status: "active",
      rewardAmount: 35,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Fashion Brand Logo Testing",
      description: "Evaluate our new fashion brand logo concepts. Focus on brand perception, memorability, and target audience appeal.",
      clientId: 1,
      clientName: "Style House Fashion",
      targetAudience: "Fashion-conscious consumers aged 18-40",
      participantCount: 20,
      estimatedDuration: 25,
      questions: [
        "What does this logo communicate about the brand?",
        "How memorable is this logo design?",
        "Does it appeal to your demographic?",
        "Which logo version do you prefer?"
      ],
      tags: ["fashion", "logo", "branding", "design", "identity"],
      status: "active",
      rewardAmount: 25,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Gaming Console Commercial Analysis",
      description: "Watch our gaming console advertisement and provide feedback on appeal to gamers, message clarity, and purchase motivation.",
      clientId: 1,
      clientName: "GameTech Industries",
      targetAudience: "Gamers aged 16-35",
      participantCount: 35,
      estimatedDuration: 30,
      questions: [
        "How appealing is this console to gamers?",
        "Was the advertisement message clear?",
        "What features excited you most?",
        "How likely are you to purchase this console?"
      ],
      tags: ["gaming", "console", "video", "entertainment", "technology"],
      status: "active",
      rewardAmount: 28,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Real Estate Virtual Tour Feedback",
      description: "Experience our virtual property tour and provide feedback on the presentation, information quality, and overall experience.",
      clientId: 1,
      clientName: "Premier Properties",
      targetAudience: "Home buyers aged 25-55",
      participantCount: 16,
      estimatedDuration: 35,
      questions: [
        "How realistic was the virtual tour experience?",
        "Was there enough information about the property?",
        "Would you schedule a physical viewing based on this tour?",
        "What could be improved in the virtual experience?"
      ],
      tags: ["real-estate", "virtual-tour", "property", "VR", "housing"],
      status: "active",
      rewardAmount: 32,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Streaming Service Content Survey",
      description: "Review our new streaming service interface and content recommendations. Focus on user experience and content discovery.",
      clientId: 1,
      clientName: "StreamNow Media",
      targetAudience: "Entertainment consumers aged 18-50",
      participantCount: 28,
      estimatedDuration: 40,
      questions: [
        "How easy is it to find content you want to watch?",
        "How accurate are the recommendations?",
        "What features do you like most?",
        "Would you subscribe to this service?"
      ],
      tags: ["streaming", "entertainment", "media", "UX", "content"],
      status: "active",
      rewardAmount: 38,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Financial App Security Features",
      description: "Test our banking app's new security features. Evaluate ease of use, perceived security, and overall user confidence.",
      clientId: 1,
      clientName: "SecureBank Digital",
      targetAudience: "Banking customers aged 25-65",
      participantCount: 24,
      estimatedDuration: 30,
      questions: [
        "How secure do these features make you feel?",
        "Are the security steps easy to complete?",
        "Would you trust this app with your finances?",
        "What security features would you add?"
      ],
      tags: ["finance", "security", "banking", "app", "trust"],
      status: "active",
      rewardAmount: 40,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Educational Platform Usability Study",
      description: "Navigate our online learning platform and provide feedback on course structure, learning experience, and platform usability.",
      clientId: 1,
      clientName: "EduTech Learning",
      targetAudience: "Students and professionals aged 18-45",
      participantCount: 32,
      estimatedDuration: 50,
      questions: [
        "How engaging is the learning experience?",
        "Is the platform easy to navigate?",
        "How effective are the teaching methods?",
        "Would you recommend this platform to others?"
      ],
      tags: ["education", "e-learning", "platform", "UX", "training"],
      status: "active",
      rewardAmount: 42,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Travel Booking App Experience",
      description: "Book a sample trip using our travel app and provide feedback on the booking process, features, and overall experience.",
      clientId: 1,
      clientName: "WanderLust Travel",
      targetAudience: "Travel enthusiasts aged 22-60",
      participantCount: 26,
      estimatedDuration: 45,
      questions: [
        "How easy was the booking process?",
        "Did you find all the information you needed?",
        "What features were most helpful?",
        "Would you use this app for your next trip?"
      ],
      tags: ["travel", "booking", "app", "tourism", "hospitality"],
      status: "active",
      rewardAmount: 36,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Social Media Platform Beta Test",
      description: "Test our new social media platform features. Focus on user engagement, content sharing, and community building aspects.",
      clientId: 1,
      clientName: "SocialConnect Inc.",
      targetAudience: "Social media users aged 16-45",
      participantCount: 40,
      estimatedDuration: 35,
      questions: [
        "How engaging is the platform?",
        "Are the sharing features intuitive?",
        "Would you switch from your current platform?",
        "What features would you add or improve?"
      ],
      tags: ["social-media", "platform", "community", "engagement", "beta"],
      status: "active",
      rewardAmount: 33,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Health & Wellness App Feedback",
      description: "Use our health tracking app for a week and provide feedback on features, motivation, and overall wellness impact.",
      clientId: 1,
      clientName: "HealthTrack Pro",
      targetAudience: "Health-conscious individuals aged 20-55",
      participantCount: 20,
      estimatedDuration: 60,
      questions: [
        "How motivating are the health tracking features?",
        "Is the app easy to use daily?",
        "Did you notice any positive health changes?",
        "What features would improve your wellness journey?"
      ],
      tags: ["health", "wellness", "app", "fitness", "lifestyle"],
      status: "active",
      rewardAmount: 50,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Cryptocurrency Trading Platform",
      description: "Test our new crypto trading interface. Evaluate ease of use, security features, and overall trading experience.",
      clientId: 1,
      clientName: "CryptoTrade Pro",
      targetAudience: "Cryptocurrency traders aged 21-50",
      participantCount: 15,
      estimatedDuration: 40,
      questions: [
        "How intuitive is the trading interface?",
        "Do you feel confident about security?",
        "What trading features are most valuable?",
        "Would you recommend this platform to other traders?"
      ],
      tags: ["cryptocurrency", "trading", "finance", "blockchain", "security"],
      status: "active",
      rewardAmount: 55,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Fashion Brand Logo Evaluation",
      description: "Multiple logo designs for a new sustainable fashion brand. Help us choose the most appealing and memorable option.",
      clientId: 1,
      clientName: "EcoFashion Inc.",
      targetAudience: "Fashion-conscious millennials",
      participantCount: 18,
      estimatedDuration: 20,
      questions: [
        "Which logo feels most premium?",
        "Which represents sustainability best?",
        "What does this logo say about the brand?",
        "How memorable is this design?"
      ],
      tags: ["fashion", "logo", "branding", "sustainability"],
      status: "active",
      rewardAmount: 18,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Mobile App UI/UX Video Walkthrough",
      description: "Watch our mobile app demo video and provide feedback on user interface, navigation flow, and overall user experience.",
      clientId: 1,
      clientName: "Digital Solutions Ltd.",
      targetAudience: "Mobile app users aged 18-40",
      participantCount: 25,
      estimatedDuration: 40,
      questions: [
        "How intuitive is the app navigation?",
        "What do you think of the visual design?",
        "Would you download this app?",
        "What features seemed most useful?"
      ],
      tags: ["mobile", "app", "UX", "design"],
      status: "active",
      rewardAmount: 30,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Music Album Cover Art Research",
      description: "Evaluate album cover designs for an upcoming music release. Consider visual appeal, genre appropriateness, and marketability.",
      clientId: 1,
      clientName: "Indie Music Records",
      targetAudience: "Music enthusiasts aged 20-35",
      participantCount: 10,
      estimatedDuration: 15,
      questions: [
        "Does this cover match the music genre?",
        "How eye-catching is this design?",
        "Would this make you want to listen?",
        "What mood does this cover convey?"
      ],
      tags: ["music", "art", "design", "entertainment"],
      status: "active",
      rewardAmount: 15,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Documentary Trailer Analysis",
      description: "Watch our 2-minute documentary trailer and provide feedback on storytelling, pacing, and audience appeal.",
      clientId: 1,
      clientName: "Documentary Films Co.",
      targetAudience: "Documentary viewers aged 30-60",
      participantCount: 15,
      estimatedDuration: 35,
      questions: [
        "How compelling was the storyline?",
        "Did the pacing feel right?",
        "Would you watch the full documentary?",
        "What emotions did the trailer evoke?"
      ],
      tags: ["documentary", "film", "trailer", "storytelling"],
      status: "active",
      rewardAmount: 28,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Product Packaging Photo Study",
      description: "Analyze product packaging photos for a new beverage line. Focus on shelf appeal, information clarity, and brand positioning.",
      clientId: 1,
      clientName: "Refresh Beverages",
      targetAudience: "Beverage consumers aged 21-45",
      participantCount: 22,
      estimatedDuration: 25,
      questions: [
        "How appealing is this packaging?",
        "Is the product information clear?",
        "Would this stand out on store shelves?",
        "What target market does this appeal to?"
      ],
      tags: ["packaging", "beverage", "retail", "branding"],
      status: "active",
      rewardAmount: 22,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Voice-Over Sample Testing",
      description: "Listen to voice-over samples for an upcoming audiobook. Evaluate voice quality, clarity, and emotional range.",
      clientId: 1,
      clientName: "AudioBook Publishing",
      targetAudience: "Audiobook listeners aged 25-65",
      participantCount: 8,
      estimatedDuration: 30,
      questions: [
        "How clear and pleasant is the voice?",
        "Does the voice match the content?",
        "Would you enjoy a full audiobook?",
        "How engaging is the narration style?"
      ],
      tags: ["audio", "voice-over", "audiobook", "narration"],
      status: "active",
      rewardAmount: 25,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Website Hero Image Testing",
      description: "Evaluate hero images for a new e-commerce website. Consider visual impact, brand alignment, and conversion potential.",
      clientId: 1,
      clientName: "E-Commerce Solutions",
      targetAudience: "Online shoppers aged 25-50",
      participantCount: 20,
      estimatedDuration: 20,
      questions: [
        "How professional does this look?",
        "Does it make you want to explore more?",
        "What impression does this give of the brand?",
        "How likely would you be to shop here?"
      ],
      tags: ["website", "hero-image", "e-commerce", "conversion"],
      status: "active",
      rewardAmount: 18,
      rewardType: "USD",
      responseDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Create campaign assets for each campaign
  const campaignAssets = [
    // Smartwatch campaign assets
    {
      campaignId: 1,
      fileName: "smartwatch-product-1.jpg",
      originalName: "premium-smartwatch-black.jpg",
      fileType: "image",
      filePath: "/uploads/campaigns/smartwatch-product-1.jpg",
      fileSize: 245000,
      mimeType: "image/jpeg",
      isWatermarked: false,
      uploadedAt: new Date(),
    },
    {
      campaignId: 1,
      fileName: "smartwatch-product-2.jpg",
      originalName: "premium-smartwatch-silver.jpg",
      fileType: "image",
      filePath: "/uploads/campaigns/smartwatch-product-2.jpg",
      fileSize: 238000,
      mimeType: "image/jpeg",
      isWatermarked: false,
      uploadedAt: new Date(),
    },
    
    // Food commercial campaign assets
    {
      campaignId: 2,
      fileName: "organic-food-commercial.mp4",
      originalName: "organic-delights-30sec.mp4",
      fileType: "video",
      filePath: "/uploads/campaigns/organic-food-commercial.mp4",
      fileSize: 15400000,
      mimeType: "video/mp4",
      isWatermarked: true,
      uploadedAt: new Date(),
    },
    
    // Podcast campaign assets
    {
      campaignId: 3,
      fileName: "podcast-intro-sample.mp3",
      originalName: "audio-media-intro.mp3",
      fileType: "audio",
      filePath: "/uploads/campaigns/podcast-intro-sample.mp3",
      fileSize: 5200000,
      mimeType: "audio/mpeg",
      isWatermarked: false,
      uploadedAt: new Date(),
    },
    
    // Fashion logo campaign assets
    {
      campaignId: 4,
      fileName: "logo-option-1.png",
      originalName: "ecofashion-logo-v1.png",
      fileType: "image",
      filePath: "/uploads/campaigns/logo-option-1.png",
      fileSize: 85000,
      mimeType: "image/png",
      isWatermarked: false,
      uploadedAt: new Date(),
    },
    {
      campaignId: 4,
      fileName: "logo-option-2.png",
      originalName: "ecofashion-logo-v2.png",
      fileType: "image",
      filePath: "/uploads/campaigns/logo-option-2.png",
      fileSize: 92000,
      mimeType: "image/png",
      isWatermarked: false,
      uploadedAt: new Date(),
    },
    
    // Mobile app campaign assets
    {
      campaignId: 5,
      fileName: "app-demo-walkthrough.mp4",
      originalName: "mobile-app-demo.mp4",
      fileType: "video",
      filePath: "/uploads/campaigns/app-demo-walkthrough.mp4",
      fileSize: 22800000,
      mimeType: "video/mp4",
      isWatermarked: true,
      uploadedAt: new Date(),
    },
    
    // Music album campaign assets
    {
      campaignId: 6,
      fileName: "album-cover-design.jpg",
      originalName: "indie-album-cover.jpg",
      fileType: "image",
      filePath: "/uploads/campaigns/album-cover-design.jpg",
      fileSize: 156000,
      mimeType: "image/jpeg",
      isWatermarked: false,
      uploadedAt: new Date(),
    },
    
    // Documentary campaign assets
    {
      campaignId: 7,
      fileName: "documentary-trailer.mp4",
      originalName: "doc-trailer-2min.mp4",
      fileType: "video",
      filePath: "/uploads/campaigns/documentary-trailer.mp4",
      fileSize: 18600000,
      mimeType: "video/mp4",
      isWatermarked: true,
      uploadedAt: new Date(),
    },
    
    // Beverage packaging campaign assets
    {
      campaignId: 8,
      fileName: "beverage-packaging-1.jpg",
      originalName: "refresh-bottle-design.jpg",
      fileType: "image",
      filePath: "/uploads/campaigns/beverage-packaging-1.jpg",
      fileSize: 198000,
      mimeType: "image/jpeg",
      isWatermarked: false,
      uploadedAt: new Date(),
    },
    
    // Voice-over campaign assets
    {
      campaignId: 9,
      fileName: "audiobook-voice-sample.mp3",
      originalName: "narrator-sample.mp3",
      fileType: "audio",
      filePath: "/uploads/campaigns/audiobook-voice-sample.mp3",
      fileSize: 4800000,
      mimeType: "audio/mpeg",
      isWatermarked: false,
      uploadedAt: new Date(),
    },
    
    // Website hero campaign assets
    {
      campaignId: 10,
      fileName: "hero-image-option-1.jpg",
      originalName: "ecommerce-hero-v1.jpg",
      fileType: "image",
      filePath: "/uploads/campaigns/hero-image-option-1.jpg",
      fileSize: 312000,
      mimeType: "image/jpeg",
      isWatermarked: false,
      uploadedAt: new Date(),
    }
  ];

  try {
    // Create campaigns
    for (const campaign of testCampaigns) {
      await storage.createCampaign(campaign as InsertCampaign);
    }

    // Create campaign assets with proper URLs
    for (const asset of campaignAssets) {
      const assetWithUrl = {
        ...asset,
        fileUrl: `https://cdn.example.com/${asset.fileName}`,
        thumbnailUrl: `https://cdn.example.com/thumbs/${asset.fileName}`,
      };
      await storage.createCampaignAsset(assetWithUrl as InsertCampaignAsset);
    }

    console.log("✅ Test campaigns seeded successfully!");
    console.log(`Created ${testCampaigns.length} campaigns with ${campaignAssets.length} assets`);
    
    return {
      campaigns: testCampaigns.length,
      assets: campaignAssets.length
    };
  } catch (error) {
    console.error("❌ Error seeding test campaigns:", error);
    throw error;
  }
}

// Run this function to seed the database (disabled for production)
if (import.meta.url === `file://${process.argv[1]}` && process.env.NODE_ENV !== 'production') {
  seedTestCampaigns().then(() => {
    console.log("Seeding completed!");
    process.exit(0);
  }).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}