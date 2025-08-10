import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { NavigationHeader } from "@/components/navigation-header";
import { AdminEmailControl } from "@/components/admin-email-control";
import { AdminMenuControl } from "@/components/admin-menu-control";
import { EmailTemplateEditor } from "@/components/email-template-editor";
import { HomePageEditor } from "@/components/homepage-content-editor";
import { LegalDocumentsEditor } from "@/components/legal-documents-editor";
import { AdminVerificationReview } from "@/components/admin-verification-review";
import { EnhancedHealthCheck } from "@/components/enhanced-health-check";
import { AdminFeeManagement } from "@/components/admin-fee-management";
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  Globe, 
  Database, 
  CreditCard,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  Target,
  Brain,
  Zap,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Clock,
  Heart,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Save,
  PieChart,
  LineChart,
  AreaChart,
  Package,
  Award,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Image,
  Video,
  Headphones,
  MonitorPlay,
  Cpu,
  Memory,
  HardDrive,
  Network,
  ClipboardList,
  Server,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  UserPlus,
  Crown,
  Building,
  Info,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Wifi,
  WifiOff,
  Power,
  PowerOff,
  Cookie,
  Home
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart as RechartsAreaChart, Area, Pie } from 'recharts';

interface AdminDashboardData {
  systemMetrics: {
    totalUsers: number;
    activeUsers: number;
    totalCampaigns: number;
    activeCampaigns: number;
    serverLoad: number;
    memoryUsage: number;
    storageUsage: number;
    responseTime: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    averageOrderValue: number;
    revenueGrowth: number;
  };
  userAnalytics: {
    newUsers: number;
    activeUsers: number;
    churnRate: number;
    userGrowth: number;
    userDistribution: any[];
  };
  platformHealth: {
    uptime: number;
    errorRate: number;
    avgResponseTime: number;
    successRate: number;
  };
  featureUsage: any[];
  recentActivity: any[];
  securityAlerts: any[];
  systemAlerts: any[];
  pricing: any[];
  integrations: any[];
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUserData, setNewUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "participant" as const,
    password: ""
  });
  
  // Questionnaire management state
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [fixingQuestionnaires, setFixingQuestionnaires] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/admin"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/dashboard/admin");
      return response.json() as AdminDashboardData;
    },
  });

  const { data: waitlistData, isLoading: waitlistLoading } = useQuery({
    queryKey: ["/api/admin/invitation/waitlist"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/invitation/waitlist");
      return response.json();
    },
  });

  const { data: invitationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/invitation/status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/invitation/status");
      return response.json();
    },
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/campaigns");
      return response.json();
    },
  });

  // Questionnaire queries
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/questionnaire/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/questionnaire/categories");
      return response.json();
    },
  });

  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: ["/api/questionnaire/questions", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const response = await apiRequest("GET", `/api/questionnaire/questions/${selectedCategory}`);
      return response.json();
    },
    enabled: !!selectedCategory,
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async (data: { feature: string; enabled: boolean }) => {
      const response = await apiRequest("POST", "/api/admin/toggle-feature", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/admin"] });
      toast({ title: "Feature toggled successfully" });
    },
    onError: (error) => {
      toast({ title: "Error toggling feature", description: error.message, variant: "destructive" });
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/update-pricing", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/admin"] });
      toast({ title: "Pricing updated successfully" });
      setShowPricingDialog(false);
    },
    onError: (error) => {
      toast({ title: "Error updating pricing", description: error.message, variant: "destructive" });
    },
  });

  const toggleInvitationMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await apiRequest("PUT", "/api/admin/invitation/toggle", { enabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitation/status"] });
      toast({ title: "Invitation mode updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating invitation mode", description: error.message, variant: "destructive" });
    },
  });

  const updateWaitlistMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/invitation/waitlist/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitation/waitlist"] });
      toast({ title: "Waitlist status updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating waitlist status", description: error.message, variant: "destructive" });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/admin"] });
      setIsCreatingUser(false);
      setNewUserData({
        email: "",
        firstName: "",
        lastName: "",
        role: "participant",
        password: ""
      });
      toast({
        title: "User created successfully",
        description: "The new user has been added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating user",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${data.userId}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/admin"] });
      setEditingUser(null);
      toast({
        title: "User updated successfully",
        description: "The user has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating user",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/admin"] });
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting user",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search and role
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    toggleFeatureMutation.mutate({ feature, enabled });
  };

  const handleCreateUser = () => {
    if (!newUserData.email || !newUserData.firstName || !newUserData.lastName || !newUserData.password) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUserData);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const updates = {
      email: editingUser.email,
      firstName: editingUser.firstName,
      lastName: editingUser.lastName,
      role: editingUser.role,
      isActive: editingUser.isActive
    };
    
    updateUserMutation.mutate({ userId: editingUser.id, updates });
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Questionnaire management mutations
  const updateQuestionMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/admin/questionnaire/questions/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/questions"] });
      setEditingQuestion(null);
      setShowQuestionDialog(false);
      toast({ title: "Question updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating question", description: error.message, variant: "destructive" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/questionnaire/questions/${questionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/questions"] });
      toast({ title: "Question deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting question", description: error.message, variant: "destructive" });
    },
  });

  // Questionnaire fix mutation
  const fixQuestionnairesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/fix-questionnaire-tracking");
      return response.json();
    },
    onSuccess: (data) => {
      setFixingQuestionnaires(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ 
        title: "Questionnaire data fixed!", 
        description: `${data.properlyCompleted} of ${data.updatedUsers} participants actually completed questionnaires`,
      });
    },
    onError: (error) => {
      setFixingQuestionnaires(false);
      toast({ 
        title: "Error fixing questionnaire data", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Questionnaire management functions
  const handleFixQuestionnaires = () => {
    if (confirm("This will recalculate questionnaire completion for all participants. Are you sure?")) {
      setFixingQuestionnaires(true);
      fixQuestionnairesMutation.mutate();
    }
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Navigation items for the sidebar
  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3, description: "System overview & analytics" },
    { id: "users", label: "Users", icon: Users, description: "User management & roles" },
    { id: "verification", label: "Verification", icon: Shield, description: "Document & identity verification" },
    { id: "campaigns", label: "Campaigns", icon: Target, description: "Campaign monitoring" },
    { id: "questionnaire", label: "Questionnaire", icon: ClipboardList, description: "Manage questions & categories" },
    { id: "fees", label: "Fees", icon: DollarSign, description: "Fee structure management" },
    { id: "invitations", label: "Invitations", icon: Mail, description: "Invitation system" },
    { id: "templates", label: "Templates", icon: FileText, description: "Email templates" },
    { id: "homepage", label: "Homepage", icon: Home, description: "Content management" },
    { id: "legal", label: "Legal", icon: FileText, description: "Legal documents" },
    { id: "menu", label: "Menu", icon: Settings, description: "Navigation control" },
    { id: "system", label: "System", icon: Database, description: "System settings" },
    { id: "cookies", label: "Cookies", icon: Cookie, description: "Cookie consent" },
    { id: "health", label: "Health", icon: Activity, description: "System health" },
    { id: "settings", label: "Settings", icon: Settings, description: "Admin settings" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <NavigationHeader />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-white/5 backdrop-blur-md border-r border-white/10 min-h-screen pt-8">
          <div className="px-6 mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Control</h1>
            <p className="text-white/60 text-sm">Platform management center</p>
          </div>
          
          <nav className="px-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-white/70 hover:bg-white/10 hover:text-white hover:transform hover:scale-102'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${
                  activeTab === item.id ? 'text-white' : 'text-white/60 group-hover:text-white'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.label}</p>
                  <p className="text-xs opacity-75 truncate">{item.description}</p>
                </div>
                {activeTab === item.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
          
          {/* Quick Stats in Sidebar */}
          <div className="px-6 mt-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Total Users</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{dashboardData?.totalUsers || 0}</span>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Active Campaigns</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{dashboardData?.totalCampaigns || 0}</span>
                    <Target className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">System Health</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold text-sm">Healthy</span>
                    <Heart className="h-4 w-4 text-green-400" />
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Uptime</span>
                    <span className="text-white font-bold text-sm">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="text-white w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome Back, Admin
                  </h1>
                  <p className="text-white/70 text-lg">
                    Complete platform oversight and management control
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="glass-effect text-white border-white/20 hover:bg-white/10">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">System Overview</h2>
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white/60 text-sm font-medium">Platform Health</p>
                        <p className="text-3xl font-bold text-white mt-1">99.9%</p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Activity className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={99.9} className="h-2" />
                      <p className="text-green-400 text-xs font-medium">System running smoothly</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white/60 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-white mt-1">{dashboardData?.totalUsers || 0}</p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 text-sm font-medium">+15%</span>
                      </div>
                      <span className="text-white/40 text-xs">vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white/60 text-sm font-medium">Active Campaigns</p>
                        <p className="text-3xl font-bold text-white mt-1">{dashboardData?.totalCampaigns || 0}</p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Target className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 text-sm font-medium">+8%</span>
                      </div>
                      <span className="text-white/40 text-xs">vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white/60 text-sm font-medium">System Uptime</p>
                        <p className="text-3xl font-bold text-white mt-1">99.9%</p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Server className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 text-sm font-medium">All systems operational</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsCreatingUser(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                  <Link href="/admin/user-management">
                    <div 
                      style={{ 
                        backgroundColor: '#9900ff !important', 
                        color: '#ffffff !important', 
                        border: '2px solid #9900ff !important',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap',
                        borderRadius: '6px',
                        fontSize: '14px',
                        height: '40px',
                        padding: '0 16px',
                        cursor: 'pointer'
                      }}
                    >
                      👥
                      Advanced Management
                    </div>
                  </Link>
                </div>
              </div>

              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Total Users</p>
                        <p className="text-2xl font-bold text-white">{users.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Active Users</p>
                        <p className="text-2xl font-bold text-white">{users.filter((u: any) => u.isActive).length}</p>
                      </div>
                      <UserCheck className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Clients</p>
                        <p className="text-2xl font-bold text-white">{users.filter((u: any) => u.role === 'client').length}</p>
                      </div>
                      <Building className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Participants</p>
                        <p className="text-2xl font-bold text-white">{users.filter((u: any) => u.role === 'participant').length}</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Filters */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                      </div>
                    </div>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="participant">Participant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/60 py-3 px-4">User</th>
                          <th className="text-left text-white/60 py-3 px-4">Role</th>
                          <th className="text-left text-white/60 py-3 px-4">Status</th>
                          <th className="text-left text-white/60 py-3 px-4">Joined</th>
                          <th className="text-left text-white/60 py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.slice(0, 10).map((user: any) => (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {user.firstName?.charAt(0) || user.email.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                                  <p className="text-white/60 text-sm">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {user.isActive ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                <span className="text-white/70 text-sm">
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-white/70 text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="cursor-pointer"
                                  style={{ 
                                    backgroundColor: '#ff6600 !important', 
                                    color: '#ffffff !important', 
                                    border: '2px solid #ff6600 !important',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    whiteSpace: 'nowrap',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    height: '36px',
                                    padding: '0 12px',
                                    minWidth: '36px'
                                  }}
                                  onClick={() => handleEditUser(user)}
                                >
                                  ✏️
                                </div>
                                <div
                                  className="cursor-pointer"
                                  style={{ 
                                    backgroundColor: '#00cc00 !important', 
                                    color: '#ffffff !important', 
                                    border: '2px solid #00cc00 !important',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    whiteSpace: 'nowrap',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    height: '36px',
                                    padding: '0 12px',
                                    minWidth: '36px'
                                  }}
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  🗑️
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredUsers.length > 10 && (
                    <div className="mt-4 text-center">
                      <Link href="/admin/user-management">
                        <div 
                          style={{ 
                            backgroundColor: '#ff6600 !important', 
                            color: '#ffffff !important', 
                            border: '2px solid #ff6600 !important',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            borderRadius: '6px',
                            fontSize: '14px',
                            height: '40px',
                            padding: '0 16px',
                            cursor: 'pointer'
                          }}
                        >
                          View All Users ({filteredUsers.length})
                        </div>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "questionnaire" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white mb-4">Questionnaire Management</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handleFixQuestionnaires}
                    disabled={fixingQuestionnaires}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {fixingQuestionnaires ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Fix Questionnaire Data
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowCategoryDialog(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                  <Button
                    onClick={() => setShowQuestionDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                    disabled={!selectedCategory}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              {/* Questionnaire Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Total Categories</p>
                        <p className="text-2xl font-bold text-white">{categories?.length || 0}</p>
                      </div>
                      <ClipboardList className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Total Questions</p>
                        <p className="text-2xl font-bold text-white">{questions?.length || 0}</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Required Questions</p>
                        <p className="text-2xl font-bold text-white">{questions?.filter((q: any) => q.isRequired).length || 0}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Active Questions</p>
                        <p className="text-2xl font-bold text-white">{questions?.filter((q: any) => q.isEnabled).length || 0}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Questionnaire Management Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categories Panel */}
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Categories ({categories?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingCategories && (
                      <div className="text-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto" />
                        <p className="text-white/60 text-sm mt-2">Loading categories...</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {!loadingCategories && categories?.map((category: any) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            selectedCategory === category.id
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-white/5 text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm opacity-75">{category.description}</p>
                            </div>
                            <Badge variant="secondary">
                              {questions?.filter((q: any) => q.categoryId === category.id).length || 0}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Questions Panel */}
                <Card className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {selectedCategory ? `Questions for ${categories?.find((c: any) => c.id === selectedCategory)?.name}` : 'Select a category'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCategory ? (
                      <div className="space-y-4">
                        {loadingQuestions && (
                          <div className="text-center py-4">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                            <p className="text-white/60 text-sm mt-2">Loading questions...</p>
                          </div>
                        )}
                        {!loadingQuestions && questions?.length > 0 && questions.map((question: any) => (
                          <div
                            key={question.id}
                            className="p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-white font-medium">{question.question}</h4>
                                  <Badge variant={question.isRequired ? "destructive" : "secondary"}>
                                    {question.isRequired ? "Required" : "Optional"}
                                  </Badge>
                                  <Badge variant={question.isEnabled ? "default" : "outline"}>
                                    {question.isEnabled ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <p className="text-white/60 text-sm mb-2">Type: {question.questionType}</p>
                                {question.options && (
                                  <div className="text-white/60 text-sm">
                                    Options: {JSON.stringify(question.options)}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingQuestion(question);
                                    setShowQuestionDialog(true);
                                  }}
                                  className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10 hover:text-blue-300"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-300"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {!loadingQuestions && questions?.length === 0 && (
                          <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
                            <p className="text-white/60">No questions found in this category</p>
                            <p className="text-white/40 text-sm">Click "Add Question" to create your first question</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClipboardList className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">Select a category to view questions</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "campaigns" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white mb-4">Campaign Management</h2>
                <Button
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>

              {/* Campaign Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Total Campaigns</p>
                        <p className="text-2xl font-bold text-white">{campaigns.length}</p>
                      </div>
                      <Target className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Active Campaigns</p>
                        <p className="text-2xl font-bold text-white">{campaigns.filter((c: any) => c.status === 'active').length}</p>
                      </div>
                      <PlayCircle className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Completed</p>
                        <p className="text-2xl font-bold text-white">{campaigns.filter((c: any) => c.status === 'completed').length}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Draft Campaigns</p>
                        <p className="text-2xl font-bold text-white">{campaigns.filter((c: any) => c.status === 'draft').length}</p>
                      </div>
                      <Edit className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Campaigns List */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">No campaigns found</p>
                      <p className="text-white/40 text-sm">Create your first campaign to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.slice(0, 5).map((campaign: any) => (
                        <div key={campaign.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{campaign.title}</p>
                              <p className="text-white/60 text-sm">{campaign.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                            <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "invitations" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Invitation Management</h2>
              
              {/* Invitation Mode Toggle */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">Invitation-Only Mode</h3>
                      <p className="text-white/60 text-sm">Control access to the platform</p>
                    </div>
                    <Switch
                      checked={invitationStatus?.invitationOnly || false}
                      onCheckedChange={(checked) => toggleInvitationMutation.mutate(checked)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-white/60 text-sm">Pending Invitations</p>
                        <p className="text-2xl font-bold text-white">{waitlistData?.filter((w: any) => w.status === 'pending').length || 0}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-white/60 text-sm">Approved</p>
                        <p className="text-2xl font-bold text-white">{waitlistData?.filter((w: any) => w.status === 'approved').length || 0}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-white/60 text-sm">Rejected</p>
                        <p className="text-2xl font-bold text-white">{waitlistData?.filter((w: any) => w.status === 'rejected').length || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Waitlist Management */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Waitlist Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {waitlistData?.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">No waitlist entries found</p>
                      <p className="text-white/40 text-sm">Waitlist entries will appear here when users request access</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {waitlistData?.map((entry: any) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-medium">{entry.firstName?.charAt(0) || 'U'}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{entry.firstName} {entry.lastName}</p>
                              <p className="text-white/60 text-sm">{entry.email}</p>
                              {entry.phoneNumber && (
                                <p className="text-white/40 text-xs">{entry.phoneNumber}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              entry.status === 'pending' ? 'secondary' :
                              entry.status === 'approved' ? 'default' : 'destructive'
                            }>
                              {entry.status}
                            </Badge>
                            {entry.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => updateWaitlistMutation.mutate({ id: entry.id, status: 'approved' })}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                                  onClick={() => updateWaitlistMutation.mutate({ id: entry.id, status: 'rejected' })}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="space-y-6">
              <AdminVerificationReview />
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6">
              <EmailTemplateEditor />
            </div>
          )}

          {activeTab === "homepage" && (
            <div className="space-y-6">
              <HomePageEditor />
            </div>
          )}

          {activeTab === "legal" && (
            <div className="space-y-6">
              <LegalDocumentsEditor />
            </div>
          )}

          {activeTab === "menu" && (
            <div className="space-y-6">
              <AdminMenuControl />
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <AdminEmailControl />
            </div>
          )}

          {activeTab === "cookies" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Cookie Settings</h2>
              
              {/* Cookie Consent Settings */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Cookie Consent Banner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Enable Cookie Consent</h3>
                      <p className="text-white/60 text-sm">Show cookie consent banner to users</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-white">Banner Title</Label>
                    <Input 
                      defaultValue="We use cookies"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-white">Banner Message</Label>
                    <Textarea 
                      defaultValue="We use cookies to enhance your experience, analyze site traffic, and personalize content. By clicking 'Accept All', you consent to our use of cookies."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Banner
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Cookie Categories */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Cookie Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Essential Cookies</h4>
                        <p className="text-white/60 text-sm">Required for basic site functionality</p>
                      </div>
                      <Switch defaultChecked disabled />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Analytics Cookies</h4>
                        <p className="text-white/60 text-sm">Help us understand how users interact with our site</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Marketing Cookies</h4>
                        <p className="text-white/60 text-sm">Used to track visitors across websites</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Functional Cookies</h4>
                        <p className="text-white/60 text-sm">Enable enhanced functionality and personalization</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "fees" && (
            <div className="space-y-6">
              <AdminFeeManagement />
            </div>
          )}

          {activeTab === "health" && (
            <div className="space-y-6">
              <EnhancedHealthCheck />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Platform Settings</h2>
              
              {/* General Settings */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Platform Name</Label>
                      <Input 
                        defaultValue="FokusHub360"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Support Email</Label>
                      <Input 
                        defaultValue="support@fokushub360.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Platform Description</Label>
                    <Textarea 
                      defaultValue="Premium virtual focus group platform for modern market research"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* User Settings */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">User Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Email Verification Required</h3>
                      <p className="text-white/60 text-sm">Require users to verify their email address</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Auto-approve Participants</h3>
                      <p className="text-white/60 text-sm">Automatically approve new participant accounts</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Session Timeout (minutes)</Label>
                      <Input 
                        type="number"
                        defaultValue="60"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Max Login Attempts</Label>
                      <Input 
                        type="number"
                        defaultValue="5"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Minimum Age Requirement (years)</Label>
                      <Input 
                        type="number"
                        defaultValue="18"
                        min="13"
                        max="21"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Account Verification Required</Label>
                      <Select defaultValue="optional">
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="optional">Optional</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Settings */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Campaign Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Default Campaign Duration (hours)</Label>
                      <Input 
                        type="number"
                        defaultValue="48"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Minimum Participants</Label>
                      <Input 
                        type="number"
                        defaultValue="5"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Auto-match Participants</h3>
                      <p className="text-white/60 text-sm">Use AI to automatically match participants to campaigns</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Save Settings */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                <CardContent className="p-6">
                  <div className="flex gap-2">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save All Settings
                    </Button>
                    <Button className="bg-gray-600 text-white border-gray-500 hover:bg-gray-700 hover:text-white !bg-gray-600 !text-white !border-gray-500" style={{ backgroundColor: '#4b5563', color: '#ffffff', borderColor: '#6b7280' }}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Create User Dialog */}
      <Dialog open={isCreatingUser} onOpenChange={setIsCreatingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUserData.firstName}
                  onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUserData.lastName}
                  onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUserData.role} onValueChange={(value) => setNewUserData({ ...newUserData, role: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setIsCreatingUser(false)} className="bg-gray-600 text-white border-gray-500 hover:bg-gray-700 hover:text-white !bg-gray-600 !text-white !border-gray-500" style={{ backgroundColor: '#4b5563', color: '#ffffff', borderColor: '#6b7280' }}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editingUser.firstName || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editingUser.lastName || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="participant">Participant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive" 
                  checked={editingUser.isActive} 
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, isActive: checked })} 
                />
                <Label htmlFor="isActive">User is active</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={() => setEditingUser(null)} 
                  className="bg-gray-600 text-white border-gray-500 hover:bg-gray-700" 
                  style={{ backgroundColor: '#4b5563', color: '#ffffff', borderColor: '#6b7280' }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question Text</Label>
              <Input
                id="question"
                defaultValue={editingQuestion?.question || ""}
                placeholder="Enter question text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionType">Question Type</Label>
                <Select defaultValue={editingQuestion?.questionType || "text"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="multiselect">Multi-select</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={editingQuestion?.categoryId?.toString() || selectedCategory?.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="options">Options (JSON format for select/multiselect)</Label>
              <Textarea
                id="options"
                defaultValue={editingQuestion?.options ? JSON.stringify(editingQuestion.options) : ""}
                placeholder='["Option 1", "Option 2", "Option 3"]'
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="isRequired" defaultChecked={editingQuestion?.isRequired || false} />
                <Label htmlFor="isRequired">Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isEnabled" defaultChecked={editingQuestion?.isEnabled !== false} />
                <Label htmlFor="isEnabled">Enabled</Label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => {
                setShowQuestionDialog(false);
                setEditingQuestion(null);
              }} className="bg-gray-600 text-white border-gray-500 hover:bg-gray-700 hover:text-white !bg-gray-600 !text-white !border-gray-500" style={{ backgroundColor: '#4b5563', color: '#ffffff', borderColor: '#6b7280' }}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle save logic here
                toast({ title: "Question saved successfully" });
                setShowQuestionDialog(false);
                setEditingQuestion(null);
              }}>
                {editingQuestion ? "Update Question" : "Create Question"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
