import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/navigation-header";
import { 
  Bell, 
  Send, 
  Users, 
  Calendar, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MessageSquare
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UnverifiedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
  daysSinceJoined: number;
  lastReminderSent?: string;
}

export default function VerificationReminders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UnverifiedUser | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: unverifiedUsers, isLoading } = useQuery<UnverifiedUser[]>({
    queryKey: ["/api/admin/unverified-users"],
    retry: false,
  });

  const bulkReminderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/send-verification-reminders", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reminders Sent",
        description: `Successfully sent ${data.remindersSent} verification reminders`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unverified-users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const individualReminderMutation = useMutation({
    mutationFn: async (data: { userId: number; customMessage?: string }) => {
      const response = await apiRequest("POST", `/api/admin/send-verification-reminder/${data.userId}`, {
        customMessage: data.customMessage
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Verification reminder sent successfully",
      });
      setIsDialogOpen(false);
      setSelectedUser(null);
      setCustomMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unverified-users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBulkReminder = () => {
    bulkReminderMutation.mutate();
  };

  const handleIndividualReminder = (user: UnverifiedUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const sendIndividualReminder = () => {
    if (selectedUser) {
      individualReminderMutation.mutate({
        userId: selectedUser.id,
        customMessage: customMessage || undefined
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unverified': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unverified': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getUrgencyLevel = (daysSinceJoined: number) => {
    if (daysSinceJoined > 21) return 'high';
    if (daysSinceJoined > 14) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <NavigationHeader 
          title="Verification Reminders"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Verification Reminders" }
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

  const totalUnverified = unverifiedUsers?.length || 0;
  const highUrgency = unverifiedUsers?.filter(u => getUrgencyLevel(u.daysSinceJoined) === 'high').length || 0;
  const mediumUrgency = unverifiedUsers?.filter(u => getUrgencyLevel(u.daysSinceJoined) === 'medium').length || 0;
  const lowUrgency = unverifiedUsers?.filter(u => getUrgencyLevel(u.daysSinceJoined) === 'low').length || 0;

  return (
    <div className="min-h-screen bg-gradient-primary">
      <NavigationHeader 
        title="Verification Reminders"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Verification Reminders" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Unverified</p>
                  <p className="text-2xl font-bold text-white">{totalUnverified}</p>
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
                  <p className="text-white/60 text-sm">High Urgency</p>
                  <p className="text-2xl font-bold text-white">{highUrgency}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Medium Urgency</p>
                  <p className="text-2xl font-bold text-white">{mediumUrgency}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Low Urgency</p>
                  <p className="text-2xl font-bold text-white">{lowUrgency}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        <Card className="card-glass mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBulkReminder}
                disabled={bulkReminderMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {bulkReminderMutation.isPending ? "Sending..." : "Send Bulk Reminders"}
              </Button>
              <p className="text-white/60 text-sm">
                Send reminders to all users who joined 7+ days ago and haven't been reminded recently
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Unverified Users List */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Unverified Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalUnverified === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">All users are verified!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unverifiedUsers?.map((user) => {
                  const urgency = getUrgencyLevel(user.daysSinceJoined);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-medium">
                              {user.firstName} {user.lastName}
                            </h3>
                            <Badge className={getStatusColor(user.verificationStatus)}>
                              {getStatusIcon(user.verificationStatus)}
                              <span className="ml-1 capitalize">{user.verificationStatus}</span>
                            </Badge>
                          </div>
                          <p className="text-white/60 text-sm">{user.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-white/60 text-xs">
                              Joined {user.daysSinceJoined} days ago
                            </span>
                            <span className={`text-xs font-medium ${getUrgencyColor(urgency)}`}>
                              {urgency.toUpperCase()} URGENCY
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleIndividualReminder(user)}
                          disabled={individualReminderMutation.isPending}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Individual Reminder Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Send Verification Reminder
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedUser && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-white/60 text-sm">{selectedUser.email}</p>
                  <p className="text-white/60 text-sm">
                    Joined {selectedUser.daysSinceJoined} days ago
                  </p>
                </div>
              )}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Custom Message (Optional)
                </label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter a custom message or leave blank for default message..."
                  className="bg-white/5 border-white/20 text-white placeholder-white/40"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendIndividualReminder}
                  disabled={individualReminderMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {individualReminderMutation.isPending ? "Sending..." : "Send Reminder"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}