import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionnaireHealthIndicator } from "@/components/questionnaire-health-indicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NavigationHeader } from "@/components/navigation-header";
import ParticipantVerificationBanner from "@/components/participant-verification-banner";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatDateTime, formatRelativeTime } from "@/lib/date-utils";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Award,
  Timer,
  Info,
  Mail,
  Eye,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Trophy,
  Zap,
  MessageSquare,
  Bell,
  Sparkles,
  X,
  AlertCircle,
  Flag,
  FileText,
  PlayCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend
} from "recharts";

interface CampaignInvitation {
  id: number;
  campaign: {
    id: number;
    title: string;
    description: string;
    clientName: string;
    estimatedDuration: number;
    participantCount: number;
    targetAudience: string;
    questions: any[];
  };
  status: 'invited' | 'accepted' | 'declined' | 'completed' | 'expired';
  invitedAt: string;
  responseDeadline: string;
  rewardType: string;
  rewardAmount: number;
  invitedBy: string;
}

interface ParticipantStats {
  totalCampaigns: number;
  completedCampaigns: number;
  pendingInvitations: number;
  totalEarnings: number;
  averageRating: number;
  warningCount: number;
  responseRate: number;
  monthlyEarnings: Array<{month: string, earnings: number}>;
  campaignsByCategory: Array<{category: string, count: number, value: number}>;
  performanceMetrics: {
    completionRate: number;
    averageResponseTime: number;
    qualityScore: number;
    punctualityScore: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: string;
    icon: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    amount?: number;
  }>;
}

