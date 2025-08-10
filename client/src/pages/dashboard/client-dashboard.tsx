import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Eye, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Mail,
  Bell,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  Download,
  Share2,
  Edit,
  Trash2,
  FileText,
  Video,
  Image,
  PieChart,
  LineChart,
  Globe,
  Sparkles,
  Brain,
  Heart,
  ThumbsUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Award,
  Package
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';

interface DashboardData {
  totalCampaigns: number;
  activeCampaigns: number;
  totalParticipants: number;
  totalSpent: number;
  averageRating: number;
  responseRate: number;
  recentCampaigns: any[];
  engagementMetrics: any[];
  notifications: any[];
  quickStats: any;
  upcomingDeadlines: any[];
  budgetAnalysis: any;
  performanceMetrics: any;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  status: string;
  participantCount: number;
  responseRate: number;
  completionRate: number;
  budget: number;
  spent: number;
  createdAt: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
}

export default function ClientDashboard() {
  const [, navigate] = useLocation();
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/client", selectedTimeRange],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/dashboard/client?timeRange=${selectedTimeRange}`);
      return response.json() as DashboardData;
    },
  });

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/campaigns");
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
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
                <BarChart3 className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  Client Dashboard
                </h1>
                <p className="text-white/70">
                  Manage your campaigns and track performance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="glass-effect">
                <Bell className="w-4 h-4 mr-2" />
                {dashboardData?.notifications?.length || 0}
              </Button>
              <Link href="/campaigns/create">
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Campaigns</p>
                  <p className="text-2xl font-bold text-white">{dashboardData?.totalCampaigns || 0}</p>
                </div>
                <Target className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+12% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Active Campaigns</p>
                  <p className="text-2xl font-bold text-white">{dashboardData?.activeCampaigns || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+8% this week</span>
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
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+25% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Average Rating</p>
                  <p className="text-2xl font-bold text-white">{dashboardData?.averageRating || 0}/5</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (dashboardData?.averageRating || 0) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 glass-effect mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Metrics */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData?.engagementMetrics || []}>
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
                      <Area
                        type="monotone"
                        dataKey="engagement"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

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
                    {dashboardData?.notifications?.slice(0, 5).map((notification: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(notification.type)}`} />
                        <div className="flex-1">
                          <p className="text-white text-sm">{notification.message}</p>
                          <p className="text-white/60 text-xs">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Deadlines */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData?.upcomingDeadlines?.map((deadline: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {deadline.type}
                        </Badge>
                        <span className={`text-xs ${getPriorityColor(deadline.priority)}`}>
                          {deadline.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">{deadline.title}</h3>
                      <p className="text-white/70 text-sm">{deadline.description}</p>
                      <div className="flex items-center mt-2">
                        <Clock className="w-4 h-4 text-white/60 mr-1" />
                        <span className="text-white/60 text-xs">{deadline.timeLeft}</span>
                      </div>
                    </div>
                  ))}
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
              <Link href="/campaigns/create">
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {campaigns.map((campaign: Campaign) => (
                <Card key={campaign.id} className="card-glass">
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
                          <span className={`text-sm font-medium ${getPriorityColor(campaign.priority)}`}>
                            {campaign.priority} priority
                          </span>
                        </div>
                        <p className="text-white/70 mb-4">{campaign.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-white/60 text-sm">Participants</p>
                            <p className="text-white font-semibold">{campaign.participantCount}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Response Rate</p>
                            <p className="text-white font-semibold">{campaign.responseRate}%</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Budget</p>
                            <p className="text-white font-semibold">${campaign.budget}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Spent</p>
                            <p className="text-white font-semibold">${campaign.spent}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {campaign.tags?.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-white/60" />
                            <span className="text-white/60 text-sm">
                              Created {new Date(campaign.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-white/60" />
                            <span className="text-white/60 text-sm">
                              Deadline {new Date(campaign.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" className="btn-premium">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="glass-effect">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="glass-effect">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Reports
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Campaign Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData?.performanceMetrics || []}>
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
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Budget Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Total Budget</span>
                      <span className="text-white font-semibold">${dashboardData?.budgetAnalysis?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Spent</span>
                      <span className="text-white font-semibold">${dashboardData?.budgetAnalysis?.spent || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Remaining</span>
                      <span className="text-green-500 font-semibold">${dashboardData?.budgetAnalysis?.remaining || 0}</span>
                    </div>
                    <Progress 
                      value={((dashboardData?.budgetAnalysis?.spent || 0) / (dashboardData?.budgetAnalysis?.total || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LineChart className="w-5 h-5 mr-2" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart data={dashboardData?.engagementMetrics || []}>
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
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Message Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.notifications?.map((notification: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-white/5">
                      <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(notification.type)}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{notification.title}</h4>
                          <span className="text-white/60 text-sm">{notification.time}</span>
                        </div>
                        <p className="text-white/70 text-sm">{notification.message}</p>
                        {notification.actions && (
                          <div className="flex space-x-2 mt-3">
                            {notification.actions.map((action: any, actionIndex: number) => (
                              <Button key={actionIndex} size="sm" className="btn-premium">
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Dashboard Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-white/60 text-sm">Receive updates about your campaigns</p>
                    </div>
                    <Button variant="outline" className="glass-effect">
                      Configure
                    </Button>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Data Export</p>
                      <p className="text-white/60 text-sm">Export your campaign data</p>
                    </div>
                    <Button variant="outline" className="glass-effect">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">API Access</p>
                      <p className="text-white/60 text-sm">Manage your API keys</p>
                    </div>
                    <Button variant="outline" className="glass-effect">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}