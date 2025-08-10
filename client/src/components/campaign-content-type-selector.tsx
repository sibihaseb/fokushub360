import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Video, 
  Camera, 
  Link, 
  Upload, 
  Play,
  Image as ImageIcon,
  Film,
  Megaphone,
  Smartphone,
  BookOpen,
  Lightbulb,
  Tv,
  Globe,
  ShoppingBag,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  supportedFormats: string[];
  aiAnalysisAvailable: boolean;
  color: string;
}

interface CampaignContentTypeSelectorProps {
  onContentTypeSelect: (contentType: ContentType, uploadMethod: 'upload' | 'link', data: any) => void;
}

const contentTypes: ContentType[] = [
  {
    id: 'video-content',
    name: 'Video Content',
    description: 'General video content for comprehensive feedback',
    icon: Video,
    category: 'Video',
    supportedFormats: ['mp4', 'mov', 'avi', 'wmv'],
    aiAnalysisAvailable: true,
    color: 'bg-purple-500'
  },
  {
    id: 'trailer',
    name: 'Movie/Product Trailer',
    description: 'Trailers for movies, products, or services',
    icon: Film,
    category: 'Video',
    supportedFormats: ['mp4', 'mov', 'avi'],
    aiAnalysisAvailable: true,
    color: 'bg-red-500'
  },
  {
    id: 'teaser',
    name: 'Teaser Content',
    description: 'Short teaser videos or previews',
    icon: Play,
    category: 'Video',
    supportedFormats: ['mp4', 'mov'],
    aiAnalysisAvailable: true,
    color: 'bg-orange-500'
  },
  {
    id: 'promo',
    name: 'Promotional Content',
    description: 'Promotional videos and advertisements',
    icon: Megaphone,
    category: 'Video',
    supportedFormats: ['mp4', 'mov', 'avi'],
    aiAnalysisAvailable: true,
    color: 'bg-green-500'
  },
  {
    id: 'social-media',
    name: 'Social Media Content',
    description: 'Content optimized for social media platforms',
    icon: Smartphone,
    category: 'Mixed',
    supportedFormats: ['mp4', 'mov', 'jpg', 'png', 'gif'],
    aiAnalysisAvailable: true,
    color: 'bg-blue-500'
  },
  {
    id: 'marketing',
    name: 'Marketing Material',
    description: 'General marketing and advertising content',
    icon: Tv,
    category: 'Mixed',
    supportedFormats: ['mp4', 'mov', 'jpg', 'png', 'pdf'],
    aiAnalysisAvailable: true,
    color: 'bg-indigo-500'
  },
  {
    id: 'book-cover',
    name: 'Book Cover',
    description: 'Book covers and publishing materials',
    icon: BookOpen,
    category: 'Image',
    supportedFormats: ['jpg', 'png', 'pdf'],
    aiAnalysisAvailable: true,
    color: 'bg-yellow-500'
  },
  {
    id: 'product-concept',
    name: 'Product Concept',
    description: 'Product designs and concept visualizations',
    icon: Lightbulb,
    category: 'Image',
    supportedFormats: ['jpg', 'png', 'pdf', 'svg'],
    aiAnalysisAvailable: true,
    color: 'bg-pink-500'
  },
  {
    id: 'website-design',
    name: 'Website Design',
    description: 'Website layouts and user interface designs',
    icon: Globe,
    category: 'Image',
    supportedFormats: ['jpg', 'png', 'pdf'],
    aiAnalysisAvailable: true,
    color: 'bg-cyan-500'
  },
  {
    id: 'packaging',
    name: 'Product Packaging',
    description: 'Package designs and product presentation',
    icon: ShoppingBag,
    category: 'Image',
    supportedFormats: ['jpg', 'png', 'pdf'],
    aiAnalysisAvailable: true,
    color: 'bg-emerald-500'
  },
  {
    id: 'logo-branding',
    name: 'Logo & Branding',
    description: 'Logos, brand identities, and visual branding',
    icon: Zap,
    category: 'Image',
    supportedFormats: ['jpg', 'png', 'svg', 'pdf'],
    aiAnalysisAvailable: true,
    color: 'bg-violet-500'
  },
  {
    id: 'infographic',
    name: 'Infographic',
    description: 'Data visualizations and informational graphics',
    icon: ImageIcon,
    category: 'Image',
    supportedFormats: ['jpg', 'png', 'pdf'],
    aiAnalysisAvailable: true,
    color: 'bg-teal-500'
  }
];

