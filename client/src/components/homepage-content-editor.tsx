import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Eye, 
  Edit, 
  Upload, 
  Loader2,
  Sparkles,
  Target,
  BarChart3,
  Settings,
  MessageSquare,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface HomePageEditorProps {
  className?: string;
}

interface SectionContent {
  id: string;
  name: string;
  icon: any;
  description: string;
  enabled: boolean;
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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sectionStates, setSectionStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch current section states
  const { data: sectionSettings, isLoading: sectionsLoading } = useQuery({
    queryKey: ['/api/admin/homepage-sections'],
    queryFn: async () => {
      const response = await fetch('/api/admin/homepage-sections', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch section settings');
      return response.json();
    },
  });

  // Update section state mutation
  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionId, enabled }: { sectionId: string; enabled: boolean }) => {
      const response = await fetch('/api/admin/homepage-sections', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ sectionId, enabled }),
      });
      if (!response.ok) throw new Error('Failed to update section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/homepage-sections'] });
      toast({
        title: "Section Updated",
        description: "Homepage section visibility updated successfully.",
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

  // Define the actual homepage sections with their current content
  const homepageSections: SectionContent[] = [
    {
      id: 'hero',
      name: 'Hero Section',
      icon: Sparkles,
      description: 'Main banner with title, subtitle, and call-to-action buttons',
      enabled: sectionSettings?.hero?.enabled ?? true,
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
      enabled: sectionSettings?.features?.enabled ?? true,
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

  // Handle input changes
  const handleInputChange = (key: string, value: string) => {
    setEditingContent(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Save content mutation
  const saveMutation = useMutation({
    mutationFn: async (content: Record<string, any>) => {
      const response = await fetch('/api/homepage/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: selectedSection,
          content: content
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save homepage content');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage/content'] });
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Homepage content saved successfully",
      });
    },
    onError: (error) => {
      console.error('Error saving homepage content:', error);
      toast({
        title: "Error",
        description: "Failed to save homepage content",
        variant: "destructive",
      });
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const result = await uploadFileMutation.mutateAsync(file);
      handleInputChange(fieldKey, result.url);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle content save
  const handleSave = () => {
    if (!selectedSection) return;
    saveMutation.mutate(editingContent);
  };

  // Get current section data
  const currentSection = homepageSections.find(s => s.id === selectedSection);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Homepage Content Editor</h2>
          <p className="text-white/70 mt-1">Edit your homepage content with live preview and media upload support</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Eye className="h-4 w-4" />
            Preview Live Site
          </Button>
          
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Selection */}
        <div className="lg:col-span-1">
          <Card className="card-glass border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Page Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {homepageSections.map((section) => {
                    const Icon = section.icon;
                    
                    return (
                      <div
                        key={section.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedSection === section.id
                            ? 'border-blue-400 bg-blue-500/20'
                            : 'border-white/20 hover:border-white/40 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedSection(section.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-white" />
                            <span className="font-medium text-white">{section.name}</span>
                          </div>
                        </div>
                        <p className="text-xs text-white/60 mt-1">{section.description}</p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-3">
          {currentSection ? (
            <Card className="card-glass border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Edit {currentSection.name}
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </CardTitle>
                <p className="text-white/70 text-sm">{currentSection.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSection.fields.map((field) => (
                    <div
                      key={field.key}
                      className={field.type === 'textarea' ? 'md:col-span-2' : 'md:col-span-1'}
                    >
                      <Label htmlFor={field.key} className="text-white/80 font-medium">
                        {field.label}
                      </Label>
                      
                      {field.type === 'text' && (
                        <Input
                          id={field.key}
                          value={editingContent[field.key] || field.currentValue}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-1"
                        />
                      )}
                      
                      {field.type === 'textarea' && (
                        <Textarea
                          id={field.key}
                          value={editingContent[field.key] || field.currentValue}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-1"
                        />
                      )}
                      
                      {field.type === 'image' && (
                        <div className="mt-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id={field.key}
                              value={editingContent[field.key] || field.currentValue}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`upload-${field.key}`)?.click()}
                              disabled={uploadingFile}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              {uploadingFile ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <input
                            id={`upload-${field.key}`}
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => handleFileUpload(e, field.key)}
                            className="hidden"
                          />
                          {(editingContent[field.key] || field.currentValue) && (
                            <div className="mt-2">
                              <img
                                src={editingContent[field.key] || field.currentValue}
                                alt="Preview"
                                className="max-w-full h-32 object-cover rounded-lg border border-white/20"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-glass border-0 shadow-xl">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Select a Section</h3>
                  <p className="text-white/60">Choose a section from the left to start editing</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}