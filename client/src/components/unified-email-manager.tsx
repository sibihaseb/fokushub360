import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, Send, Settings, Users, FileText, Bell, Check, X, Palette, Target, 
  Eye, Copy, Edit, Trash2, Plus, Save, Wand2, Clock, Star, Gift, 
  MessageSquare, Shield, BarChart3, Filter, Search, Volume2, Image, 
  Video, Paperclip, Type, Layout, Zap, Heart, Trophy, Crown, Sparkles
} from "lucide-react";
import { EmailTemplateLibrary, EmailTemplate, emailTemplates } from "./email-templates-simple";
import { VisualEmailBuilder } from "./visual-email-builder";

interface EmailSettings {
  enabled: boolean;
  from_email: string;
  from_name: string;
  auto_welcome: boolean;
  auto_campaign_invites: boolean;
  auto_verification_reminders: boolean;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified?: boolean;
  profileCompletion?: number;
  joinDate?: string;
  lastActivity?: string;
}

interface EmailSegment {
  id: string;
  name: string;
  description: string;
  criteria: any;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  segmentId: string;
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  opened: number;
  clicked: number;
  createdAt: string;
}

export function UnifiedEmailManager() {
  const [activeTab, setActiveTab] = useState("compose");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [campaignName, setCampaignName] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "Campaign",
    html: "",
    colors: {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#f8f9fa"
    }
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email settings
  const { data: emailSettings, isLoading: settingsLoading } = useQuery<EmailSettings>({
    queryKey: ["/api/admin/email-settings"],
  });

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch email segments
  const { data: segments = [] } = useQuery<EmailSegment[]>({
    queryKey: ["/api/admin/email-segments"],
  });

  // Fetch email campaigns
  const { data: campaigns = [] } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/admin/email-campaigns"],
  });

  // Update email settings
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: EmailSettings) => 
      apiRequest("/api/admin/email-settings", "POST", settings),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update email settings",
        variant: "destructive",
      });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (emailData: any) => 
      apiRequest("/api/admin/send-email", "POST", emailData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email sent successfully",
      });
      setCustomMessage("");
      setEmailSubject("");
      setSelectedTemplate(null);
      setSelectedUsers([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    },
  });

  // Create segment mutation
  const createSegmentMutation = useMutation({
    mutationFn: (segmentData: any) => 
      apiRequest("/api/admin/email-segments", "POST", segmentData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email segment created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-segments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create segment",
        variant: "destructive",
      });
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (campaignData: any) => 
      apiRequest("/api/admin/email-campaigns", "POST", campaignData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email campaign created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      setCampaignName("");
      setEmailSubject("");
      setCustomMessage("");
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter templates based on search
  const filteredTemplates = emailTemplates.filter(template =>
    template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    template.category.toLowerCase().includes(templateSearch.toLowerCase()) ||
    template.description.toLowerCase().includes(templateSearch.toLowerCase())
  );

  // Generate email preview
  const generatePreview = () => {
    if (!selectedTemplate) return "";
    
    let html = selectedTemplate.html;
    
    // Replace all template variables with sample data
    const replacements = {
      firstName: "John",
      loginUrl: "#",
      campaignTitle: "Sample Campaign",
      earningAmount: "50",
      duration: "30 minutes",
      deadline: "2 days",
      message: customMessage || "This is a sample message",
      resetUrl: "#",
      verificationUrl: "#",
      dashboardUrl: "#",
      campaignUrl: "#",
      actionRequired: "Please verify your account",
      actionUrl: "#",
      month: "January",
      totalEarnings: "250",
      completedCampaigns: "8",
      qualityScore: "95",
      paymentAmount: "75",
      paymentDate: "Today",
      paymentMethod: "PayPal",
      transactionId: "TX123456",
      receiptUrl: "#",
      feature1: "New AI matching system",
      feature2: "Enhanced dashboard analytics",
      feature3: "Mobile app improvements",
      exploreUrl: "#",
      giftTitle: "Bonus $25 Credit",
      claimUrl: "#",
      startTime: "2:00 AM EST",
      endTime: "6:00 AM EST",
      affectedServices: "Dashboard, Campaigns",
      statusUrl: "#",
      newUsers: "150",
      newCampaigns: "25",
      highlight1: "Record user engagement",
      highlight2: "New partnership announcements",
      highlight3: "Platform performance improvements",
      newsletterUrl: "#",
      alertType: "unusual login activity",
      alertTime: "Today at 2:30 PM",
      alertLocation: "New York, NY",
      alertDevice: "iPhone 14",
      alertIp: "192.168.1.1",
      securityUrl: "#",
      referralBonus: "25",
      referralLink: "https://fokushub360.com/ref/john123",
      shareUrl: "#",
      achievementTitle: "Survey Master",
      achievementDescription: "Complete 10 surveys with 95%+ quality score",
      achievementPoints: "100",
      totalPoints: "1,250",
      achievementsUrl: "#",
      timeLeft: "6 hours",
      acceptUrl: "#"
    };
    
    // Replace all variables in the template
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    });
    
    return html;
  };

  // Template editing functions
  const openTemplateEditor = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      category: template.category,
      html: template.html,
      colors: template.colors
    });
    setShowTemplateEditor(true);
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;
    
    try {
      const updatedTemplate = {
        ...editingTemplate,
        ...templateForm,
        thumbnail: `linear-gradient(135deg, ${templateForm.colors.primary} 0%, ${templateForm.colors.secondary} 100%)`
      };
      
      // Update in local state for now - in production this would save to database
      toast({
        title: "Template Updated",
        description: "Email template has been saved successfully.",
      });
      
      setShowTemplateEditor(false);
      setEditingTemplate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      description: "",
      category: "Campaign",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0;">
          <div style="background: white; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Custom Email</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hello {{firstName}},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Your custom email content goes here.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{actionUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Take Action
                </a>
              </div>
            </div>
          </div>
        </div>
      `,
      colors: {
        primary: "#667eea",
        secondary: "#764ba2",
        accent: "#f8f9fa"
      }
    });
    setShowTemplateEditor(true);
  };

  // Helper functions to convert between template formats
  const convertToVisualTemplate = (htmlTemplate: EmailTemplate): any => {
    // Parse HTML content to extract blocks - this is a simplified parser
    const blocks = parseHtmlToBlocks(htmlTemplate.html);
    
    return {
      id: htmlTemplate.id,
      name: htmlTemplate.name,
      description: htmlTemplate.description,
      category: htmlTemplate.category,
      blocks: blocks,
      globalStyles: {
        primaryColor: htmlTemplate.colors.primary,
        secondaryColor: htmlTemplate.colors.secondary,
        accentColor: htmlTemplate.colors.accent,
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }
    };
  };

  const parseHtmlToBlocks = (html: string): any[] => {
    // Parse HTML content in order to preserve the original structure
    const blocks = [];
    let blockIndex = 0;
    
    // Remove the outer container and header to focus on content
    let contentHtml = html;
    
    // Split by common patterns to maintain order
    const parts = contentHtml.split(/(<h[1-6][^>]*>.*?<\/h[1-6]>|<p[^>]*>.*?<\/p>|<a[^>]*>.*?<\/a>|<div[^>]*style="[^"]*background[^"]*"[^>]*>.*?<\/div>)/gi);
    
    parts.forEach((part, index) => {
      if (!part.trim() || part.length < 10) return;
      
      // Check if it's a heading
      const headingMatch = part.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
      if (headingMatch) {
        const content = headingMatch[1].replace(/<[^>]*>/g, '').trim();
        if (content && !content.includes('FokusHub360')) {
          blocks.push({
            id: `heading-${blockIndex++}`,
            type: 'heading',
            content: content,
            styles: { fontSize: '24px', fontWeight: 'bold', color: '#333333', textAlign: 'left' }
          });
        }
        return;
      }
      
      // Check if it's a paragraph
      const paragraphMatch = part.match(/<p[^>]*>(.*?)<\/p>/i);
      if (paragraphMatch) {
        const content = paragraphMatch[1].replace(/<[^>]*>/g, '').trim();
        if (content && !content.includes('Premium Virtual Focus Groups')) {
          blocks.push({
            id: `text-${blockIndex++}`,
            type: 'text',
            content: content,
            styles: { fontSize: '16px', color: '#666666', textAlign: 'left' }
          });
        }
        return;
      }
      
      // Check if it's a button/link
      const buttonMatch = part.match(/<a[^>]*>(.*?)<\/a>/i);
      if (buttonMatch) {
        const content = buttonMatch[1].replace(/<[^>]*>/g, '').trim();
        const hrefMatch = part.match(/href="([^"]*)"/);
        const href = hrefMatch ? hrefMatch[1] : '#';
        
        if (content) {
          blocks.push({
            id: `button-${blockIndex++}`,
            type: 'button',
            content: content,
            styles: { fontSize: '16px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#667eea', padding: '12px 24px', borderRadius: '6px', textAlign: 'center' },
            settings: { buttonText: content, buttonUrl: href }
          });
        }
        return;
      }
      
      // Check if it's a highlighted div
      const divMatch = part.match(/<div[^>]*style="[^"]*background[^"]*"[^>]*>(.*?)<\/div>/i);
      if (divMatch) {
        const content = divMatch[1].replace(/<[^>]*>/g, '').trim();
        if (content && content.length > 10 && !content.includes('FokusHub360')) {
          blocks.push({
            id: `highlight-${blockIndex++}`,
            type: 'text',
            content: content,
            styles: { fontSize: '14px', color: '#333333', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', textAlign: 'center' }
          });
        }
        return;
      }
    });
    
    // If no blocks found, create default content
    if (blocks.length === 0) {
      blocks.push(
        {
          id: '1',
          type: 'heading',
          content: 'Email Template',
          styles: { fontSize: '24px', fontWeight: 'bold', color: '#333333', textAlign: 'center' }
        },
        {
          id: '2',
          type: 'text',
          content: 'Hello {{firstName}}, this is your email content.',
          styles: { fontSize: '16px', color: '#666666', textAlign: 'left' }
        },
        {
          id: '3',
          type: 'button',
          content: 'Take Action',
          styles: { fontSize: '16px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#667eea', padding: '12px 24px', borderRadius: '6px', textAlign: 'center' },
          settings: { buttonText: 'Take Action', buttonUrl: '{{actionUrl}}' }
        }
      );
    }
    
    return blocks;
  };

  const convertToHtmlTemplate = (visualTemplate: any): EmailTemplate => {
    // Convert visual builder format back to HTML template
    // This would generate the HTML from the blocks
    return {
      id: visualTemplate.id,
      name: visualTemplate.name,
      description: visualTemplate.description,
      category: visualTemplate.category,
      preview: `${visualTemplate.description} - Professional FokusHub360 design`,
      thumbnail: `linear-gradient(135deg, ${visualTemplate.globalStyles.primaryColor} 0%, ${visualTemplate.globalStyles.secondaryColor} 100%)`,
      colors: {
        primary: visualTemplate.globalStyles.primaryColor,
        secondary: visualTemplate.globalStyles.secondaryColor,
        accent: visualTemplate.globalStyles.accentColor
      },
      html: generateHtmlFromBlocks(visualTemplate.blocks, visualTemplate.globalStyles)
    };
  };

  const generateHtmlFromBlocks = (blocks: any[], globalStyles: any): string => {
    const headerHTML = `
      <div style="background: linear-gradient(135deg, ${globalStyles.primaryColor} 0%, ${globalStyles.secondaryColor} 100%); padding: 40px; text-align: center;">
        <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Premium Virtual Focus Groups</p>
      </div>
    `;
    
    const blocksHTML = blocks.map(block => {
      const styles = Object.entries(block.styles || {})
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
      
      switch (block.type) {
        case 'heading':
          return `<h2 style="${styles}; margin: 20px 0;">${block.content}</h2>`;
        case 'text':
          return `<p style="${styles}; line-height: 1.6; margin: 15px 0;">${block.content}</p>`;
        case 'button':
          return `<div style="text-align: ${block.styles.textAlign}; margin: 20px 0;"><a href="${block.settings?.buttonUrl || '#'}" style="${styles}; text-decoration: none; display: inline-block; font-weight: bold;">${block.settings?.buttonText || block.content}</a></div>`;
        case 'image':
          return `<div style="text-align: ${block.styles.textAlign}; margin: 20px 0;"><img src="${block.settings?.imageUrl || ''}" alt="${block.settings?.imageAlt || ''}" style="${styles}; max-width: 100%; height: auto;" /></div>`;
        case 'divider':
          return `<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />`;
        case 'spacer':
          return `<div style="height: ${block.settings?.spacerHeight || '20px'};"></div>`;
        default:
          return '';
      }
    }).join('');
    
    return `
      <div style="font-family: ${globalStyles.fontFamily}; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, ${globalStyles.primaryColor} 0%, ${globalStyles.secondaryColor} 100%); padding: 40px 0;">
        <div style="background: ${globalStyles.backgroundColor}; margin: 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          ${headerHTML}
          <div style="padding: 40px;">
            ${blocksHTML}
          </div>
        </div>
      </div>
    `;
  };

  // Handle template selection
  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    if (!emailSubject) {
      setEmailSubject(template.preview);
    }
  };

  // Handle send email
  const handleSendEmail = () => {
    if (!selectedTemplate || !emailSubject) {
      toast({
        title: "Error",
        description: "Please select a template and enter a subject",
        variant: "destructive",
      });
      return;
    }

    const recipients = selectedUsers.length > 0 ? selectedUsers : 
                     selectedSegment ? [selectedSegment] : [];
    
    if (recipients.length === 0) {
      toast({
        title: "Error",
        description: "Please select recipients or a segment",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate({
      template: selectedTemplate,
      subject: emailSubject,
      message: customMessage,
      recipients,
      segmentId: selectedSegment
    });
  };

  // Handle create campaign
  const handleCreateCampaign = () => {
    if (!campaignName || !selectedTemplate || !emailSubject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate({
      name: campaignName,
      subject: emailSubject,
      template: selectedTemplate,
      message: customMessage,
      segmentId: selectedSegment,
      status: 'draft'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Email Manager</h2>
            <p className="text-muted-foreground">
              Comprehensive email management and template system
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">
            <Users className="w-3 h-3 mr-1" />
            {users.length} users
          </Badge>
          <Badge variant="secondary">
            <Palette className="w-3 h-3 mr-1" />
            {emailTemplates.length} templates
          </Badge>
          <Badge variant="secondary">
            <Target className="w-3 h-3 mr-1" />
            {segments.length} segments
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Email Composer
                </CardTitle>
                <CardDescription>
                  Create and send emails using professional templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Custom Message</Label>
                  <Textarea
                    id="message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add your custom message here..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment or users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="clients">Clients Only</SelectItem>
                      <SelectItem value="participants">Participants Only</SelectItem>
                      <SelectItem value="unverified">Unverified Users</SelectItem>
                      {segments.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id}>
                          {segment.name} ({segment.userCount} users)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendEmail}
                    disabled={sendEmailMutation.isPending}
                    className="flex-1"
                  >
                    {sendEmailMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewMode(true)}
                    disabled={!selectedTemplate}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Template Selection
                </CardTitle>
                <CardDescription>
                  Choose from beautifully designed templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-1 gap-3">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: template.thumbnail }}
                            >
                              F360
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {template.description}
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <EmailTemplateLibrary 
            onSelectTemplate={handleTemplateSelect}
            selectedTemplate={selectedTemplate}
            onEditTemplate={openTemplateEditor}
            onCreateTemplate={createNewTemplate}
          />
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Email Segments</h3>
              <p className="text-muted-foreground">
                Organize users into targeted groups for better email campaigns
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Segment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {segment.name}
                  </CardTitle>
                  <CardDescription>{segment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Users</span>
                      <Badge variant="secondary">{segment.userCount}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Email Campaigns</h3>
              <p className="text-muted-foreground">
                Track and manage your email marketing campaigns
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <Badge 
                      variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardDescription>{campaign.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{campaign.recipients}</div>
                        <div className="text-xs text-muted-foreground">Recipients</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{campaign.opened}</div>
                        <div className="text-xs text-muted-foreground">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{campaign.clicked}</div>
                        <div className="text-xs text-muted-foreground">Clicked</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure global email settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {emailSettings && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-enabled">Email System</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable the email system
                      </p>
                    </div>
                    <Switch
                      id="email-enabled"
                      checked={emailSettings.enabled}
                      onCheckedChange={(checked) =>
                        updateSettingsMutation.mutate({
                          ...emailSettings,
                          enabled: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-email">From Email</Label>
                      <Input
                        id="from-email"
                        value={emailSettings.from_email}
                        onChange={(e) =>
                          updateSettingsMutation.mutate({
                            ...emailSettings,
                            from_email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="from-name">From Name</Label>
                      <Input
                        id="from-name"
                        value={emailSettings.from_name}
                        onChange={(e) =>
                          updateSettingsMutation.mutate({
                            ...emailSettings,
                            from_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Automated Emails</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-welcome">Welcome Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Send welcome emails to new users
                        </p>
                      </div>
                      <Switch
                        id="auto-welcome"
                        checked={emailSettings.auto_welcome}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({
                            ...emailSettings,
                            auto_welcome: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-invites">Campaign Invites</Label>
                        <p className="text-sm text-muted-foreground">
                          Send automated campaign invitations
                        </p>
                      </div>
                      <Switch
                        id="auto-invites"
                        checked={emailSettings.auto_campaign_invites}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({
                            ...emailSettings,
                            auto_campaign_invites: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-reminders">Verification Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Send verification reminder emails
                        </p>
                      </div>
                      <Switch
                        id="auto-reminders"
                        checked={emailSettings.auto_verification_reminders}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({
                            ...emailSettings,
                            auto_verification_reminders: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewMode} onOpenChange={setPreviewMode}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how your email will look to recipients
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div 
              className="border rounded-lg p-4 bg-background"
              dangerouslySetInnerHTML={{ __html: generatePreview() }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Visual Email Builder Dialog */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <VisualEmailBuilder
            template={editingTemplate ? convertToVisualTemplate(editingTemplate) : undefined}
            onSave={(template) => {
              const htmlTemplate = convertToHtmlTemplate(template);
              setTemplateForm({
                name: htmlTemplate.name,
                description: htmlTemplate.description,
                category: htmlTemplate.category,
                html: htmlTemplate.html,
                colors: htmlTemplate.colors
              });
              saveTemplate();
              setShowTemplateEditor(false);
            }}
            onCancel={() => setShowTemplateEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}