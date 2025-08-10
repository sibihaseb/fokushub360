import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Settings, 
  Zap, 
  Target, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Sparkles,
  Bot,
  Cpu,
  Database,
  Eye,
  Edit,
  Play,
  Pause,
  Save,
  RefreshCw,
  TestTube,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  Search,
  Filter,
  Download,
  Upload,
  Activity,
  Globe,
  Lock,
  Key,
  Shield,
  Gauge,
  Sliders,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface AISettings {
  openaiApiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  features: {
    sentimentAnalysis: boolean;
    keywordExtraction: boolean;
    participantMatching: boolean;
    reportGeneration: boolean;
    realTimeInsights: boolean;
    conversationAnalysis: boolean;
    trendPrediction: boolean;
    demographicAnalysis: boolean;
  };
  advanced: {
    batchProcessing: boolean;
    customPrompts: boolean;
    modelFinetuning: boolean;
    dataEncryption: boolean;
    rateLimiting: number;
    costLimits: number;
    qualityThreshold: number;
    responseTimeLimit: number;
  };
}

export default function AISettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [testingFeature, setTestingFeature] = useState<string | null>(null);

  const { data: aiSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/ai-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/ai-settings");
      return response.json() as AISettings;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<AISettings>) => {
      const response = await apiRequest("POST", "/api/admin/ai-settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-settings"] });
      toast({ title: "AI settings updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating AI settings", description: error.message, variant: "destructive" });
    },
  });

  const testFeatureMutation = useMutation({
    mutationFn: async (feature: string) => {
      const response = await apiRequest("POST", "/api/admin/ai-test", { feature });
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Feature test completed", description: data.message });
    },
    onError: (error) => {
      toast({ title: "Feature test failed", description: error.message, variant: "destructive" });
    },
  });

  const handleUpdateSettings = (updates: Partial<AISettings>) => {
    updateSettingsMutation.mutate(updates);
  };

  const handleTestFeature = (feature: string) => {
    setTestingFeature(feature);
    testFeatureMutation.mutate(feature);
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    const updatedFeatures = { ...aiSettings?.features, [feature]: enabled };
    handleUpdateSettings({ features: updatedFeatures });
  };

  const handleAdvancedToggle = (setting: string, value: boolean | number) => {
    const updatedAdvanced = { ...aiSettings?.advanced, [setting]: value };
    handleUpdateSettings({ advanced: updatedAdvanced });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Brain className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  AI Configuration
                </h1>
                <p className="text-white/70">
                  Advanced AI settings and feature management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="glass-effect text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white"
                onClick={() => handleTestFeature("connection")}
                disabled={testFeatureMutation.isPending}
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
              <Button 
                className="btn-premium"
                onClick={() => handleUpdateSettings(aiSettings || {})}
                disabled={updateSettingsMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">API Status</p>
                  <p className="text-2xl font-bold text-white">Active</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Model</p>
                  <p className="text-2xl font-bold text-white">{aiSettings?.model || 'gpt-4o'}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Features Active</p>
                  <p className="text-2xl font-bold text-white">
                    {Object.values(aiSettings?.features || {}).filter(Boolean).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Temperature</p>
                  <p className="text-2xl font-bold text-white">{aiSettings?.temperature || 0.7}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 glass-effect mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  OpenAI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="apiKey" className="text-white">API Key</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type="password"
                        value={aiSettings?.openaiApiKey || ''}
                        onChange={(e) => handleUpdateSettings({ openaiApiKey: e.target.value })}
                        className="form-premium pr-10"
                        placeholder="sk-..."
                      />
                      <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-white">Model</Label>
                    <Select value={aiSettings?.model || 'gpt-4o'} onValueChange={(value) => handleUpdateSettings({ model: value })}>
                      <SelectTrigger className="form-premium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o (Latest)</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="temperature" className="text-white">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={aiSettings?.temperature || 0.7}
                      onChange={(e) => handleUpdateSettings({ temperature: parseFloat(e.target.value) })}
                      className="form-premium"
                    />
                    <p className="text-white/60 text-sm mt-1">Controls randomness (0-2)</p>
                  </div>
                  <div>
                    <Label htmlFor="maxTokens" className="text-white">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="1"
                      max="4096"
                      value={aiSettings?.maxTokens || 1000}
                      onChange={(e) => handleUpdateSettings({ maxTokens: parseInt(e.target.value) })}
                      className="form-premium"
                    />
                    <p className="text-white/60 text-sm mt-1">Maximum response length</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="systemPrompt" className="text-white">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={aiSettings?.systemPrompt || ''}
                    onChange={(e) => handleUpdateSettings({ systemPrompt: e.target.value })}
                    className="form-premium h-32"
                    placeholder="You are an AI assistant specialized in market research and focus group analysis..."
                  />
                  <p className="text-white/60 text-sm mt-1">Base instructions for AI behavior</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Feature Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Analysis Features</h3>
                    {[
                      { key: 'sentimentAnalysis', label: 'Sentiment Analysis', desc: 'Analyze emotional tone of responses' },
                      { key: 'keywordExtraction', label: 'Keyword Extraction', desc: 'Extract key themes and topics' },
                      { key: 'trendPrediction', label: 'Trend Prediction', desc: 'Predict market trends from data' },
                      { key: 'demographicAnalysis', label: 'Demographic Analysis', desc: 'Analyze participant demographics' },
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex-1">
                          <p className="text-white font-medium">{feature.label}</p>
                          <p className="text-white/60 text-sm">{feature.desc}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestFeature(feature.key)}
                            disabled={testingFeature === feature.key}
                            className="glass-effect text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white"
                          >
                            <TestTube className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Switch
                            checked={aiSettings?.features[feature.key as keyof typeof aiSettings.features] || false}
                            onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Automation Features</h3>
                    {[
                      { key: 'participantMatching', label: 'Participant Matching', desc: 'AI-powered participant selection' },
                      { key: 'reportGeneration', label: 'Report Generation', desc: 'Automated report creation' },
                      { key: 'realTimeInsights', label: 'Real-time Insights', desc: 'Live analysis during sessions' },
                      { key: 'conversationAnalysis', label: 'Conversation Analysis', desc: 'Analyze group conversations' },
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex-1">
                          <p className="text-white font-medium">{feature.label}</p>
                          <p className="text-white/60 text-sm">{feature.desc}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestFeature(feature.key)}
                            disabled={testingFeature === feature.key}
                            className="glass-effect text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white"
                          >
                            <TestTube className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Switch
                            checked={aiSettings?.features[feature.key as keyof typeof aiSettings.features] || false}
                            onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sliders className="w-5 h-5 mr-2" />
                  Advanced Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="rateLimiting" className="text-white">Rate Limiting (req/min)</Label>
                      <Input
                        id="rateLimiting"
                        type="number"
                        min="1"
                        max="1000"
                        value={aiSettings?.advanced?.rateLimiting || 60}
                        onChange={(e) => handleAdvancedToggle('rateLimiting', parseInt(e.target.value))}
                        className="form-premium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="costLimits" className="text-white">Monthly Cost Limit ($)</Label>
                      <Input
                        id="costLimits"
                        type="number"
                        min="0"
                        value={aiSettings?.advanced?.costLimits || 1000}
                        onChange={(e) => handleAdvancedToggle('costLimits', parseInt(e.target.value))}
                        className="form-premium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="qualityThreshold" className="text-white">Quality Threshold (%)</Label>
                      <Input
                        id="qualityThreshold"
                        type="number"
                        min="0"
                        max="100"
                        value={aiSettings?.advanced?.qualityThreshold || 80}
                        onChange={(e) => handleAdvancedToggle('qualityThreshold', parseInt(e.target.value))}
                        className="form-premium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="responseTimeLimit" className="text-white">Response Time Limit (ms)</Label>
                      <Input
                        id="responseTimeLimit"
                        type="number"
                        min="1000"
                        max="30000"
                        value={aiSettings?.advanced?.responseTimeLimit || 10000}
                        onChange={(e) => handleAdvancedToggle('responseTimeLimit', parseInt(e.target.value))}
                        className="form-premium"
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Advanced Features</h3>
                    {[
                      { key: 'batchProcessing', label: 'Batch Processing', desc: 'Process multiple requests simultaneously' },
                      { key: 'customPrompts', label: 'Custom Prompts', desc: 'Allow custom prompt templates' },
                      { key: 'modelFinetuning', label: 'Model Fine-tuning', desc: 'Use fine-tuned models' },
                      { key: 'dataEncryption', label: 'Data Encryption', desc: 'Encrypt AI processing data' },
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex-1">
                          <p className="text-white font-medium">{feature.label}</p>
                          <p className="text-white/60 text-sm">{feature.desc}</p>
                        </div>
                        <Switch
                          checked={aiSettings?.advanced?.[feature.key as keyof typeof aiSettings.advanced] || false}
                          onCheckedChange={(checked) => handleAdvancedToggle(feature.key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Settings */}
          <TabsContent value="prompts" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Custom Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="sentimentPrompt" className="text-white">Sentiment Analysis Prompt</Label>
                      <Textarea
                        id="sentimentPrompt"
                        className="form-premium h-32"
                        placeholder="Analyze the sentiment of the following text..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="keywordPrompt" className="text-white">Keyword Extraction Prompt</Label>
                      <Textarea
                        id="keywordPrompt"
                        className="form-premium h-32"
                        placeholder="Extract key themes and topics from..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="reportPrompt" className="text-white">Report Generation Prompt</Label>
                      <Textarea
                        id="reportPrompt"
                        className="form-premium h-32"
                        placeholder="Generate a comprehensive report based on..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="matchingPrompt" className="text-white">Participant Matching Prompt</Label>
                      <Textarea
                        id="matchingPrompt"
                        className="form-premium h-32"
                        placeholder="Match participants based on criteria..."
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="btn-premium">
                      <Save className="w-4 h-4 mr-2" />
                      Save Prompts
                    </Button>
                    <Button variant="outline" className="glass-effect text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Settings */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  AI Performance Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <BarChart3 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">98.5%</p>
                    <p className="text-white/70 text-sm">Success Rate</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">1.2s</p>
                    <p className="text-white/70 text-sm">Avg Response Time</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <Database className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">45.2K</p>
                    <p className="text-white/70 text-sm">Requests Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}