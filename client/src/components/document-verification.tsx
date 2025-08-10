import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  File, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  AlertCircle,
  Camera,
  FileText,
  CreditCard,
  MapPin,
  User,
  X
} from "lucide-react";

interface DocumentVerificationProps {
  userId: number;
  userRole: string;
  currentStatus?: 'pending' | 'verified' | 'rejected' | 'not_submitted';
}

interface VerificationDocument {
  id: string;
  type: 'identity' | 'address' | 'income' | 'other';
  name: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadDate: string;
  rejectionReason?: string;
}

export function DocumentVerification({ userId, userRole, currentStatus = 'not_submitted' }: DocumentVerificationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<'identity' | 'address' | 'income' | 'other'>('identity');
  const [uploadedDocs, setUploadedDocs] = useState<VerificationDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/verification/upload", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedDocs(prev => [...prev, data]);
      toast({ title: "Document uploaded successfully", description: "Your document is being reviewed." });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/status"] });
    },
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({ title: "File too large", description: "Please select a file smaller than 10MB", variant: "destructive" });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPEG, PNG, or PDF file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', selectedDocType);
    formData.append('userId', userId.toString());

    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'identity': return <User className="w-5 h-5" />;
      case 'address': return <MapPin className="w-5 h-5" />;
      case 'income': return <CreditCard className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const documentTypes = [
    { value: 'identity', label: 'Identity Document', description: 'Driver\'s license, passport, or national ID' },
    { value: 'address', label: 'Address Proof', description: 'Utility bill, bank statement, or lease agreement' },
    { value: 'income', label: 'Income Verification', description: 'Pay stub, tax return, or bank statement' },
    { value: 'other', label: 'Other Document', description: 'Any additional required documentation' }
  ];

  const getVerificationProgress = () => {
    const totalRequired = 2; // Identity + Address minimum
    const verifiedCount = uploadedDocs.filter(doc => doc.status === 'verified').length;
    return Math.min((verifiedCount / totalRequired) * 100, 100);
  };

  // Only show verification status to admins and managers
  const canSeeVerificationStatus = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="space-y-6">
      {/* Verification Status Overview */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              Document Verification
            </div>
            {canSeeVerificationStatus && (
              <Badge className={getStatusColor(currentStatus)}>
                {getStatusIcon(currentStatus)}
                <span className="ml-1 capitalize">{currentStatus.replace('_', ' ')}</span>
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Verification Progress</span>
              <span className="text-white font-semibold">{Math.round(getVerificationProgress())}%</span>
            </div>
            <Progress value={getVerificationProgress()} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <h4 className="text-white font-medium">Required Documents</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Government-issued ID (required)</li>
                  <li>• Proof of address (required)</li>
                  <li>• Income verification (optional)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-medium">Verification Benefits</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Access to premium campaigns</li>
                  <li>• Higher reward eligibility</li>
                  <li>• Priority participant matching</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-white">Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDocType} onValueChange={(value) => setSelectedDocType(value as any)}>
            <TabsList className="grid w-full grid-cols-4 glass-effect">
              {documentTypes.map((type) => (
                <TabsTrigger key={type.value} value={type.value} className="flex items-center space-x-2">
                  {getDocumentIcon(type.value)}
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {documentTypes.map((type) => (
              <TabsContent key={type.value} value={type.value} className="mt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">{type.label}</h3>
                    <p className="text-white/70 text-sm">{type.description}</p>
                  </div>
                  
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Upload {type.label}</h4>
                        <p className="text-white/60 text-sm mt-1">
                          Drag and drop or click to select file
                        </p>
                        <p className="text-white/40 text-xs mt-2">
                          Supported formats: JPEG, PNG, PDF (max 10MB)
                        </p>
                      </div>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="btn-premium"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Uploaded Documents List */}
      {uploadedDocs.length > 0 && (
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-white">Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(doc.type)}
                    <div>
                      <p className="text-white font-medium">{doc.name}</p>
                      <p className="text-white/60 text-sm">
                        Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                      {doc.rejectionReason && (
                        <p className="text-red-400 text-xs mt-1">{doc.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(doc.status)}>
                      {getStatusIcon(doc.status)}
                      <span className="ml-1 capitalize">{doc.status}</span>
                    </Badge>
                    {canSeeVerificationStatus && (
                      <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}