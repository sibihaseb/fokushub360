import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Camera, 
  Video, 
  DollarSign, 
  Sparkles, 
  Eye, 
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
  Play,
  Download,
  Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CampaignAsset {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  isAnalyzed: boolean;
  analysisResult?: any;
}

interface CampaignAIAnalysisProps {
  campaignId: number;
  assets: CampaignAsset[];
  onAnalysisComplete?: (results: any[]) => void;
}

export default function CampaignAIAnalysis({ campaignId, assets, onAnalysisComplete }: CampaignAIAnalysisProps) {
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('comprehensive');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: aiSettings } = useQuery({
    queryKey: ["/api/admin/ai-analysis-settings"],
    select: (data) => data || { enabled: false, pricing: { image: 5, video: 15 }, features: [] }
  });

  const { data: existingResults } = useQuery({
    queryKey: [`/api/ai-analysis/results/${campaignId}`],
    select: (data) => data || []
  });

  const analyzeImageMutation = useMutation({
    mutationFn: async (data: { imageBase64: string; fileName: string; analysisType: string }) => {
      return await apiRequest("POST", "/api/ai-analysis/analyze-image", {
        ...data,
        campaignId,
        assetId: selectedAssets.values().next().value
      });
    }
  });

  const analyzeVideoMutation = useMutation({
    mutationFn: async (data: { videoBase64: string; fileName: string; analysisType: string }) => {
      return await apiRequest("POST", "/api/ai-analysis/analyze-video", {
        ...data,
        campaignId,
        assetId: selectedAssets.values().next().value
      });
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: { campaignId: number; analysisIds: string[] }) => {
      return await apiRequest("POST", "/api/ai-analysis/generate-report", data);
    }
  });

  const handleAssetSelect = (assetId: number) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const handleSelectAll = () => {
    const unanalyzedAssets = assets.filter(asset => !asset.isAnalyzed);
    setSelectedAssets(new Set(unanalyzedAssets.map(asset => asset.id)));
  };

  const handleDeselectAll = () => {
    setSelectedAssets(new Set());
  };

  const calculateTotalCost = () => {
    if (!aiSettings) return 0;
    
    let total = 0;
    selectedAssets.forEach(assetId => {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        if (asset.fileType.startsWith('image/')) {
          total += aiSettings.pricing.image;
        } else if (asset.fileType.startsWith('video/')) {
          total += aiSettings.pricing.video;
        }
      }
    });
    return total;
  };

  const handleStartAnalysis = async () => {
    if (selectedAssets.size === 0) {
      toast({
        title: "No Assets Selected",
        description: "Please select at least one asset to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    const results = [];

    try {
      for (const assetId of selectedAssets) {
        const asset = assets.find(a => a.id === assetId);
        if (!asset) continue;

        // In a real implementation, you'd convert the asset to base64
        // For demonstration, we'll use placeholder data
        const mockBase64 = "placeholder_base64_data";

        let result;
        if (asset.fileType.startsWith('image/')) {
          result = await analyzeImageMutation.mutateAsync({
            imageBase64: mockBase64,
            fileName: asset.fileName,
            analysisType: selectedAnalysisType
          });
        } else if (asset.fileType.startsWith('video/')) {
          result = await analyzeVideoMutation.mutateAsync({
            videoBase64: mockBase64,
            fileName: asset.fileName,
            analysisType: selectedAnalysisType
          });
        }

        if (result) {
          results.push(result);
        }
      }

      setAnalysisResults(results);
      onAnalysisComplete?.(results);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${results.length} assets.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze assets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (analysisResults.length === 0) {
      toast({
        title: "No Analysis Results",
        description: "Please analyze assets first before generating a report.",
        variant: "destructive",
      });
      return;
    }

    try {
      const report = await generateReportMutation.mutateAsync({
        campaignId,
        analysisIds: analysisResults.map(r => r.id)
      });

      // In a real implementation, you'd open the report in a new tab or modal
      toast({
        title: "Report Generated",
        description: "AI analysis report has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate analysis report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!aiSettings || !aiSettings.enabled) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Brain className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600">AI Analysis Unavailable</h3>
            <p className="text-sm text-gray-500">
              AI analysis features are currently disabled by the administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const imageAssets = assets.filter(asset => asset.fileType.startsWith('image/'));
  const videoAssets = assets.filter(asset => asset.fileType.startsWith('video/'));
  const unanalyzedAssets = assets.filter(asset => !asset.isAnalyzed);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span>AI-Powered Media Analysis</span>
          </CardTitle>
          <CardDescription>
            Get comprehensive insights from your uploaded images and videos using advanced AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Assets</p>
                  <p className="text-2xl font-bold text-purple-800">{assets.length}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Images</p>
                  <p className="text-2xl font-bold text-blue-800">{imageAssets.length}</p>
                  <p className="text-xs text-blue-600">${aiSettings.pricing.image} each</p>
                </div>
                <Camera className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Videos</p>
                  <p className="text-2xl font-bold text-green-800">{videoAssets.length}</p>
                  <p className="text-xs text-green-600">${aiSettings.pricing.video} each</p>
                </div>
                <Video className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Select Assets for Analysis</h3>
                <p className="text-sm text-gray-600">Choose which assets you want to analyze</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {assets.map((asset) => (
                <div key={asset.id} className={`flex items-center space-x-3 p-3 border rounded-lg ${asset.isAnalyzed ? 'bg-gray-50' : 'bg-white'}`}>
                  <Checkbox
                    checked={selectedAssets.has(asset.id)}
                    onCheckedChange={() => handleAssetSelect(asset.id)}
                    disabled={asset.isAnalyzed}
                  />
                  <div className="flex items-center space-x-2">
                    {asset.fileType.startsWith('image/') ? (
                      <Camera className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Video className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="text-sm font-medium">{asset.fileName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {(asset.fileSize / 1024 / 1024).toFixed(1)} MB
                    </Badge>
                    {asset.isAnalyzed && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Analyzed
                      </Badge>
                    )}
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    ${asset.fileType.startsWith('image/') ? aiSettings.pricing.image : aiSettings.pricing.video}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Analysis Type</h3>
              <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiSettings.features.map((feature: string) => (
                    <SelectItem key={feature} value={feature}>
                      <div className="flex items-center space-x-2">
                        {feature === 'comprehensive' && <Brain className="w-4 h-4 text-purple-500" />}
                        {feature === 'sentiment' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {feature === 'demographic' && <Users className="w-4 h-4 text-blue-500" />}
                        {feature === 'content' && <Eye className="w-4 h-4 text-orange-500" />}
                        <span className="capitalize">{feature}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Cost Summary</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selected Assets:</span>
                  <span className="font-medium">{selectedAssets.size}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Total Cost:</span>
                  <span className="font-bold text-lg">${calculateTotalCost()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              onClick={handleStartAnalysis}
              disabled={selectedAssets.size === 0 || isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Analysis (${calculateTotalCost()})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500 animate-pulse" />
                <h3 className="font-semibold">AI Analysis in Progress</h3>
              </div>
              <p className="text-sm text-gray-600">
                Analyzing {selectedAssets.size} assets using advanced AI algorithms...
              </p>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-gray-500">
                This may take a few moments depending on the number and size of assets.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              <span>Analysis Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully analyzed {analysisResults.length} assets. Generate a comprehensive report to view detailed insights.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Quick Insights</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• {analysisResults.length} assets analyzed</li>
                    <li>• Average confidence: {(analysisResults.reduce((sum, r) => sum + r.metadata.confidence, 0) / analysisResults.length * 100).toFixed(1)}%</li>
                    <li>• Processing time: {(analysisResults.reduce((sum, r) => sum + r.metadata.processingTime, 0) / 1000).toFixed(1)}s</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Available Reports</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Executive summary</li>
                    <li>• Demographic analysis</li>
                    <li>• Sentiment breakdown</li>
                    <li>• Content insights</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {generateReportMutation.isPending ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Full Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}