export default function ParticipantDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState<{[key: number]: string}>({});
  const [selectedChartData, setSelectedChartData] = useState<any>(null);
  const [showEarningsDetails, setShowEarningsDetails] = useState(false);
  const [showCategoriesDetails, setShowCategoriesDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  const { data: invitations, isLoading: invitationsLoading } = useQuery<CampaignInvitation[]>({
    queryKey: ["/api/dashboard/participant/invitations"],
    retry: false,
  });

  const { data: completedCampaigns } = useQuery<CampaignInvitation[]>({
    queryKey: ["/api/dashboard/participant/completed"],
    retry: false,
  });

  const { data: stats } = useQuery<ParticipantStats>({
    queryKey: ["/api/dashboard/participant/stats"],
    retry: false,
  });

  // Mock enhanced stats for demonstration (would come from API)
  const enhancedStats = {
    ...stats,
    monthlyEarnings: stats?.monthlyEarnings || [],
    campaignsByCategory: stats?.campaignsByCategory || [],
    performanceMetrics: stats?.performanceMetrics || {
      completionRate: 0,
      averageResponseTime: 0,
      qualityScore: 0,
      punctualityScore: 0,
    },
    achievements: stats?.achievements || [],
    recentActivity: stats?.recentActivity || []
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const getTimeUrgency = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursLeft < 0) return 'expired';
    if (hoursLeft < 12) return 'critical';
    if (hoursLeft < 24) return 'urgent';
    return 'normal';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'expired': return 'text-red-600 bg-red-50';
      case 'critical': return 'text-red-600 bg-red-50';
      case 'urgent': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'expired': return 'EXPIRED';
      case 'critical': return 'CRITICAL';
      case 'urgent': return 'URGENT';
      default: return 'NORMAL';
    }
  };

  const respondMutation = useMutation({
    mutationFn: async (data: { invitationId: number; action: 'accept' | 'decline' }) => {
      const response = await apiRequest("POST", `/api/invitations/respond`, {
        invitationId: data.invitationId,
        action: data.action
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/participant/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/participant/stats"] });
      toast({ 
        title: "Response recorded", 
        description: "Your response has been successfully recorded." 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error responding", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleAcceptInvitation = (invitation: any) => {
    respondMutation.mutate({ invitationId: invitation.invitationId, action: 'accept' });
  };

  const handleDeclineInvitation = (invitation: any) => {
    respondMutation.mutate({ invitationId: invitation.invitationId, action: 'decline' });
  };

  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = (invitation: any) => {
    setSelectedInvitation(invitation);
    setIsDetailsModalOpen(true);
  };

  const calculateTimeLeft = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const difference = deadlineTime - now;

    if (difference <= 0) return 'Expired';

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) return `${minutes}m left`;
    if (hours < 24) return `${hours}h ${minutes}m left`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invited': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'declined': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'expired': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'invited': 
      case 'pending': return <Mail className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'completed': return <Award className="w-4 h-4" />;
      case 'expired': return <Timer className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getUrgencyLevel = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const hoursLeft = (deadlineTime - now) / (1000 * 60 * 60);
    
    if (hoursLeft <= 0) return 'expired';
    if (hoursLeft <= 6) return 'critical';
    if (hoursLeft <= 12) return 'urgent';
    return 'normal';
  };

  // Update countdown timer
  useEffect(() => {
    if (!invitations) return;

    const interval = setInterval(() => {
      const newTimeLeft: {[key: number]: string} = {};
      invitations.forEach(invitation => {
        newTimeLeft[invitation.id] = calculateTimeLeft(invitation.responseDeadline);
      });
      setTimeLeft(newTimeLeft);
    }, 60000); // Update every minute

    // Initial calculation
    const initialTimeLeft: {[key: number]: string} = {};
    invitations.forEach(invitation => {
      initialTimeLeft[invitation.id] = calculateTimeLeft(invitation.responseDeadline);
    });
    setTimeLeft(initialTimeLeft);

    return () => clearInterval(interval);
  }, [invitations]);

  const pendingInvitations = invitations?.filter(inv => inv.status === 'pending') || [];
  const acceptedInvitations = invitations?.filter(inv => inv.status === 'accepted') || [];
  const declinedInvitations = invitations?.filter(inv => inv.status === 'declined') || [];
  const completedInvitations = invitations?.filter(inv => inv.status === 'completed') || [];

  if (invitationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <NavigationHeader 
          title="Participant Dashboard"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Participant" }
          ]}
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <NavigationHeader 
        title="Participant Dashboard"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Participant" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Campaigns</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalCampaigns || 0}</p>
                  <p className="text-white/40 text-xs mt-1">{stats?.totalCampaigns > 0 ? 'Active' : 'Get started'}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">${stats?.totalEarnings || 0}</p>
                  <p className="text-white/40 text-xs mt-1">{stats?.totalEarnings > 0 ? 'Earned from campaigns' : 'Start earning'}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Average Rating</p>
                  <p className="text-2xl font-bold text-white">{stats?.averageRating || 0}/5</p>
                  <p className="text-white/40 text-xs mt-1">{stats?.averageRating > 0 ? 'Quality feedback' : 'Not rated yet'}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Response Rate</p>
                  <p className="text-2xl font-bold text-white">{stats?.responseRate || 0}%</p>
                  <p className="text-white/40 text-xs mt-1">{stats?.responseRate > 90 ? 'Excellent' : stats?.responseRate > 0 ? 'Good' : 'Not rated yet'}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Pending Invites</p>
                  <p className="text-2xl font-bold text-white">{stats?.pendingInvitations || 0}</p>
                  <p className="text-white/40 text-xs mt-1">{stats?.pendingInvitations > 0 ? 'Action needed' : 'All caught up'}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Bell className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Completion Rate</span>
                  <span className="text-white">{enhancedStats.performanceMetrics?.completionRate || 0}%</span>
                </div>
                <Progress value={enhancedStats.performanceMetrics?.completionRate || 0} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Quality Score</span>
                  <span className="text-white">{enhancedStats.performanceMetrics?.qualityScore || 0}/5</span>
                </div>
                <Progress value={(enhancedStats.performanceMetrics?.qualityScore || 0) * 20} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Punctuality Score</span>
                  <span className="text-white">{enhancedStats.performanceMetrics?.punctualityScore || 0}%</span>
                </div>
                <Progress value={enhancedStats.performanceMetrics?.punctualityScore || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowEarningsDetails(true)}>
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Earnings
                </div>
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <Eye className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={enhancedStats.monthlyEarnings || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value, name) => [`$${value}`, name]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    onClick={(data) => {
                      setSelectedChartData(data);
                      setShowEarningsDetails(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-glass cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowCategoriesDetails(true)}>
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Campaign Categories
                </div>
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <Eye className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={enhancedStats.campaignsByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(data) => {
                      setSelectedChartData(data);
                      setShowCategoriesDetails(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {enhancedStats.campaignsByCategory?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value, name) => [`${value} campaigns`, name]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedStats.recentActivity?.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Activity className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.title}</p>
                      <p className="text-white/60 text-xs">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
                    {activity.amount && (
                      <div className="text-green-400 text-sm font-medium">
                        +${activity.amount}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-blue-500/20">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedStats.achievements?.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <div className="p-2 bg-yellow-500/20 rounded-full">
                      <span className="text-xl">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{achievement.title}</p>
                      <p className="text-white/60 text-xs">{achievement.description}</p>
                    </div>
                    <div className="text-white/60 text-xs">
                      {formatDate(achievement.earnedAt)}
                    </div>
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-yellow-500/20">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Banner */}
        <ParticipantVerificationBanner />

        {/* Questionnaire Health Indicator */}
        <div className="mb-8">
          <QuestionnaireHealthIndicator />
        </div>

        {/* Warning Display */}
        {stats?.warningCount > 0 && (
          <Card className="card-glass mb-8 border-yellow-500/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium">
                    Active Warnings: {stats.warningCount}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    Please review your participation behavior. Continued warnings may result in account suspension.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Invitations */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-white">Campaign Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700">
                <TabsTrigger value="pending" className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Pending ({pendingInvitations.length})
                </TabsTrigger>
                <TabsTrigger value="accepted" className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Accepted ({acceptedInvitations.length})
                </TabsTrigger>
                <TabsTrigger value="declined" className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Declined ({declinedInvitations.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Completed ({completedInvitations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingInvitations.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No pending invitations</p>
                  </div>
                ) : (
                  pendingInvitations.map((invitation) => {
                    const urgency = getUrgencyLevel(invitation.responseDeadline);
                    const currentTimeLeft = timeLeft[invitation.id] || calculateTimeLeft(invitation.responseDeadline);
                    
                    return (
                      <Card 
                        key={invitation.id} 
                        className={`border border-white/10 ${urgency === 'critical' ? 'border-red-500/50 bg-red-500/5' : urgency === 'urgent' ? 'border-yellow-500/50 bg-yellow-500/5' : 'bg-white/5'}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-lg font-semibold text-white">
                                  {invitation.title}
                                </h3>
                                <Badge className={getStatusColor(invitation.status)}>
                                  {getStatusIcon(invitation.status)}
                                  <span className="ml-1 capitalize">{invitation.status}</span>
                                </Badge>
                                {urgency === 'critical' && (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Critical
                                  </Badge>
                                )}
                                {urgency === 'urgent' && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Urgent
                                  </Badge>
                                )}
                                {invitation.priorityLevel && invitation.priorityLevel !== 'normal' && (
                                  <Badge className={
                                    invitation.priorityLevel === 'urgent' 
                                      ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                  }>
                                    <Flag className="w-3 h-3 mr-1" />
                                    {invitation.priorityLevel.toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-white/80 mb-4">
                                {invitation.description}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-white/60" />
                                  <span className="text-white/70 text-sm">
                                    25 participants
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-white/60" />
                                  <span className="text-white/70 text-sm">
                                    30 min
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4 text-white/60" />
                                  <span className="text-white/70 text-sm">
                                    {invitation.rewardAmount} {invitation.rewardType}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Timer className="w-4 h-4 text-white/60" />
                                  <span className={`text-sm ${urgency === 'critical' ? 'text-red-400' : urgency === 'urgent' ? 'text-yellow-400' : 'text-white/70'}`}>
                                    {currentTimeLeft}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-white/60 text-sm">
                                  Category: {invitation.targetAudience ? (typeof invitation.targetAudience === 'string' ? JSON.parse(invitation.targetAudience).category : invitation.targetAudience.category) : 'General'}
                                </p>
                                <p className="text-white/60 text-sm">
                                  Invited by: Manager #{invitation.invitedBy}
                                </p>

                                <p className="text-white/60 text-sm">
                                  Deadline: {formatDateTime(invitation.responseDeadline)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                onClick={() => handleAcceptInvitation(invitation)}
                                disabled={respondMutation.isPending}
                                className="btn-premium"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleDeclineInvitation(invitation)}
                                disabled={respondMutation.isPending}
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-red-900/20"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(invitation)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* Campaign Details Modal */}
              <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center justify-between">
                      Campaign Details
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDetailsModalOpen(false)}
                        className="text-white/60 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </DialogTitle>
                  </DialogHeader>
                  {selectedInvitation && (
                    <div className="space-y-6">
                      {/* Priority and Urgency Alert */}
                      {selectedInvitation.priorityLevel && selectedInvitation.priorityLevel !== 'normal' && (
                        <div className={`p-4 rounded-lg border-l-4 ${
                          selectedInvitation.priorityLevel === 'urgent' 
                            ? 'bg-red-900/20 border-red-500' 
                            : 'bg-yellow-900/20 border-yellow-500'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <AlertCircle className={`w-5 h-5 ${
                              selectedInvitation.priorityLevel === 'urgent' ? 'text-red-400' : 'text-yellow-400'
                            }`} />
                            <span className={`font-medium ${
                              selectedInvitation.priorityLevel === 'urgent' ? 'text-red-300' : 'text-yellow-300'
                            }`}>
                              {selectedInvitation.priorityLevel.toUpperCase()} PRIORITY
                            </span>
                          </div>
                          {selectedInvitation.urgencyNotes && (
                            <p className="text-white/70 text-sm mt-2">{selectedInvitation.urgencyNotes}</p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {selectedInvitation.title}
                          </h3>
                          <p className="text-white/70 text-sm mb-4">
                            {selectedInvitation.description}
                          </p>
                          
                          {/* Campaign Details */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="text-white/80">
                                Reward: ${selectedInvitation.rewardAmount} {selectedInvitation.rewardType}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span className="text-white/80">
                                Estimated Duration: {selectedInvitation.estimatedDuration || 30} minutes
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-white/80">
                                Participants Needed: {selectedInvitation.participantCount || 10}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Timer className="w-4 h-4 text-orange-400" />
                              <span className="text-white/80">
                                Response Deadline: {new Date(selectedInvitation.responseDeadline).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-indigo-400" />
                              <span className="text-white/80">
                                Client: {selectedInvitation.clientName || 'Anonymous Client'}
                              </span>
                            </div>
                          </div>

                          {/* Special Instructions */}
                          {selectedInvitation.specialInstructions && (
                            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                              <div className="flex items-center space-x-2 mb-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-blue-300 font-medium">Special Instructions</span>
                              </div>
                              <p className="text-white/70 text-sm">{selectedInvitation.specialInstructions}</p>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <h4 className="text-white font-medium mb-3">Campaign Status</h4>
                          <Badge className={getStatusColor(selectedInvitation.status)}>
                            {getStatusIcon(selectedInvitation.status)}
                            <span className="ml-2 capitalize">{selectedInvitation.status}</span>
                          </Badge>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-green-400" />
                              <span className="text-white/60 text-sm">
                                Category: {selectedInvitation.targetAudience ? 
                                  (typeof selectedInvitation.targetAudience === 'string' ? 
                                    JSON.parse(selectedInvitation.targetAudience).category : 
                                    selectedInvitation.targetAudience.category) : 'General'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-cyan-400" />
                              <span className="text-white/60 text-sm">
                                Invited: {new Date(selectedInvitation.invitedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Flag className="w-4 h-4 text-yellow-400" />
                              <span className="text-white/60 text-sm">
                                Priority: {selectedInvitation.priorityLevel || 'Normal'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-white/60 text-sm">
                                Manager: #{selectedInvitation.invitedBy}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedInvitation.status === 'invited' && (
                        <div className="flex space-x-4 pt-4 border-t border-gray-800">
                          <Button
                            onClick={() => {
                              handleAcceptInvitation(selectedInvitation);
                              setIsDetailsModalOpen(false);
                            }}
                            disabled={respondMutation.isPending}
                            className="btn-premium flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept Campaign
                          </Button>
                          <Button
                            onClick={() => {
                              handleDeclineInvitation(selectedInvitation);
                              setIsDetailsModalOpen(false);
                            }}
                            disabled={respondMutation.isPending}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-red-900/20 flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline Campaign
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <TabsContent value="accepted" className="space-y-4">
                {acceptedInvitations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No accepted invitations</p>
                  </div>
                ) : (
                  acceptedInvitations.map((invitation) => (
                    <Card key={invitation.id} className="border border-white/10 bg-white/5">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-semibold text-white">
                                {invitation.title}
                              </h3>
                              <Badge className={getStatusColor(invitation.status)}>
                                {getStatusIcon(invitation.status)}
                                <span className="ml-1 capitalize">{invitation.status}</span>
                              </Badge>
                            </div>
                            <p className="text-white/80 mb-4">
                              {invitation.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  ${invitation.rewardAmount} cash
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  Accepted: {new Date(invitation.invitedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  30 min
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                // Navigate to campaign participation - id is already the campaign ID from backend transformation
                                console.log('Campaign ID:', invitation.id, 'Invitation:', invitation);
                                window.location.href = `/campaign/${invitation.id}/participate`;
                              }}
                            >
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start Campaign
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/40 bg-gray-800/50"
                                  onClick={() => setSelectedInvitation(invitation)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-white flex items-center justify-between">
                                    Campaign Details
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setSelectedInvitation(null)}
                                      className="text-white/60 hover:text-white hover:bg-white/10"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedInvitation && (
                                  <div className="space-y-6">
                                    {/* Priority and Urgency Alert */}
                                    {selectedInvitation.priorityLevel && selectedInvitation.priorityLevel !== 'normal' && (
                                      <div className={`p-4 rounded-lg border-l-4 ${
                                        selectedInvitation.priorityLevel === 'urgent' 
                                          ? 'bg-red-900/20 border-red-500' 
                                          : 'bg-yellow-900/20 border-yellow-500'
                                      }`}>
                                        <div className="flex items-center space-x-2">
                                          <AlertCircle className={`w-5 h-5 ${
                                            selectedInvitation.priorityLevel === 'urgent' ? 'text-red-400' : 'text-yellow-400'
                                          }`} />
                                          <span className={`font-medium ${
                                            selectedInvitation.priorityLevel === 'urgent' ? 'text-red-300' : 'text-yellow-300'
                                          }`}>
                                            {selectedInvitation.priorityLevel.toUpperCase()} PRIORITY
                                          </span>
                                        </div>
                                        {selectedInvitation.urgencyNotes && (
                                          <p className="text-white/70 text-sm mt-2">{selectedInvitation.urgencyNotes}</p>
                                        )}
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                          {selectedInvitation.title}
                                        </h3>
                                        <p className="text-white/70 text-sm mb-4">
                                          {selectedInvitation.description}
                                        </p>
                                        
                                        {/* Campaign Details */}
                                        <div className="space-y-3">
                                          <div className="flex items-center space-x-2">
                                            <DollarSign className="w-4 h-4 text-green-400" />
                                            <span className="text-white/80">
                                              Reward: ${selectedInvitation.rewardAmount} {selectedInvitation.rewardType}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-blue-400" />
                                            <span className="text-white/80">
                                              Estimated Duration: {selectedInvitation.estimatedDuration || 30} minutes
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4 text-purple-400" />
                                            <span className="text-white/80">
                                              Participants Needed: {selectedInvitation.participantCount || 10}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Shield className="w-4 h-4 text-indigo-400" />
                                            <span className="text-white/80">
                                              Client: {selectedInvitation.clientName || 'Anonymous Client'}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Special Instructions */}
                                        {selectedInvitation.specialInstructions && (
                                          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                                            <div className="flex items-center space-x-2 mb-2">
                                              <FileText className="w-4 h-4 text-blue-400" />
                                              <span className="text-blue-300 font-medium">Special Instructions</span>
                                            </div>
                                            <p className="text-white/70 text-sm">{selectedInvitation.specialInstructions}</p>
                                          </div>
                                        )}
                                      </div>

                                      <div className="bg-gray-800/50 p-4 rounded-lg">
                                        <h4 className="text-white font-medium mb-3">Campaign Status</h4>
                                        <Badge className={getStatusColor(selectedInvitation.status)}>
                                          {getStatusIcon(selectedInvitation.status)}
                                          <span className="ml-2 capitalize">{selectedInvitation.status}</span>
                                        </Badge>
                                        
                                        <div className="mt-4 space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Target className="w-4 h-4 text-green-400" />
                                            <span className="text-white/60 text-sm">
                                              Category: {selectedInvitation.targetAudience ? 
                                                (typeof selectedInvitation.targetAudience === 'string' ? 
                                                  JSON.parse(selectedInvitation.targetAudience).category : 
                                                  selectedInvitation.targetAudience.category) : 'General'}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-cyan-400" />
                                            <span className="text-white/60 text-sm">
                                              Accepted: {formatDateTime(selectedInvitation.invitedAt)}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Flag className="w-4 h-4 text-yellow-400" />
                                            <span className="text-white/60 text-sm">
                                              Priority: {selectedInvitation.priorityLevel || 'Normal'}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4 text-purple-400" />
                                            <span className="text-white/60 text-sm">
                                              Manager: #{selectedInvitation.invitedBy}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons for Accepted Campaigns */}
                                    {selectedInvitation.status === 'accepted' && (
                                      <div className="flex space-x-4 pt-4 border-t border-gray-800">
                                        <Button
                                          onClick={() => {
                                            // id is already the campaign ID from backend transformation
                                            console.log('Modal Campaign ID:', selectedInvitation.id, 'Selected Invitation:', selectedInvitation);
                                            window.location.href = `/campaign/${selectedInvitation.id}/participate`;
                                          }}
                                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                        >
                                          <PlayCircle className="w-4 h-4 mr-2" />
                                          Start Campaign
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="declined" className="space-y-4">
                {declinedInvitations.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No declined invitations</p>
                  </div>
                ) : (
                  declinedInvitations.map((invitation) => (
                    <Card key={invitation.id} className="border border-white/10 bg-white/5">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-semibold text-white">
                                {invitation.title}
                              </h3>
                              <Badge className={getStatusColor(invitation.status)}>
                                {getStatusIcon(invitation.status)}
                                <span className="ml-1 capitalize">{invitation.status}</span>
                              </Badge>
                            </div>
                            <p className="text-white/80 mb-4">
                              {invitation.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  Declined: {formatDate(invitation.invitedAt)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  Would have earned: ${invitation.rewardAmount} cash
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Completed Campaigns Tab */}
              <TabsContent value="completed" className="space-y-4">
                {completedInvitations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No completed campaigns yet</p>
                  </div>
                ) : (
                  completedInvitations.map((invitation) => (
                    <Card key={invitation.id} className="card-glass border-green-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-white">{invitation.title}</h3>
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                              {invitation.priorityLevel && invitation.priorityLevel !== 'normal' && (
                                <Badge className={
                                  invitation.priorityLevel === 'urgent' 
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                }>
                                  <Flag className="w-3 h-3 mr-1" />
                                  {invitation.priorityLevel.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/70 text-sm mb-4">
                              {invitation.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  ${invitation.rewardAmount} {invitation.rewardType}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  Completed: {invitation.respondedAt ? formatDate(invitation.respondedAt) : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  {invitation.estimatedDuration || 30} min
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-white/60" />
                                <span className="text-white/70 text-sm">
                                  Rating: {invitation.rating || 'N/A'}/5
                                </span>
                              </div>
                            </div>
                            {invitation.feedback && (
                              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                                <p className="text-white/60 text-sm font-medium mb-1">Your Feedback:</p>
                                <p className="text-white/70 text-sm">{invitation.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Detail Dialogs */}
      <Dialog open={showEarningsDetails} onOpenChange={setShowEarningsDetails}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Earnings Details
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowEarningsDetails(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-4">Earnings Breakdown</h4>
              <div className="space-y-3">
                {enhancedStats.monthlyEarnings?.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-white/80">{month.month}</span>
                    <span className="text-green-400 font-bold">${month.earnings}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Statistics</h4>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Total Earnings</span>
                    <span className="text-green-400 font-bold">${enhancedStats.totalEarnings}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Average Monthly</span>
                    <span className="text-blue-400 font-bold">
                      ${enhancedStats.monthlyEarnings?.length > 0 ? 
                        (enhancedStats.totalEarnings / enhancedStats.monthlyEarnings.length).toFixed(2) : 
                        '0.00'
                      }
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Best Month</span>
                    <span className="text-purple-400 font-bold">
                      ${Math.max(...(enhancedStats.monthlyEarnings?.map(m => m.earnings) || [0]))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoriesDetails} onOpenChange={setShowCategoriesDetails}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Campaign Categories Details
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCategoriesDetails(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-4">Category Breakdown</h4>
              <div className="space-y-3">
                {enhancedStats.campaignsByCategory?.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-white/80">{category.category}</span>
                    </div>
                    <span className="text-white/60">{category.count} campaigns</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Performance by Category</h4>
              <div className="space-y-4">
                {enhancedStats.campaignsByCategory?.map((category, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">{category.category}</span>
                      <span className="text-green-400 font-bold">{category.value} earnings</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${(category.count / Math.max(...(enhancedStats.campaignsByCategory?.map(c => c.count) || [1]))) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              Activity Details
              <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="text-white font-semibold mb-2">{selectedActivity.title}</h4>
                <p className="text-white/70 text-sm mb-3">
                  {formatDateTime(selectedActivity.timestamp)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Type: {selectedActivity.type}</span>
                  {selectedActivity.amount && (
                    <span className="text-green-400 font-bold">+${selectedActivity.amount}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              Achievement Details
              <Button variant="ghost" size="sm" onClick={() => setSelectedAchievement(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                <div className="text-4xl mb-3">{selectedAchievement.icon}</div>
                <h4 className="text-white font-semibold mb-2">{selectedAchievement.title}</h4>
                <p className="text-white/70 text-sm mb-3">{selectedAchievement.description}</p>
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Earned {formatDate(selectedAchievement.earnedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}