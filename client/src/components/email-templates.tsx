import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye, Copy, Heart, Mail, Trophy, Star, Gift, Users, Target } from "lucide-react";

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  html: string;
  thumbnail: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome-professional",
    name: "Professional Welcome",
    description: "Clean, professional welcome email with FokusHub360 branding",
    category: "Welcome",
    preview: "Welcome to FokusHub360! Your journey to premium market research begins here.",
    thumbnail: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    colors: {
      primary: "#667eea",
      secondary: "#764ba2", 
      accent: "#f8f9fa"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Premium Virtual Focus Groups</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Welcome, {{firstName}}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining FokusHub360, the premier platform for virtual focus groups and market research.
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">What's Next?</h3>
              <ul style="color: #666; padding-left: 20px; line-height: 1.8;">
                <li>Complete your profile for better matching</li>
                <li>Explore available focus groups</li>
                <li>Start earning from your valuable insights</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "campaign-invite-premium",
    name: "Premium Campaign Invite",
    description: "Elegant campaign invitation with earning highlights",
    category: "Campaign",
    preview: "You've been selected for an exclusive focus group opportunity!",
    thumbnail: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    colors: {
      primary: "#f093fb",
      secondary: "#f5576c",
      accent: "#fff5f7"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Exclusive Invitation</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">You're Invited, {{firstName}}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We have an exciting new focus group opportunity that matches your profile perfectly.
            </p>
            <div style="background: #fff5f7; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f093fb;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">{{campaignTitle}}</h3>
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="color: #f5576c; font-size: 20px; font-weight: bold;">💰 ${{earningAmount}}</span>
                <span style="color: #666; margin-left: 10px;">earning potential</span>
              </div>
              <div style="color: #666; font-size: 14px;">
                <p>⏰ Duration: {{duration}}</p>
                <p>📅 Deadline: {{deadline}}</p>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{campaignUrl}}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "notification-modern",
    name: "Modern Notification",
    description: "Clean notification template for system updates",
    category: "Notification",
    preview: "Important update from your FokusHub360 team",
    thumbnail: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    colors: {
      primary: "#4facfe",
      secondary: "#00f2fe",
      accent: "#f0fdff"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">System Notification</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hello {{firstName}},</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              {{message}}
            </p>
            <div style="background: #f0fdff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4facfe;">
              <p style="color: #333; margin: 0; font-size: 16px;">
                <strong>Action Required:</strong> {{actionRequired}}
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{actionUrl}}" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Take Action
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "earnings-summary",
    name: "Earnings Summary",
    description: "Monthly earnings report with achievement highlights",
    category: "Report",
    preview: "Your monthly earnings summary is ready!",
    thumbnail: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    colors: {
      primary: "#fa709a",
      secondary: "#fee140",
      accent: "#fff9e6"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Monthly Earnings Report</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Great work, {{firstName}}! 🎉</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Here's your earnings summary for {{month}}.
            </p>
            <div style="background: #fff9e6; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 36px; font-weight: bold; color: #fa709a;">💰 ${{totalEarnings}}</div>
                <p style="color: #666; font-size: 16px; margin: 5px 0;">Total Earnings</p>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #333;">{{completedCampaigns}}</div>
                  <p style="color: #666; font-size: 14px; margin: 5px 0;">Campaigns Completed</p>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #333;">{{qualityScore}}%</div>
                  <p style="color: #666; font-size: 14px; margin: 5px 0;">Quality Score</p>
                </div>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                View Full Report
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "password-reset-secure",
    name: "Secure Password Reset",
    description: "Security-focused password reset template",
    category: "Security",
    preview: "Reset your FokusHub360 password securely",
    thumbnail: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    colors: {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#f8f9fa"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Password Reset</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, we received a request to reset your password.
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="color: #333; margin: 0; font-size: 16px;">
                <strong>⚠️ Security Notice:</strong> This link expires in 1 hour for your security.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              If you didn't request this, please ignore this email. Your password won't be changed.
            </p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "survey-completion",
    name: "Survey Completion",
    description: "Thank you message after completing surveys",
    category: "Completion",
    preview: "Thank you for completing the survey! Your insights matter.",
    thumbnail: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    colors: {
      primary: "#43e97b",
      secondary: "#38f9d7",
      accent: "#f0fffc"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Survey Completed</p>
          </div>
          <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Thank you, {{firstName}}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your feedback has been successfully submitted and will help improve products and services.
            </p>
            <div style="background: #f0fffc; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <div style="font-size: 24px; font-weight: bold; color: #43e97b; margin-bottom: 10px;">
                💰 ${{earningAmount}} earned
              </div>
              <p style="color: #666; font-size: 14px;">Payment processing within 24-48 hours</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "account-verification",
    name: "Account Verification",
    description: "Verification request for new accounts",
    category: "Verification",
    preview: "Please verify your FokusHub360 account to get started",
    thumbnail: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    colors: {
      primary: "#ffecd2",
      secondary: "#fcb69f",
      accent: "#fff8f0"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Account Verification</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Verify Your Account</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, please verify your email address to activate your FokusHub360 account.
            </p>
            <div style="background: #fff8f0; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #fcb69f;">
              <p style="color: #333; margin: 0; font-size: 16px;">
                <strong>📧 Important:</strong> Click the verification link below to complete your registration.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{verificationUrl}}" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify Account
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "payment-confirmation",
    name: "Payment Confirmation",
    description: "Confirmation of payment processing",
    category: "Payment",
    preview: "Your payment has been processed successfully",
    thumbnail: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    colors: {
      primary: "#a8edea",
      secondary: "#fed6e3",
      accent: "#f0fdfc"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Payment Confirmation</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Payment Processed</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, your payment has been successfully processed.
            </p>
            <div style="background: #f0fdfc; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 36px; font-weight: bold; color: #a8edea;">💰 ${{paymentAmount}}</div>
                <p style="color: #666; font-size: 16px; margin: 5px 0;">Payment Confirmed</p>
              </div>
              <div style="color: #666; font-size: 14px;">
                <p>📅 Date: {{paymentDate}}</p>
                <p>💳 Method: {{paymentMethod}}</p>
                <p>🆔 Transaction ID: {{transactionId}}</p>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{receiptUrl}}" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                View Receipt
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "new-feature-announcement",
    name: "New Feature Announcement",
    description: "Exciting new feature updates and announcements",
    category: "Announcement",
    preview: "Exciting new features are now available on FokusHub360!",
    thumbnail: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    colors: {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#f8f9fa"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">New Features Available</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">🚀 Exciting Updates!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, we're thrilled to announce new features that will enhance your FokusHub360 experience.
            </p>
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">✨ What's New:</h3>
              <ul style="color: #666; padding-left: 20px; line-height: 1.8;">
                <li>{{feature1}}</li>
                <li>{{feature2}}</li>
                <li>{{feature3}}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{exploreUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "birthday-celebration",
    name: "Birthday Celebration",
    description: "Special birthday wishes and exclusive offers",
    category: "Celebration",
    preview: "Happy Birthday! Enjoy a special gift from FokusHub360",
    thumbnail: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    colors: {
      primary: "#ff9a9e",
      secondary: "#fecfef",
      accent: "#fff0f5"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Birthday Celebration</p>
          </div>
          <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎉🎂🎈</div>
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Happy Birthday, {{firstName}}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Wishing you a fantastic birthday filled with joy and celebration!
            </p>
            <div style="background: #fff0f5; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">🎁 Special Birthday Gift</h3>
              <div style="font-size: 24px; font-weight: bold; color: #ff9a9e; margin-bottom: 10px;">
                {{giftTitle}}
              </div>
              <p style="color: #666; font-size: 14px;">Valid for 30 days from your birthday</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{claimUrl}}" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Claim Your Gift
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "system-maintenance",
    name: "System Maintenance",
    description: "Scheduled maintenance and downtime notifications",
    category: "System",
    preview: "Scheduled maintenance notice for FokusHub360",
    thumbnail: "linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)",
    colors: {
      primary: "#ffa726",
      secondary: "#fb8c00",
      accent: "#fff8f0"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">System Maintenance</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Scheduled Maintenance</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, we're performing scheduled maintenance to improve your FokusHub360 experience.
            </p>
            <div style="background: #fff8f0; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffa726;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">⏰ Maintenance Schedule</h3>
              <div style="color: #666; font-size: 14px; line-height: 1.6;">
                <p><strong>Start:</strong> {{startTime}}</p>
                <p><strong>End:</strong> {{endTime}}</p>
                <p><strong>Duration:</strong> {{duration}}</p>
                <p><strong>Services affected:</strong> {{affectedServices}}</p>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{statusUrl}}" style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                View Status Page
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "monthly-newsletter",
    name: "Monthly Newsletter",
    description: "Monthly updates and platform highlights",
    category: "Newsletter",
    preview: "Monthly updates from FokusHub360 - Don't miss out!",
    thumbnail: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    colors: {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#f8f9fa"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Monthly Newsletter</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">📰 {{month}} Newsletter</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, here's what's been happening at FokusHub360 this month.
            </p>
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">📊 Platform Stats</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #667eea;">{{newUsers}}</div>
                  <p style="color: #666; font-size: 14px; margin: 5px 0;">New Users</p>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #764ba2;">{{newCampaigns}}</div>
                  <p style="color: #666; font-size: 14px; margin: 5px 0;">New Campaigns</p>
                </div>
              </div>
              <h4 style="color: #333; font-size: 16px; margin-bottom: 10px;">🎯 This Month's Highlights</h4>
              <ul style="color: #666; padding-left: 20px; line-height: 1.8;">
                <li>{{highlight1}}</li>
                <li>{{highlight2}}</li>
                <li>{{highlight3}}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{newsletterUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Read Full Newsletter
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "security-alert",
    name: "Security Alert",
    description: "Important security notifications and alerts",
    category: "Security",
    preview: "Important security alert for your FokusHub360 account",
    thumbnail: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
    colors: {
      primary: "#ff6b6b",
      secondary: "#ee5a52",
      accent: "#fff5f5"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Security Alert</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">🚨 Security Alert</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, we detected {{alertType}} on your account.
            </p>
            <div style="background: #fff5f5; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">🔒 Security Details</h3>
              <div style="color: #666; font-size: 14px; line-height: 1.6;">
                <p><strong>Time:</strong> {{alertTime}}</p>
                <p><strong>Location:</strong> {{alertLocation}}</p>
                <p><strong>Device:</strong> {{alertDevice}}</p>
                <p><strong>IP Address:</strong> {{alertIp}}</p>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="color: #333; font-size: 16px; margin-bottom: 10px;">✅ Recommended Actions</h4>
              <ul style="color: #666; padding-left: 20px; line-height: 1.8;">
                <li>Review recent account activity</li>
                <li>Change your password immediately</li>
                <li>Enable two-factor authentication</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{securityUrl}}" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Secure My Account
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "referral-program",
    name: "Referral Program",
    description: "Invite friends and earn rewards",
    category: "Referral",
    preview: "Invite friends to FokusHub360 and earn rewards!",
    thumbnail: "linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%)",
    colors: {
      primary: "#56ccf2",
      secondary: "#2f80ed",
      accent: "#f0f9ff"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Referral Program</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">🎁 Invite Friends & Earn!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, share FokusHub360 with friends and earn rewards for each successful referral.
            </p>
            <div style="background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">💰 Earn ${{referralBonus}} per referral!</h3>
              <div style="color: #666; font-size: 14px; line-height: 1.8;">
                <p>✅ Your friend joins FokusHub360</p>
                <p>✅ They complete their first campaign</p>
                <p>✅ You both earn bonus rewards</p>
              </div>
            </div>
            <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <h4 style="color: #333; font-size: 16px; margin-bottom: 10px;">Your Referral Link</h4>
              <div style="background: white; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; color: #2f80ed; word-break: break-all;">
                {{referralLink}}
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{shareUrl}}" style="background: linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Share & Earn
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "achievement-unlocked",
    name: "Achievement Unlocked",
    description: "Milestone achievements and badges",
    category: "Achievement",
    preview: "Congratulations! You've unlocked a new achievement",
    thumbnail: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    colors: {
      primary: "#f093fb",
      secondary: "#f5576c",
      accent: "#fff5f7"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Achievement Unlocked</p>
          </div>
          <div style="padding: 40px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 20px;">🏆</div>
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Congratulations, {{firstName}}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              You've unlocked a new achievement badge!
            </p>
            <div style="background: #fff5f7; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; font-size: 20px; margin-bottom: 15px;">{{achievementTitle}}</h3>
              <p style="color: #666; font-size: 14px; margin-bottom: 15px;">{{achievementDescription}}</p>
              <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 20px;">
                <div style="text-center;">
                  <div style="font-size: 20px; font-weight: bold; color: #f093fb;">{{achievementPoints}}</div>
                  <p style="color: #666; font-size: 12px;">Points Earned</p>
                </div>
                <div style="text-center;">
                  <div style="font-size: 20px; font-weight: bold; color: #f5576c;">{{totalPoints}}</div>
                  <p style="color: #666; font-size: 12px;">Total Points</p>
                </div>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{achievementsUrl}}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                View All Achievements
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "campaign-reminder",
    name: "Campaign Reminder",
    description: "Gentle reminders for pending campaigns",
    category: "Reminder",
    preview: "Reminder: You have a pending campaign invitation",
    thumbnail: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
    colors: {
      primary: "#ffeaa7",
      secondary: "#fab1a0",
      accent: "#fff9f0"
    },
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); padding: 40px 0;">
        <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Campaign Reminder</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">⏰ Friendly Reminder</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello {{firstName}}, you have a pending campaign invitation that expires soon.
            </p>
            <div style="background: #fff9f0; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffeaa7;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">{{campaignTitle}}</h3>
              <div style="color: #666; font-size: 14px; line-height: 1.6;">
                <p><strong>💰 Earning:</strong> ${{earningAmount}}</p>
                <p><strong>⏱️ Duration:</strong> {{duration}}</p>
                <p><strong>📅 Deadline:</strong> {{deadline}}</p>
                <p><strong>⚡ Time Left:</strong> {{timeLeft}}</p>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{acceptUrl}}" style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Accept Campaign
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  }
];

interface EmailTemplateLibraryProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  selectedTemplate?: EmailTemplate;
}

export function EmailTemplateLibrary({ onSelectTemplate, selectedTemplate }: EmailTemplateLibraryProps) {
  const categories = [...new Set(emailTemplates.map(t => t.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Email Templates</h3>
        <Badge variant="secondary">{emailTemplates.length} templates</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emailTemplates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div 
                className="w-full h-24 rounded-lg mb-3 flex items-center justify-center text-white font-bold"
                style={{ background: template.thumbnail }}
              >
                <div className="text-center">
                  <div className="text-lg">F360</div>
                  <div className="text-xs opacity-80">{template.category}</div>
                </div>
              </div>
              <CardTitle className="text-sm">{template.name}</CardTitle>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-semibold mb-2">Selected: {selectedTemplate.name}</h4>
          <p className="text-sm text-muted-foreground mb-3">{selectedTemplate.description}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Use Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}