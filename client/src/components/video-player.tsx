import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  Shield,
  Eye,
  EyeOff,
  Clock,
  Download,
  MoreHorizontal,
  Zap,
  Brain,
  BarChart3,
  FileText,
  X
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  campaignId: number;
  allowDownload?: boolean;
  showWatermark?: boolean;
  watermarkText?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

interface VideoAnalysis {
  emotions: Record<string, number>;
  engagement: number;
  attentionSpans: Array<{ start: number; end: number; level: number }>;
  keyMoments: Array<{ timestamp: number; description: string }>;
  transcript: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
}

export function VideoPlayer({ 
  videoUrl, 
  title, 
  campaignId, 
  allowDownload = false, 
  showWatermark = true, 
  watermarkText = "FokusHub360",
  onAnalysisComplete 
}: VideoPlayerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [viewingTime, setViewingTime] = useState(0);
  const [isSecured, setIsSecured] = useState(true);

  const analyzeVideoMutation = useMutation({
    mutationFn: async (data: { videoUrl: string; campaignId: number }) => {
      const response = await apiRequest("POST", "/api/video/analyze", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      onAnalysisComplete?.(data);
      toast({ title: "Video analysis completed", description: "AI insights are now available." });
    },
    onError: (error) => {
      toast({ title: "Analysis failed", description: error.message, variant: "destructive" });
    },
  });

  const trackViewingMutation = useMutation({
    mutationFn: async (data: { 
      videoUrl: string; 
      campaignId: number; 
      viewingTime: number; 
      completed: boolean;
      events: Array<{ type: string; timestamp: number; data?: any }>;
    }) => {
      const response = await apiRequest("POST", "/api/video/track", data);
      return response.json();
    },
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setViewingTime(prev => prev + 1);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      trackViewingMutation.mutate({
        videoUrl,
        campaignId,
        viewingTime,
        completed: false,
        events: [{ type: 'play', timestamp: video.currentTime }]
      });
    };

    const handlePause = () => {
      setIsPlaying(false);
      trackViewingMutation.mutate({
        videoUrl,
        campaignId,
        viewingTime,
        completed: false,
        events: [{ type: 'pause', timestamp: video.currentTime }]
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      trackViewingMutation.mutate({
        videoUrl,
        campaignId,
        viewingTime,
        completed: true,
        events: [{ type: 'ended', timestamp: video.currentTime }]
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl, campaignId, viewingTime]);

  // Security measures
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isSecured) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSecured && (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')
      )) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSecured]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePlaybackRateChange = (rate: string) => {
    const video = videoRef.current;
    if (!video) return;

    const newRate = parseFloat(rate);
    video.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    analyzeVideoMutation.mutate({ videoUrl, campaignId });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEngagementColor = (level: number) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card className="card-glass overflow-hidden">
        <CardContent className="p-0">
          <div 
            className="relative group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full aspect-video bg-black"
              preload="metadata"
              controlsList={isSecured ? "nodownload nofullscreen noremoteplayback" : ""}
              disablePictureInPicture={isSecured}
              playsInline
            />
            
            {/* Watermark */}
            {showWatermark && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm font-medium backdrop-blur-sm">
                {watermarkText}
              </div>
            )}

            {/* Security Badge */}
            {isSecured && (
              <div className="absolute top-4 left-4 bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border border-red-500/30">
                <Shield className="w-3 h-3 inline mr-1" />
                Protected Content
              </div>
            )}

            {/* Controls Overlay */}
            {showControls && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/30"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </Button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  {/* Progress Bar */}
                  <div className="w-full">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={togglePlay}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={toggleMute}
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <div className="w-20">
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            onValueChange={handleVolumeChange}
                            max={1}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <span className="text-white text-sm font-medium">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setShowCaptions(!showCaptions)}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        CC
                      </Button>

                      <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                        <SelectTrigger className="w-16 h-8 text-white border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="1">1x</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="2">2x</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={toggleFullscreen}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Information & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Info */}
        <Card className="card-glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>{title}</span>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(viewingTime)}
                </Badge>
                {!allowDownload && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    No Download
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{formatTime(duration)}</p>
                <p className="text-white/60 text-sm">Total Duration</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Math.round((currentTime / duration) * 100) || 0}%</p>
                <p className="text-white/60 text-sm">Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatTime(viewingTime)}</p>
                <p className="text-white/60 text-sm">Watch Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                AI Analysis
              </div>
              <Button
                onClick={startAnalysis}
                disabled={isAnalyzing || analyzeVideoMutation.isPending}
                size="sm"
                className="btn-premium"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Engagement Score</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analysis.engagement}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getEngagementColor(analysis.engagement)}`}>
                      {analysis.engagement}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Sentiment</h4>
                  <Badge className={`${
                    analysis.sentiment === 'positive' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    analysis.sentiment === 'negative' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Top Emotions</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.emotions).slice(0, 3).map(([emotion, score]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="text-white/80 capitalize">{emotion}</span>
                        <span className="text-white font-medium">{Math.round(score * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Summary</h4>
                  <p className="text-white/80 text-sm">{analysis.summary}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-white/60">Click "Analyze" to get AI insights on viewer engagement and emotional response</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}