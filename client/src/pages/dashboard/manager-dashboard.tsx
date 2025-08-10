import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Settings, 
  Eye, 
  Edit, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target,
  UserPlus,
  Mail,
  MessageSquare,
  BarChart3,
  Activity,
  Bell,
  Filter,
  Search,
  Play,
  Pause,
  RefreshCw,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Globe,
  Sparkles,
  Brain,
  Heart,
  ThumbsUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Award,
  FileText,
  Video,
  Image,
  Headphones,
  MonitorPlay,
  Mic,
  Camera,
  Volume2,
  PhoneCall,
  UserCheck,
  UserX,
  Send,
  Plus,
  Trash2,
  MoreVertical
} from "lucide-react";

interface ManagerDashboardData {
  assignedCampaigns: any[];
  totalParticipants: number;
  activeParticipants: number;
  completionRate: number;
  averageEngagement: number;
  recentActivity: any[];
  liveMonitoring: any[];
  participantMetrics: any[];
  notifications: any[];
  pendingInvitations: any[];
  moderationQueue: any[];
  performanceMetrics: any;
}

export default function ManagerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/manager"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/dashboard/manager");
      return response.json() as ManagerDashboardData;
    },
  });

  const inviteParticipantsMutation = useMutation({
    mutationFn: async (data: { campaignId: number; participantIds: number[] }) => {
      const response = await apiRequest("POST", "/api/campaigns/invite-participants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/manager"] });
      toast({ title: "Participants invited successfully" });
      setShowInviteDialog(false);
      setSelectedParticipants([]);
    },
    onError: (error) => {
      toast({ title: "Error inviting participants", description: error.message, variant: "destructive" });
    },
  });

  const moderateContentMutation = useMutation({
    mutationFn: async (data: { contentId: number; action: 'approve' | 'reject'; reason?: string }) => {
      const response = await apiRequest("POST", "/api/moderation/content", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/manager"] });
      toast({ title: "Content moderated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error moderating content", description: error.message, variant: "destructive" });
    },
  });

  const handleInviteParticipants = () => {
    if (selectedCampaign && selectedParticipants.length > 0) {
      inviteParticipantsMutation.mutate({
        campaignId: selectedCampaign,
        participantIds: selectedParticipants
      });
    }
  };

  const handleModerateContent = (contentId: number, action: 'approve' | 'reject', reason?: string) => {
    moderateContentMutation.mutate({ contentId, action, reason });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Settings className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  Manager Dashboard
                </h1>
                <p className="text-white/70">
                  Monitor campaigns and manage participants
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="glass-effect">
                <Bell className="w-4 h-4 mr-2" />
                {dashboardData?.notifications?.length || 0}
              </Button>
              <Button className="btn-premium">
                <MonitorPlay className="w-4 h-4 mr-2" />
                Live Monitor
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Assigned Campaigns</p>
                  <p className="text-2xl font-bold text-white">{dashboardData?.assignedCampaigns?.length || 0}</p>
                </div>
                <Target className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+3 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Participants</p>
                  <p className="text-2xl font-bold text-white">{dashboardData?.totalParticipants || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+15% growth</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Active Participants</p>
                  <p className="text-2xl font-bold text-white">{dashboardData?.activeParticipants || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-4">
                <Progress value={((dashboardData?.activeParticipants || 0) / (dashboardData?.totalParticipants || 1)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{dashboardData?.completionRate || 0}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4">
                <Progress value={dashboardData?.completionRate || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 glass-effect mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="live">Live Monitor</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recentActivity?.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.type)}`} />
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.message}</p>
                          <p className="text-white/60 text-xs">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Invitations */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Pending Invitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.pendingInvitations?.map((invitation: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{invitation.campaign}</p>
                            <p className="text-white/60 text-xs">{invitation.count} participants</p>
                          </div>
                        </div>
                        <Button size="sm" className="btn-premium">
                          <Send className="w-4 h-4 mr-1" />
                          Send
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{dashboardData?.performanceMetrics?.responseRate || 0}%</p>
                    <p className="text-white/70 text-sm">Response Rate</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{dashboardData?.performanceMetrics?.avgTime || 0}min</p>
                    <p className="text-white/70 text-sm">Avg. Response Time</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{dashboardData?.performanceMetrics?.satisfaction || 0}/5</p>
                    <p className="text-white/70 text-sm">Satisfaction Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <Button variant="outline" className="glass-effect">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {dashboardData?.assignedCampaigns?.map((campaign: any, index: number) => (
                <Card key={index} className="card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{campaign.title}</h3>
                          <Badge 
                            variant={campaign.status === 'active' ? 'default' : 'secondary'}
                            className={`${getStatusColor(campaign.status)} text-white`}
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-white/70 mb-4">{campaign.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-white/60 text-sm">Participants</p>
                            <p className="text-white font-semibold">{campaign.participants}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Responses</p>
                            <p className="text-white font-semibold">{campaign.responses}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Completion</p>
                            <p className="text-white font-semibold">{campaign.completion}%</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Deadline</p>
                            <p className="text-white font-semibold">{campaign.deadline}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" className="btn-premium">
                          <Eye className="w-4 h-4 mr-2" />
                          Monitor
                        </Button>
                        <Button size="sm" variant="outline" className="glass-effect">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="glass-effect"
                              onClick={() => setSelectedCampaign(campaign.id)}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Invite
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="card-glass">
                            <DialogHeader>
                              <DialogTitle className="text-white">Invite Participants</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-white">Select Participants</Label>
                                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                                  {/* Participant selection would go here */}
                                  <p className="text-white/60 text-sm">Participant selection interface</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={handleInviteParticipants}
                                  disabled={inviteParticipantsMutation.isPending}
                                  className="btn-premium"
                                >
                                  Send Invitations
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setShowInviteDialog(false)}
                                  className="glass-effect"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Monitor Tab */}
          <TabsContent value="live" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MonitorPlay className="w-5 h-5 mr-2" />
                  Live Session Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Active Sessions</h3>
                      <Badge className="bg-green-500 text-white">
                        {dashboardData?.liveMonitoring?.length || 0} Live
                      </Badge>
                    </div>
                    {dashboardData?.liveMonitoring?.map((session: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{session.campaign}</h4>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-white/60 text-sm">Live</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-white/60" />
                            <span className="text-white/60">{session.participants} participants</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-white/60" />
                            <span className="text-white/60">{session.duration}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" className="btn-premium">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="glass-effect">
                            <Mic className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Session Controls</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="btn-premium h-16 flex flex-col items-center justify-center space-y-1">
                        <Camera className="w-6 h-6" />
                        <span className="text-sm">Start Video</span>
                      </Button>
                      <Button className="btn-premium h-16 flex flex-col items-center justify-center space-y-1">
                        <Mic className="w-6 h-6" />
                        <span className="text-sm">Enable Audio</span>
                      </Button>
                      <Button className="btn-premium h-16 flex flex-col items-center justify-center space-y-1">
                        <Share2 className="w-6 h-6" />
                        <span className="text-sm">Share Screen</span>
                      </Button>
                      <Button className="btn-premium h-16 flex flex-col items-center justify-center space-y-1">
                        <FileText className="w-6 h-6" />
                        <span className="text-sm">Show Notes</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Content Moderation Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.moderationQueue?.map((item: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-yellow-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              {item.type}
                            </Badge>
                            <span className="text-white/60 text-sm">{item.campaign}</span>
                          </div>
                          <p className="text-white mb-2">{item.content}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-white/60">By: {item.author}</span>
                            <span className="text-white/60">{item.timestamp}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            className="btn-premium"
                            onClick={() => handleModerateContent(item.id, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleModerateContent(item.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
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