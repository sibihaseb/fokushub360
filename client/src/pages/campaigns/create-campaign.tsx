import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Progress } from "@/components/ui/progress";
import CampaignContentTypeSelector from "@/components/campaign-content-type-selector";
import CampaignQuestionBuilder from "@/components/campaign-question-builder";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Stripe Payment Form Component
const StripePaymentForm = ({ 
  amount, 
  campaignData, 
  onSuccess, 
  onError 
}: { 
  amount: number; 
  campaignData?: {
    campaignType: string;
    contentType: string;
    participantCount: number;
    campaignId: number | null;
  };
  onSuccess: () => void; 
  onError: (error: string) => void; 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      // Create payment intent with campaign data
      const paymentData = campaignData 
        ? {
            campaignType: campaignData.campaignType,
            contentType: campaignData.contentType,
            participantCount: campaignData.participantCount,
            campaignId: campaignData.campaignId
          }
        : { amount };

      const response = await apiRequest("POST", "/api/create-payment-intent", paymentData);
      const { clientSecret } = await response.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      onError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': { color: '#94a3b8' },
              },
            },
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full btn-premium"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${amount}
          </>
        )}
      </Button>
    </form>
  );
};
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  Link, 
  Users, 
  Target, 
  Brain, 
  Gift, 
  FileText, 
  Zap, 
  Shield, 
  Sparkles,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Wand2,
  Globe,
  DollarSign,
  Award,
  Package,
  CreditCard,
  BarChart3,
  TrendingUp,
  Eye,
  Droplet,
  Settings
} from "lucide-react";

interface CampaignFormData {
  title: string;
  description: string;
  targetAudience: string;
  audienceType: 'custom' | 'ai_generated';
  participantCount: number;
  rewardType: 'cash' | 'gift_card' | 'product' | 'points';
  rewardAmount: number;
  reportLevel: 'basic' | 'advanced';
  watermarking: boolean;
  contentType: any;
  uploadMethod: 'upload' | 'link';
  assets: File[];
  linkUrl: string;
  additionalNotes: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'multiple-choice' | 'rating' | 'text' | 'yes-no' | 'ranking';
    category: string;
    options?: string[];
    required: boolean;
    customQuestion?: boolean;
  }>;
  aiSettings: {
    useAI: boolean;
    matchingCriteria: string[];
    insightLevel: 'basic' | 'advanced' | 'premium';
    enableAIAnalysis: boolean;
  };
}

