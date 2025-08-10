import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Type, Image, Video, Link, Palette, Plus, Minus, MoveUp, MoveDown, 
  Save, Eye, Trash2, Copy, Layout, Mail, Star, Gift, Bell, Shield
} from "lucide-react";

interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'button' | 'image' | 'divider' | 'spacer';
  content: string;
  styles: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: string;
    margin?: string;
    borderRadius?: string;
    width?: string;
    height?: string;
  };
  settings?: {
    buttonText?: string;
    buttonUrl?: string;
    imageUrl?: string;
    imageAlt?: string;
    spacerHeight?: string;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  blocks: EmailBlock[];
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
}

const BLOCK_TYPES = [
  { id: 'heading', name: 'Heading', icon: Type, description: 'Add a title or heading' },
  { id: 'text', name: 'Text', icon: Type, description: 'Add paragraph text' },
  { id: 'button', name: 'Button', icon: Link, description: 'Add a call-to-action button' },
  { id: 'image', name: 'Image', icon: Image, description: 'Add an image' },
  { id: 'divider', name: 'Divider', icon: Minus, description: 'Add a horizontal line' },
  { id: 'spacer', name: 'Spacer', icon: Plus, description: 'Add vertical spacing' },
];

const PRESET_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Professional welcome message for new users',
    category: 'Welcome',
    icon: Mail,
    blocks: [
      {
        id: '1',
        type: 'heading' as const,
        content: 'Welcome to FokusHub360!',
        styles: { fontSize: '32px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' as const }
      },
      {
        id: '2',
        type: 'text' as const,
        content: 'Hello {{firstName}}, thank you for joining our premium virtual focus group platform.',
        styles: { fontSize: '16px', color: '#666666', textAlign: 'left' as const, padding: '20px' }
      },
      {
        id: '3',
        type: 'button' as const,
        content: 'Get Started',
        styles: { backgroundColor: '#667eea', color: '#ffffff', padding: '15px 30px', borderRadius: '8px', textAlign: 'center' as const },
        settings: { buttonText: 'Get Started', buttonUrl: '{{loginUrl}}' }
      }
    ]
  },
  {
    id: 'campaign',
    name: 'Campaign Invitation',
    description: 'Invite users to participate in campaigns',
    category: 'Campaign',
    icon: Star,
    blocks: [
      {
        id: '1',
        type: 'heading' as const,
        content: 'You\'re Invited!',
        styles: { fontSize: '28px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' as const }
      },
      {
        id: '2',
        type: 'text' as const,
        content: 'Hi {{firstName}}, we have an exciting focus group opportunity that matches your profile perfectly.',
        styles: { fontSize: '16px', color: '#666666', textAlign: 'left' as const, padding: '20px' }
      },
      {
        id: '3',
        type: 'text' as const,
        content: '💰 Earn $50 • ⏰ Duration: 30 minutes • 📅 Deadline: 2 days',
        styles: { fontSize: '14px', color: '#333333', textAlign: 'center' as const, backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }
      },
      {
        id: '4',
        type: 'button' as const,
        content: 'Accept Invitation',
        styles: { backgroundColor: '#f093fb', color: '#ffffff', padding: '15px 30px', borderRadius: '8px', textAlign: 'center' as const },
        settings: { buttonText: 'Accept Invitation', buttonUrl: '{{campaignUrl}}' }
      }
    ]
  },
  {
    id: 'notification',
    name: 'System Notification',
    description: 'Important updates and notifications',
    category: 'Notification',
    icon: Bell,
    blocks: [
      {
        id: '1',
        type: 'heading' as const,
        content: 'Important Update',
        styles: { fontSize: '28px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' as const }
      },
      {
        id: '2',
        type: 'text' as const,
        content: 'Hello {{firstName}}, we have an important update about your FokusHub360 account.',
        styles: { fontSize: '16px', color: '#666666', textAlign: 'left' as const, padding: '20px' }
      },
      {
        id: '3',
        type: 'button' as const,
        content: 'Learn More',
        styles: { backgroundColor: '#4facfe', color: '#ffffff', padding: '15px 30px', borderRadius: '8px', textAlign: 'center' as const },
        settings: { buttonText: 'Learn More', buttonUrl: '{{actionUrl}}' }
      }
    ]
  },
  {
    id: 'security',
    name: 'Security Alert',
    description: 'Security notifications and alerts',
    category: 'Security',
    icon: Shield,
    blocks: [
      {
        id: '1',
        type: 'heading' as const,
        content: 'Security Alert',
        styles: { fontSize: '28px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' as const }
      },
      {
        id: '2',
        type: 'text' as const,
        content: 'Hello {{firstName}}, we detected unusual activity on your account.',
        styles: { fontSize: '16px', color: '#666666', textAlign: 'left' as const, padding: '20px' }
      },
      {
        id: '3',
        type: 'text' as const,
        content: '🔒 Please review your account security settings immediately.',
        styles: { fontSize: '14px', color: '#ff6b6b', textAlign: 'center' as const, backgroundColor: '#fff5f5', padding: '15px', borderRadius: '8px' }
      },
      {
        id: '4',
        type: 'button' as const,
        content: 'Secure Account',
        styles: { backgroundColor: '#ff6b6b', color: '#ffffff', padding: '15px 30px', borderRadius: '8px', textAlign: 'center' as const },
        settings: { buttonText: 'Secure Account', buttonUrl: '{{securityUrl}}' }
      }
    ]
  },
  {
    id: 'celebration',
    name: 'Achievement Unlocked',
    description: 'Celebrate user achievements and milestones',
    category: 'Achievement',
    icon: Gift,
    blocks: [
      {
        id: '1',
        type: 'heading' as const,
        content: 'Congratulations! 🎉',
        styles: { fontSize: '32px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' as const }
      },
      {
        id: '2',
        type: 'text' as const,
        content: 'Amazing work, {{firstName}}! You\'ve unlocked a new achievement badge.',
        styles: { fontSize: '18px', color: '#666666', textAlign: 'center' as const, padding: '20px' }
      },
      {
        id: '3',
        type: 'text' as const,
        content: '🏆 Survey Master • 100 Points Earned • Total: 1,250 Points',
        styles: { fontSize: '16px', color: '#333333', textAlign: 'center' as const, backgroundColor: '#fff5f7', padding: '20px', borderRadius: '10px' }
      },
      {
        id: '4',
        type: 'button' as const,
        content: 'View Achievements',
        styles: { backgroundColor: '#f093fb', color: '#ffffff', padding: '15px 30px', borderRadius: '8px', textAlign: 'center' as const },
        settings: { buttonText: 'View Achievements', buttonUrl: '{{achievementsUrl}}' }
      }
    ]
  }
];

