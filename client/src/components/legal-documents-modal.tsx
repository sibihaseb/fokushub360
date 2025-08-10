import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FileText, Shield, Eye, Calendar, User, CheckCircle, ExternalLink, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LegalDocument {
  id: number;
  type: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

interface LegalDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
  initialTab?: 'terms' | 'privacy' | 'gdpr_rights';
}

export function LegalDocumentsModal({ 
  isOpen, 
  onClose, 
  onAccept, 
  showAcceptButton = false,
  initialTab = 'terms'
}: LegalDocumentsModalProps) {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userAcceptances, setUserAcceptances] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchLegalDocuments();
      if (user) {
        fetchUserAcceptances();
      }
    }
  }, [isOpen, user]);

  const fetchLegalDocuments = async () => {
    try {
      const response = await fetch('/api/legal/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        // If no documents found, create default ones
        setDocuments(getDefaultDocuments());
      }
    } catch (error) {
      console.error('Error fetching legal documents:', error);
      setDocuments(getDefaultDocuments());
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAcceptances = async () => {
    try {
      const response = await fetch('/api/legal/user-acceptances');
      if (response.ok) {
        const data = await response.json();
        setUserAcceptances(data);
      }
    } catch (error) {
      console.error('Error fetching user acceptances:', error);
    }
  };

  const getDefaultDocuments = (): LegalDocument[] => [
    {
      id: 1,
      type: 'terms',
      title: 'Terms of Service',
      version: '1.0',
      isActive: true,
      effectiveDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: `
        <div class="space-y-6">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold mb-2">Terms of Service</h1>
            <p class="text-gray-600">Effective Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <section>
            <h2 class="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
            <p class="mb-4">By accessing and using FokusHub360, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p class="mb-4">FokusHub360 is a virtual focus group platform that connects market researchers with participants to gather insights and feedback on products, services, and concepts.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">3. User Responsibilities</h2>
            <ul class="list-disc ml-6 space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Maintain the confidentiality of shared materials</li>
              <li>Participate in good faith and provide honest feedback</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">4. Intellectual Property</h2>
            <p class="mb-4">All content, materials, and intellectual property on FokusHub360 remain the property of their respective owners. Users may not reproduce, distribute, or create derivative works without permission.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">5. Payment and Compensation</h2>
            <p class="mb-4">Participants may receive compensation for their participation in focus groups. Payment terms and amounts will be specified for each individual campaign.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">6. Termination</h2>
            <p class="mb-4">Either party may terminate this agreement at any time. FokusHub360 reserves the right to suspend or terminate accounts for violations of these terms.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p class="mb-4">FokusHub360 shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">8. Governing Law</h2>
            <p class="mb-4">These terms are governed by the laws of the jurisdiction in which FokusHub360 operates.</p>
          </section>
        </div>
      `
    },
    {
      id: 2,
      type: 'privacy',
      title: 'Privacy Policy',
      version: '1.0',
      isActive: true,
      effectiveDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: `
        <div class="space-y-6">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold mb-2">Privacy Policy</h1>
            <p class="text-gray-600">Effective Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <section>
            <h2 class="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <div class="space-y-3">
              <div>
                <h3 class="font-medium">Personal Information</h3>
                <p class="text-sm text-gray-600">Name, email address, phone number, demographic information</p>
              </div>
              <div>
                <h3 class="font-medium">Usage Information</h3>
                <p class="text-sm text-gray-600">How you interact with our platform, campaign responses, feedback</p>
              </div>
              <div>
                <h3 class="font-medium">Technical Information</h3>
                <p class="text-sm text-gray-600">IP address, browser type, device information, cookies</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <ul class="list-disc ml-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Match you with relevant focus groups</li>
              <li>Communicate with you about campaigns and updates</li>
              <li>Process payments and manage your account</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <p class="mb-4">We do not sell your personal information. We may share your information with:</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Clients conducting focus groups (in aggregated, anonymized form)</li>
              <li>Service providers who help us operate our platform</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">4. Data Security</h2>
            <p class="mb-4">We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">5. Your Rights</h2>
            <p class="mb-4">Under GDPR and other privacy laws, you have the right to:</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your data</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
            <p class="mb-4">We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can manage your cookie preferences in your browser settings.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">7. Contact Information</h2>
            <p class="mb-4">For privacy-related questions or to exercise your rights, contact us at:</p>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email:</strong> privacy@fokushub360.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@fokushub360.com</p>
            </div>
          </section>
        </div>
      `
    },
    {
      id: 3,
      type: 'gdpr_rights',
      title: 'Your Data Rights',
      version: '1.0',
      isActive: true,
      effectiveDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: `
        <div class="space-y-6">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold mb-2">Your Data Rights</h1>
            <p class="text-gray-600">Under GDPR and Privacy Laws</p>
          </div>

          <section>
            <h2 class="text-xl font-semibold mb-3">Right to Access</h2>
            <p class="mb-4">You can request a copy of all personal data we hold about you. This includes your profile information, campaign responses, and any other data we've collected.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">Right to Rectification</h2>
            <p class="mb-4">You can ask us to correct any inaccurate or incomplete personal data. We'll update your information promptly once verified.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">Right to Erasure</h2>
            <p class="mb-4">Also known as the "right to be forgotten," you can request that we delete your personal data under certain circumstances.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">Right to Restrict Processing</h2>
            <p class="mb-4">You can ask us to limit how we process your personal data while we address any concerns you may have.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">Right to Data Portability</h2>
            <p class="mb-4">You can request your data in a structured, machine-readable format to transfer to another service provider.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">Right to Object</h2>
            <p class="mb-4">You can object to processing of your personal data based on legitimate interests, direct marketing, or research purposes.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-3">How to Exercise Your Rights</h2>
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="mb-2">To exercise any of these rights, please contact us at:</p>
              <p><strong>Email:</strong> privacy@fokushub360.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@fokushub360.com</p>
              <p class="mt-2 text-sm text-gray-600">We'll respond to your request within 30 days as required by law.</p>
            </div>
          </section>
        </div>
      `
    }
  ];

  const handleAcceptAll = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to accept legal documents",
        variant: "destructive",
      });
      return;
    }

    try {
      // Record acceptance for each document
      for (const doc of documents) {
        await fetch('/api/legal/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: doc.id,
            documentType: doc.type,
            documentVersion: doc.version
          })
        });
      }

      toast({
        title: "Documents Accepted",
        description: "Your acceptance has been recorded successfully",
      });

      if (onAccept) {
        onAccept();
      }
      onClose();
    } catch (error) {
      console.error('Error accepting documents:', error);
      toast({
        title: "Error",
        description: "Failed to record document acceptance",
        variant: "destructive",
      });
    }
  };

  const isDocumentAccepted = (docType: string) => {
    return userAcceptances.some(acceptance => acceptance.documentType === docType);
  };

  const getDocumentByType = (type: string) => {
    // Map frontend types to database types
    const typeMapping: { [key: string]: string } = {
      'terms': 'terms_of_service',
      'privacy': 'privacy_policy', 
      'gdpr_rights': 'data_rights'
    };
    
    const dbType = typeMapping[type] || type;
    return documents.find(doc => doc.type === dbType);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Legal Documents & Privacy
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Terms of Service
                {user && isDocumentAccepted('terms') && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Privacy Policy
                {user && isDocumentAccepted('privacy') && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="gdpr_rights" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Your Data Rights
                {user && isDocumentAccepted('gdpr_rights') && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <TabsContent value="terms" className="h-full">
                  {getDocumentByType('terms') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Version {getDocumentByType('terms')?.version}</Badge>
                          <Badge variant="secondary">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(getDocumentByType('terms')?.effectiveDate || '')}
                          </Badge>
                        </div>
                        {user && isDocumentAccepted('terms') && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                      </div>
                      <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: getDocumentByType('terms')?.content || '' }}
                        />
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="privacy" className="h-full">
                  {getDocumentByType('privacy') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Version {getDocumentByType('privacy')?.version}</Badge>
                          <Badge variant="secondary">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(getDocumentByType('privacy')?.effectiveDate || '')}
                          </Badge>
                        </div>
                        {user && isDocumentAccepted('privacy') && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                      </div>
                      <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: getDocumentByType('privacy')?.content || '' }}
                        />
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="gdpr_rights" className="h-full">
                  {getDocumentByType('gdpr_rights') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Version {getDocumentByType('gdpr_rights')?.version}</Badge>
                          <Badge variant="secondary">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(getDocumentByType('gdpr_rights')?.effectiveDate || '')}
                          </Badge>
                        </div>
                        {user && isDocumentAccepted('gdpr_rights') && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                      </div>
                      <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: getDocumentByType('gdpr_rights')?.content || '' }}
                        />
                      </ScrollArea>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Need to exercise your data rights? Visit our{" "}
                          <a href="/data-rights" className="text-primary hover:underline">
                            Data Rights page
                          </a>{" "}
                          to submit a request.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            <Button 
              onClick={() => window.open('/data-rights', '_blank')}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Data Rights
            </Button>
            
            {showAcceptButton && user && (
              <Button 
                onClick={handleAcceptAll}
                className="ml-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept All Documents
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}