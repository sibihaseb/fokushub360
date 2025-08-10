import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target, 
  CheckCircle,
  Lightbulb,
  Search,
  Download,
  PieChart
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Cell,
  Pie
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B'];

interface MatchingCriteria {
  demographics?: any;
  behavioral?: any;
  psychographic?: any;
  campaignSpecific?: any;
  qualityRequirements?: any;
}

interface MatchingResult {
  participantId: number;
  matchScore: number;
  confidence: number;
  matchReasons: string[];
  behavioralInsights: {
    strengths: string[];
    considerations: string[];
    recommendations: string[];
    riskFactors: string[];
  };
  segmentClassification: string;
  engagementPrediction: number;
  personalityProfile: {
    traits: string[];
    communicationStyle: string;
    decisionMakingStyle: string;
    motivationFactors: string[];
  };
  predictedPerformance: {
    feedbackQuality: number;
    completionRate: number;
    responseTime: number;
    engagement: number;
  };
}

export default function AIMatchingDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState("overview");
  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriteria>({});
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [criteriaGeneration, setCriteriaGeneration] = useState({
    campaignRequirements: "",
    targetAudience: "",
    industry: ""
  });
  
  const { toast } = useToast();

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/campaigns'],
    staleTime: 5 * 60 * 1000,
  });

  // Generate matching criteria
  const generateCriteriaMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai-matching/generate-criteria", data);
      return response.json();
    },
    onSuccess: (data) => {
      setMatchingCriteria(data.recommendedCriteria);
      toast({
        title: "Success",
        description: "AI matching criteria generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate matching criteria",
        variant: "destructive",
      });
    },
  });

  // Find participant matches
  const findMatchesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai-matching/find-matches", data);
      return response.json();
    },
    onSuccess: (data) => {
      setMatchingResults(data.matches);
      toast({
        title: "Success",
        description: `Found ${data.matches.length} participant matches!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to find participant matches",
        variant: "destructive",
      });
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getSegmentBadgeColor = (segment: string) => {
    const colors: Record<string, string> = {
      "Early Adopters": "bg-purple-100 text-purple-800",
      "Mainstream": "bg-blue-100 text-blue-800",
      "Traditionalists": "bg-green-100 text-green-800",
      "Niche Enthusiasts": "bg-orange-100 text-orange-800",
      "Professional Consumers": "bg-gray-100 text-gray-800"
    };
    return colors[segment] || "bg-gray-100 text-gray-800";
  };

  const handleGenerateCriteria = () => {
    if (!criteriaGeneration.campaignRequirements || !criteriaGeneration.targetAudience || !criteriaGeneration.industry) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    generateCriteriaMutation.mutate(criteriaGeneration);
  };

  const handleFindMatches = () => {
    if (!selectedCampaign || selectedCampaign === 'all' || !matchingCriteria || Object.keys(matchingCriteria).length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a campaign and generate criteria first",
        variant: "destructive",
      });
      return;
    }
    findMatchesMutation.mutate({
      campaignId: parseInt(selectedCampaign),
      criteria: matchingCriteria,
      targetCount: 50
    });
  };

  // Calculate analytics from real data
  const analyticsData = {
    totalMatches: matchingResults.length,
    averageMatchScore: matchingResults.length > 0 ? 
      Math.round(matchingResults.reduce((sum, m) => sum + m.matchScore, 0) / matchingResults.length) : 0,
    averageConfidence: matchingResults.length > 0 ? 
      Math.round(matchingResults.reduce((sum, m) => sum + m.confidence, 0) / matchingResults.length) : 0,
    highQualityMatches: matchingResults.filter(m => m.matchScore >= 80).length,
    segmentDistribution: matchingResults.reduce((acc, result) => {
      acc[result.segmentClassification] = (acc[result.segmentClassification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const segmentChartData = Object.entries(analyticsData.segmentDistribution).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));

  const topMatchingFactors = matchingResults.length > 0 ? 
    matchingResults.flatMap(m => m.matchReasons)
      .reduce((acc, reason) => {
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Matching Dashboard</h1>
            <p className="text-gray-600">Advanced participant matching with behavioral analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold">{analyticsData.totalMatches}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Match Score</p>
                <p className="text-2xl font-bold">{analyticsData.averageMatchScore}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">{analyticsData.averageConfidence}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Quality</p>
                <p className="text-2xl font-bold">{analyticsData.highQualityMatches}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Segment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {segmentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={segmentChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {segmentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No matching data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Matching Factors</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(topMatchingFactors).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(topMatchingFactors)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 8)
                      .map(([factor, count]) => (
                        <div key={factor} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{factor}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, ((count as number) / Math.max(...Object.values(topMatchingFactors) as number[])) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No matching factors to display</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>AI Criteria Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={criteriaGeneration.industry} onValueChange={(value) => 
                    setCriteriaGeneration(prev => ({ ...prev, industry: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Young professionals, Tech enthusiasts"
                    value={criteriaGeneration.targetAudience}
                    onChange={(e) => setCriteriaGeneration(prev => ({ ...prev, targetAudience: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignRequirements">Campaign Requirements</Label>
                <Textarea
                  id="campaignRequirements"
                  placeholder="Describe your campaign goals, product/service, and specific requirements..."
                  value={criteriaGeneration.campaignRequirements}
                  onChange={(e) => setCriteriaGeneration(prev => ({ ...prev, campaignRequirements: e.target.value }))}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleGenerateCriteria}
                disabled={generateCriteriaMutation.isPending}
                className="w-full"
              >
                {generateCriteriaMutation.isPending ? "Generating..." : "Generate AI Criteria"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Find Participant Matches</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign">Select Campaign</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleFindMatches}
                disabled={findMatchesMutation.isPending || !selectedCampaign}
                className="w-full"
              >
                {findMatchesMutation.isPending ? "Finding Matches..." : "Find AI Matches"}
              </Button>

              {findMatchesMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm">AI is analyzing participants...</span>
                  </div>
                  <Progress value={65} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Matching Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matchingResults.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No matching results yet. Generate criteria and find matches to see results.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {matchingResults.map((result) => (
                      <Card key={result.participantId} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-semibold">Participant #{result.participantId}</p>
                              <Badge className={getSegmentBadgeColor(result.segmentClassification)}>
                                {result.segmentClassification}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className={`font-bold ${getScoreColor(result.matchScore)}`}>
                                {result.matchScore}%
                              </p>
                              <p className="text-sm text-gray-500">Match Score</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{result.confidence}%</p>
                              <p className="text-sm text-gray-500">Confidence</p>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white" size="sm">
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Participant #{result.participantId} Analysis</DialogTitle>
                                  <DialogDescription>
                                    Detailed behavioral insights and matching analysis
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Match Score</Label>
                                      <p className={`text-lg font-bold ${getScoreColor(result.matchScore)}`}>
                                        {result.matchScore}%
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Engagement Prediction</Label>
                                      <p className="text-lg font-bold">{result.engagementPrediction}%</p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Strengths</Label>
                                    <div className="flex flex-wrap gap-1">
                                      {result.behavioralInsights.strengths.map((strength, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                                          {strength}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Match Reasons</Label>
                                    <ul className="space-y-1">
                                      {result.matchReasons.map((reason, idx) => (
                                        <li key={idx} className="flex items-start space-x-2">
                                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          <span className="text-sm">{reason}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Predicted Performance</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Feedback Quality:</span>
                                        <span className="font-semibold">{result.predictedPerformance.feedbackQuality}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Completion Rate:</span>
                                        <span className="font-semibold">{result.predictedPerformance.completionRate}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}