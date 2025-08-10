import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Bell, 
  Send,
  Eye,
  Edit,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Mail,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw
} from "lucide-react";
import { AdminVerificationReview } from "@/components/admin-verification-review";

interface VerificationStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  pendingVerification: number;
  verificationRate: number;
  recentSignups: number;
  highPriorityUnverified: number;
}

interface VerificationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  isVerified: boolean;
  verificationStatus: string;
  reminderCount?: number;
  lastReminderSent?: string;
  daysSinceJoined?: number;
  daysSinceVerified?: number;
  reminderStatus?: string;
  priorityLevel?: string;
  verificationLevel?: string;
  verificationDate?: string;
}

export default function VerificationDashboard() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewingUser, setReviewingUser] = useState<VerificationUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch verification statistics
  const { data: stats, isLoading: statsLoading } = useQuery<VerificationStats>({
    queryKey: ["/api/admin/verification/stats"],
  });

  // Fetch unverified users
  const { data: unverifiedUsers, isLoading: unverifiedLoading } = useQuery<VerificationUser[]>({
    queryKey: ["/api/admin/verification/unverified"],
  });

  // Fetch verified users
  const { data: verifiedUsers, isLoading: verifiedLoading } = useQuery<VerificationUser[]>({
    queryKey: ["/api/admin/verification/verified"],
  });

  // Update verification status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return await apiRequest("POST", "/api/admin/verification/update-status", {
        userId,
        status,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Verification status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification/unverified"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification/verified"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    },
  });

  // Send reminders mutation
  const sendRemindersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      return await apiRequest("POST", "/api/admin/verification/send-reminders", {
        userIds,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Reminders sent to ${data.remindersSent} users`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification/unverified"] });
      setSelectedUsers([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send reminders",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (userId: string, status: string) => {
    updateStatusMutation.mutate({ userId, status });
  };

  const handleBulkReminders = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No users selected",
        description: "Please select users to send reminders to",
        variant: "destructive",
      });
      return;
    }
    sendRemindersMutation.mutate(selectedUsers);
  };

  const handleSendAllReminders = () => {
    sendRemindersMutation.mutate([]);
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getReminderStatusColor = (status: string) => {
    switch (status) {
      case 'never_sent': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'recent': return 'bg-green-100 text-green-800 border-green-300';
      case 'due_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Verification Management</h1>
            <p className="text-white/70 mt-2">Manage user verification and priority access</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSendAllReminders}
              disabled={sendRemindersMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sendRemindersMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              Send All Reminders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Verified Users</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.verifiedUsers || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Unverified Users</p>
                  <p className="text-2xl font-bold text-red-400">{stats?.unverifiedUsers || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Verification Rate</p>
                  <p className="text-2xl font-bold text-purple-400">{stats?.verificationRate?.toFixed(1) || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Alerts */}
        {stats && stats.highPriorityUnverified > 0 && (
          <Card className="glass-effect border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium">High Priority Alert</p>
                  <p className="text-white/70 text-sm">
                    {stats.highPriorityUnverified} users have been unverified for more than 3 days and need immediate attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                User Verification Management
              </CardTitle>
              {selectedUsers.length > 0 && (
                <Button
                  onClick={handleBulkReminders}
                  disabled={sendRemindersMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Reminders ({selectedUsers.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="unverified" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="unverified" className="data-[state=active]:bg-white/20">
                  Unverified Users ({stats?.unverifiedUsers || 0})
                </TabsTrigger>
                <TabsTrigger value="verified" className="data-[state=active]:bg-white/20">
                  Verified Users ({stats?.verifiedUsers || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unverified" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm bg-white/10 border-white/20 text-white"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {unverifiedUsers?.map((user) => (
                    <Card key={user.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-white/20 text-blue-500"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <Badge className={getPriorityColor(user.priorityLevel || 'low')}>
                                  {user.priorityLevel || 'low'}
                                </Badge>
                                <Badge className={getStatusColor(user.verificationStatus)}>
                                  {user.verificationStatus}
                                </Badge>
                              </div>
                              <p className="text-white/70 text-sm">{user.email}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                                <span>Joined {user.daysSinceJoined} days ago</span>
                                <span>Reminders sent: {user.reminderCount || 0}</span>
                                {user.reminderStatus && (
                                  <Badge className={getReminderStatusColor(user.reminderStatus)}>
                                    {user.reminderStatus.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => setReviewingUser(user)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(user.id, 'verified')}
                              disabled={updateStatusMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(user.id, 'rejected')}
                              disabled={updateStatusMutation.isPending}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="verified" className="space-y-4">
                <div className="space-y-3">
                  {verifiedUsers?.map((user) => (
                    <Card key={user.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <Badge className={getStatusColor(user.verificationLevel || 'verified')}>
                                  {user.verificationLevel || 'verified'}
                                </Badge>
                              </div>
                              <p className="text-white/70 text-sm">{user.email}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                                <span>Verified {user.daysSinceVerified} days ago</span>
                                <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(user.id, 'pending')}
                              disabled={updateStatusMutation.isPending}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Revoke
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Verification Review Dialog */}
        {reviewingUser && (
          <Dialog open={!!reviewingUser} onOpenChange={() => setReviewingUser(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Verification Review</DialogTitle>
              </DialogHeader>
              <AdminVerificationReview
                userId={parseInt(reviewingUser.id)}
                userName={`${reviewingUser.firstName} ${reviewingUser.lastName}`}
                userEmail={reviewingUser.email}
                onClose={() => setReviewingUser(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}