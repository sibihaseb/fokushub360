import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { NavigationHeader } from "@/components/navigation-header";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  PlayCircle, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Flag,
  Target,
  Shield,
  Star,
  Send,
  ArrowLeft,
  Timer,
  MessageSquare,
  MapPin,
  Plus,
  X,
  Image as ImageIcon,
  Video,
  Headphones,
  Play,
  Pause,
  Volume2,
  ExternalLink
} from "lucide-react";

interface CampaignParticipationProps {
  campaignId: string;
}

interface MediaAnnotation {
  id: string;
  type: 'image' | 'video' | 'audio';
  assetId: number;
  x?: number;
  y?: number;
  timestamp?: number;
  note: string;
  createdAt: Date;
}

export default function CampaignParticipate({ campaignId }: CampaignParticipationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Media annotation states
  const [annotations, setAnnotations] = useState<MediaAnnotation[]>([]);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<MediaAnnotation>>({});
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null);
  
  // Media control states
  const [isPlaying, setIsPlaying] = useState<Record<number, boolean>>({});
  const [currentTime, setCurrentTime] = useState<Record<number, number>>({});
  
  // Refs for media elements
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});
  const imageRefs = useRef<Record<number, HTMLImageElement | null>>({});

  // Fetch campaign details
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['/api/campaigns', campaignId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/campaigns/${campaignId}`);
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Fetch campaign assets
  const { data: campaignAssets, isLoading: assetsLoading } = useQuery({
    queryKey: ['/api/campaigns', campaignId, 'assets'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/campaigns/${campaignId}/assets`);
      const data = await response.json();

      return data;
    },
    refetchOnWindowFocus: false,
    enabled: !!campaignId,
  });



  // Annotation functions
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, assetId: number) => {
    if (!isAnnotating) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCurrentAnnotation({
      id: Date.now().toString(),
      type: 'image',
      assetId,
      x,
      y,
      createdAt: new Date(),
    });
    setSelectedAsset(assetId);
  };

  const handleVideoTimeUpdate = (assetId: number, time: number) => {
    setCurrentTime(prev => ({ ...prev, [assetId]: time }));
  };

  const addVideoAnnotation = (assetId: number) => {
    const video = videoRefs.current[assetId];
    if (!video) return;
    
    setCurrentAnnotation({
      id: Date.now().toString(),
      type: 'video',
      assetId,
      timestamp: video.currentTime,
      createdAt: new Date(),
    });
    setSelectedAsset(assetId);
  };

  const addAudioAnnotation = (assetId: number) => {
    const audio = audioRefs.current[assetId];
    if (!audio) return;
    
    setCurrentAnnotation({
      id: Date.now().toString(),
      type: 'audio',
      assetId,
      timestamp: audio.currentTime,
      createdAt: new Date(),
    });
    setSelectedAsset(assetId);
  };

  const saveAnnotation = (note: string) => {
    if (!note.trim()) return;
    
    if (currentAnnotation.id && annotations.find(a => a.id === currentAnnotation.id)) {
      // Edit existing annotation
      setAnnotations(prev => prev.map(a => 
        a.id === currentAnnotation.id 
          ? { ...a, note: note.trim() }
          : a
      ));
      toast({
        title: "Note Updated",
        description: "Your note has been updated.",
      });
    } else {
      // Create new annotation
      const annotation: MediaAnnotation = {
        ...currentAnnotation,
        id: currentAnnotation.id || Date.now().toString(),
        note: note.trim(),
        createdAt: new Date(),
      } as MediaAnnotation;
      
      setAnnotations(prev => [...prev, annotation]);
      toast({
        title: "Note Added",
        description: "Your note has been saved.",
      });
    }
    
    setCurrentAnnotation({});
    setSelectedAsset(null);
    setIsAnnotating(false);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const editAnnotation = (annotation: MediaAnnotation) => {
    setCurrentAnnotation(annotation);
    setSelectedAsset(annotation.assetId);
    setIsAnnotating(true);
  };

  const togglePlayPause = (assetId: number, type: 'video' | 'audio') => {
    const mediaElement = type === 'video' ? videoRefs.current[assetId] : audioRefs.current[assetId];
    if (!mediaElement) return;
    
    if (mediaElement.paused) {
      mediaElement.play();
      setIsPlaying(prev => ({ ...prev, [assetId]: true }));
    } else {
      mediaElement.pause();
      setIsPlaying(prev => ({ ...prev, [assetId]: false }));
    }
  };

  // Submit feedback mutation with annotations
  const submitFeedback = useMutation({
    mutationFn: async (feedbackData: { feedback: string; rating: number; annotations: MediaAnnotation[] }) => {
      return apiRequest('POST', `/api/campaigns/${campaignId}/feedback`, feedbackData);
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your detailed feedback and annotations!",
      });
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please rate your experience before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitFeedback.mutate({ feedback, rating, annotations });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Campaign Not Found</h2>
            <p className="text-white/70 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.location.href = '/dashboard'} className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Campaign Participation</h1>
              <p className="text-white/70">Complete your focus group participation and provide feedback</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="border-white/20 text-white hover:bg-white/10 bg-gray-800/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Campaign Overview */}
          <Card className="border border-white/10 bg-white/5 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center space-x-3 mb-2">
                    <PlayCircle className="w-6 h-6 text-green-400" />
                    <span>{campaign.title || 'Campaign Participation'}</span>
                  </CardTitle>
                  <p className="text-white/60 text-sm">Campaign ID: #{campaign.id} | Client: {campaign.clientName || 'Premium Client'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active Participation
                  </Badge>
                  {campaign.priorityLevel && campaign.priorityLevel !== 'normal' && (
                    <Badge className={
                      campaign.priorityLevel === 'urgent' 
                        ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    }>
                      <Flag className="w-3 h-3 mr-1" />
                      {campaign.priorityLevel.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-6">{campaign.description || 'Please review the campaign materials and provide your detailed feedback.'}</p>
              
              {/* Campaign Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Campaign Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Campaign Type:</span>
                      <span className="text-white">{campaign.campaignType || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Content Type:</span>
                      <span className="text-white">{campaign.contentType || 'Mixed Media'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Report Level:</span>
                      <span className="text-white capitalize">{campaign.reportLevel || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Watermark:</span>
                      <span className="text-white">{campaign.watermarkEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Participation Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Target Audience:</span>
                      <span className="text-white">
                        {typeof campaign.targetAudience === 'string' 
                          ? campaign.targetAudience 
                          : typeof campaign.targetAudience === 'object' && campaign.targetAudience
                            ? (campaign.targetAudience.primary || campaign.targetAudience.demographic || 'General')
                            : 'General'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Created:</span>
                      <span className="text-white">{campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Status:</span>
                      <span className="text-green-400 capitalize">{campaign.status || 'Active'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Payment:</span>
                      <span className="text-white">{campaign.paymentStatus || 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Campaign Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white/60 text-sm">Reward</p>
                    <p className="text-white font-medium">${campaign.rewardAmount}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">Duration</p>
                    <p className="text-white font-medium">{campaign.estimatedDuration || 30} min</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white/60 text-sm">Participants</p>
                    <p className="text-white font-medium">{campaign.participantCount || 10}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <Target className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white/60 text-sm">Category</p>
                    <p className="text-white font-medium">{campaign.category || 'General'}</p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {campaign.specialInstructions && (
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium">Special Instructions</span>
                  </div>
                  <p className="text-white/80">{campaign.specialInstructions}</p>
                </div>
              )}

              {/* Urgency Notes */}
              {campaign.urgencyNotes && (
                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-300 font-medium">Urgency Notes</span>
                  </div>
                  <p className="text-white/80">{campaign.urgencyNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Materials Section - Enhanced with Annotations */}
          {campaignAssets && campaignAssets.length > 0 ? (
            <div className="space-y-6">
              {/* Media Controls Bar */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-white/10">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-medium">Campaign Materials</h3>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {campaignAssets.length} {campaignAssets.length === 1 ? 'Asset' : 'Assets'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setIsAnnotating(!isAnnotating)}
                    variant={isAnnotating ? "default" : "outline"}
                    size="sm"
                    className={isAnnotating ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-white/20 text-white hover:bg-white/10 bg-transparent"}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAnnotating ? 'Exit Annotation Mode' : 'Add Annotations'}
                  </Button>
                  {annotations.length > 0 && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {annotations.length} {annotations.length === 1 ? 'Note' : 'Notes'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Media Assets Grid */}
              <div className="space-y-8">
                {campaignAssets.map((asset: any, index: number) => (
                  <Card key={index} className="border border-white/10 bg-white/5 overflow-hidden">
                    <CardContent className="p-0">
                      {asset.fileType?.startsWith('image/') ? (
                        <div className="space-y-4">
                          {/* Image Header */}
                          <div className="p-4 bg-gray-800/30 border-b border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <ImageIcon className="w-5 h-5 text-blue-400" />
                                <div>
                                  <h4 className="text-white font-medium">{asset.fileName}</h4>
                                  <p className="text-white/60 text-sm">Image • Click to annotate specific areas</p>
                                </div>
                              </div>
                              {isAnnotating && (
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  Click to Add Note
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Image Display */}
                          <div className="relative px-4">
                            <img 
                              ref={el => imageRefs.current[asset.id] = el}
                              src={asset.fileUrl} 
                              alt={asset.fileName} 
                              className={`w-full max-h-96 object-contain rounded-lg ${isAnnotating ? 'cursor-crosshair' : ''}`}
                              onClick={(e) => handleImageClick(e, asset.id)}
                            />
                            
                            {/* Image Annotations */}
                            {annotations.filter(a => a.assetId === asset.id && a.type === 'image').map((annotation) => (
                              <div 
                                key={annotation.id}
                                className="absolute"
                                style={{ 
                                  left: `${annotation.x}%`, 
                                  top: `${annotation.y}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                <div className="bg-red-500 w-3 h-3 rounded-full border-2 border-white shadow-lg"></div>
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-2 rounded text-xs w-48 z-10">
                                  {annotation.note}
                                  <div className="flex space-x-1 mt-1">
                                    <Button
                                      onClick={() => editAnnotation(annotation)}
                                      size="sm"
                                      className="p-1 h-auto bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      onClick={() => removeAnnotation(annotation.id)}
                                      size="sm"
                                      className="p-1 h-auto bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : asset.fileType?.startsWith('video/') ? (
                        <div className="space-y-4">
                          {/* Video Header */}
                          <div className="p-4 bg-gray-800/30 border-b border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Video className="w-5 h-5 text-green-400" />
                                <div>
                                  <h4 className="text-white font-medium">{asset.fileName}</h4>
                                  <p className="text-white/60 text-sm">Video • Pause to add timestamped notes</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => togglePlayPause(asset.id, 'video')}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isPlaying[asset.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                                <Button
                                  onClick={() => addVideoAnnotation(asset.id)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Note
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Video Display */}
                          <div className="px-4">
                            <video 
                              ref={el => videoRefs.current[asset.id] = el}
                              src={asset.fileUrl} 
                              controls
                              preload="metadata"
                              className="w-full max-h-96 rounded-lg bg-black"
                              onTimeUpdate={(e) => handleVideoTimeUpdate(asset.id, e.currentTarget.currentTime)}
                            />
                            
                            {/* Video Annotations Timeline */}
                            {annotations.filter(a => a.assetId === asset.id && a.type === 'video').length > 0 && (
                              <div className="mt-4 space-y-2">
                                <h5 className="text-white text-sm font-medium">Video Notes:</h5>
                                {annotations.filter(a => a.assetId === asset.id && a.type === 'video').map((annotation) => (
                                  <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-blue-500/20 text-blue-300">
                                        {Math.floor(annotation.timestamp! / 60)}:{(annotation.timestamp! % 60).toFixed(0).padStart(2, '0')}
                                      </Badge>
                                      <span className="text-white/80 text-sm">{annotation.note}</span>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={() => editAnnotation(annotation)}
                                        size="sm"
                                        className="p-1 h-auto bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        onClick={() => removeAnnotation(annotation.id)}
                                        size="sm"
                                        className="p-1 h-auto bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : asset.fileType?.startsWith('audio/') ? (
                        <div className="space-y-4">
                          {/* Audio Header */}
                          <div className="p-4 bg-gray-800/30 border-b border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Headphones className="w-5 h-5 text-purple-400" />
                                <div>
                                  <h4 className="text-white font-medium">{asset.fileName}</h4>
                                  <p className="text-white/60 text-sm">Audio • Pause to add timestamped notes</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => togglePlayPause(asset.id, 'audio')}
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  {isPlaying[asset.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                                <Button
                                  onClick={() => addAudioAnnotation(asset.id)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Note
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Audio Display */}
                          <div className="px-4">
                            <div className="p-6 bg-gray-800/50 rounded-lg">
                              <audio 
                                ref={el => audioRefs.current[asset.id] = el}
                                src={asset.fileUrl} 
                                controls
                                preload="metadata"
                                className="w-full"
                              />
                            </div>
                            
                            {/* Audio Annotations Timeline */}
                            {annotations.filter(a => a.assetId === asset.id && a.type === 'audio').length > 0 && (
                              <div className="mt-4 space-y-2">
                                <h5 className="text-white text-sm font-medium">Audio Notes:</h5>
                                {annotations.filter(a => a.assetId === asset.id && a.type === 'audio').map((annotation) => (
                                  <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-purple-500/20 text-purple-300">
                                        {Math.floor(annotation.timestamp! / 60)}:{(annotation.timestamp! % 60).toFixed(0).padStart(2, '0')}
                                      </Badge>
                                      <span className="text-white/80 text-sm">{annotation.note}</span>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={() => editAnnotation(annotation)}
                                        size="sm"
                                        className="p-1 h-auto bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        onClick={() => removeAnnotation(annotation.id)}
                                        size="sm"
                                        className="p-1 h-auto bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-white/10">
                            <div className="flex items-center space-x-3">
                              <ExternalLink className="w-5 h-5 text-orange-400" />
                              <div>
                                <h4 className="text-white font-medium">{asset.fileName}</h4>
                                <p className="text-white/60 text-sm">External Content • Click to view</p>
                              </div>
                            </div>
                            <a 
                              href={asset.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Open Content</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border border-white/10 bg-white/5">
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">No campaign materials available yet.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Annotation Input Modal */}
          {selectedAsset && currentAnnotation.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="border border-white/10 bg-gray-900 w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-white">Add Annotation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-white/60">
                      {currentAnnotation.type === 'image' && 'Click position noted'}
                      {currentAnnotation.type === 'video' && `Timestamp: ${Math.floor(currentAnnotation.timestamp! / 60)}:${(currentAnnotation.timestamp! % 60).toFixed(0).padStart(2, '0')}`}
                      {currentAnnotation.type === 'audio' && `Timestamp: ${Math.floor(currentAnnotation.timestamp! / 60)}:${(currentAnnotation.timestamp! % 60).toFixed(0).padStart(2, '0')}`}
                    </div>
                    <Textarea
                      placeholder="Enter your note or feedback..."
                      className="bg-gray-800 border-white/10 text-white"
                      rows={3}
                      value={currentAnnotation.note || ''}
                      onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, note: e.target.value }))}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        onClick={() => {
                          setCurrentAnnotation({});
                          setSelectedAsset(null);
                          setIsAnnotating(false);
                        }}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => saveAnnotation(currentAnnotation.note || '')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Save Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feedback Form */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span>Provide Your Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-white font-medium mb-3">Rate Your Experience</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 rounded transition-colors ${
                        star <= rating ? 'text-yellow-400' : 'text-white/30 hover:text-white/50'
                      }`}
                    >
                      <Star className="w-6 h-6" fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="text-white/70 ml-3">
                    {rating === 0 ? 'No rating' : `${rating} star${rating !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-white font-medium mb-3">Your Feedback</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Please share your thoughts about the campaign, products, or materials you reviewed..."
                  className="min-h-[150px] bg-gray-800/50 border-gray-700 text-white placeholder-white/40 resize-none"
                  maxLength={2000}
                />
                <div className="text-right text-white/50 text-sm mt-2">
                  {feedback.length}/2000 characters
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submitFeedback.isPending || !feedback.trim() || rating === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  {submitFeedback.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}