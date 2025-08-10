import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Send, 
  Users, 
  Filter, 
  Image, 
  Video, 
  Music, 
  Type, 
  Palette, 
  Eye,
  Save,
  Upload,
  Target,
  Mail,
  Calendar,
  Clock
} from 'lucide-react';

interface EmailSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    role?: string[];
    verificationStatus?: string[];
    campaignParticipation?: string[];
    earnings?: { min?: number; max?: number };
    joinDate?: { after?: string; before?: string };
    demographics?: {
      ageRange?: { min: number; max: number };
      location?: string[];
      gender?: string[];
    };
  };
  userCount?: number;
}

interface EmailDesign {
  subject: string;
  preheader?: string;
  template: 'modern' | 'classic' | 'minimal' | 'newsletter';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      heading: number;
      body: number;
    };
  };
  layout: {
    width: number;
    padding: number;
    borderRadius: number;
  };
  header?: {
    logo?: string;
    title?: string;
    subtitle?: string;
  };
  footer?: {
    companyName: string;
    address?: string;
    unsubscribeLink: boolean;
  };
}

interface EmailContent {
  blocks: EmailBlock[];
}

interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'button' | 'divider' | 'spacer';
  content: {
    text?: string;
    html?: string;
    src?: string;
    alt?: string;
    url?: string;
    buttonText?: string;
    height?: number;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    backgroundColor?: string;
    padding?: number;
    margin?: number;
  };
  styles?: {
    [key: string]: any;
  };
}

