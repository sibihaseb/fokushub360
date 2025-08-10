import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Download, 
  Calendar,
  Clock,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Eye,
  Target,
  Zap,
  Brain,
  Sparkles,
  Globe,
  Filter,
  Search,
  RefreshCw,
  Share2,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  AreaChart,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  TrendingDown,
  Map,
  Smartphone,
  Monitor,
  Tablet,
  Mail,
  Phone,
  Plus,
  Minus,
  Equal,
  Hash,
  AtSign,
  Percent,
  X
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart as RechartsAreaChart, Area, Pie } from 'recharts';

interface ReportData {
  campaignId: number;
  title: string;
  totalParticipants: number;
  responseRate: number;
  completionRate: number;
  averageRating: number;
  sentimentScore: number;
  keyInsights: string[];
  participantDemographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
  };
  timeMetrics: {
    averageSessionTime: number;
    completionTime: number;
    bounceRate: number;
  };
  engagementData: Array<{ date: string; engagement: number }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywordClouds: Array<{ word: string; frequency: number }>;
  aiSuggestions: string[];
  recommendations: string[];
}

export default function Reports() {
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<number>(1);
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports", selectedCampaign, timeRange],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/reports/${selectedCampaign}?timeRange=${timeRange}`);
      return response.json() as ReportData;
    },
    enabled: !!selectedCampaign,
  });

  const exportMutation = useMutation({
    mutationFn: async (format: string) => {
      const response = await apiRequest("POST", `/api/reports/${selectedCampaign}/export`, { format });
      return response.blob();
    },
    onSuccess: (data, format) => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${selectedCampaign}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Report exported successfully" });
    },
    onError: (error) => {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    },
  });

  const handleExport = (format: string) => {
    exportMutation.mutate(format);
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEngagementTrend = (data: Array<{ date: string; engagement: number }>) => {
    if (data.length < 2) return { trend: 'stable', change: 0 };
    const latest = data[data.length - 1].engagement;
    const previous = data[data.length - 2].engagement;
    const change = ((latest - previous) / previous) * 100;
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change)
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const engagementTrend = getEngagementTrend(reportData?.engagementData || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  Campaign Reports
                </h1>
                <p className="text-white/70">
                  {reportData?.title || "Campaign Analytics and Insights"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="form-premium w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="glass-effect"
                onClick={() => handleExport("pdf")}
                disabled={exportMutation.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                className="btn-premium"
                onClick={() => handleExport("xlsx")}
                disabled={exportMutation.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Participants</p>
                  <p className="text-2xl font-bold text-white">{reportData?.totalParticipants || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={75} className="h-2" />
                <p className="text-white/60 text-xs mt-1">75% of target reached</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Response Rate</p>
                  <p className="text-2xl font-bold text-white">{reportData?.responseRate || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+5.2% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Average Rating</p>
                  <p className="text-2xl font-bold text-white">{reportData?.averageRating || 0}/5</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${
                        star <= (reportData?.averageRating || 0) ? 'text-yellow-500 fill-current' : 'text-white/30'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Sentiment Score</p>
                  <p className={`text-2xl font-bold ${getSentimentColor(reportData?.sentimentScore || 0)}`}>
                    {reportData?.sentimentScore || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={reportData?.sentimentScore || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 glass-effect mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Trend */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Engagement Trend
                    </div>
                    <div className="flex items-center space-x-2">
                      {engagementTrend.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                      {engagementTrend.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                      <span className={`text-sm ${engagementTrend.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {engagementTrend.change.toFixed(1)}%
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={reportData?.engagementData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="engagement" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={{ fill: '#10B981', strokeWidth: 2 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData?.keyInsights?.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        <p className="text-white/90 text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Metrics */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{reportData?.timeMetrics?.averageSessionTime || 0}min</p>
                    <p className="text-white/70 text-sm">Average Session Time</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{reportData?.timeMetrics?.completionTime || 0}min</p>
                    <p className="text-white/70 text-sm">Completion Time</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{reportData?.timeMetrics?.bounceRate || 0}%</p>
                    <p className="text-white/70 text-sm">Bounce Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Age Distribution */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Age Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(reportData?.participantDemographics?.age || {}).map(([key, value]) => ({
                            name: key,
                            value: value
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {Object.entries(reportData?.participantDemographics?.age || {}).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(reportData?.participantDemographics?.gender || {}).map(([key, value]) => ({
                        name: key,
                        value: value
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Location Distribution */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Map className="w-5 h-5 mr-2" />
                    Location Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportData?.participantDemographics?.location || {}).map(([location, percentage]) => (
                      <div key={location} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/80 capitalize">{location}</span>
                          <span className="text-white font-semibold">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Analysis */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: reportData?.sentimentAnalysis?.positive || 0, color: '#10B981' },
                            { name: 'Neutral', value: reportData?.sentimentAnalysis?.neutral || 0, color: '#F59E0B' },
                            { name: 'Negative', value: reportData?.sentimentAnalysis?.negative || 0, color: '#EF4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'Positive', value: reportData?.sentimentAnalysis?.positive || 0, color: '#10B981' },
                            { name: 'Neutral', value: reportData?.sentimentAnalysis?.neutral || 0, color: '#F59E0B' },
                            { name: 'Negative', value: reportData?.sentimentAnalysis?.negative || 0, color: '#EF4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Cloud */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Top Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData?.keywordClouds?.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white font-medium">{keyword.word}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${(keyword.frequency / 50) * 100}%` }}
                            />
                          </div>
                          <span className="text-white/70 text-sm">{keyword.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData?.aiSuggestions?.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-emerald-500/20">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">AI Insight #{index + 1}</p>
                        <p className="text-white/80 text-sm mt-1">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData?.recommendations?.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-blue-500/20">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Action Item #{index + 1}</p>
                        <p className="text-white/80 text-sm mt-1">{recommendation}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="btn-premium">
                          Implement
                        </Button>
                        <Button size="sm" variant="outline" className="glass-effect">
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}