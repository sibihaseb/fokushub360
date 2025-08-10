import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Eye, 
  Camera, 
  Video, 
  TrendingUp, 
  Users, 
  Target, 
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Download,
  Share,
  Star,
  Heart,
  Frown,
  Smile,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadialBarChart, RadialBar } from 'recharts';

interface AnalysisResult {
  id: string;
  mediaType: 'image' | 'video';
  fileName: string;
  analysisType: string;
  results: {
    overview: {
      description: string;
      primarySubjects: string[];
      setting: string;
      mood: string;
      visualStyle: string;
    };
    demographics: {
      estimatedAge: string;
      gender: string;
      ethnicity: string;
      clothing: string;
      accessories: string[];
    };
    emotions: {
      primaryEmotion: string;
      confidence: number;
      secondaryEmotions: string[];
      facialExpressions: string[];
      bodyLanguage: string[];
    };
    content: {
      objects: string[];
      text: string[];
      brands: string[];
      colors: string[];
      composition: string;
      lighting: string;
    };
    insights: {
      targetAudience: string[];
      marketingPotential: string;
      brandAlignment: string;
      improvementSuggestions: string[];
      keyTakeaways: string[];
    };
    sentiment: {
      overall: 'positive' | 'negative' | 'neutral';
      score: number;
      reasoning: string;
      marketRelevance: string;
    };
    temporal?: {
      duration: number;
      keyFrames: Array<{
        timestamp: number;
        description: string;
        significance: string;
      }>;
      transitions: string[];
      pacing: string;
    };
  };
  metadata: {
    analysisDate: string;
    confidence: number;
    processingTime: number;
    model: string;
  };
}

interface ReportData {
  reportId: string;
  summary: {
    executiveSummary: string;
    keyInsights: string[];
    demographicProfile: {
      primaryAudience: string;
      ageRange: string;
      genderDistribution: string;
      emotionalResponse: string;
    };
    contentAnalysis: {
      visualThemes: string[];
      brandPresence: string[];
      sentimentTrends: string;
      engagementFactors: string[];
    };
    recommendations: string[];
    marketingImplications: string[];
    nextSteps: string[];
  };
  recommendations: string[];
  insights: any;
}

interface AIAnalysisReportProps {
  campaignId: number;
  analysisResults: AnalysisResult[];
  reportData?: ReportData;
  onExport?: () => void;
  onShare?: () => void;
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B'];

export default function AIAnalysisReport({ 
  campaignId, 
  analysisResults, 
  reportData, 
  onExport, 
  onShare 
}: AIAnalysisReportProps) {
  const [selectedMedia, setSelectedMedia] = useState<AnalysisResult | null>(null);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <Frown className="w-4 h-4 text-red-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Process data for visualizations
  const sentimentData = analysisResults.reduce((acc, result) => {
    const sentiment = result.results.sentiment.overall;
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sentimentChartData = Object.entries(sentimentData).map(([sentiment, count]) => ({
    name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    value: count,
    color: sentiment === 'positive' ? '#10B981' : sentiment === 'negative' ? '#EF4444' : '#6B7280'
  }));

  const emotionData = analysisResults.reduce((acc, result) => {
    const emotion = result.results.emotions.primaryEmotion;
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emotionChartData = Object.entries(emotionData).map(([emotion, count]) => ({
    emotion,
    count,
    percentage: (count / analysisResults.length) * 100
  }));

  const avgConfidence = analysisResults.reduce((sum, result) => sum + result.metadata.confidence, 0) / analysisResults.length;
  const avgSentimentScore = analysisResults.reduce((sum, result) => sum + result.results.sentiment.score, 0) / analysisResults.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>AI Analysis Report</span>
          </h1>
          <p className="text-gray-600">Campaign #{campaignId} • {analysisResults.length} media items analyzed</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Media</p>
                <p className="text-2xl font-bold text-purple-600">{analysisResults.length}</p>
                <p className="text-xs text-gray-500">
                  {analysisResults.filter(r => r.mediaType === 'image').length} images, {analysisResults.filter(r => r.mediaType === 'video').length} videos
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(avgConfidence)}`}>
                  {(avgConfidence * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">AI analysis confidence</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sentiment Score</p>
                <p className={`text-2xl font-bold ${getSentimentColor(avgSentimentScore > 0.6 ? 'positive' : avgSentimentScore < 0.4 ? 'negative' : 'neutral').split(' ')[0]}`}>
                  {(avgSentimentScore * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Overall sentiment</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing Time</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {(analysisResults.reduce((sum, r) => sum + r.metadata.processingTime, 0) / 1000).toFixed(1)}s
                </p>
                <p className="text-xs text-gray-500">Average per media</p>
              </div>
              <Clock className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>Executive Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{reportData.summary.executiveSummary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Key Insights</h3>
                  <ul className="space-y-1">
                    {reportData.summary.keyInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Demographic Profile</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Primary Audience:</span>
                      <span className="text-sm font-medium">{reportData.summary.demographicProfile.primaryAudience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Age Range:</span>
                      <span className="text-sm font-medium">{reportData.summary.demographicProfile.ageRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gender Distribution:</span>
                      <span className="text-sm font-medium">{reportData.summary.demographicProfile.genderDistribution}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              <span>Sentiment Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={sentimentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emotion Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <span>Emotion Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Media Analysis</CardTitle>
          <CardDescription>Individual analysis results for each media item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisResults.map((result) => (
              <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMedia(result)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result.mediaType === 'image' ? (
                        <Camera className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Video className="w-4 h-4 text-purple-500" />
                      )}
                      <span className="text-sm font-medium truncate">{result.fileName}</span>
                    </div>
                    {getSentimentIcon(result.results.sentiment.overall)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Confidence</span>
                      <span className={`text-xs font-medium ${getConfidenceColor(result.metadata.confidence)}`}>
                        {(result.metadata.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={result.metadata.confidence * 100} className="h-1" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Sentiment</span>
                      <Badge variant="outline" className={`text-xs ${getSentimentColor(result.results.sentiment.overall)}`}>
                        {result.results.sentiment.overall}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {result.results.overview.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-500" />
              <span>Recommendations & Next Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="nextSteps">Next Steps</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommendations" className="space-y-3">
                {reportData.summary.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="marketing" className="space-y-3">
                {reportData.summary.marketingImplications.map((impl, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{impl}</span>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="nextSteps" className="space-y-3">
                {reportData.summary.nextSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Detailed Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detailed Analysis: {selectedMedia.fileName}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMedia(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                  <TabsTrigger value="emotions">Emotions</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-gray-700">{selectedMedia.results.overview.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Primary Subjects</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedMedia.results.overview.primarySubjects.map((subject, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="demographics" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Basic Demographics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Age:</span>
                          <span className="text-sm font-medium">{selectedMedia.results.demographics.estimatedAge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Gender:</span>
                          <span className="text-sm font-medium">{selectedMedia.results.demographics.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Ethnicity:</span>
                          <span className="text-sm font-medium">{selectedMedia.results.demographics.ethnicity}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Appearance</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Clothing:</span>
                          <p className="text-sm">{selectedMedia.results.demographics.clothing}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Accessories:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedMedia.results.demographics.accessories.map((acc, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{acc}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Add other tab contents as needed */}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}