export default function AdvancedEmailComposer() {
  const [selectedSegment, setSelectedSegment] = useState<EmailSegment | null>(null);
  const [emailDesign, setEmailDesign] = useState<EmailDesign>({
    subject: '',
    template: 'modern',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#ffffff',
      text: '#2d3748'
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
      size: { heading: 24, body: 16 }
    },
    layout: {
      width: 600,
      padding: 20,
      borderRadius: 8
    },
    footer: {
      companyName: 'FokusHub360',
      unsubscribeLink: true
    }
  });
  const [emailContent, setEmailContent] = useState<EmailContent>({
    blocks: []
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [scheduledSend, setScheduledSend] = useState<Date | null>(null);
  const [testRecipients, setTestRecipients] = useState<string[]>(['']);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available email segments
  const { data: segments = [] } = useQuery<EmailSegment[]>({
    queryKey: ["/api/admin/email-segments"],
  });

  // Fetch users for segmentation
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Create email segment mutation
  const createSegmentMutation = useMutation({
    mutationFn: (segment: Omit<EmailSegment, 'id'>) => 
      apiRequest("/api/admin/email-segments", "POST", segment),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email segment created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-segments"] });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: {
      design: EmailDesign;
      content: EmailContent;
      recipients: string[];
      segmentId?: string;
      scheduledAt?: Date;
    }) => apiRequest("/api/admin/email/send-advanced", "POST", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email sent successfully!",
      });
    },
  });

  // Add content block
  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: {
        text: type === 'text' ? 'Enter your text here...' : '',
        alignment: 'left',
        fontSize: 16,
        fontWeight: 'normal',
        color: emailDesign.colors.text,
        padding: 10,
        margin: 10
      }
    };

    setEmailContent(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  // Update block content
  const updateBlock = (blockId: string, updates: Partial<EmailBlock['content']>) => {
    setEmailContent(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { ...block, content: { ...block.content, ...updates } }
          : block
      )
    }));
  };

  // Remove block
  const removeBlock = (blockId: string) => {
    setEmailContent(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
  };

  // Generate email preview HTML
  const generatePreviewHTML = () => {
    const { colors, fonts, layout } = emailDesign;
    
    const headerHTML = emailDesign.header ? `
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);">
        ${emailDesign.header.logo ? `<img src="${emailDesign.header.logo}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;">` : ''}
        ${emailDesign.header.title ? `<h1 style="color: white; margin: 0; font-family: ${fonts.heading}; font-size: ${fonts.size.heading}px;">${emailDesign.header.title}</h1>` : ''}
        ${emailDesign.header.subtitle ? `<p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-family: ${fonts.body};">${emailDesign.header.subtitle}</p>` : ''}
      </div>
    ` : '';

    const contentHTML = emailContent.blocks.map(block => {
      const { content } = block;
      const styles = `
        text-align: ${content.alignment};
        font-size: ${content.fontSize}px;
        font-weight: ${content.fontWeight};
        color: ${content.color};
        padding: ${content.padding}px;
        margin: ${content.margin}px 0;
        background-color: ${content.backgroundColor || 'transparent'};
      `;

      switch (block.type) {
        case 'text':
          return `<div style="${styles}">${content.html || content.text}</div>`;
        case 'image':
          return `<div style="${styles}"><img src="${content.src}" alt="${content.alt}" style="max-width: 100%; height: auto;"></div>`;
        case 'video':
          return `<div style="${styles}"><video controls style="max-width: 100%;"><source src="${content.src}"></video></div>`;
        case 'audio':
          return `<div style="${styles}"><audio controls><source src="${content.src}"></audio></div>`;
        case 'button':
          return `<div style="${styles}"><a href="${content.url}" style="background: ${colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">${content.buttonText}</a></div>`;
        case 'divider':
          return `<hr style="border: none; height: 1px; background: ${colors.secondary}; margin: ${content.margin}px 0;">`;
        case 'spacer':
          return `<div style="height: ${content.height || 20}px;"></div>`;
        default:
          return '';
      }
    }).join('');

    const footerHTML = `
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-top: 1px solid #e9ecef; margin-top: 30px;">
        <p style="margin: 0; font-size: 14px; color: #6c757d;">${emailDesign.footer.companyName}</p>
        ${emailDesign.footer.address ? `<p style="margin: 5px 0; font-size: 12px; color: #6c757d;">${emailDesign.footer.address}</p>` : ''}
        ${emailDesign.footer.unsubscribeLink ? `<p style="margin: 5px 0; font-size: 12px;"><a href="{unsubscribeUrl}" style="color: #6c757d;">Unsubscribe</a></p>` : ''}
      </div>
    `;

    return `
      <div style="max-width: ${layout.width}px; margin: 0 auto; background: ${colors.background}; border-radius: ${layout.borderRadius}px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${headerHTML}
        <div style="padding: ${layout.padding}px;">
          ${contentHTML}
        </div>
        ${footerHTML}
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Advanced Email Composer</h2>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button
            onClick={() => sendEmailMutation.mutate({
              design: emailDesign,
              content: emailContent,
              recipients: selectedRecipients,
              segmentId: selectedSegment?.id,
              scheduledAt: scheduledSend
            })}
            disabled={sendEmailMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="design">
            <Palette className="w-4 h-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="content">
            <Type className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="audience">
            <Target className="w-4 h-4 mr-2" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-effect border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Email Design</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Subject Line</Label>
                  <Input
                    value={emailDesign.subject}
                    onChange={(e) => setEmailDesign(prev => ({ ...prev, subject: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Enter email subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Template Style</Label>
                  <Select
                    value={emailDesign.template}
                    onValueChange={(value: EmailDesign['template']) => 
                      setEmailDesign(prev => ({ ...prev, template: value }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Primary Color</Label>
                  <Input
                    type="color"
                    value={emailDesign.colors.primary}
                    onChange={(e) => setEmailDesign(prev => ({
                      ...prev,
                      colors: { ...prev.colors, primary: e.target.value }
                    }))}
                    className="bg-slate-800 border-slate-600 h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Secondary Color</Label>
                  <Input
                    type="color"
                    value={emailDesign.colors.secondary}
                    onChange={(e) => setEmailDesign(prev => ({
                      ...prev,
                      colors: { ...prev.colors, secondary: e.target.value }
                    }))}
                    className="bg-slate-800 border-slate-600 h-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Typography & Layout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Heading Font</Label>
                  <Select
                    value={emailDesign.fonts.heading}
                    onValueChange={(value) => setEmailDesign(prev => ({
                      ...prev,
                      fonts: { ...prev.fonts, heading: value }
                    }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                      <SelectItem value="'Helvetica Neue', sans-serif">Helvetica Neue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Heading Size: {emailDesign.fonts.size.heading}px</Label>
                  <Slider
                    value={[emailDesign.fonts.size.heading]}
                    onValueChange={(value) => setEmailDesign(prev => ({
                      ...prev,
                      fonts: { ...prev.fonts, size: { ...prev.fonts.size, heading: value[0] } }
                    }))}
                    max={48}
                    min={16}
                    step={2}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Body Size: {emailDesign.fonts.size.body}px</Label>
                  <Slider
                    value={[emailDesign.fonts.size.body]}
                    onValueChange={(value) => setEmailDesign(prev => ({
                      ...prev,
                      fonts: { ...prev.fonts, size: { ...prev.fonts.size, body: value[0] } }
                    }))}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Email Width: {emailDesign.layout.width}px</Label>
                  <Slider
                    value={[emailDesign.layout.width]}
                    onValueChange={(value) => setEmailDesign(prev => ({
                      ...prev,
                      layout: { ...prev.layout, width: value[0] }
                    }))}
                    max={800}
                    min={400}
                    step={20}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Email Content Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => addBlock('text')}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </Button>
                <Button
                  onClick={() => addBlock('image')}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button
                  onClick={() => addBlock('video')}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                <Button
                  onClick={() => addBlock('audio')}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Audio
                </Button>
                <Button
                  onClick={() => addBlock('button')}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  Button
                </Button>
                <Button
                  onClick={() => addBlock('divider')}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  Divider
                </Button>
                <Button
                  onClick={() => addBlock('spacer')}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  Spacer
                </Button>
              </div>

              <div className="space-y-4">
                {emailContent.blocks.map((block, index) => (
                  <Card key={block.id} className="bg-slate-800 border-slate-600">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white text-sm capitalize">{block.type} Block</CardTitle>
                        <Button
                          onClick={() => removeBlock(block.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {block.type === 'text' && (
                        <div className="space-y-2">
                          <Textarea
                            value={block.content.text}
                            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white min-h-24"
                            placeholder="Enter your text content..."
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={block.content.fontSize}
                              onChange={(e) => updateBlock(block.id, { fontSize: parseInt(e.target.value) })}
                              className="bg-slate-700 border-slate-600 text-white w-20"
                              placeholder="Size"
                            />
                            <Input
                              type="color"
                              value={block.content.color}
                              onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                              className="bg-slate-700 border-slate-600 w-16"
                            />
                            <Select
                              value={block.content.alignment}
                              onValueChange={(value) => updateBlock(block.id, { alignment: value })}
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-2">
                          <Input
                            value={block.content.src}
                            onChange={(e) => updateBlock(block.id, { src: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Image URL"
                          />
                          <Input
                            value={block.content.alt}
                            onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Alt text"
                          />
                        </div>
                      )}

                      {block.type === 'button' && (
                        <div className="space-y-2">
                          <Input
                            value={block.content.buttonText}
                            onChange={(e) => updateBlock(block.id, { buttonText: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Button text"
                          />
                          <Input
                            value={block.content.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Link URL"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}