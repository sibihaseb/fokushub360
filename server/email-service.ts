import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private fromEmail = 'onboarding@resend.dev';

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async getEmailSettings(): Promise<{ from_email: string; from_name: string }> {
    try {
      const { storage } = await import('./storage');
      const settings = await storage.getSystemSettings();
      const emailSettings = settings.filter(s => s.setting.startsWith('email_'));
      
      const config = emailSettings.reduce((acc, setting) => {
        const key = setting.setting.replace('email_', '');
        acc[key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      return {
        from_email: 'onboarding@resend.dev', // Use verified resend.dev domain
        from_name: config.from_name || 'FokusHub360'
      };
    } catch (error) {
      console.error('Error fetching email settings:', error);
      return {
        from_email: 'onboarding@resend.dev', // Verified resend.dev domain
        from_name: 'FokusHub360'
      };
    }
  }

  async getEmailTemplate(templateKey: string): Promise<{ subject: string; htmlContent: string } | null> {
    try {
      const { storage } = await import('./storage');
      return await storage.getEmailTemplate(templateKey);
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  }

  async sendEmail(template: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const emailSettings = await this.getEmailSettings();
      const fromEmail = template.from || emailSettings.from_email;
      
      const { data, error } = await resend.emails.send({
        from: `${emailSettings.from_name} <${fromEmail}>`,
        to: template.to,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
      }

      console.log('Email sent successfully:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Email service unavailable' };
    }
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white !important; margin: 0; font-size: 24px;">FokusHub360 Test Email</h1>
          <p style="color: white !important; margin: 10px 0 0 0;">Email functionality is working perfectly!</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">System Status: ✅ Operational</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #475569; margin-top: 0;">Email Service Features:</h3>
            <ul style="color: #64748b; line-height: 1.6;">
              <li>✅ User notifications and alerts</li>
              <li>✅ Campaign invitations</li>
              <li>✅ System announcements</li>
              <li>✅ Verification reminders</li>
              <li>✅ Custom admin messaging</li>
            </ul>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <p style="color: #0369a1; margin: 0; font-weight: 500;">This test email confirms that your FokusHub360 admin panel can now send emails through the Resend service.</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Sent from FokusHub360 Admin Panel<br>
              Time: ${new Date().toLocaleString()}<br>
              Service: Resend Email API
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'FokusHub360 - Email System Test ✅',
      html
    });
  }

  async sendWelcomeEmail(to: string, firstName: string, userRole: 'client' | 'participant' = 'participant'): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const baseUrl = process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000';
    
    const clientWelcomeHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; overflow: hidden;">
        <div style="background: white; margin: 2px; border-radius: 14px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea !important;">F360</div>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: white !important;">Welcome to FokusHub360!</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9; color: white !important;">Transform Your Business with AI-Powered Insights</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px; font-size: 22px;">Hello ${firstName},</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Congratulations on joining FokusHub360! You now have access to the most advanced virtual focus group platform designed specifically for business leaders like yourself.
            </p>
            
            <!-- Features Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
              <div style="background: #f7fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #667eea;">
                <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 16px;">📊 AI-Powered Analytics</h3>
                <p style="color: #4a5568; font-size: 14px; margin: 0;">Get deep insights from participant feedback using advanced AI analysis.</p>
              </div>
              <div style="background: #f7fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #764ba2;">
                <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 16px;">🎯 Smart Matching</h3>
                <p style="color: #4a5568; font-size: 14px; margin: 0;">Our AI matches you with the perfect participants for your research needs.</p>
              </div>
              <div style="background: #f7fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #667eea;">
                <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 16px;">📈 Real-Time Reports</h3>
                <p style="color: #4a5568; font-size: 14px; margin: 0;">Watch your insights unfold in real-time with beautiful, actionable reports.</p>
              </div>
              <div style="background: #f7fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #764ba2;">
                <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 16px;">🚀 Scale Your Research</h3>
                <p style="color: #4a5568; font-size: 14px; margin: 0;">Launch unlimited campaigns and reach thousands of qualified participants.</p>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${baseUrl}/auth/sign-in" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white !important; padding: 16px 32px; text-decoration: none; 
                        border-radius: 8px; display: inline-block; font-weight: 600; 
                        font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                🚀 Launch Your First Campaign
              </a>
            </div>
            
            <!-- Quick Start -->
            <div style="background: #edf2f7; padding: 25px; border-radius: 12px; margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px;">Quick Start Guide:</h3>
              <ol style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Complete your profile setup</li>
                <li>Define your target audience</li>
                <li>Upload your campaign materials</li>
                <li>Launch and watch the insights roll in!</li>
              </ol>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #2d3748; padding: 25px; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 14px; color: white !important;">Ready to transform your business insights?</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.7; color: white !important;">
              Best regards,<br>The FokusHub360 Team
            </p>
          </div>
        </div>
      </div>
    `;

    const participantWelcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white !important; margin: 0; font-size: 24px;">Welcome to FokusHub360!</h1>
          <p style="color: white !important; margin: 10px 0 0 0;">Start Earning Money Sharing Your Opinions</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            Congratulations! You've joined the most rewarding virtual focus group platform where your opinions are valued and <strong>your time is compensated</strong>.
          </p>

          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #10b981;">
            <h3 style="color: #065f46; margin: 0 0 15px; font-size: 20px; text-align: center;">💰 Your Earning Potential</h3>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="text-align: center; padding: 10px;">
                  <div style="font-size: 24px; font-weight: bold; color: #10b981;">Up to $400</div>
                  <div style="font-size: 12px; color: #065f46;">Per Campaign</div>
                </td>
                <td style="text-align: center; padding: 10px;">
                  <div style="font-size: 24px; font-weight: bold; color: #10b981;">$1000+</div>
                  <div style="font-size: 12px; color: #065f46;">Monthly Potential</div>
                </td>
                <td style="text-align: center; padding: 10px;">
                  <div style="font-size: 24px; font-weight: bold; color: #10b981;">Fast</div>
                  <div style="font-size: 12px; color: #065f46;">Payouts</div>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1e293b; margin: 0 0 15px;">🚀 Key Benefits:</h3>
            <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Flexible Schedule:</strong> Participate whenever convenient - no fixed schedules!</li>
              <li><strong>Perfect Matches:</strong> AI matches you with relevant campaigns that fit your profile</li>
              <li><strong>Quick Payouts:</strong> Get paid for your participation</li>
              <li><strong>Quality Rewards:</strong> Bonus rewards for providing quality feedback</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/auth/sign-in" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; font-size: 16px;">
              💰 Start Earning Today
            </a>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #1e293b; margin-top: 0;">Getting Started is Easy:</h3>
            <ol style="color: #475569; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Complete your profile (helps us match you with relevant campaigns)</li>
              <li>Wait for campaign invitations (usually within 24-48 hours)</li>
              <li>Participate in campaigns that interest you</li>
              <li>Get paid quickly for your valuable contributions!</li>
            </ol>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Ready to start earning with your opinions?<br>
              Best regards, The FokusHub360 Team<br>
              This is an automated welcome email from FokusHub360
            </p>
          </div>
        </div>
      </div>
    `;

    const html = userRole === 'client' ? clientWelcomeHtml : participantWelcomeHtml;
    const subject = userRole === 'client' 
      ? 'Welcome to FokusHub360 - Transform Your Business Insights!'
      : 'Welcome to FokusHub360 - Earn Up to $400 Per Campaign!';

    return this.sendEmail({
      to,
      subject,
      html,
    });
  }

  async sendCampaignInvitation(to: string, firstName: string, campaignTitle: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white !important; margin: 0; font-size: 24px;">New Campaign Invitation</h1>
          <p style="color: white !important; margin: 10px 0 0 0;">You've been selected for a focus group</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            Great news! You've been selected to participate in a new focus group campaign:
          </p>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #0369a1; margin-top: 0;">${campaignTitle}</h3>
            <p style="color: #0369a1; margin: 0;">This campaign matches your profile and interests perfectly.</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-weight: 500;">⏰ Response Required: Please respond within 48 hours to secure your spot.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'https://your-domain.com'}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              View Campaign Details
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This is an automated invitation from FokusHub360<br>
              Log in to your dashboard to accept or decline
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `New Focus Group Invitation - ${campaignTitle}`,
      html
    });
  }

  async sendCustomMessage(to: string, subject: string, message: string, senderName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white !important; margin: 0; font-size: 24px;">Message from ${senderName}</h1>
          <p style="color: white !important; margin: 10px 0 0 0;">FokusHub360 Platform</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="color: #475569; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'https://your-domain.com'}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Sent by: ${senderName}<br>
              Time: ${new Date().toLocaleString()}<br>
              FokusHub360 Admin Panel
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  async sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const resetUrl = `${process.env.REPLIT_DEPLOYMENT_URL || 'https://your-domain.com'}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; border-bottom: 3px solid #667eea;">
          <h1 style="color: #1e293b !important; margin: 0; font-size: 24px;">Reset Your Password</h1>
          <p style="color: #64748b !important; margin: 10px 0 0 0;">FokusHub360 Account Security</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            We received a request to reset your password for your FokusHub360 account. If you made this request, click the button below to reset your password.
          </p>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: 500;">⏰ This reset link will expire in 1 hour for security reasons.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; color: white !important; padding: 15px 30px; text-decoration: none !important; border-radius: 8px; font-weight: 500; display: inline-block; text-shadow: none !important; -webkit-text-fill-color: white !important;">
              <span style="color: white !important; -webkit-text-fill-color: white !important;">Reset Your Password</span>
            </a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #475569; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This is an automated security email from FokusHub360<br>
              Time: ${new Date().toLocaleString()}<br>
              If you need help, contact our support team
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Reset Your FokusHub360 Password',
      html
    });
  }

  async sendPasswordResetConfirmation(to: string, firstName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white !important; margin: 0; font-size: 24px;">Password Reset Successful</h1>
          <p style="color: white !important; margin: 10px 0 0 0;">Your account is now secure</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            Your password has been successfully reset. You can now sign in to your FokusHub360 account using your new password.
          </p>

          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="color: #15803d; margin: 0; font-weight: 500;">✅ Your account security has been updated successfully.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'https://your-domain.com'}/auth/signin" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Sign In to Your Account
            </a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #475569; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Remember to use a strong, unique password and never share it with anyone.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This is an automated security confirmation from FokusHub360<br>
              Time: ${new Date().toLocaleString()}<br>
              If you didn't reset your password, please contact support immediately
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Password Reset Confirmation - FokusHub360',
      html
    });
  }

  async sendVerificationReminderEmail(to: string, firstName: string, daysSinceJoined: number): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const urgencyLevel = daysSinceJoined >= 14 ? 'high' : daysSinceJoined >= 7 ? 'medium' : 'low';
    const urgencyColor = urgencyLevel === 'high' ? '#dc2626' : urgencyLevel === 'medium' ? '#ea580c' : '#0369a1';
    const urgencyText = urgencyLevel === 'high' ? 'URGENT' : urgencyLevel === 'medium' ? 'IMPORTANT' : 'REMINDER';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white !important; margin: 0; font-size: 24px;">${urgencyText}: Verify Your Account</h1>
          <p style="color: white !important; margin: 10px 0 0 0;">Complete your FokusHub360 verification</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            It's been ${daysSinceJoined} days since you joined FokusHub360, but your account verification is still pending. 
            Please complete your verification to access all platform features.
          </p>

          <div style="background: ${urgencyLevel === 'high' ? '#fef2f2' : urgencyLevel === 'medium' ? '#fff7ed' : '#f0f9ff'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
            <p style="color: ${urgencyColor}; margin: 0; font-weight: 500;">
              ${urgencyLevel === 'high' ? '⚠️ Your account may be restricted soon if verification is not completed.' : 
                urgencyLevel === 'medium' ? '⏰ Please verify your account to avoid any restrictions.' : 
                'ℹ️ Complete verification to unlock all features.'}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'https://your-domain.com'}/verification" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Complete Verification Now
            </a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #475569; margin-top: 0;">Benefits of Verification:</h3>
            <ul style="color: #64748b; line-height: 1.6; margin: 0;">
              <li>Access to premium focus group opportunities</li>
              <li>Higher earning potential</li>
              <li>Priority campaign invitations</li>
              <li>Enhanced platform features</li>
            </ul>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This is an automated reminder from FokusHub360<br>
              Account created: ${daysSinceJoined} days ago<br>
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `${urgencyText}: Complete Your FokusHub360 Account Verification`,
      html
    });
  }

  async sendAccountSuspensionWarning(to: string, firstName: string, warningCount: number, maxWarnings: number): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const remainingWarnings = maxWarnings - warningCount;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white !important; margin: 0; font-size: 24px;">Account Warning Notice</h1>
          <p style="color: white !important; margin: 10px 0 0 0;">Important: Action Required</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            Your FokusHub360 account has received ${warningCount} warning${warningCount > 1 ? 's' : ''} due to violations of our platform policies.
          </p>

          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="color: #dc2626; margin: 0; font-weight: 500;">
              ⚠️ You have ${remainingWarnings} warning${remainingWarnings !== 1 ? 's' : ''} remaining before your account is suspended.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #475569; margin-top: 0;">To avoid suspension:</h3>
            <ul style="color: #64748b; line-height: 1.6; margin: 0;">
              <li>Review and follow all platform guidelines</li>
              <li>Provide thoughtful, honest feedback</li>
              <li>Meet all campaign deadlines</li>
              <li>Maintain professional communication</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'https://your-domain.com'}/guidelines" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Review Platform Guidelines
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This is an automated warning from FokusHub360<br>
              Current warnings: ${warningCount}/${maxWarnings}<br>
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'URGENT: Account Warning - FokusHub360',
      html
    });
  }

  async sendCustomEmail(to: string, subject: string, html: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({
      to,
      subject,
      html
    });
  }
}