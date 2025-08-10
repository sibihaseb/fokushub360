import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  Upload, 
  Play, 
  Save, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Image, 
  Video, 
  Type, 
  Link,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Loader2,
  Sparkles,
  Target,
  Users,
  BarChart3,
  Zap,
  Star,
  MessageSquare,
  DollarSign,
  Award,
  TrendingUp
} from "lucide-react";

interface HomePageEditorProps {
  className?: string;
}

interface SectionContent {
  id: string;
  name: string;
  icon: any;
  description: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'video' | 'url' | 'number';
    currentValue: string;
    placeholder?: string;
  }[];
}

export function HomePageEditor({ className }: HomePageEditorProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>('hero');
  const [editingContent, setEditingContent] = useState<Record<string, any>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Define the actual homepage sections with their current content
  const homepageSections: SectionContent[] = [
    {
      id: 'hero',
      name: 'Hero Section',
      icon: Sparkles,
      description: 'Main banner with title, subtitle, and call-to-action buttons',
      fields: [
        {
          key: 'title',
          label: 'Main Title',
          type: 'text',
          currentValue: 'Experience the Future of Market Research',
          placeholder: 'Enter main title'
        },
        {
          key: 'subtitle',
          label: 'Subtitle',
          type: 'textarea',
          currentValue: 'Transform how you gather insights with our AI-powered platform. Connect with perfectly matched participants, analyze sentiment in real-time, and get actionable feedback in minutes, not weeks.',
          placeholder: 'Enter subtitle description'
        },
        {
          key: 'primaryButtonText',
          label: 'Primary Button Text',
          type: 'text',
          currentValue: 'Launch Your Campaign',
          placeholder: 'Primary button text'
        },
        {
          key: 'secondaryButtonText',
          label: 'Secondary Button Text',
          type: 'text',
          currentValue: 'Join as Participant',
          placeholder: 'Secondary button text'
        },
        {
          key: 'heroImage',
          label: 'Hero Image/Video',
          type: 'image',
          currentValue: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900',
          placeholder: 'Upload hero image or video'
        }
      ]
    },
    {
      id: 'features',
      name: 'Features Section',
      icon: Target,
      description: 'Key features and benefits of the platform',
      fields: [
        {
          key: 'sectionTitle',
          label: 'Section Title',
          type: 'text',
          currentValue: 'Powerful Features for Modern Market Research',
          placeholder: 'Features section title'
        },
        {
          key: 'sectionDescription',
          label: 'Section Description',
          type: 'textarea',
          currentValue: 'Discover the cutting-edge capabilities that make FokusHub360 the premium choice for market research professionals.',
          placeholder: 'Features section description'
        },
        {
          key: 'feature1Title',
          label: 'Feature 1 Title',
          type: 'text',
          currentValue: 'Real-Time Analytics',
          placeholder: 'First feature title'
        },
        {
          key: 'feature1Description',
          label: 'Feature 1 Description',
          type: 'textarea',
          currentValue: 'Watch insights unfold as participants engage with your content',
          placeholder: 'First feature description'
        },
        {
          key: 'feature2Title',
          label: 'Feature 2 Title',
          type: 'text',
          currentValue: 'Precision Targeting',
          placeholder: 'Second feature title'
        },
        {
          key: 'feature2Description',
          label: 'Feature 2 Description',
          type: 'textarea',
          currentValue: 'Reach exactly the right audience with our advanced matching algorithms',
          placeholder: 'Second feature description'
        },
        {
          key: 'feature3Title',
          label: 'Feature 3 Title',
          type: 'text',
          currentValue: 'Lightning Speed',
          placeholder: 'Third feature title'
        },
        {
          key: 'feature3Description',
          label: 'Feature 3 Description',
          type: 'textarea',
          currentValue: 'From setup to results in under 24 hours with full automation',
          placeholder: 'Third feature description'
        }
      ]
    },
    {
      id: 'stats',
      name: 'Statistics Section',
      icon: BarChart3,
      description: 'Key performance metrics and statistics',
      fields: [
        {
          key: 'stat1Number',
          label: 'Statistic 1 Number',
          type: 'text',
          currentValue: '85%',
          placeholder: 'First statistic number'
        },
        {
          key: 'stat1Description',
          label: 'Statistic 1 Description',
          type: 'text',
          currentValue: 'Faster than traditional focus groups',
          placeholder: 'First statistic description'
        },
        {
          key: 'stat2Number',
          label: 'Statistic 2 Number',
          type: 'text',
          currentValue: '150+',
          placeholder: 'Second statistic number'
        },
        {
          key: 'stat2Description',
          label: 'Statistic 2 Description',
          type: 'text',
          currentValue: 'Countries and regions covered',
          placeholder: 'Second statistic description'
        },
        {
          key: 'stat3Number',
          label: 'Statistic 3 Number',
          type: 'text',
          currentValue: '98%',
          placeholder: 'Third statistic number'
        },
        {
          key: 'stat3Description',
          label: 'Statistic 3 Description',
          type: 'text',
          currentValue: 'Client satisfaction rate',
          placeholder: 'Third statistic description'
        }
      ]
    },
    {
      id: 'howItWorks',
      name: 'How It Works',
      icon: Settings,
      description: 'Step-by-step process explanation',
      fields: [
        {
          key: 'sectionTitle',
          label: 'Section Title',
          type: 'text',
          currentValue: 'How FokusHub360 Works',
          placeholder: 'How it works section title'
        },
        {
          key: 'sectionDescription',
          label: 'Section Description',
          type: 'textarea',
          currentValue: 'Our streamlined process gets you from concept to insights in record time',
          placeholder: 'How it works description'
        },
        {
          key: 'step1Title',
          label: 'Step 1 Title',
          type: 'text',
          currentValue: 'Create Your Campaign',
          placeholder: 'First step title'
        },
        {
          key: 'step1Description',
          label: 'Step 1 Description',
          type: 'textarea',
          currentValue: 'Set up your focus group with our intuitive campaign builder',
          placeholder: 'First step description'
        },
        {
          key: 'step2Title',
          label: 'Step 2 Title',
          type: 'text',
          currentValue: 'AI Matches Participants',
          placeholder: 'Second step title'
        },
        {
          key: 'step2Description',
          label: 'Step 2 Description',
          type: 'textarea',
          currentValue: 'Our AI finds and invites the perfect participants for your study',
          placeholder: 'Second step description'
        },
        {
          key: 'step3Title',
          label: 'Step 3 Title',
          type: 'text',
          currentValue: 'Collect & Analyze',
          placeholder: 'Third step title'
        },
        {
          key: 'step3Description',
          label: 'Step 3 Description',
          type: 'textarea',
          currentValue: 'Get real-time insights and comprehensive reports',
          placeholder: 'Third step description'
        }
      ]
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      icon: MessageSquare,
      description: 'Customer testimonials and reviews',
      fields: [
        {
          key: 'sectionTitle',
          label: 'Section Title',
          type: 'text',
          currentValue: 'What Our Clients Say',
          placeholder: 'Testimonials section title'
        },
        {
          key: 'testimonial1Name',
          label: 'Testimonial 1 Name',
          type: 'text',
          currentValue: 'Sarah Johnson',
          placeholder: 'First testimonial author name'
        },
        {
          key: 'testimonial1Company',
          label: 'Testimonial 1 Company',
          type: 'text',
          currentValue: 'Marketing Director, TechCorp',
          placeholder: 'First testimonial company'
        },
        {
          key: 'testimonial1Content',
          label: 'Testimonial 1 Content',
          type: 'textarea',
          currentValue: 'FokusHub360 transformed our product research. We got insights in days that used to take weeks.',
          placeholder: 'First testimonial content'
        },
        {
          key: 'testimonial2Name',
          label: 'Testimonial 2 Name',
          type: 'text',
          currentValue: 'Michael Chen',
          placeholder: 'Second testimonial author name'
        },
        {
          key: 'testimonial2Company',
          label: 'Testimonial 2 Company',
          type: 'text',
          currentValue: 'Product Manager, StartupXYZ',
          placeholder: 'Second testimonial company'
        },
        {
          key: 'testimonial2Content',
          label: 'Testimonial 2 Content',
          type: 'textarea',
          currentValue: 'The AI matching is incredible. We reached exactly the right audience for our B2B product.',
          placeholder: 'Second testimonial content'
        }
      ]
    },
    {
      id: 'pricing',
      name: 'Pricing Section',
      icon: DollarSign,
      description: 'Pricing plans and packages',
      fields: [
        {
          key: 'sectionTitle',
          label: 'Section Title',
          type: 'text',
          currentValue: 'Choose Your Plan',
          placeholder: 'Pricing section title'
        },
        {
          key: 'sectionDescription',
          label: 'Section Description',
          type: 'textarea',
          currentValue: 'Flexible pricing options to match your research needs',
          placeholder: 'Pricing section description'
        },
        {
          key: 'basicPlanName',
          label: 'Basic Plan Name',
          type: 'text',
          currentValue: 'Starter',
          placeholder: 'Basic plan name'
        },
        {
          key: 'basicPlanPrice',
          label: 'Basic Plan Price',
          type: 'text',
          currentValue: '$299',
          placeholder: 'Basic plan price'
        },
        {
          key: 'proPlanName',
          label: 'Pro Plan Name',
          type: 'text',
          currentValue: 'Professional',
          placeholder: 'Pro plan name'
        },
        {
          key: 'proPlanPrice',
          label: 'Pro Plan Price',
          type: 'text',
          currentValue: '$599',
          placeholder: 'Pro plan price'
        },
        {
          key: 'enterprisePlanName',
          label: 'Enterprise Plan Name',
          type: 'text',
          currentValue: 'Enterprise',
          placeholder: 'Enterprise plan name'
        },
        {
          key: 'enterprisePlanPrice',
          label: 'Enterprise Plan Price',
          type: 'text',
          currentValue: 'Custom',
          placeholder: 'Enterprise plan price'
        }
      ]
    }
  ];

  // Initialize editing content with current values
  useEffect(() => {
    if (selectedSection) {
      const section = homepageSections.find(s => s.id === selectedSection);
      if (section) {
        const initialContent: Record<string, any> = {};
        section.fields.forEach(field => {
          initialContent[field.key] = field.currentValue;
        });
        setEditingContent(initialContent);
      }
    }
  }, [selectedSection]);

  // Fetch home page content
  const { data: homePageContent, isLoading } = useQuery({
    queryKey: ['/api/homepage/content'],
    queryFn: async () => {
      const response = await fetch('/api/homepage/content');
      if (!response.ok) throw new Error('Failed to fetch home page content');
      return response.json();
    },
  });

  // Create/update content mutation
  const updateContentMutation = useMutation({
    mutationFn: async (content: Partial<HomePageContent>) => {
      const response = await fetch('/api/homepage/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage/content'] });
      toast({
        title: "Content Updated",
        description: "Home page content has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/media', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload file');
      return response.json();
    },
    onSuccess: (data) => {
      const fileUrl = data.url;
      const isVideo = data.mimeType?.startsWith('video/');
      
      setEditingContent(prev => ({
        ...prev,
        [isVideo ? 'videoUrl' : 'imageUrl']: fileUrl
      }));
      
      toast({
        title: "File Uploaded",
        description: `${isVideo ? 'Video' : 'Image'} uploaded successfully to Wasabi server.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, QuickTime).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(true);
    await uploadFileMutation.mutateAsync(file);
    setUploadingFile(false);
  };

  const handleSave = () => {
    if (!selectedSection || !editingContent.section) {
      toast({
        title: "Missing Information",
        description: "Please select a section and fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    updateContentMutation.mutate(editingContent);
  };

  const sections = [
    { id: 'hero', name: 'Hero Section', icon: Home },
    { id: 'features', name: 'Features', icon: Settings },
    { id: 'how-it-works', name: 'How It Works', icon: Play },
    { id: 'testimonials', name: 'Testimonials', icon: Type },
    { id: 'pricing', name: 'Pricing', icon: Globe },
    { id: 'cta', name: 'Call to Action', icon: Link },
  ];

  const currentContent = homePageContent?.find((content: HomePageContent) => content.section === selectedSection);

  useEffect(() => {
    if (currentContent) {
      setEditingContent(currentContent);
    } else if (selectedSection) {
      setEditingContent({
        section: selectedSection,
        title: '',
        subtitle: '',
        content: '',
        imageUrl: '',
        videoUrl: '',
        buttonText: '',
        buttonUrl: '',
        isActive: true,
        sortOrder: 0,
        metadata: {},
      });
    }
  }, [selectedSection, currentContent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Home Page Editor</h2>
          <p className="text-gray-600">Edit your home page content with media upload support</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          {previewMode && (
            <Select value={devicePreview} onValueChange={(value: any) => setDevicePreview(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </div>
                </SelectItem>
                <SelectItem value="tablet">
                  <div className="flex items-center gap-2">
                    <Tablet className="h-4 w-4" />
                    Tablet
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Page Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const hasContent = homePageContent?.some((content: HomePageContent) => content.section === section.id);
                    
                    return (
                      <div
                        key={section.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedSection === section.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSection(section.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{section.name}</span>
                          </div>
                          {hasContent && (
                            <Badge variant="secondary" className="text-xs">
                              Configured
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-2">
          {selectedSection ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Edit {sections.find(s => s.id === selectedSection)?.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingContent.isActive}
                      onCheckedChange={(checked) => 
                        setEditingContent(prev => ({ ...prev, isActive: checked }))
                      }
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter section title"
                        value={editingContent.title || ''}
                        onChange={(e) => setEditingContent(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        placeholder="Enter section subtitle"
                        value={editingContent.subtitle || ''}
                        onChange={(e) => setEditingContent(prev => ({ ...prev, subtitle: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Enter section content"
                        rows={6}
                        value={editingContent.content || ''}
                        onChange={(e) => setEditingContent(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input
                          id="buttonText"
                          placeholder="e.g., Get Started"
                          value={editingContent.buttonText || ''}
                          onChange={(e) => setEditingContent(prev => ({ ...prev, buttonText: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buttonUrl">Button URL</Label>
                        <Input
                          id="buttonUrl"
                          placeholder="e.g., /signup"
                          value={editingContent.buttonUrl || ''}
                          onChange={(e) => setEditingContent(prev => ({ ...prev, buttonUrl: e.target.value }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Upload className="h-5 w-5" />
                        <span className="font-medium">Upload Media to Wasabi Server</span>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <Image className="h-8 w-8 text-gray-400" />
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600">
                            Drop files here or click to browse
                          </p>
                          <p className="text-xs text-gray-500">
                            Supports: JPEG, PNG, GIF, WebP, MP4, WebM, QuickTime (Max 50MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingFile}
                        />
                        {uploadingFile && (
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Uploading...</span>
                          </div>
                        )}
                      </div>

                      {editingContent.imageUrl && (
                        <div className="space-y-2">
                          <Label>Current Image</Label>
                          <div className="relative">
                            <img
                              src={editingContent.imageUrl}
                              alt="Current image"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setEditingContent(prev => ({ ...prev, imageUrl: '' }))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {editingContent.videoUrl && (
                        <div className="space-y-2">
                          <Label>Current Video</Label>
                          <div className="relative">
                            <video
                              src={editingContent.videoUrl}
                              className="w-full h-40 object-cover rounded-lg"
                              controls
                              preload="metadata"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setEditingContent(prev => ({ ...prev, videoUrl: '' }))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        placeholder="0"
                        value={editingContent.sortOrder || 0}
                        onChange={(e) => setEditingContent(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Changes will be saved to the database
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={updateContentMutation.isPending}
                    className="gap-2"
                  >
                    {updateContentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Edit className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Select a Section</h3>
                    <p className="text-gray-600">Choose a section from the left to start editing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}