interface VisualEmailBuilderProps {
  template?: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
}

export function VisualEmailBuilder({ template, onSave, onCancel }: VisualEmailBuilderProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>(
    template || {
      id: '',
      name: '',
      description: '',
      category: 'Campaign',
      blocks: [],
      globalStyles: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#f8f9fa',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }
    }
  );
  
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);

  const loadPreset = (presetId: string) => {
    const preset = PRESET_TEMPLATES.find(p => p.id === presetId);
    if (preset) {
      setCurrentTemplate({
        ...currentTemplate,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        blocks: preset.blocks.map(block => ({ ...block, id: Math.random().toString(36).substr(2, 9) }))
      });
      setSelectedPreset(presetId);
    }
  };

  const addBlock = (type: string) => {
    const newBlock: EmailBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: type as any,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      settings: getDefaultSettings(type)
    };
    
    setCurrentTemplate({
      ...currentTemplate,
      blocks: [...currentTemplate.blocks, newBlock]
    });
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (blockId: string, updates: Partial<EmailBlock>) => {
    setCurrentTemplate({
      ...currentTemplate,
      blocks: currentTemplate.blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    });
  };

  const deleteBlock = (blockId: string) => {
    setCurrentTemplate({
      ...currentTemplate,
      blocks: currentTemplate.blocks.filter(block => block.id !== blockId)
    });
    setSelectedBlockId('');
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...currentTemplate.blocks];
    const index = blocks.findIndex(b => b.id === blockId);
    
    if (direction === 'up' && index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }
    
    setCurrentTemplate({ ...currentTemplate, blocks });
  };

  const generateHTML = () => {
    const { globalStyles, blocks } = currentTemplate;
    
    const headerHTML = `
      <div style="background: linear-gradient(135deg, ${globalStyles.primaryColor} 0%, ${globalStyles.secondaryColor} 100%); padding: 40px; text-align: center;">
        <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">FokusHub360</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0 0;">Premium Virtual Focus Groups</p>
      </div>
    `;
    
    const blocksHTML = blocks.map(block => {
      const styles = Object.entries(block.styles)
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

  const selectedBlock = currentTemplate.blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="h-full flex">
      {/* Left Panel - Block Library & Settings */}
      <div className="w-80 border-r bg-muted/50 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-2">Email Builder</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={currentTemplate.description}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                placeholder="Template description"
              />
            </div>
            <div>
              <Label htmlFor="template-category">Category</Label>
              <Select 
                value={currentTemplate.category} 
                onValueChange={(value) => setCurrentTemplate({ ...currentTemplate, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Welcome">Welcome</SelectItem>
                  <SelectItem value="Campaign">Campaign</SelectItem>
                  <SelectItem value="Notification">Notification</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Achievement">Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Template Presets */}
        <div className="p-4 border-b">
          <h4 className="font-medium mb-3">Quick Start Templates</h4>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_TEMPLATES.map((preset) => (
              <Button
                key={preset.id}
                variant={selectedPreset === preset.id ? "default" : "outline"}
                size="sm"
                onClick={() => loadPreset(preset.id)}
                className="h-auto p-2 flex flex-col items-center gap-1"
              >
                <preset.icon className="w-4 h-4" />
                <span className="text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Block Library */}
        <div className="p-4 border-b">
          <h4 className="font-medium mb-3">Add Elements</h4>
          <div className="space-y-2">
            {BLOCK_TYPES.map((blockType) => (
              <Button
                key={blockType.id}
                variant="outline"
                size="sm"
                onClick={() => addBlock(blockType.id)}
                className="w-full justify-start gap-2"
              >
                <blockType.icon className="w-4 h-4" />
                {blockType.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Block Settings */}
        <ScrollArea className="flex-1 p-4">
          {selectedBlock ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Edit {selectedBlock.type}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteBlock(selectedBlock.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="block-content">Content</Label>
                  <Textarea
                    id="block-content"
                    value={selectedBlock.content}
                    onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                    placeholder="Enter content..."
                    rows={3}
                  />
                </div>
                
                {selectedBlock.type === 'button' && (
                  <>
                    <div>
                      <Label htmlFor="button-text">Button Text</Label>
                      <Input
                        id="button-text"
                        value={selectedBlock.settings?.buttonText || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { 
                          settings: { ...selectedBlock.settings, buttonText: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="button-url">Button URL</Label>
                      <Input
                        id="button-url"
                        value={selectedBlock.settings?.buttonUrl || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { 
                          settings: { ...selectedBlock.settings, buttonUrl: e.target.value }
                        })}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="text-align">Text Alignment</Label>
                  <Select
                    value={selectedBlock.styles.textAlign || 'left'}
                    onValueChange={(value) => updateBlock(selectedBlock.id, { 
                      styles: { ...selectedBlock.styles, textAlign: value as any }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select
                    value={selectedBlock.styles.fontSize || '16px'}
                    onValueChange={(value) => updateBlock(selectedBlock.id, { 
                      styles: { ...selectedBlock.styles, fontSize: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12px">Small</SelectItem>
                      <SelectItem value="16px">Normal</SelectItem>
                      <SelectItem value="20px">Large</SelectItem>
                      <SelectItem value="24px">X-Large</SelectItem>
                      <SelectItem value="32px">Heading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <Input
                    id="text-color"
                    type="color"
                    value={selectedBlock.styles.color || '#000000'}
                    onChange={(e) => updateBlock(selectedBlock.id, { 
                      styles: { ...selectedBlock.styles, color: e.target.value }
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={selectedBlock.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateBlock(selectedBlock.id, { 
                      styles: { ...selectedBlock.styles, backgroundColor: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Layout className="w-8 h-8 mx-auto mb-2" />
              <p>Select a block to edit its properties</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Email Preview</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onSave({
                  ...currentTemplate,
                  id: currentTemplate.id || Math.random().toString(36).substr(2, 9)
                })}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {previewMode ? (
            <div 
              className="max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: generateHTML() }}
            />
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {currentTemplate.blocks.map((block, index) => (
                <Card
                  key={block.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedBlockId === block.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{block.type}</Badge>
                        <span className="text-sm font-medium">Block {index + 1}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'up');
                          }}
                          disabled={index === 0}
                        >
                          <MoveUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'down');
                          }}
                          disabled={index === currentTemplate.blocks.length - 1}
                        >
                          <MoveDown className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {block.content.substring(0, 100)}
                      {block.content.length > 100 && '...'}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {currentTemplate.blocks.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Start building your email</p>
                  <p className="text-sm">Choose a quick start template or add blocks from the left panel</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

// Helper functions
function getDefaultContent(type: string): string {
  switch (type) {
    case 'heading': return 'Your Heading Here';
    case 'text': return 'Your text content goes here. You can include variables like {{firstName}} for personalization.';
    case 'button': return 'Click Here';
    case 'image': return '';
    case 'divider': return '';
    case 'spacer': return '';
    default: return '';
  }
}

function getDefaultStyles(type: string): any {
  switch (type) {
    case 'heading': return { 
      fontSize: '24px', 
      fontWeight: 'bold', 
      color: '#333333', 
      textAlign: 'left' 
    };
    case 'text': return { 
      fontSize: '16px', 
      color: '#666666', 
      textAlign: 'left' 
    };
    case 'button': return { 
      fontSize: '16px', 
      fontWeight: 'bold', 
      color: '#ffffff', 
      backgroundColor: '#667eea', 
      padding: '12px 24px', 
      borderRadius: '6px', 
      textAlign: 'center' 
    };
    case 'image': return { 
      width: '100%', 
      textAlign: 'center' 
    };
    default: return {};
  }
}

function getDefaultSettings(type: string): any {
  switch (type) {
    case 'button': return { 
      buttonText: 'Click Here', 
      buttonUrl: '#' 
    };
    case 'image': return { 
      imageUrl: '', 
      imageAlt: '' 
    };
    case 'spacer': return { 
      spacerHeight: '20px' 
    };
    default: return {};
  }
}