import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Star,
  Activity,
  Brain,
  CheckCircle,
  PlayCircle,
  ImageIcon,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AIAnalysisReport from "@/components/ai-analysis-report";

export default function AIAnalysisDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<string>("30d");
  const [mediaType, setMediaType] = useState<string>("all");
  const [analysisType, setAnalysisType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    select: (data) => data || []
  });

  const { data: analysisResults } = useQuery({
    queryKey: [`/api/ai-analysis/results/${selectedCampaign}`],
    enabled: selectedCampaign !== "all",
    select: (data) => data || []
  });

  // Use real analysis results from API - no mock data
  const realAnalysisResults = analysisResults || [];

  const filteredResults = realAnalysisResults.filter((result: any) => {
    if (!result?.fileName || !result?.results?.overview?.description) return false;
    
    const matchesSearch = result.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.results.overview.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMediaType = mediaType === "all" || result.mediaType === mediaType;
    const matchesAnalysisType = analysisType === "all" || result.analysisType === analysisType;
    
    return matchesSearch && matchesMediaType && matchesAnalysisType;
  });

  const stats = {
    totalAnalyses: realAnalysisResults.length,
    imageAnalyses: realAnalysisResults.filter((r: any) => r.mediaType === "image").length,
    videoAnalyses: realAnalysisResults.filter((r: any) => r.mediaType === "video").length,
    avgConfidence: realAnalysisResults.length > 0 ? 
      realAnalysisResults.reduce((sum: number, r: any) => sum + (r.metadata?.confidence || 0), 0) / realAnalysisResults.length : 0,
    avgSentiment: realAnalysisResults.length > 0 ? 
      realAnalysisResults.reduce((sum: number, r: any) => sum + (r.results?.sentiment?.score || 0), 0) / realAnalysisResults.length : 0,
    positiveResults: realAnalysisResults.filter((r: any) => r.results?.sentiment?.overall === "positive").length
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>AI Analysis Dashboard</span>
          </h1>
          <p className="text-gray-600">Comprehensive insights from AI-powered media analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            {stats.totalAnalyses} Analyses
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Sentiment</p>
                <p className="text-2xl font-bold">{(stats.avgSentiment * 100).toFixed(1)}%</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positive Results</p>
                <p className="text-2xl font-bold">{stats.positiveResults}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns?.map((campaign: any) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mediaType} onValueChange={setMediaType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Media type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Analysis type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Analysis</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="sentiment">Sentiment Only</SelectItem>
                <SelectItem value="demographic">Demographic</SelectItem>
                <SelectItem value="content">Content Focus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredResults.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No AI Analysis Results</h3>
            <p className="text-gray-500 mb-4">
              {selectedCampaign === "all" 
                ? "Upload media to campaigns and run AI analysis to see insights here."
                : "No analysis results found for the selected campaign and filters."
              }
            </p>
            <Button variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResults.map((result: any) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.mediaType === "image" ? (
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                    ) : (
                      <PlayCircle className="w-5 h-5 text-purple-500" />
                    )}
                    <CardTitle className="text-lg">{result.fileName}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {result.analysisType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {result.results?.overview?.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">
                        {((result.metadata?.confidence || 0) * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-600">
                        {result.results?.sentiment?.overall || "neutral"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(result.metadata?.analysisDate || Date.now()).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}