export default function CampaignContentTypeSelector({ onContentTypeSelect }: CampaignContentTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'link'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
  };

  const handleContinue = () => {
    if (!selectedType) return;

    const data = {
      uploadMethod,
      files: uploadedFiles,
      linkUrl,
      additionalNotes,
      contentType: selectedType
    };

    onContentTypeSelect(selectedType, uploadMethod, data);
  };

  const categories = Array.from(new Set(contentTypes.map(type => type.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Select Content Type</h2>
        <p className="text-gray-600">Choose the type of content you want to test with participants</p>
      </div>

      {/* Content Type Selection */}
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center space-x-2">
              {category === 'Video' && <Video className="w-5 h-5 text-purple-500" />}
              {category === 'Image' && <ImageIcon className="w-5 h-5 text-blue-500" />}
              {category === 'Mixed' && <Zap className="w-5 h-5 text-green-500" />}
              <span>{category} Content</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentTypes.filter(type => type.category === category).map(type => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedType?.id === type.id ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${type.color} bg-opacity-10`}>
                          <Icon className={`w-5 h-5 ${type.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{type.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex flex-wrap gap-1">
                              {type.supportedFormats.slice(0, 3).map(format => (
                                <Badge key={format} variant="secondary" className="text-xs px-1 py-0">
                                  {format.toUpperCase()}
                                </Badge>
                              ))}
                              {type.supportedFormats.length > 3 && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  +{type.supportedFormats.length - 3}
                                </Badge>
                              )}
                            </div>
                            {type.aiAnalysisAvailable && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">
                                AI Analysis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Method Selection */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${selectedType.color} bg-opacity-10`}>
                <selectedType.icon className={`w-5 h-5 ${selectedType.color.replace('bg-', 'text-')}`} />
              </div>
              <span>{selectedType.name}</span>
            </CardTitle>
            <CardDescription>Choose how you want to provide your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  uploadMethod === 'upload' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setUploadMethod('upload')}
              >
                <CardContent className="p-4 text-center">
                  <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-medium">Upload Files</h3>
                  <p className="text-sm text-gray-600 mt-1">Upload your content directly</p>
                  <div className="mt-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      AI Analysis Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  uploadMethod === 'link' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setUploadMethod('link')}
              >
                <CardContent className="p-4 text-center">
                  <Link className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium">Provide Link</h3>
                  <p className="text-sm text-gray-600 mt-1">Share a URL to your content</p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      No AI Analysis
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {uploadMethod === 'upload' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload Files</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your files here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: {selectedType.supportedFormats.join(', ').toUpperCase()}
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept={selectedType.supportedFormats.map(format => `.${format}`).join(',')}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Files:</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Video className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedFiles.length > 0 && selectedType.aiAnalysisAvailable && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your uploaded files are eligible for AI analysis. This will provide detailed insights including sentiment analysis, demographic targeting, and content recommendations.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {uploadMethod === 'link' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content-url">Content URL</Label>
                  <Input
                    id="content-url"
                    placeholder="https://example.com/your-content"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> AI analysis is not available for linked content. Only uploaded files can be analyzed by our AI system. Participants will still be able to view and provide feedback on your linked content.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div>
              <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="additional-notes"
                placeholder="Any additional context or specific areas you'd like participants to focus on..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={
                  (uploadMethod === 'upload' && uploadedFiles.length === 0) ||
                  (uploadMethod === 'link' && !linkUrl.trim())
                }
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue to Questions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}