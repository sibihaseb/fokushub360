import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Users, 
  Target, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  BarChart3,
  UserCheck,
  Zap,
  Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AIMatchingProps {
  campaignId?: number;
  onMatchingComplete?: (matches: any[]) => void;
  initialCriteria?: any;
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
  };
  segmentClassification: string;
  engagementPrediction: number;
}

interface MatchingAnalytics {
  totalParticipants: number;
  matchedParticipants: number;
  averageMatchScore: number;
  topMatchingFactors: string[];
  segmentDistribution: Record<string, number>;
  recommendedSampleSize: number;
  diversityScore: number;
  qualityScore: number;
}

export default function AIMatching({ campaignId, onMatchingComplete, initialCriteria }: AIMatchingProps) {
  const [step, setStep] = useState<'criteria' | 'matching' | 'results'>('criteria');
  const [campaignRequirements, setCampaignRequirements] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [industry, setIndustry] = useState("");
  const [criteria, setCriteria] = useState(initialCriteria || null);
  const [matches, setMatches] = useState<MatchingResult[]>([]);
  const [analytics, setAnalytics] = useState<MatchingAnalytics | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<number>>(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCriteriaMutation = useMutation({
    mutationFn: async (data: { campaignRequirements: string; targetAudience: string; industry: string }) => {
      return await apiRequest("POST", "/api/ai-matching/generate-criteria", data);
    },
    onSuccess: (data) => {
      setCriteria(data);
      setStep('matching');
      toast({
        title: "AI Criteria Generated",
        description: "Smart matching criteria have been generated for your campaign.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate matching criteria. Please try again.",
        variant: "destructive",
      });
    },
  });

  const findMatchesMutation = useMutation({
    mutationFn: async (data: { campaignId: number; criteria: any; options: any }) => {
      return await apiRequest("POST", "/api/ai-matching/find-matches", data);
    },
    onSuccess: (data) => {
      setMatches(data.matches);
      setAnalytics(data.analytics);
      setStep('results');
      toast({
        title: "AI Matching Complete",
        description: `Found ${data.matches.length} optimal participants for your campaign.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Matching Failed",
        description: "Failed to find participant matches. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateCriteria = () => {
    if (!campaignRequirements || !targetAudience || !industry) {
      toast({
        title: "Missing Information",
        description: "Please provide campaign requirements, target audience, and industry.",
        variant: "destructive",
      });
      return;
    }

    generateCriteriaMutation.mutate({
      campaignRequirements,
      targetAudience,
      industry
    });
  };

  const handleFindMatches = () => {
    if (!campaignId || !criteria) {
      toast({
        title: "Missing Information",
        description: "Campaign ID and criteria are required for matching.",
        variant: "destructive",
      });
      return;
    }

    findMatchesMutation.mutate({
      campaignId,
      criteria,
      options: {
        maxResults: 50,
        minMatchScore: 0.6,
        diversityWeight: 0.3,
        qualityWeight: 0.7
      }
    });
  };

  const handleParticipantSelect = (participantId: number) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(participantId)) {
      newSelected.delete(participantId);
    } else {
      newSelected.add(participantId);
    }
    setSelectedParticipants(newSelected);
  };

  const handleCompleteMatching = () => {
    const selectedMatches = matches.filter(match => selectedParticipants.has(match.participantId));
    onMatchingComplete?.(selectedMatches);
    toast({
      title: "Participants Selected",
      description: `${selectedMatches.length} participants have been selected for your campaign.`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.8) return "default";
    if (score >= 0.6) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span>AI-Powered Participant Matching</span>
          </CardTitle>
          <CardDescription>
            Use advanced AI to find the perfect participants for your campaign based on behavioral analysis and preference learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step === 'criteria' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'criteria' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span>Define Criteria</span>
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center space-x-2 ${step === 'matching' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'matching' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span>AI Matching</span>
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center space-x-2 ${step === 'results' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'results' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span>Review Results</span>
              </div>
            </div>
          </div>

          {step === 'criteria' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaignRequirements">Campaign Requirements</Label>
                    <Textarea
                      id="campaignRequirements"
                      placeholder="Describe what you need from participants (e.g., tech-savvy users who have experience with mobile apps and are comfortable providing detailed feedback)"
                      value={campaignRequirements}
                      onChange={(e) => setCampaignRequirements(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Young professionals, parents, students"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                    AI Matching Benefits
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      Advanced behavioral analysis of 100+ profile attributes
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      Intelligent matching based on psychological profiling
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      Predictive engagement scoring for better outcomes
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      Optimized diversity and quality balance
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateCriteria}
                  disabled={generateCriteriaMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {generateCriteriaMutation.isPending ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate AI Criteria
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'matching' && criteria && (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  AI has generated sophisticated matching criteria based on your requirements. Review and proceed with participant matching.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="demographics" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                  <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                  <TabsTrigger value="psychographic">Psychographic</TabsTrigger>
                  <TabsTrigger value="campaign">Campaign Specific</TabsTrigger>
                </TabsList>

                <TabsContent value="demographics" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Age Range</Label>
                      <p className="text-sm text-gray-600">{criteria.demographics?.ageRange?.join(' - ') || 'Any'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Education</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {criteria.demographics?.education?.map((edu: string) => (
                          <Badge key={edu} variant="outline" className="text-xs">{edu}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="behavioral" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Interests</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {criteria.behavioral?.interests?.map((interest: string) => (
                          <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tech Savviness</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {criteria.behavioral?.techSavviness?.map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="psychographic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Personality Traits</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {criteria.psychographic?.personality?.map((trait: string) => (
                          <Badge key={trait} variant="outline" className="text-xs">{trait}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Values</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {criteria.psychographic?.values?.map((value: string) => (
                          <Badge key={value} variant="outline" className="text-xs">{value}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="campaign" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Industry</Label>
                      <p className="text-sm text-gray-600">{criteria.campaignSpecific?.industry || 'General'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Required Experience</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {criteria.campaignSpecific?.requiredExperience?.map((exp: string) => (
                          <Badge key={exp} variant="secondary" className="text-xs">{exp}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button 
                  onClick={handleFindMatches}
                  disabled={findMatchesMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {findMatchesMutation.isPending ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Find Optimal Matches
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'results' && matches.length > 0 && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Matches</p>
                        <p className="text-2xl font-bold text-purple-600">{analytics.matchedParticipants}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
                        <p className="text-2xl font-bold text-green-600">{(analytics.averageMatchScore * 100).toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Diversity Score</p>
                        <p className="text-2xl font-bold text-blue-600">{(analytics.diversityScore * 100).toFixed(1)}%</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Quality Score</p>
                        <p className="text-2xl font-bold text-emerald-600">{(analytics.qualityScore * 100).toFixed(1)}%</p>
                      </div>
                      <Star className="w-8 h-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Matched Participants</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Selected: {selectedParticipants.size}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedParticipants(new Set(matches.map(m => m.participantId)))}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedParticipants(new Set())}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {matches.map((match) => (
                    <Card key={match.participantId} className={`cursor-pointer transition-all hover:shadow-md ${selectedParticipants.has(match.participantId) ? 'ring-2 ring-purple-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedParticipants.has(match.participantId)}
                              onChange={() => handleParticipantSelect(match.participantId)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Participant #{match.participantId}</span>
                                <Badge variant={getScoreBadgeVariant(match.matchScore)}>
                                  {(match.matchScore * 100).toFixed(1)}% Match
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {match.segmentClassification}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Engagement: {(match.engagementPrediction * 100).toFixed(1)}% | 
                                Confidence: {(match.confidence * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {match.matchReasons.length} reasons
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Strengths</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {match.behavioralInsights.strengths.slice(0, 3).map((strength, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{strength}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Match Reasons</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {match.matchReasons.slice(0, 2).map((reason, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{reason}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setStep('criteria')}>
                  Back to Criteria
                </Button>
                <Button 
                  onClick={handleCompleteMatching}
                  disabled={selectedParticipants.size === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Select {selectedParticipants.size} Participants
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}