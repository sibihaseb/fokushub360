import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye, Copy, Edit, Plus } from "lucide-react";

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
                <span style="color: #f5576c; font-size: 20px; font-weight: bold;">💰 $50</span>
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
                <strong>Action Required:</strong> Please verify your account
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
              Here's your earnings summary for this month.
            </p>
            <div style="background: #fff9e6; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 36px; font-weight: bold; color: #fa709a;">💰 $250</div>
                <p style="color: #666; font-size: 16px; margin: 5px 0;">Total Earnings</p>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #333;">8</div>
                  <p style="color: #666; font-size: 14px; margin: 5px 0;">Campaigns Completed</p>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #333;">95%</div>
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
  }
];

interface EmailTemplateLibraryProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  selectedTemplate?: EmailTemplate;
  onEditTemplate?: (template: EmailTemplate) => void;
  onCreateTemplate?: () => void;
}

export function EmailTemplateLibrary({ onSelectTemplate, selectedTemplate, onEditTemplate, onCreateTemplate }: EmailTemplateLibraryProps) {
  const categories = [...new Set(emailTemplates.map(t => t.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <Badge variant="secondary">{emailTemplates.length} templates</Badge>
        </div>
        {onCreateTemplate && (
          <Button onClick={onCreateTemplate} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        )}
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
                  {onEditTemplate && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTemplate(template);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
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