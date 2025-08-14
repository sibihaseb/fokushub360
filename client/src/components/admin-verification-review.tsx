import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Download,
  Calendar,
  Mail,
  Phone,
  Search
} from "lucide-react";

interface VerificationDocument {
  id: number;
  userId: number;
  docType: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  uploadedAt: string;
}

interface UserResponse {
  userId: number;
  totalResponses: number;
  responsesByCategory: { [key: string]: any[] };
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  questionnaireCompleted: boolean;
}

export function AdminVerificationReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users for admin review
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return await response.json() as User[];
    }
  });
  console.log("users", users);

  // Fetch verification documents for selected user
  const { data: documents, isLoading: loadingDocs } = useQuery({
    queryKey: [`/api/admin/verification/documents/${selectedUser?.id}`],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const response = await apiRequest("GET", `/api/admin/verification/documents/${selectedUser.id}`);
      return await response.json() as VerificationDocument[];
    },
    enabled: !!selectedUser?.id
  });

  // Fetch user questionnaire responses for selected user
  const { data: responses, isLoading: loadingResponses } = useQuery({
    queryKey: [`/api/admin/responses/${selectedUser?.id}`],
    queryFn: async () => {
      if (!selectedUser?.id) return null;
      const response = await apiRequest("GET", `/api/admin/responses/${selectedUser.id}`);
      return await response.json() as UserResponse;
    },
    enabled: !!selectedUser?.id
  });

  // Review verification mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ status, reason }: { status: string; reason?: string }) => {
      if (!selectedUser?.id) throw new Error("No user selected");
      const response = await apiRequest("POST", "/api/admin/verification/review", {
        userId: selectedUser.id,
        status,
        reason
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Verification Reviewed",
        description: `User verification ${data.status} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
      setActiveTab("users");
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to review verification",
        variant: "destructive",
      });
    },
  });

  const getDocumentIcon = (docType: string) => {
    switch (docType) {
      case 'identity': return <User className="w-4 h-4" />;
      case 'address': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
          Unknown
        </Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredUsers = users?.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>User Verification & Questionnaire Review</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/10 border border-white/20">
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/20">
                All Users
              </TabsTrigger>
              {selectedUser && (
                <>
                  <TabsTrigger value="documents" className="text-white data-[state=active]:bg-white/20">
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="questionnaire" className="text-white data-[state=active]:bg-white/20">
                    Questionnaire
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="users" className="mt-[4px] mb-[4px] text-[14px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#272f73d6] border-white/20 text-white placeholder:text-white/60 w-full"
                  />
                </div>
                <p className="text-sm whitespace-nowrap text-[#00000099] mt-[0px] mb-[0px]">{filteredUsers.length} users found</p>
              </div>

              <div className="space-y-3">
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-white/60">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-white/10 gap-4 bg-[#5a75a60d]">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium">
                            {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-[#000000]">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                          </p>
                          <p className="text-sm truncate text-[#3a4a69]">{user.email}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {user.role}
                            </Badge>
                            {user.verificationStatus=== "verified" ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-[#38267adb] text-yellow-400 border-yellow-500/30 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                            {user.questionnaireCompleted ? (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                Survey Complete
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                Survey Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 w-full sm:w-auto">
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setActiveTab("documents");
                          }}
                          size="sm"
                          style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none' }}
                          className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-0 w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {selectedUser && (
              <>
                <TabsContent value="documents" className="space-y-4">
                  <div className="flex items-center justify-between ">
                    <div>
                      <h3 className="text-lg font-medium text-[#000000]">
                        Verification Documents: {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-[#140a0a99]">{selectedUser.email}</p>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedUser(null);
                        setActiveTab("users");
                      }}
                      style={{ backgroundColor: '#374151', color: '#ffffff', border: '1px solid #6b7280' }}
                      className="!bg-gray-700 hover:!bg-gray-600 !text-white !border-gray-500"
                    >
                      Back to Users
                    </Button>
                  </div>

                  {loadingDocs ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-white/60">Loading documents...</p>
                    </div>
                  ) : documents?.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-[#42181899]">No verification documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents?.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center space-x-4">
                            {getDocumentIcon(doc.docType)}
                            <div>
                              <p className="text-white font-medium">{doc.originalName}</p>
                              <p className="text-white/60 text-sm">
                                {doc.docType} • {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(doc.status)}
                            <Button 
                              size="sm" 
                              style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none' }}
                              className="!bg-emerald-600 hover:!bg-emerald-700 !text-white !border-0"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={() => reviewMutation.mutate({ status: 'verified' })}
                      disabled={reviewMutation.isPending}
                      style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none' }}
                      className="!bg-green-600 hover:!bg-green-700 !text-white !border-0"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Verification
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          disabled={reviewMutation.isPending}
                          style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none' }}
                          className="!bg-red-600 hover:!bg-red-700 !text-white !border-0"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Verification
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Reject Verification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-white text-sm font-medium">Reason for rejection:</label>
                            <Textarea
                              value={reviewReason}
                              onChange={(e) => setReviewReason(e.target.value)}
                              placeholder="Enter reason for rejection..."
                              className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                            />
                          </div>
                          <div className="flex space-x-2 justify-end">
                            <Button 
                              style={{ backgroundColor: '#6b7280', color: '#ffffff', border: 'none' }}
                              className="!bg-gray-500 hover:!bg-gray-600 !text-white !border-0"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => reviewMutation.mutate({ status: 'rejected', reason: reviewReason })}
                              disabled={reviewMutation.isPending}
                              style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none' }}
                              className="!bg-red-600 hover:!bg-red-700 !text-white !border-0"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TabsContent>

                <TabsContent value="questionnaire" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-[#000000]">
                        Questionnaire Responses: {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-[#21161699]">{selectedUser.email}</p>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedUser(null);
                        setActiveTab("users");
                      }}
                      style={{ backgroundColor: '#374151', color: '#ffffff', border: '1px solid #6b7280' }}
                      className="!bg-gray-700 hover:!bg-gray-600 !text-white !border-gray-500"
                    >
                      Back to Users
                    </Button>
                  </div>

                  {loadingResponses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-white/60">Loading questionnaire responses...</p>
                    </div>
                  ) : !responses || responses.totalResponses === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-[#11525499]">No questionnaire responses found</p>
                      <p className="text-sm text-[#11525499]">User has not completed the onboarding questionnaire</p>
                      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-[#520b0b]">
                          <strong>Status:</strong> This user is marked as having not completed the questionnaire. 
                          They have 0 recorded responses in the system.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="text-white font-medium mb-2">Response Summary</h4>
                        <p className="text-white/60">
                          Total Responses: <span className="text-white font-medium">{responses.totalResponses}</span>
                        </p>
                      </div>

                      {Object.entries(responses.responsesByCategory || {}).map(([category, categoryResponses]) => (
                        <Card key={category} className="bg-white/5 backdrop-blur-md border border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white">{category}</CardTitle>
                          </CardHeader>
                          <CardContent className="bg-[#c41d1dcf]">
                            <div className="space-y-3">
                              {categoryResponses.map((response: any, index: number) => (
                                <div key={index} className="p-3 bg-white/5 rounded-lg">
                                  <p className="text-white font-medium mb-2">{response.questionText}</p>
                                  <p className="text-white/70">{response.answer}</p>
                                  <p className="text-white/40 text-xs mt-2">
                                    Answered: {response.createdAt ? new Date(response.createdAt).toLocaleDateString() : 'Date not available'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}