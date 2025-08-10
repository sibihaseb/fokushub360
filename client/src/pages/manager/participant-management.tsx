import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NavigationHeader } from "@/components/navigation-header";
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  Mail,
  Shield,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Star,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Send
} from "lucide-react";

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  warningCount: number;
  maxWarnings: number;
  lastLogin: string;
  createdAt: string;
  stats: {
    totalCampaigns: number;
    completedCampaigns: number;
    responseRate: number;
    averageRating: number;
    totalEarnings: number;
  };
  profile?: {
    completionScore: number;
    onboardingCompleted: boolean;
    tags: string[];
  };
}

interface InviteCampaign {
  id: number;
  title: string;
  description: string;
  participantCount: number;
  rewardAmount: number;
  rewardType: string;
}

export default function ParticipantManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showWarnDialog, setShowWarnDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [banReason, setBanReason] = useState("");
  const [warningReason, setWarningReason] = useState("");

  const { data: participants, isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: ["/api/manager/participants"],
    retry: false,
  });

  const { data: availableCampaigns } = useQuery<InviteCampaign[]>({
    queryKey: ["/api/manager/campaigns/available"],
    retry: false,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { campaignId: number; participantId: number }) => {
      const response = await apiRequest("POST", `/api/manager/campaigns/${data.campaignId}/invite`, {
        participantId: data.participantId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager/participants"] });
      toast({ title: "Invitation sent successfully" });
      setShowInviteDialog(false);
      setSelectedCampaign("");
    },
    onError: (error) => {
      toast({ title: "Error sending invitation", description: error.message, variant: "destructive" });
    },
  });

  const banMutation = useMutation({
    mutationFn: async (data: { participantId: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/manager/participants/${data.participantId}/ban`, {
        reason: data.reason
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager/participants"] });
      toast({ title: "Participant banned successfully" });
      setShowBanDialog(false);
      setBanReason("");
    },
    onError: (error) => {
      toast({ title: "Error banning participant", description: error.message, variant: "destructive" });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (participantId: number) => {
      const response = await apiRequest("POST", `/api/manager/participants/${participantId}/unban`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager/participants"] });
      toast({ title: "Participant unbanned successfully" });
    },
    onError: (error) => {
      toast({ title: "Error unbanning participant", description: error.message, variant: "destructive" });
    },
  });

  const warnMutation = useMutation({
    mutationFn: async (data: { participantId: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/manager/participants/${data.participantId}/warn`, {
        reason: data.reason
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager/participants"] });
      toast({ title: "Warning issued successfully" });
      setShowWarnDialog(false);
      setWarningReason("");
    },
    onError: (error) => {
      toast({ title: "Error issuing warning", description: error.message, variant: "destructive" });
    },
  });

  const handleInviteParticipant = () => {
    if (!selectedParticipant || !selectedCampaign) return;
    inviteMutation.mutate({ 
      campaignId: parseInt(selectedCampaign), 
      participantId: selectedParticipant.id 
    });
  };

  const handleBanParticipant = () => {
    if (!selectedParticipant || !banReason.trim()) return;
    banMutation.mutate({ 
      participantId: selectedParticipant.id, 
      reason: banReason 
    });
  };

  const handleWarnParticipant = () => {
    if (!selectedParticipant || !warningReason.trim()) return;
    warnMutation.mutate({ 
      participantId: selectedParticipant.id, 
      reason: warningReason 
    });
  };

  const getStatusBadge = (participant: Participant) => {
    if (participant.isBanned) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <Ban className="w-3 h-3 mr-1" />
        Banned
      </Badge>;
    }
    if (!participant.isActive) {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
        <UserX className="w-3 h-3 mr-1" />
        Inactive
      </Badge>;
    }
    if (participant.warningCount >= participant.maxWarnings) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <AlertTriangle className="w-3 h-3 mr-1" />
        High Risk
      </Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
      <UserCheck className="w-3 h-3 mr-1" />
      Active
    </Badge>;
  };

  const filteredParticipants = participants?.filter(participant => {
    const matchesSearch = 
      participant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && participant.isActive && !participant.isBanned) ||
      (statusFilter === "banned" && participant.isBanned) ||
      (statusFilter === "inactive" && !participant.isActive) ||
      (statusFilter === "warned" && participant.warningCount > 0);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const activeParticipants = participants?.filter(p => p.isActive && !p.isBanned).length || 0;
  const bannedParticipants = participants?.filter(p => p.isBanned).length || 0;
  const warnedParticipants = participants?.filter(p => p.warningCount > 0).length || 0;

  if (participantsLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <NavigationHeader 
          title="Participant Management"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Manager", href: "/manager" },
            { label: "Participants" }
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
        title="Participant Management"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Manager", href: "/manager" },
          { label: "Participants" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Participants</p>
                  <p className="text-2xl font-bold text-white">{participants?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active</p>
                  <p className="text-2xl font-bold text-white">{activeParticipants}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Warnings</p>
                  <p className="text-2xl font-bold text-white">{warnedParticipants}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Banned</p>
                  <p className="text-2xl font-bold text-white">{bannedParticipants}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="card-glass mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <Input
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="banned">Banned Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="warned">With Warnings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-white">Participants ({filteredParticipants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredParticipants.map((participant) => (
                <Card key={participant.id} className="border border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {participant.firstName} {participant.lastName}
                            </h3>
                            <p className="text-white/60 text-sm">{participant.email}</p>
                          </div>
                          {getStatusBadge(participant)}
                          {participant.warningCount > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              {participant.warningCount}/{participant.maxWarnings} warnings
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-white/60" />
                            <span className="text-white/70 text-sm">
                              {participant.stats.totalCampaigns} campaigns
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-white/60" />
                            <span className="text-white/70 text-sm">
                              {participant.stats.completedCampaigns} completed
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-white/60" />
                            <span className="text-white/70 text-sm">
                              {participant.stats.averageRating}/5 rating
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-white/60" />
                            <span className="text-white/70 text-sm">
                              ${participant.stats.totalEarnings} earned
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined: {new Date(participant.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Last login: {new Date(participant.lastLogin).toLocaleDateString()}</span>
                          </div>
                          {participant.isBanned && participant.banReason && (
                            <div className="flex items-center space-x-1 text-red-400">
                              <Ban className="w-4 h-4" />
                              <span>Banned: {participant.banReason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => {
                            setSelectedParticipant(participant);
                            setShowInviteDialog(true);
                          }}
                          size="sm"
                          className="btn-premium"
                          disabled={participant.isBanned}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setSelectedParticipant(participant);
                            setShowWarnDialog(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                          disabled={participant.isBanned}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Warn
                        </Button>

                        {participant.isBanned ? (
                          <Button
                            onClick={() => unbanMutation.mutate(participant.id)}
                            size="sm"
                            variant="outline"
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                            disabled={unbanMutation.isPending}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Unban
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setShowBanDialog(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Ban
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="bg-[#1a1a2e] border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">
                Invite {selectedParticipant?.firstName} {selectedParticipant?.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Select Campaign</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCampaigns?.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.title} - {campaign.rewardAmount} {campaign.rewardType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                  className="border-white/20 text-white/70"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteParticipant}
                  disabled={!selectedCampaign || inviteMutation.isPending}
                  className="btn-premium"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Ban Dialog */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent className="bg-[#1a1a2e] border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">
                Ban {selectedParticipant?.firstName} {selectedParticipant?.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Ban Reason</Label>
                <Textarea
                  placeholder="Please provide a reason for banning this participant..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBanDialog(false)}
                  className="border-white/20 text-white/70"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBanParticipant}
                  disabled={!banReason.trim() || banMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Ban Participant
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Warning Dialog */}
        <Dialog open={showWarnDialog} onOpenChange={setShowWarnDialog}>
          <DialogContent className="bg-[#1a1a2e] border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">
                Issue Warning to {selectedParticipant?.firstName} {selectedParticipant?.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Warning Reason</Label>
                <Textarea
                  placeholder="Please provide a reason for this warning..."
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">
                  Current warnings: {selectedParticipant?.warningCount || 0}/{selectedParticipant?.maxWarnings || 3}
                </p>
                {selectedParticipant?.warningCount === (selectedParticipant?.maxWarnings || 3) - 1 && (
                  <p className="text-red-400 text-sm mt-1">
                    ⚠️ This will be the final warning before automatic ban
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWarnDialog(false)}
                  className="border-white/20 text-white/70"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWarnParticipant}
                  disabled={!warningReason.trim() || warnMutation.isPending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Issue Warning
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}