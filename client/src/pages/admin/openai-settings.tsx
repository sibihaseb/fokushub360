import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Settings, 
  Key, 
  Zap, 
  TestTube, 
  Globe, 
  Users, 
  Target, 
  BarChart3, 
  Shield, 
  Sparkles,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Wand2,
  Lightbulb,
  Cpu,
  Database
} from "lucide-react";

interface OpenAISettings {
  apiKey: string;
  organization: string;
  model: string;
  temperature: number;
  maxTokens: number;
  audienceGeneration: {
    enabled: boolean;
    systemPrompt: string;
    temperature: number;
  };
  participantMatching: {
    enabled: boolean;
    algorithm: 'similarity' | 'diversity' | 'balanced';
    threshold: number;
    maxMatches: number;
  };
  insightGeneration: {
    enabled: boolean;
    analysisDepth: 'basic' | 'advanced' | 'premium';
    includeRecommendations: boolean;
    sentimentAnalysis: boolean;
  };
  contentModeration: {
    enabled: boolean;
    filterLevel: 'low' | 'medium' | 'high';
    categories: string[];
  };
}

export default function OpenAISettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/openai-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/openai-settings");
      return response.json() as OpenAISettings;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<OpenAISettings>) => {
      const response = await apiRequest("PUT", "/api/admin/openai-settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/openai-settings"] });
      toast({ title: "OpenAI settings updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating settings", description: error.message, variant: "destructive" });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/openai-test");
      return response.json();
    },
    onSuccess: (data) => {
      setConnectionStatus('success');
      toast({ title: "Connection successful", description: `Connected to ${data.model}` });
    },
    onError: (error) => {
      setConnectionStatus('error');
      toast({ title: "Connection failed", description: error.message, variant: "destructive" });
    },
  });

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      await testConnectionMutation.mutateAsync();
    } finally {
      setTestingConnection(false);
    }
  };

  const handleUpdateSettings = (field: keyof OpenAISettings, value: any) => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      [field]: value
    };
    
    updateSettingsMutation.mutate(newSettings);
  };

  const handleNestedUpdate = (parent: keyof OpenAISettings, field: string, value: any) => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      [parent]: {
        ...settings[parent],
        [field]: value
      }
    };
    
    updateSettingsMutation.mutate(newSettings);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Brain className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  OpenAI Settings
                </h1>
                <p className="text-white/70">
                  Configure AI-powered features and integrations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="glass-effect">
                {connectionStatus === 'success' ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
                ) : connectionStatus === 'error' ? (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Error</>
                ) : (
                  <><Globe className="w-3 h-3 mr-1" /> Unknown</>
                )}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 glass-effect">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="audience">Audience Generation</TabsTrigger>
            <TabsTrigger value="matching">Participant Matching</TabsTrigger>
            <TabsTrigger value="insights">Insight Generation</TabsTrigger>
            <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          </TabsList>

          {/* API Configuration */}
          <TabsContent value="api" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiKey" className="text-white">API Key</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        value={settings?.apiKey || ''}
                        onChange={(e) => handleUpdateSettings('apiKey', e.target.value)}
                        placeholder="sk-..."
                        className="form-premium pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="organization" className="text-white">Organization ID (Optional)</Label>
                    <Input
                      id="organization"
                      value={settings?.organization || ''}
                      onChange={(e) => handleUpdateSettings('organization', e.target.value)}
                      placeholder="org-..."
                      className="form-premium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="model" className="text-white">Model</Label>
                    <Select value={settings?.model || 'gpt-4'} onValueChange={(value) => handleUpdateSettings('model', value)}>
                      <SelectTrigger className="form-premium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="temperature" className="text-white">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings?.temperature || 0.7}
                      onChange={(e) => handleUpdateSettings('temperature', parseFloat(e.target.value))}
                      className="form-premium"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxTokens" className="text-white">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="1"
                      max="4096"
                      value={settings?.maxTokens || 2048}
                      onChange={(e) => handleUpdateSettings('maxTokens', parseInt(e.target.value))}
                      className="form-premium"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="btn-premium"
                  >
                    {testingConnection ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                  
                  {connectionStatus === 'success' && (
                    <Alert className="glass-effect border-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-white">
                        OpenAI API connection successful
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <Alert className="glass-effect border-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-white">
                        Failed to connect to OpenAI API
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Generation */}
          <TabsContent value="audience" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Audience Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="audienceEnabled"
                    checked={settings?.audienceGeneration?.enabled || false}
                    onCheckedChange={(checked) => handleNestedUpdate('audienceGeneration', 'enabled', checked)}
                  />
                  <Label htmlFor="audienceEnabled" className="text-white">
                    Enable AI audience generation
                  </Label>
                </div>

                <div>
                  <Label htmlFor="systemPrompt" className="text-white">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={settings?.audienceGeneration?.systemPrompt || ''}
                    onChange={(e) => handleNestedUpdate('audienceGeneration', 'systemPrompt', e.target.value)}
                    placeholder="You are an expert market researcher. Generate detailed target audience profiles based on campaign objectives..."
                    rows={6}
                    className="form-premium"
                  />
                </div>

                <div>
                  <Label htmlFor="audienceTemp" className="text-white">Generation Temperature</Label>
                  <Input
                    id="audienceTemp"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings?.audienceGeneration?.temperature || 0.7}
                    onChange={(e) => handleNestedUpdate('audienceGeneration', 'temperature', parseFloat(e.target.value))}
                    className="form-premium"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participant Matching */}
          <TabsContent value="matching" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Participant Matching Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="matchingEnabled"
                    checked={settings?.participantMatching?.enabled || false}
                    onCheckedChange={(checked) => handleNestedUpdate('participantMatching', 'enabled', checked)}
                  />
                  <Label htmlFor="matchingEnabled" className="text-white">
                    Enable AI participant matching
                  </Label>
                </div>

                <div>
                  <Label htmlFor="algorithm" className="text-white">Matching Algorithm</Label>
                  <Select 
                    value={settings?.participantMatching?.algorithm || 'balanced'} 
                    onValueChange={(value) => handleNestedUpdate('participantMatching', 'algorithm', value)}
                  >
                    <SelectTrigger className="form-premium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="similarity">Similarity-based</SelectItem>
                      <SelectItem value="diversity">Diversity-focused</SelectItem>
                      <SelectItem value="balanced">Balanced approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="threshold" className="text-white">Matching Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings?.participantMatching?.threshold || 0.7}
                      onChange={(e) => handleNestedUpdate('participantMatching', 'threshold', parseFloat(e.target.value))}
                      className="form-premium"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxMatches" className="text-white">Max Matches Per Campaign</Label>
                    <Input
                      id="maxMatches"
                      type="number"
                      min="1"
                      max="1000"
                      value={settings?.participantMatching?.maxMatches || 100}
                      onChange={(e) => handleNestedUpdate('participantMatching', 'maxMatches', parseInt(e.target.value))}
                      className="form-premium"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insight Generation */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Insight Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="insightEnabled"
                    checked={settings?.insightGeneration?.enabled || false}
                    onCheckedChange={(checked) => handleNestedUpdate('insightGeneration', 'enabled', checked)}
                  />
                  <Label htmlFor="insightEnabled" className="text-white">
                    Enable AI insight generation
                  </Label>
                </div>

                <div>
                  <Label htmlFor="analysisDepth" className="text-white">Analysis Depth</Label>
                  <Select 
                    value={settings?.insightGeneration?.analysisDepth || 'basic'} 
                    onValueChange={(value) => handleNestedUpdate('insightGeneration', 'analysisDepth', value)}
                  >
                    <SelectTrigger className="form-premium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Analysis</SelectItem>
                      <SelectItem value="advanced">Advanced Analysis</SelectItem>
                      <SelectItem value="premium">Premium Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recommendations"
                      checked={settings?.insightGeneration?.includeRecommendations || false}
                      onCheckedChange={(checked) => handleNestedUpdate('insightGeneration', 'includeRecommendations', checked)}
                    />
                    <Label htmlFor="recommendations" className="text-white">
                      Include AI recommendations
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sentiment"
                      checked={settings?.insightGeneration?.sentimentAnalysis || false}
                      onCheckedChange={(checked) => handleNestedUpdate('insightGeneration', 'sentimentAnalysis', checked)}
                    />
                    <Label htmlFor="sentiment" className="text-white">
                      Enable sentiment analysis
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation */}
          <TabsContent value="moderation" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Content Moderation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="moderationEnabled"
                    checked={settings?.contentModeration?.enabled || false}
                    onCheckedChange={(checked) => handleNestedUpdate('contentModeration', 'enabled', checked)}
                  />
                  <Label htmlFor="moderationEnabled" className="text-white">
                    Enable content moderation
                  </Label>
                </div>

                <div>
                  <Label htmlFor="filterLevel" className="text-white">Filter Level</Label>
                  <Select 
                    value={settings?.contentModeration?.filterLevel || 'medium'} 
                    onValueChange={(value) => handleNestedUpdate('contentModeration', 'filterLevel', value)}
                  >
                    <SelectTrigger className="form-premium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minimal filtering</SelectItem>
                      <SelectItem value="medium">Medium - Balanced filtering</SelectItem>
                      <SelectItem value="high">High - Strict filtering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Moderation Categories</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['hate', 'harassment', 'self-harm', 'sexual', 'violence', 'spam'].map((category) => (
                      <Button
                        key={category}
                        variant={settings?.contentModeration?.categories?.includes(category) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const currentCategories = settings?.contentModeration?.categories || [];
                          const newCategories = currentCategories.includes(category)
                            ? currentCategories.filter(c => c !== category)
                            : [...currentCategories, category];
                          handleNestedUpdate('contentModeration', 'categories', newCategories);
                        }}
                      >
                        {category}
                      </Button>
                    ))}
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