export default function CreateCampaign() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    targetAudience: '',
    audienceType: 'custom',
    participantCount: 10,
    rewardType: 'cash',
    rewardAmount: 0,
    reportLevel: 'basic',
    watermarking: false,
    contentType: null,
    uploadMethod: 'upload',
    assets: [],
    linkUrl: '',
    additionalNotes: '',
    questions: [],
    aiSettings: {
      useAI: true,
      matchingCriteria: [],
      insightLevel: 'basic',
      enableAIAnalysis: false
    }
  });

  const totalSteps = 8;

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({ title: "Campaign created successfully!" });
      setLocation(`/campaigns/${data.id}`);
    },
    onError: (error) => {
      toast({ title: "Error creating campaign", description: error.message, variant: "destructive" });
    },
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, ...newFiles]
    }));
  };

  const removeAsset = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index)
    }));
  };

  const handleContentTypeSelect = (contentType: any, uploadMethod: 'upload' | 'link', data: any) => {
    setFormData(prev => ({
      ...prev,
      contentType,
      uploadMethod,
      assets: data.files || [],
      linkUrl: data.linkUrl || '',
      additionalNotes: data.additionalNotes || '',
      aiSettings: {
        ...prev.aiSettings,
        enableAIAnalysis: uploadMethod === 'upload' && contentType.aiAnalysisAvailable
      }
    }));
    nextStep();
  };

  const handleQuestionsSelect = (questions: any[]) => {
    setFormData(prev => ({
      ...prev,
      questions
    }));
    nextStep();
  };

  const generateAIAudience = async () => {
    try {
      const response = await apiRequest("POST", "/api/ai/generate-audience", {
        campaignTitle: formData.title,
        description: formData.description,
        participantCount: formData.participantCount
      });
      const result = await response.json();
      setFormData(prev => ({
        ...prev,
        targetAudience: result.audience,
        audienceType: 'ai_generated'
      }));
      toast({ title: "AI audience generated successfully!" });
    } catch (error) {
      toast({ title: "Error generating AI audience", variant: "destructive" });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createCampaignMutation.mutate(formData);
  };

  const [pricing, setPricing] = useState<{
    baseCost: number;
    participantCost: number;
    totalCost: number;
    campaignType: string;
    contentType: string;
  } | null>(null);

  const calculateCampaignCost = () => {
    if (pricing) {
      return pricing.totalCost;
    }
    
    // Fallback calculation
    let cost = 299; // Base cost
    cost += Math.max(0, formData.participantCount - 10) * 15; // Extra participants
    if (formData.reportLevel === 'advanced') cost += 50;
    if (formData.aiSettings.enableAIAnalysis) cost += 100;
    return cost;
  };

  // Calculate pricing when content type or participant count changes
  useEffect(() => {
    if (formData.contentType && formData.participantCount > 0) {
      const campaignType = formData.reportLevel === 'advanced' ? 'premium' : 'standard';
      const contentType = formData.contentType.id;
      
      apiRequest("POST", "/api/pricing/calculate", {
        campaignType,
        contentType,
        participantCount: formData.participantCount
      })
      .then(result => {
        setPricing(result);
      })
      .catch(error => {
        console.error("Error calculating pricing:", error);
      });
    }
  }, [formData.contentType, formData.participantCount, formData.reportLevel]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Campaign Basics
              </h2>
              <p className="text-white/70">
                Set up your campaign foundation
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Campaign Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter campaign title"
                  className="form-premium"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your campaign objectives and requirements"
                  rows={4}
                  className="form-premium"
                />
              </div>
              
              <div>
                <Label htmlFor="participantCount" className="text-white">Participant Count</Label>
                <Select value={formData.participantCount.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, participantCount: parseInt(value) }))}>
                  <SelectTrigger className="form-premium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 participants</SelectItem>
                    <SelectItem value="25">25 participants</SelectItem>
                    <SelectItem value="50">50 participants</SelectItem>
                    <SelectItem value="100">100 participants</SelectItem>
                    <SelectItem value="250">250 participants</SelectItem>
                    <SelectItem value="500">500 participants</SelectItem>
                    <SelectItem value="1000">1,000 participants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Content Type Selection
              </h2>
              <p className="text-white/70">
                Choose your content type and upload method
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
              <CampaignContentTypeSelector 
                onContentTypeSelect={handleContentTypeSelect}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Question Selection
              </h2>
              <p className="text-white/70">
                Choose questions for participant feedback
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
              <CampaignQuestionBuilder 
                contentType={formData.contentType?.id || 'general'}
                onQuestionsSelect={handleQuestionsSelect}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Target Audience
              </h2>
              <p className="text-white/70">
                Define your ideal participants
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={formData.audienceType === 'custom' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, audienceType: 'custom' }))}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                >
                  <Target className="w-6 h-6" />
                  <span>Custom Targeting</span>
                </Button>
                <Button
                  variant={formData.audienceType === 'ai_generated' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, audienceType: 'ai_generated' }))}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                >
                  <Brain className="w-6 h-6" />
                  <span>AI Generated</span>
                </Button>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">Target Audience Description</Label>
                  {formData.audienceType === 'ai_generated' && (
                    <Button
                      size="sm"
                      onClick={generateAIAudience}
                      className="btn-premium"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate with AI
                    </Button>
                  )}
                </div>
                <Textarea
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder={formData.audienceType === 'custom' 
                    ? "Describe your target audience demographics, interests, and characteristics"
                    : "AI will generate optimal audience based on your campaign details"
                  }
                  rows={4}
                  className="form-premium"
                />
              </div>
              
              <div>
                <Label className="text-white">AI Matching Criteria</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Demographics', 'Interests', 'Behavior', 'Location', 'Technology', 'Lifestyle'].map((criteria) => (
                    <Button
                      key={criteria}
                      variant={formData.aiSettings.matchingCriteria.includes(criteria) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newCriteria = formData.aiSettings.matchingCriteria.includes(criteria)
                          ? formData.aiSettings.matchingCriteria.filter(c => c !== criteria)
                          : [...formData.aiSettings.matchingCriteria, criteria];
                        setFormData(prev => ({
                          ...prev,
                          aiSettings: { ...prev.aiSettings, matchingCriteria: newCriteria }
                        }));
                      }}
                    >
                      {criteria}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Rewards & Reporting
              </h2>
              <p className="text-white/70">
                Set participant rewards and report preferences
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white">Reward Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { value: 'cash', label: 'Cash', icon: <DollarSign className="w-4 h-4" /> },
                    { value: 'gift_card', label: 'Gift Card', icon: <CreditCard className="w-4 h-4" /> },
                    { value: 'product', label: 'Product', icon: <Package className="w-4 h-4" /> },
                    { value: 'points', label: 'Points', icon: <Award className="w-4 h-4" /> }
                  ].map((reward) => (
                    <Button
                      key={reward.value}
                      variant={formData.rewardType === reward.value ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, rewardType: reward.value as any }))}
                      className="h-16 flex flex-col items-center justify-center space-y-1"
                    >
                      {reward.icon}
                      <span className="text-sm">{reward.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="rewardAmount" className="text-white">Reward Amount</Label>
                <Input
                  id="rewardAmount"
                  type="number"
                  value={formData.rewardAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, rewardAmount: parseFloat(e.target.value) }))}
                  placeholder="Enter reward amount"
                  className="form-premium"
                />
              </div>
              
              <div>
                <Label className="text-white">Report Level</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={formData.reportLevel === 'basic' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, reportLevel: 'basic' }))}
                    className="h-16 flex flex-col items-center justify-center space-y-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">Basic Report</span>
                  </Button>
                  <Button
                    variant={formData.reportLevel === 'advanced' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, reportLevel: 'advanced' }))}
                    className="h-16 flex flex-col items-center justify-center space-y-1"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Advanced Report</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-white">AI Insight Level</Label>
                <Select value={formData.aiSettings.insightLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, aiSettings: { ...prev.aiSettings, insightLevel: value as any } }))}>
                  <SelectTrigger className="form-premium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic AI Analysis</SelectItem>
                    <SelectItem value="advanced">Advanced AI Insights</SelectItem>
                    <SelectItem value="premium">Premium AI + Predictions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                AI Configuration
              </h2>
              <p className="text-white/70">
                Configure AI analysis and matching settings
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="watermarking"
                  checked={formData.watermarking}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, watermarking: checked }))}
                />
                <Label htmlFor="watermarking" className="text-white">
                  Enable watermarking for content protection
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="useAI"
                  checked={formData.aiSettings.useAI}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    aiSettings: { ...prev.aiSettings, useAI: checked } 
                  }))}
                />
                <Label htmlFor="useAI" className="text-white">
                  Enable AI-powered participant matching
                </Label>
              </div>
              
              {formData.aiSettings.enableAIAnalysis && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-emerald-400 font-medium">AI Analysis Available</h4>
                  </div>
                  <p className="text-white/70 text-sm">
                    Premium AI analysis will be available for your uploaded {formData.contentType?.name?.toLowerCase()} content, providing detailed insights on demographics, emotions, and market relevance.
                  </p>
                </div>
              )}
              
              {formData.uploadMethod === 'link' && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <h4 className="text-orange-400 font-medium">Limited AI Analysis</h4>
                  </div>
                  <p className="text-white/70 text-sm">
                    AI analysis is limited for linked content. For full analysis capabilities, consider uploading files directly.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Payment & Checkout
              </h2>
              <p className="text-white/70">
                Complete your payment to launch the campaign
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cost Breakdown */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pricing ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/70">Base Campaign Cost</span>
                        <span className="text-white">${pricing.baseCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Participants ({formData.participantCount})</span>
                        <span className="text-white">${(pricing.participantCost * formData.participantCount).toFixed(2)}</span>
                      </div>
                      {formData.reportLevel === 'advanced' && (
                        <div className="flex justify-between">
                          <span className="text-white/70">Advanced Reports</span>
                          <span className="text-white">$50.00</span>
                        </div>
                      )}
                      {formData.aiSettings.enableAIAnalysis && (
                        <div className="flex justify-between">
                          <span className="text-white/70">AI Analysis Premium</span>
                          <span className="text-white">$100.00</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full" />
                    </div>
                  )}
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-white">${calculateCampaignCost().toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white">Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      amount={calculateCampaignCost()}
                      campaignData={{
                        campaignType: formData.reportLevel === 'advanced' ? 'premium' : 'standard',
                        contentType: formData.contentType?.id || '',
                        participantCount: formData.participantCount,
                        campaignId: null
                      }}
                      onSuccess={() => nextStep()}
                      onError={(error) => toast({ title: "Payment failed", description: error, variant: "destructive" })}
                    />
                  </Elements>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <h4 className="text-blue-400 font-medium">Secure Payment</h4>
              </div>
              <p className="text-white/70 text-sm">
                Your payment is processed securely through Stripe. We never store your payment information.
              </p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Campaign Summary
              </h2>
              <p className="text-white/70">
                Review and launch your campaign
              </p>
            </div>
            
            <div className="space-y-4">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{formData.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/70 text-sm">{formData.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/60 text-xs">Participants</Label>
                      <p className="text-white font-medium">{formData.participantCount}</p>
                    </div>
                    <div>
                      <Label className="text-white/60 text-xs">Content Type</Label>
                      <p className="text-white font-medium">{formData.contentType?.name || 'Not selected'}</p>
                    </div>
                    <div>
                      <Label className="text-white/60 text-xs">Upload Method</Label>
                      <p className="text-white font-medium">{formData.uploadMethod === 'upload' ? 'File Upload' : 'Link'}</p>
                    </div>
                    <div>
                      <Label className="text-white/60 text-xs">Assets</Label>
                      <p className="text-white font-medium">
                        {formData.uploadMethod === 'upload' ? `${formData.assets.length} files` : formData.linkUrl ? '1 link' : 'None'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-white/60 text-xs">Questions</Label>
                      <p className="text-white font-medium">{formData.questions.length}</p>
                    </div>
                    <div>
                      <Label className="text-white/60 text-xs">Reward</Label>
                      <p className="text-white font-medium">${formData.rewardAmount}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="premium-badge">
                      {formData.audienceType === 'ai_generated' ? 'AI Targeting' : 'Custom Targeting'}
                    </Badge>
                    <Badge className="premium-badge">
                      {formData.reportLevel === 'advanced' ? 'Advanced Reports' : 'Basic Reports'}
                    </Badge>
                    {formData.watermarking && (
                      <Badge className="premium-badge">Watermarked</Badge>
                    )}
                    {formData.aiSettings.useAI && (
                      <Badge className="premium-badge">AI Matching</Badge>
                    )}
                    {formData.aiSettings.enableAIAnalysis && (
                      <Badge className="premium-badge">AI Analysis</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  Create Campaign
                </h1>
                <p className="text-white/70">
                  Launch your next focus group study
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Step {currentStep} of {totalSteps}</span>
            <span className="text-white/60 text-sm">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="card-glass mb-8">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="glass-effect"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i + 1 === currentStep
                    ? 'bg-emerald-500'
                    : i + 1 < currentStep
                    ? 'bg-emerald-400'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          
          {currentStep < totalSteps ? (
            <Button onClick={nextStep} className="btn-premium">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="btn-premium"
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Launch Campaign
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}