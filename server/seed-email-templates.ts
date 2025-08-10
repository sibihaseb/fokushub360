import { storage } from "./storage";

const defaultEmailTemplates = [
  {
    id: 'welcome_client',
    name: 'Welcome Email - Client',
    subject: 'Welcome to FokusHub360 - Your Market Research Platform',
    body: `Hello {{firstName}},

Welcome to FokusHub360! We're excited to have you join our premium virtual focus group platform.

As a client, you now have access to:
• AI-powered participant matching
• Real-time campaign analytics
• Comprehensive market insights
• Advanced reporting tools
• Professional support team

Getting Started:
1. Complete your company profile
2. Set up your first campaign
3. Define your target audience
4. Launch and monitor results

Your dashboard is ready at: {{loginUrl}}

If you have any questions, our support team is here to help.

Best regards,
The FokusHub360 Team`,
    type: 'welcome',
    isActive: true,
    variables: ['firstName', 'loginUrl']
  },
  {
    id: 'welcome_participant',
    name: 'Welcome Email - Participant',
    subject: 'Welcome to FokusHub360 - Start Earning Today!',
    body: `Hi {{firstName}},

Welcome to FokusHub360! You're now part of our exclusive community of market research participants.

Earning Opportunities:
• $25-$75 per campaign
• Flexible scheduling
• Work from anywhere
• Weekly payouts available

Next Steps:
1. Complete your profile for better matches
2. Browse available campaigns
3. Start participating and earning
4. Get paid for your valuable insights

Access your dashboard: {{loginUrl}}

Ready to start earning? Your first campaign match is waiting!

Best regards,
The FokusHub360 Team`,
    type: 'welcome',
    isActive: true,
    variables: ['firstName', 'loginUrl']
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset Your FokusHub360 Password',
    body: `Hello {{firstName}},

We received a request to reset your password for your FokusHub360 account.

Click the link below to reset your password:
{{resetUrl}}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your account remains secure.

Need help? Contact our support team.

Best regards,
The FokusHub360 Team`,
    type: 'security',
    isActive: true,
    variables: ['firstName', 'resetUrl']
  },
  {
    id: 'campaign_invitation',
    name: 'Campaign Invitation',
    subject: 'New Campaign Invitation - {{campaignTitle}}',
    body: `Hi {{firstName}},

Great news! You've been matched with a new campaign opportunity.

Campaign: {{campaignTitle}}
Potential Earnings: {{earnings}}
Duration: {{duration}}
Deadline: {{deadline}}

This campaign matches your profile and interests perfectly. 

To accept this invitation and start earning:
{{campaignUrl}}

Remember: You have {{deadline}} to respond to this invitation.

Questions? We're here to help.

Best regards,
The FokusHub360 Team`,
    type: 'campaign',
    isActive: true,
    variables: ['firstName', 'campaignTitle', 'earnings', 'duration', 'deadline', 'campaignUrl']
  },
  {
    id: 'verification_reminder',
    name: 'Verification Reminder',
    subject: 'Please Verify Your FokusHub360 Account',
    body: `Hello {{firstName}},

We noticed your account hasn't been verified yet. Verification is required to:
• Access premium campaigns
• Receive higher payouts
• Maintain account security
• Get priority matching

Verify your account now:
{{loginUrl}}

This process takes less than 5 minutes and helps us ensure the quality of our platform.

Questions about verification? Contact our support team.

Best regards,
The FokusHub360 Team`,
    type: 'reminder',
    isActive: true,
    variables: ['firstName', 'loginUrl']
  },
  {
    id: 'account_warning',
    name: 'Account Warning',
    subject: 'Important: FokusHub360 Account Warning',
    body: `Hello {{firstName}},

We're writing to inform you about important activity on your FokusHub360 account.

This is a formal warning regarding your account status. Please review our community guidelines and terms of service.

To avoid further action:
• Review your recent activity
• Ensure compliance with platform rules
• Contact support if you have questions

Access your account: {{loginUrl}}

We value your participation and want to help you succeed on our platform.

Best regards,
The FokusHub360 Team`,
    type: 'notification',
    isActive: true,
    variables: ['firstName', 'loginUrl']
  }
];

export async function seedEmailTemplates() {
  try {
    console.log('Seeding email templates...');
    
    // Check if templates already exist
    const existingTemplates = await storage.getSystemSettings('email_template_');
    
    if (existingTemplates.length > 0) {
      console.log('Email templates already exist, skipping seed');
      return { success: true, message: 'Email templates already exist' };
    }

    // Create each template
    const createdTemplates = [];
    for (const template of defaultEmailTemplates) {
      const templateData = {
        name: template.name,
        subject: template.subject,
        body: template.body,
        type: template.type,
        isActive: template.isActive,
        variables: template.variables
      };
      
      const key = `email_template_${template.id}`;
      await storage.setSystemSetting(key, JSON.stringify(templateData), 1); // Created by admin user ID 1
      createdTemplates.push({ id: template.id, ...templateData });
    }

    console.log(`Successfully seeded ${createdTemplates.length} email templates`);
    return { 
      success: true, 
      message: `Successfully seeded ${createdTemplates.length} email templates`,
      templates: createdTemplates 
    };
  } catch (error) {
    console.error('Error seeding email templates:', error);
    return { 
      success: false, 
      message: 'Failed to seed email templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// If this script is run directly
if (require.main === module) {
  seedEmailTemplates().then(result => {
    console.log(result);
    process.exit(result.success ? 0 : 1);
  });
}