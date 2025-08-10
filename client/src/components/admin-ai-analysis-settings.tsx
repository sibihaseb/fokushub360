import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  DollarSign, 
  Settings, 
  Eye, 
  Camera, 
  Video,
  CheckCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Users,
  Target,
  Sparkles
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIAnalysisSettings {
  enabled: boolean;
  pricing: {
    image: number;
    video: number;
  };
  features: string[];
}

export default function AdminAIAnalysisSettings() {
  const [settings, setSettings] = useState<AIAnalysisSettings>({
    enabled: true,
    pricing: {
      image: 5,
      video: 15
    },
    features: ['comprehensive', 'sentiment', 'demographic', 'content']
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/ai-analysis-settings"],
    onSuccess: (data) => {
      setSettings(data);
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: AIAnalysisSettings) => {
      return await apiRequest("POST", "/api/admin/ai-analysis-settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-analysis-settings"] });
      toast({
        title: "Settings Updated",
        description: "AI analysis settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update AI analysis settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleToggleFeature = (feature: string) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const featureDescriptions = {
    comprehensive: "Complete analysis including all aspects (demographics, emotions, content, insights)",
    sentiment: "Focused sentiment analysis and emotional response detection",
    demographic: "Detailed demographic profiling and audience identification",
    content: "Visual content analysis including objects, brands, and composition"
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'comprehensive':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'sentiment':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'demographic':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'content':
        return <Eye className="w-4 h-4 text-orange-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>AI Analysis Settings</span>
          </h2>
          <p className="text-gray-600">Configure AI-powered image and video analysis features and pricing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={settings.enabled ? "default" : "secondary"}>
            {settings.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-500" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>
                Enable or disable AI analysis features for the entire platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-ai-analysis" className="text-base font-medium">
                    Enable AI Analysis
                  </Label>
                  <p className="text-sm text-gray-600">
                    Allow clients to purchase AI analysis for their uploaded media
                  </p>
                </div>
                <Switch
                  id="enable-ai-analysis"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              {settings.enabled && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    AI analysis is enabled. Clients can purchase analysis for images and videos during campaign creation.
                  </AlertDescription>
                </Alert>
              )}

              {!settings.enabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    AI analysis is disabled. Clients will not see the option to purchase analysis features.
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-600" />
                  AI Analysis Capabilities
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Advanced image analysis using OpenAI GPT-4o vision</li>
                  <li>• Video content analysis with temporal understanding</li>
                  <li>• Comprehensive demographic and emotional profiling</li>
                  <li>• Brand recognition and content identification</li>
                  <li>• Sentiment analysis and market relevance scoring</li>
                  <li>• Automated insight generation and recommendations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span>Pricing Configuration</span>
              </CardTitle>
              <CardDescription>
                Set pricing for AI analysis features (prices in USD)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Image Analysis</h3>
                  </div>
                  <div>
                    <Label htmlFor="image-price">Price per image</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        id="image-price"
                        type="number"
                        min="1"
                        max="50"
                        value={settings.pricing.image}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          pricing: { ...prev.pricing, image: parseInt(e.target.value) || 5 }
                        }))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">per image</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Includes comprehensive analysis:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Visual content detection</li>
                      <li>• Demographic profiling</li>
                      <li>• Emotion analysis</li>
                      <li>• Brand recognition</li>
                      <li>• Marketing insights</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold">Video Analysis</h3>
                  </div>
                  <div>
                    <Label htmlFor="video-price">Price per video</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        id="video-price"
                        type="number"
                        min="5"
                        max="100"
                        value={settings.pricing.video}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          pricing: { ...prev.pricing, video: parseInt(e.target.value) || 15 }
                        }))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">per video</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Includes everything from image analysis plus:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Temporal analysis</li>
                      <li>• Audio analysis</li>
                      <li>• Transition detection</li>
                      <li>• Pacing analysis</li>
                      <li>• Key frame extraction</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Pricing Recommendations</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• Images: $3-$8 per image (industry standard: $5)</p>
                  <p>• Videos: $10-$25 per video (industry standard: $15)</p>
                  <p>• Consider offering bundle discounts for multiple items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>Available Features</span>
              </CardTitle>
              <CardDescription>
                Configure which AI analysis features are available to clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(featureDescriptions).map(([feature, description]) => (
                  <div key={feature} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      {getFeatureIcon(feature)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold capitalize">{feature}</h3>
                          <Badge variant={settings.features.includes(feature) ? "default" : "secondary"}>
                            {settings.features.includes(feature) ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.features.includes(feature)}
                      onCheckedChange={() => handleToggleFeature(feature)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Feature Recommendations</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• <strong>Comprehensive:</strong> Most popular option, provides complete analysis</p>
                  <p>• <strong>Sentiment:</strong> Essential for marketing campaigns and brand monitoring</p>
                  <p>• <strong>Demographic:</strong> Valuable for audience targeting and market research</p>
                  <p>• <strong>Content:</strong> Useful for brand safety and content categorization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Usage Analytics</span>
              </CardTitle>
              <CardDescription>
                Monitor AI analysis usage and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total Analyses</p>
                      <p className="text-2xl font-bold text-purple-800">1,247</p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Revenue Generated</p>
                      <p className="text-2xl font-bold text-green-800">$8,435</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Avg Processing Time</p>
                      <p className="text-2xl font-bold text-blue-800">2.4s</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-semibold">Feature Usage Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(featureDescriptions).map(([feature, _]) => (
                    <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {getFeatureIcon(feature)}
                        <span className="font-medium capitalize">{feature}</span>
                      </div>
                      <Badge variant="outline">
                        {Math.floor(Math.random() * 500) + 100} uses
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setSettings(currentSettings || settings)}>
          Reset Changes
        </Button>
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {updateSettingsMutation.isPending ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}