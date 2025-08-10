import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Bell, Users, Clock, AlertTriangle, CheckCircle, Target, Send, User, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QuestionnaireHealthIndicator } from "./questionnaire-health-indicator";

interface ParticipantHealthData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  completionPercentage: number;
  healthStatus: 'poor' | 'fair' | 'good' | 'great' | 'excellent';
  lastActivity: string;
  reminderCount: number;
  canSendReminder: boolean;
}

export function ParticipantReminderDashboard() {
  const { toast } = useToast();
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Get participants with health data
  const { data: participants, isLoading } = useQuery({
    queryKey: ["/api/participants/health"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/participants/health");
      return response.json() as Promise<ParticipantHealthData[]>;
    },
  });

  // Send bulk reminders mutation
  const sendRemindersMutation = useMutation({
    mutationFn: async (data: { participantIds: number[]; message?: string }) => {
      const response = await apiRequest("POST", "/api/questionnaire/reminders/bulk", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminders Sent",
        description: `Successfully sent reminders to ${selectedParticipants.length} participants.`,
      });
      setSelectedParticipants([]);
      setCustomMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/participants/health"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reminders. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendSingleReminderMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", "/api/questionnaire/reminder", { userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Questionnaire reminder sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/participants/health"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reminder.",
        variant: "destructive",
      });
    },
  });

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'poor': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'fair': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'good': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'great': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'excellent': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getUrgencyLevel = (percentage: number) => {
    if (percentage < 20) return { level: 'critical', color: 'text-red-400', icon: AlertTriangle };
    if (percentage < 50) return { level: 'high', color: 'text-orange-400', icon: Clock };
    if (percentage < 80) return { level: 'medium', color: 'text-yellow-400', icon: Target };
    return { level: 'low', color: 'text-green-400', icon: CheckCircle };
  };

  const filteredParticipants = participants?.filter(p => {
    if (filterStatus === "all") return true;
    if (filterStatus === "poor") return p.healthStatus === 'poor';
    if (filterStatus === "needs_reminder") return p.completionPercentage < 80 && p.canSendReminder;
    if (filterStatus === "incomplete") return p.completionPercentage < 100;
    return true;
  }) || [];

  const handleBulkReminder = () => {
    if (selectedParticipants.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select participants to send reminders to.",
        variant: "destructive",
      });
      return;
    }
    sendRemindersMutation.mutate({ 
      participantIds: selectedParticipants, 
      message: customMessage || undefined 
    });
  };

  const toggleParticipantSelection = (id: number) => {
    setSelectedParticipants(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: filteredParticipants.length,
    needsReminder: filteredParticipants.filter(p => p.completionPercentage < 80).length,
    critical: filteredParticipants.filter(p => p.completionPercentage < 20).length,
    completed: filteredParticipants.filter(p => p.completionPercentage === 100).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-purple-500/20 border border-purple-500/30">
          <Bell className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Participant Reminder System</h2>
          <p className="text-white/60 text-sm">Manage questionnaire completion reminders</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-white/60 text-sm">Total Participants</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.needsReminder}</div>
                <div className="text-white/60 text-sm">Need Reminders</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.critical}</div>
                <div className="text-white/60 text-sm">Critical Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.completed}</div>
                <div className="text-white/60 text-sm">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Participants</SelectItem>
              <SelectItem value="poor">Poor Health Status</SelectItem>
              <SelectItem value="needs_reminder">Needs Reminder</SelectItem>
              <SelectItem value="incomplete">Incomplete Profiles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          {selectedParticipants.length > 0 && (
            <Button
              onClick={handleBulkReminder}
              disabled={sendRemindersMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Bulk Reminders ({selectedParticipants.length})
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedParticipants.length > 0 && (
        <Card className="card-glass border-purple-500/30">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">
                  Bulk Action - {selectedParticipants.length} participants selected
                </span>
              </div>
              <Textarea
                placeholder="Optional: Add a custom message for the reminders..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkReminder}
                  disabled={sendRemindersMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendRemindersMutation.isPending ? 'Sending...' : 'Send Reminders'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedParticipants([])}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants List */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-white">Participant Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredParticipants.map((participant) => {
              const urgency = getUrgencyLevel(participant.completionPercentage);
              const UrgencyIcon = urgency.icon;
              
              return (
                <div 
                  key={participant.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedParticipants.includes(participant.id)
                      ? 'bg-purple-500/10 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => toggleParticipantSelection(participant.id)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={() => toggleParticipantSelection(participant.id)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20"
                    />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-white/60" />
                        <div>
                          <div className="text-white font-medium">
                            {participant.firstName} {participant.lastName}
                          </div>
                          <div className="text-white/60 text-sm">{participant.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <UrgencyIcon className={`w-4 h-4 ${urgency.color}`} />
                        <div className="flex-1">
                          <Progress 
                            value={participant.completionPercentage} 
                            className="h-2 bg-white/10"
                          />
                          <div className="text-white/60 text-xs mt-1">
                            {participant.completionPercentage}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Badge 
                          variant="outline" 
                          className={`${getHealthColor(participant.healthStatus)} capitalize`}
                        >
                          {participant.healthStatus}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-white/60 text-sm flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          {participant.reminderCount} sent
                        </div>
                        <div className="text-white/40 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(participant.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-slate-900 border-white/10">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                {participant.firstName} {participant.lastName} - Health Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <QuestionnaireHealthIndicator 
                                userId={participant.id} 
                                showManagerActions={true}
                              />
                              {participant.canSendReminder && (
                                <Button
                                  onClick={() => sendSingleReminderMutation.mutate(participant.id)}
                                  disabled={sendSingleReminderMutation.isPending}
                                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                                >
                                  <Bell className="w-4 h-4 mr-2" />
                                  {sendSingleReminderMutation.isPending ? 'Sending...' : 'Send Individual Reminder'}
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}