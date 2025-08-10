import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Save, Edit, TestTube, Mail, Users, Shield, AlertTriangle } from 'lucide-react';

interface EmailTemplate {
  templateKey: string;
  subject: string;
  htmlContent: string;
  description?: string;
}

const defaultTemplates: { [key: string]: EmailTemplate } = {
  welcome_client: {
    templateKey: 'welcome_client',
    subject: 'Welcome to FokusHub360 - Your Market Research Journey Begins',
    htmlContent: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; overflow: hidden;">
        <div style="background: white; margin: 2px; border-radius: 14px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea;">F360</div>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Welcome to FokusHub360!</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Transform Your Business with AI-Powered Insights</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px; font-size: 22px;">Hello {firstName},</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Congratulations on joining FokusHub360! You now have access to the most advanced virtual focus group platform designed specifically for business leaders like yourself.
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
              <div style="background: #f7fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #667eea;">
                <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 16px;">📊 AI-Powered Analytics</h3>
                <p style="color: #4a5568; font-size: 14px; margin: 0;">Get deep insights from participant feedback using advanced AI analysis.</p>
              </div>
              <div style="background: #f7fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #764ba2;">
                <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 16px;">🎯 Smart Matching</h3>
                <p style="color: #4a5568; font-size: 14px; margin: 0;">Our AI matches you with the perfect participants for your research needs.</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="{loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                🚀 Launch Your First Campaign
              </a>
            </div>
          </div>
        </div>
      </div>
    `,
    description: 'Welcome email for new client registrations'
  },
  welcome_participant: {
    templateKey: 'welcome_participant',
    subject: 'Welcome to FokusHub360 - Start Earning Today!',
    htmlContent: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; overflow: hidden;">
        <div style="background: white; margin: 2px; border-radius: 14px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white;">
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 32px; font-weight: bold; color: #10b981;">F360</div>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Welcome to FokusHub360!</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Start Earning Money from Your Opinions</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px; font-size: 22px;">Hello {firstName},</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Welcome to FokusHub360! You're now part of an exclusive community of participants who earn money by sharing their valuable opinions with top brands and companies.
            </p>
            
            <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #166534; margin: 0 0 15px; font-size: 18px;">💰 Your Earning Potential</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #10b981;">$25-75</div>
                  <div style="font-size: 14px; color: #4a5568;">Per Campaign</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #10b981;">$500+</div>
                  <div style="font-size: 14px; color: #4a5568;">Monthly Potential</div>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="{loginUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
                💸 Start Earning Now
              </a>
            </div>
          </div>
        </div>
      </div>
    `,
    description: 'Welcome email for new participant registrations'
  },
  password_reset: {
    templateKey: 'password_reset',
    subject: 'Reset Your FokusHub360 Password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Reset Your Password</h1>
          <p style="color: #f8fafc; margin: 10px 0 0 0;">FokusHub360 Account Security</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello {firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            We received a request to reset your password for your FokusHub360 account. If you made this request, click the button below to reset your password.
          </p>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: 500;">⏰ This reset link will expire in 1 hour for security reasons.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Reset Your Password
            </a>
          </div>
        </div>
      </div>
    `,
    description: 'Password reset email with secure token link'
  },
  verification_reminder: {
    templateKey: 'verification_reminder',
    subject: 'Please Verify Your FokusHub360 Account',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Account Verification Required</h1>
          <p style="color: #f8fafc; margin: 10px 0 0 0;">Complete Your FokusHub360 Setup</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello {firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            We noticed that your FokusHub360 account hasn't been verified yet. To access all platform features and participate in campaigns, please complete your account verification.
          </p>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: 500;">⚠️ Unverified accounts have limited access to platform features.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{verificationUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Verify Your Account
            </a>
          </div>
        </div>
      </div>
    `,
    description: 'Verification reminder email for unverified users'
  },
  warning: {
    templateKey: 'warning',
    subject: 'Important: FokusHub360 Account Warning',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Account Warning</h1>
          <p style="color: #f8fafc; margin: 10px 0 0 0;">FokusHub360 Account Security</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello {firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            This is warning #{warningCount} out of {maxWarnings} for your FokusHub360 account. Please review your recent activities and ensure compliance with our platform guidelines.
          </p>

          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="color: #dc2626; margin: 0; font-weight: 500;">⚠️ Additional violations may result in account suspension.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{dashboardUrl}" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Review Guidelines
            </a>
          </div>
        </div>
      </div>
    `,
    description: 'Warning email for participants with violations'
  },
  campaign_invitation: {
    templateKey: 'campaign_invitation',
    subject: 'New Campaign Invitation - FokusHub360',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Campaign Invitation</h1>
          <p style="color: #f8fafc; margin: 10px 0 0 0;">Earn Money with Your Opinion</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello {firstName}!</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            You've been invited to participate in a new campaign: <strong>{campaignTitle}</strong>
          </p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #374151; margin: 0;"><strong>Reward:</strong> {reward}</p>
            <p style="color: #374151; margin: 10px 0 0;"><strong>Deadline:</strong> {deadline}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{campaignUrl}" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              View Campaign
            </a>
          </div>
        </div>
      </div>
    `,
    description: 'Campaign invitation email for participants'
  }
};

export default function AdminEmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome_client');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/admin/email-templates'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/email-templates');
      return response as EmailTemplate[];
    }
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (template: EmailTemplate) => {
      return await apiRequest(`/api/admin/email-templates/${template.templateKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: template.subject,
          htmlContent: template.htmlContent
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email template saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setIsEditing(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      });
    }
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ templateKey, testEmail }: { templateKey: string; testEmail: string }) => {
      return await apiRequest('/api/admin/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail, templateKey })
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test email sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
  });

  const getCurrentTemplate = () => {
    const dbTemplate = templates?.find(t => t.templateKey === selectedTemplate);
    return dbTemplate || defaultTemplates[selectedTemplate];
  };

  const handleEdit = () => {
    const template = getCurrentTemplate();
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editingTemplate) {
      saveTemplateMutation.mutate(editingTemplate);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const handleSendTest = () => {
    const testEmail = prompt('Enter test email address:');
    if (testEmail && testEmail.includes('@')) {
      sendTestEmailMutation.mutate({ templateKey: selectedTemplate, testEmail });
    }
  };

  const templateCategories = [
    { key: 'welcome_client', label: 'Client Welcome', icon: Users, color: 'bg-blue-500' },
    { key: 'welcome_participant', label: 'Participant Welcome', icon: Users, color: 'bg-green-500' },
    { key: 'password_reset', label: 'Password Reset', icon: Shield, color: 'bg-purple-500' },
    { key: 'verification_reminder', label: 'Verification', icon: Mail, color: 'bg-yellow-500' },
    { key: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-red-500' },
    { key: 'campaign_invitation', label: 'Campaign Invite', icon: Mail, color: 'bg-indigo-500' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">Manage all email templates with full FokusHub360 branding control</p>
        </div>
        <Button onClick={handleSendTest} disabled={sendTestEmailMutation.isPending}>
          {sendTestEmailMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <TestTube className="h-4 w-4 mr-2" />
          )}
          Send Test Email
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Template Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templateCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedTemplate === category.key;
              const hasCustomTemplate = templates?.some(t => t.templateKey === category.key);
              
              return (
                <div
                  key={category.key}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-primary/10 border-primary border' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTemplate(category.key)}
                >
                  <div className={`p-2 rounded-md ${category.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{category.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {hasCustomTemplate ? 'Custom' : 'Default'}
                    </div>
                  </div>
                  {hasCustomTemplate && (
                    <Badge variant="secondary" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  {templateCategories.find(c => c.key === selectedTemplate)?.label} Template
                </CardTitle>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={handleEdit} size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        disabled={saveTemplateMutation.isPending}
                        size="sm"
                      >
                        {saveTemplateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor">Edit Template</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="editor" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={isEditing ? editingTemplate?.subject || '' : getCurrentTemplate()?.subject || ''}
                      onChange={(e) => setEditingTemplate(prev => prev ? {...prev, subject: e.target.value} : null)}
                      disabled={!isEditing}
                      placeholder="Email subject line"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">HTML Content</Label>
                    <Textarea
                      id="content"
                      value={isEditing ? editingTemplate?.htmlContent || '' : getCurrentTemplate()?.htmlContent || ''}
                      onChange={(e) => setEditingTemplate(prev => prev ? {...prev, htmlContent: e.target.value} : null)}
                      disabled={!isEditing}
                      placeholder="Email HTML content"
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Available Variables:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div><code>{'{firstName}'}</code> - User's first name</div>
                      <div><code>{'{loginUrl}'}</code> - Dashboard login URL</div>
                      {selectedTemplate === 'password_reset' && <div><code>{'{resetUrl}'}</code> - Password reset URL</div>}
                      {selectedTemplate === 'verification_reminder' && <div><code>{'{verificationUrl}'}</code> - Verification URL</div>}
                      {selectedTemplate === 'warning' && (
                        <>
                          <div><code>{'{warningCount}'}</code> - Current warning number</div>
                          <div><code>{'{maxWarnings}'}</code> - Maximum warnings allowed</div>
                        </>
                      )}
                      {selectedTemplate === 'campaign_invitation' && (
                        <>
                          <div><code>{'{campaignTitle}'}</code> - Campaign name</div>
                          <div><code>{'{reward}'}</code> - Campaign reward amount</div>
                          <div><code>{'{deadline}'}</code> - Campaign deadline</div>
                          <div><code>{'{campaignUrl}'}</code> - Campaign participation URL</div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Email Preview</h4>
                    <div className="text-sm mb-4">
                      <strong>Subject:</strong> {getCurrentTemplate()?.subject || 'No subject'}
                    </div>
                    <div 
                      className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
                      dangerouslySetInnerHTML={{ 
                        __html: getCurrentTemplate()?.htmlContent
                          ?.replace(/{firstName}/g, 'John')
                          ?.replace(/{loginUrl}/g, '#')
                          ?.replace(/{resetUrl}/g, '#')
                          ?.replace(/{verificationUrl}/g, '#')
                          ?.replace(/{dashboardUrl}/g, '#')
                          ?.replace(/{campaignTitle}/g, 'Sample Campaign')
                          ?.replace(/{reward}/g, '$50')
                          ?.replace(/{deadline}/g, '3 days')
                          ?.replace(/{campaignUrl}/g, '#')
                          ?.replace(/{warningCount}/g, '1')
                          ?.replace(/{maxWarnings}/g, '3') || 'No content'
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}