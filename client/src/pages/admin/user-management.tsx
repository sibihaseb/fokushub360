import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { NavigationHeader } from "@/components/navigation-header";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Crown,
  UserCheck,
  UserX,
  Activity,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Heart,
  Settings,
  Lock,
  Unlock,
  ArrowLeft
} from "lucide-react";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  isVerified: boolean;
  verificationStatus: string;
  warningCount: number;
  maxWarnings: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function UserManagement() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "client"
  });
  const [editForm, setEditForm] = useState<Partial<User>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: (newUser) => {
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
      setIsCreateModalOpen(false);
      setCreateForm({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "client"
      });
      // Invalidate and refetch the users query
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number, userData: Partial<User> }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}`, userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setEditForm({});
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation with comprehensive debugging
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log('🚀 MUTATION STARTING: Delete user', userId);
      
      try {
        const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
        console.log('📡 RAW RESPONSE:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        });

        const responseText = await response.text();
        console.log('📄 RESPONSE TEXT:', responseText);

        if (!response.ok) {
          const errorData = responseText ? JSON.parse(responseText) : { message: `HTTP ${response.status}` };
          console.error('❌ API ERROR:', errorData);
          throw new Error(errorData.message || `Delete failed with status ${response.status}`);
        }

        const result = responseText ? JSON.parse(responseText) : { success: true };
        console.log('✅ DELETE SUCCESS:', result);
        return result;
      } catch (error) {
        console.error('💥 MUTATION ERROR:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 MUTATION SUCCESS:', data);
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      refetch();
    },
    onError: (error: any) => {
      console.error('🚨 MUTATION ERROR HANDLER:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  });

  // Ban/Unban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, banned, reason }: { userId: number, banned: boolean, reason?: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/ban`, { banned, reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Status Updated",
        description: "User ban status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user ban status.",
        variant: "destructive",
      });
    }
  });

  // Filter users based on search and role
  const filteredUsers = React.useMemo(() => {
    if (isLoading || !users || !Array.isArray(users)) return [];
    
    return users.filter(user => {
      const matchesSearch = searchTerm === "" || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      
      let matchesTab = true;
      if (activeTab === "active") matchesTab = user.isActive && !user.isBanned;
      if (activeTab === "banned") matchesTab = user.isBanned;
      if (activeTab === "unverified") matchesTab = !user.isVerified;
      
      return matchesSearch && matchesRole && matchesTab;
    });
  }, [users, isLoading, searchTerm, selectedRole, activeTab]);

  // Get user statistics
  const stats = React.useMemo(() => {
    if (isLoading || !users || !Array.isArray(users)) {
      return {
        total: 0,
        active: 0,
        banned: 0,
        unverified: 0,
        clients: 0,
        participants: 0,
        managers: 0,
        admins: 0
      };
    }
    
    return {
      total: users.length,
      active: users.filter(u => u.isActive && !u.isBanned).length,
      banned: users.filter(u => u.isBanned).length,
      unverified: users.filter(u => !u.isVerified).length,
      clients: users.filter(u => u.role === "client").length,
      participants: users.filter(u => u.role === "participant").length,
      managers: users.filter(u => u.role === "manager").length,
      admins: users.filter(u => u.role === "admin").length
    };
  }, [users, isLoading]);

  const handleCreateUser = () => {
    createUserMutation.mutate(createForm);
  };

  const handleUpdateUser = () => {
    if (selectedUser) {
      updateUserMutation.mutate({ 
        userId: selectedUser.id, 
        userData: editForm 
      });
    }
  };

  const handleDeleteUser = (userId: number) => {
    console.log('🗑️ DELETE USER INITIATED:', { userId, timestamp: new Date().toISOString() });
    
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      console.log('✅ DELETE CONFIRMED by user');
      deleteUserMutation.mutate(userId);
    } else {
      console.log('❌ DELETE CANCELLED by user');
    }
  };

  const handleBanUser = (userId: number, banned: boolean) => {
    const reason = banned ? prompt("Please provide a reason for banning this user:") : undefined;
    if (banned && !reason) return;
    
    banUserMutation.mutate({ userId, banned, reason });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm(user);
    setIsEditModalOpen(true);
  };

  const debugUserDeletion = async (userId: number) => {
    try {
      const response = await apiRequest("GET", `/api/admin/users/${userId}/debug`);
      const data = await response.json();
      setDebugData(data);
      setIsDebugModalOpen(true);
    } catch (error: any) {
      toast({
        title: "Debug Failed",
        description: error.message || "Failed to analyze user deletion",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="w-4 h-4" />;
      case "manager": return <Shield className="w-4 h-4" />;
      case "client": return <Target className="w-4 h-4" />;
      case "participant": return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "manager": return "bg-blue-500";
      case "client": return "bg-green-500";
      case "participant": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
              <p className="text-slate-300">Manage all users, roles, and permissions</p>
            </div>
            <Button
              onClick={() => setLocation("/dashboard/admin")}
              className="glass-effect bg-slate-600 text-white border-slate-500 hover:bg-slate-700 hover:text-white !bg-slate-600 !text-white !border-slate-500"
              style={{ backgroundColor: '#475569', color: '#ffffff', borderColor: '#64748b' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card className="glass-effect border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Active</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Banned</p>
                  <p className="text-2xl font-bold text-red-400">{stats.banned}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Unverified</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.unverified}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Clients</p>
                  <p className="text-2xl font-bold text-green-400">{stats.clients}</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Participants</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.participants}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Managers</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.managers}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Admins</p>
                  <p className="text-2xl font-bold text-red-400">{stats.admins}</p>
                </div>
                <Crown className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
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
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New User</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Create a new user account with the specified role and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role" className="text-slate-300">Role</Label>
                  <Select value={createForm.role} onValueChange={(value) => setCreateForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateUser} disabled={createUserMutation.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1 text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* User Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-effect mb-6">
            <TabsTrigger value="all">All Users ({stats.total})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="banned">Banned ({stats.banned})</TabsTrigger>
            <TabsTrigger value="unverified">Unverified ({stats.unverified})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card className="glass-effect border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => refetch()}
                    className="bg-slate-600 text-white border-slate-500 hover:bg-slate-700 hover:text-white !bg-slate-600 !text-white !border-slate-500"
                    style={{ backgroundColor: '#475569', color: '#ffffff', borderColor: '#64748b' }}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <Card key={user.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(user.role)}
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                                    <Badge className={`${getRoleBadgeColor(user.role)} text-white text-xs`}>
                                      {user.role}
                                    </Badge>
                                    {user.isVerified && <CheckCircle className="w-4 h-4 text-green-400" />}
                                    {user.isBanned && <XCircle className="w-4 h-4 text-red-400" />}
                                  </div>
                                  <p className="text-sm text-slate-300">{user.email}</p>
                                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                                    <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                                    {user.lastLogin && <span>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</span>}
                                    {user.warningCount > 0 && <span className="text-yellow-400">Warnings: {user.warningCount}/{user.maxWarnings}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => openEditModal(user)}
                                className="bg-blue-600 text-white border-blue-500 hover:bg-blue-700 hover:text-white focus:ring-2 focus:ring-blue-500 !bg-blue-600 !text-white !border-blue-500"
                                style={{ backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#3b82f6' }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={() => debugUserDeletion(user.id)}
                                className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:text-white focus:ring-2 focus:ring-purple-500 !bg-purple-600 !text-white !border-purple-500"
                                style={{ backgroundColor: '#9333ea', color: '#ffffff', borderColor: '#a855f7' }}
                                title="Debug deletion issues"
                              >
                                <Search className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={() => handleBanUser(user.id, !user.isBanned)}
                                className={user.isBanned ? "bg-green-600 text-white border-green-500 hover:bg-green-700 hover:text-white focus:ring-2 focus:ring-green-500 !bg-green-600 !text-white !border-green-500" : "bg-yellow-600 text-white border-yellow-500 hover:bg-yellow-700 hover:text-white focus:ring-2 focus:ring-yellow-500 !bg-yellow-600 !text-white !border-yellow-500"}
                                style={user.isBanned ? { backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#22c55e' } : { backgroundColor: '#ca8a04', color: '#ffffff', borderColor: '#eab308' }}
                              >
                                {user.isBanned ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 text-white border-red-500 hover:bg-red-700 hover:text-white focus:ring-2 focus:ring-red-500 !bg-red-600 !text-white !border-red-500"
                                style={{ backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#ef4444' }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {user.banReason && (
                            <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-red-300 text-sm">
                              <strong>Ban Reason:</strong> {user.banReason}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        No users found matching your criteria.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit User</DialogTitle>
              <DialogDescription className="text-slate-300">
                Edit user details and update their account information.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFirstName" className="text-slate-300">First Name</Label>
                    <Input
                      id="editFirstName"
                      value={editForm.firstName || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastName" className="text-slate-300">Last Name</Label>
                    <Input
                      id="editLastName"
                      value={editForm.lastName || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editEmail" className="text-slate-300">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="editRole" className="text-slate-300">Role</Label>
                  <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="editIsActive"
                      checked={editForm.isActive}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="editIsActive" className="text-slate-300">Active</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="editIsVerified"
                      checked={editForm.isVerified}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isVerified: checked }))}
                    />
                    <Label htmlFor="editIsVerified" className="text-slate-300">Verified</Label>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    {updateUserMutation.isPending ? "Updating..." : "Update User"}
                  </Button>
                  <Button onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-600 text-white border-gray-500 hover:bg-gray-700 hover:text-white !bg-gray-600 !text-white !border-gray-500" style={{ backgroundColor: '#4b5563', color: '#ffffff', borderColor: '#6b7280' }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Debug User Deletion Modal */}
        <Dialog open={isDebugModalOpen} onOpenChange={setIsDebugModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">User Deletion Debug Analysis</DialogTitle>
              <DialogDescription className="text-slate-300">
                Detailed analysis of foreign key relationships preventing user deletion.
              </DialogDescription>
            </DialogHeader>
            {debugData && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">User Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-300">Name:</span>
                      <span className="text-white ml-2">{debugData.user.firstName} {debugData.user.lastName}</span>
                    </div>
                    <div>
                      <span className="text-slate-300">Email:</span>
                      <span className="text-white ml-2">{debugData.user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-300">Role:</span>
                      <Badge className={`ml-2 ${getRoleBadgeColor(debugData.user.role)} text-white`}>
                        {debugData.user.role}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-slate-300">Status:</span>
                      <span className={`ml-2 ${debugData.user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {debugData.user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deletion Status */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Deletion Status</h3>
                  <div className="flex items-center space-x-2">
                    {debugData.totalRelatedRecords === 0 ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">User can be safely deleted - no related records found</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400">
                          {debugData.totalRelatedRecords} related records found - deletion system will handle these
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Related Records Breakdown */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Related Records Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(debugData.relatedRecords).map(([table, count]) => (
                      <div key={table} className="flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0">
                        <span className="text-slate-300 text-sm capitalize">
                          {table.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${count > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {count}
                          </span>
                          {count > 0 && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      setIsDebugModalOpen(false);
                      handleDeleteUser(debugData.user.id);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Force Delete User
                  </Button>
                  <Button 
                    onClick={() => setIsDebugModalOpen(false)} 
                    className="flex-1 bg-gray-600 text-white border-gray-500 hover:bg-gray-700 hover:text-white !bg-gray-600 !text-white !border-gray-500"
                    style={{ backgroundColor: '#4b5563', color: '#ffffff', borderColor: '#6b7280' }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}