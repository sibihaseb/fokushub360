import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  BarChart3,
  Target,
  AlertCircle,
  Eye
} from "lucide-react";

export default function SentimentDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  // Fetch all campaigns for selection
  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  // Fetch sentiment analysis for selected campaign
  const { data: sentimentData } = useQuery({
    queryKey: ["/api/sentiment/campaign", selectedCampaign],
    enabled: !!selectedCampaign,
  });

  // Fetch detailed sentiment analysis
  const { data: detailedAnalysis } = useQuery({
    queryKey: ["/api/sentiment/analysis", selectedCampaign],
    enabled: !!selectedCampaign,
  });

  const getSentimentColor = (score: number) => {
    if (score > 0.5) return "text-green-400";
    if (score > 0) return "text-yellow-400";
    return "text-red-400";
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.5) return <ThumbsUp className="w-4 h-4" />;
    if (score > 0) return <Heart className="w-4 h-4" />;
    return <ThumbsDown className="w-4 h-4" />;
  };

  const getSentimentBadge = (score: number) => {
    if (score > 0.5) return <Badge className="bg-green-500">Positive</Badge>;
    if (score > 0) return <Badge className="bg-yellow-500">Neutral</Badge>;
    return <Badge className="bg-red-500">Negative</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Sentiment Analysis Dashboard
          </h1>
          <p className="text-white/70">
            Monitor real-time participant sentiment and campaign feedback
          </p>
        </div>

        {/* Campaign Selection */}
        <Card className="card-glass mb-8">
          <CardHeader>
            <CardTitle className="text-white">Select Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns?.map((campaign: any) => (
                <Card 
                  key={campaign.id} 
                  className={`cursor-pointer transition-all ${
                    selectedCampaign === campaign.id 
                      ? 'bg-emerald-500/20 border-emerald-500' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedCampaign(campaign.id)}
                >
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold mb-2">{campaign.title}</h3>
                    <p className="text-white/70 text-sm mb-2">{campaign.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                      <span className="text-white/50 text-sm">
                        {campaign.participant_count} participants
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedCampaign && sentimentData && (
          <>
            {/* Sentiment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="card-glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">
                    Overall Sentiment
                  </CardTitle>
                  {getSentimentIcon(sentimentData.averageSentiment)}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSentimentColor(sentimentData.averageSentiment)}`}>
                    {(sentimentData.averageSentiment * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-white/50">
                    {sentimentData.totalResponses} responses analyzed
                  </p>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">
                    Positive Responses
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {sentimentData.positiveCount}
                  </div>
                  <p className="text-xs text-white/50">
                    {((sentimentData.positiveCount / sentimentData.totalResponses) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">
                    Negative Responses
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">
                    {sentimentData.negativeCount}
                  </div>
                  <p className="text-xs text-white/50">
                    {((sentimentData.negativeCount / sentimentData.totalResponses) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">
                    Confidence Score
                  </CardTitle>
                  <Target className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {(sentimentData.averageConfidence * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-white/50">
                    Analysis reliability
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Tabs defaultValue="emotions" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="emotions">Emotions</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="emotions">
                <Card className="card-glass">
                  <CardHeader>
                    <CardTitle className="text-white">Emotional Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Primary Emotions</h3>
                        <div className="space-y-3">
                          {Object.entries(sentimentData.emotions).map(([emotion, percentage]: [string, any]) => (
                            <div key={emotion} className="flex items-center justify-between">
                              <span className="text-white capitalize">{emotion}</span>
                              <div className="flex items-center space-x-2">
                                <Progress 
                                  value={percentage} 
                                  className="w-32"
                                />
                                <span className="text-white/70 text-sm w-12">{percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="card-glass">
                    <CardHeader>
                      <CardTitle className="text-white text-green-400">Positive Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {sentimentData.keywords.positive.map((keyword: string, index: number) => (
                          <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-glass">
                    <CardHeader>
                      <CardTitle className="text-white text-yellow-400">Neutral Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {sentimentData.keywords.neutral.map((keyword: string, index: number) => (
                          <Badge key={index} className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-glass">
                    <CardHeader>
                      <CardTitle className="text-white text-red-400">Negative Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {sentimentData.keywords.negative.map((keyword: string, index: number) => (
                          <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="card-glass">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sentimentData.recommendations.improvements.map((improvement: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-white/80">{improvement}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-glass">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Concerns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sentimentData.recommendations.concerns.map((concern: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-white/80">{concern}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Individual Response Analysis */}
            <Card className="card-glass mt-8">
              <CardHeader>
                <CardTitle className="text-white">Individual Response Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedAnalysis?.map((analysis: any) => (
                    <Card key={analysis.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getSentimentBadge(parseFloat(analysis.sentiment_score))}
                              <span className="text-white/70 text-sm">
                                Confidence: {(parseFloat(analysis.confidence) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-white/80 mb-2">
                              Participant {analysis.participant_id} • {new Date(analysis.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-white/60 text-sm">Primary emotion:</span>
                              <Badge variant="outline" className="text-purple-400 border-purple-400">
                                {analysis.emotions.primary}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}