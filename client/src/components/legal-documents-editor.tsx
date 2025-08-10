import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  FileText, 
  Save, 
  Edit, 
  Loader2,
  Eye,
  Lock,
  AlertCircle
} from "lucide-react";
import type { LegalDocument } from "@/shared/schema";

interface LegalDocumentsEditorProps {
  className?: string;
}

export function LegalDocumentsEditor({ className }: LegalDocumentsEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("privacy_policy");
  const [editingDocs, setEditingDocs] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  // Fetch legal documents
  const { data: legalDocs, isLoading } = useQuery({
    queryKey: ['/api/legal/documents'],
    queryFn: async () => {
      const response = await fetch('/api/legal/documents');
      if (!response.ok) throw new Error('Failed to fetch legal documents');
      return response.json();
    },
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ type, content }: { type: string; content: string }) => {
      const response = await apiRequest('PUT', '/api/legal/documents', { type, content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal/documents'] });
      toast({
        title: "Document Updated",
        description: "Legal document has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = (type: string) => {
    const content = editingDocs[type];
    if (!content?.trim()) {
      toast({
        title: "Empty Content",
        description: "Please enter content before saving.",
        variant: "destructive",
      });
      return;
    }

    updateDocumentMutation.mutate({ type, content });
  };

  const handleContentChange = (type: string, content: string) => {
    setEditingDocs(prev => ({ ...prev, [type]: content }));
  };

  const getCurrentDoc = (type: string) => {
    return legalDocs?.find((doc: LegalDocument) => doc.type === type);
  };

  const getDocumentContent = (type: string) => {
    return editingDocs[type] ?? getCurrentDoc(type)?.content ?? getDefaultContent(type);
  };

  const getDefaultContent = (type: string) => {
    const defaultContents = {
      privacy_policy: `# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## Information We Collect

We collect information you provide directly to us, such as when you create an account, participate in focus groups, or contact us for support.

### Personal Information
- Name and email address
- Demographic information (age, location, interests)
- Profile information for participant matching
- Payment information for transactions

### Usage Information
- How you use our platform
- Campaign participation data
- Feedback and responses
- Device and browser information

## How We Use Your Information

We use the information we collect to:
- Provide and improve our services
- Match participants with relevant campaigns
- Process payments and transactions
- Communicate with you about our services
- Comply with legal obligations

## Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:
- To trusted service providers who help us operate our platform
- When required by law or to protect our rights
- In connection with a business transfer or acquisition

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account and data
- Opt out of marketing communications
- Data portability

## Contact Us

If you have questions about this Privacy Policy, please contact us at privacy@fokushub360.com.`,

      terms_of_service: `# Terms of Service

Last updated: ${new Date().toLocaleDateString()}

## Acceptance of Terms

By accessing and using FokusHub360, you accept and agree to be bound by these Terms of Service.

## Description of Service

FokusHub360 is a virtual focus group platform that connects businesses with participants for market research purposes.

## User Accounts

### Registration
- You must provide accurate information when creating an account
- You are responsible for maintaining the confidentiality of your account
- You must be at least 13 years old to use our service

### Account Types
- **Clients**: Create campaigns and receive research insights
- **Participants**: Join focus groups and provide feedback

## User Responsibilities

### General Conduct
- Use the platform lawfully and respectfully
- Do not share false or misleading information
- Respect other users' privacy and rights
- Do not attempt to circumvent platform security

### Clients
- Provide clear and accurate campaign descriptions
- Pay agreed fees in a timely manner
- Respect participant privacy and data rights

### Participants
- Provide honest and thoughtful feedback
- Complete campaigns you've accepted
- Maintain confidentiality of campaign materials

## Payment Terms

### Client Fees
- Campaign fees are due upon campaign creation
- Refunds are subject to our refund policy
- All fees are non-transferable

### Participant Payments
- Payments are processed after campaign completion
- Minimum payout thresholds apply
- Payment methods are subject to availability

## Intellectual Property

- You retain rights to content you submit
- You grant us license to use your content for platform operations
- We respect intellectual property rights of others

## Limitation of Liability

Our liability is limited to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages.

## Termination

We may suspend or terminate accounts that violate these terms. You may close your account at any time.

## Changes to Terms

We reserve the right to modify these terms. Users will be notified of significant changes.

## Governing Law

These terms are governed by the laws of [Your Jurisdiction].

## Contact Information

For questions about these Terms of Service, contact us at legal@fokushub360.com.`,

      data_rights: `# Your Data Rights

Last updated: ${new Date().toLocaleDateString()}

## Overview

At FokusHub360, we believe you should have control over your personal data. This document explains your rights and how to exercise them.

## Your Rights

### Right to Access
You have the right to know what personal data we have about you and how it's used.

**How to exercise:** Contact us at privacy@fokushub360.com or use the data download feature in your account settings.

### Right to Rectification
You have the right to correct inaccurate or incomplete personal data.

**How to exercise:** Update your profile information directly in your account or contact us for assistance.

### Right to Erasure (Right to be Forgotten)
You have the right to request deletion of your personal data under certain circumstances.

**How to exercise:** Use the account deletion feature or contact us. Note that some data may be retained for legal compliance.

### Right to Restrict Processing
You have the right to limit how we use your personal data in certain situations.

**How to exercise:** Contact us to discuss your specific situation and preferences.

### Right to Data Portability
You have the right to receive your personal data in a structured, commonly used format.

**How to exercise:** Use our data export feature or contact us for assistance.

### Right to Object
You have the right to object to certain types of data processing, including marketing.

**How to exercise:** Update your communication preferences or contact us.

### Rights Related to Automated Decision Making
You have rights regarding automated decision making, including our AI matching system.

**How to exercise:** Contact us to understand how automated decisions affect you.

## How to Exercise Your Rights

### Online
- Log into your account and visit Privacy Settings
- Use the data download or deletion tools
- Update your communication preferences

### By Email
Send your request to privacy@fokushub360.com including:
- Your full name and email address
- Specific right you want to exercise
- Any additional information to help us process your request

### Response Time
We will respond to your request within 30 days. Complex requests may take longer, and we'll inform you if additional time is needed.

## Identity Verification

To protect your privacy, we may need to verify your identity before processing certain requests.

## No Fee for Most Requests

Most requests are free. However, we may charge a reasonable fee for excessive or repetitive requests.

## Contact Information

**Data Protection Officer:** privacy@fokushub360.com  
**General Inquiries:** support@fokushub360.com  
**Legal Department:** legal@fokushub360.com

## Updates to This Document

We may update this document periodically. Check the "Last updated" date for the most recent version.`
    };

    return defaultContents[type as keyof typeof defaultContents] || '';
  };

  const hasUnsavedChanges = (type: string) => {
    const currentContent = getCurrentDoc(type)?.content ?? '';
    const editingContent = editingDocs[type] ?? '';
    return editingContent !== currentContent && editingContent !== '';
  };

  const documentTypes = [
    {
      id: 'privacy_policy',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect user data',
      icon: Shield,
      color: 'text-blue-600'
    },
    {
      id: 'terms_of_service',
      title: 'Terms of Service',
      description: 'Rules and conditions for using our platform',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      id: 'data_rights',
      title: 'Your Data Rights',
      description: 'User rights regarding their personal data',
      icon: Lock,
      color: 'text-purple-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Legal Documents</h2>
          <p className="text-gray-600">Edit your legal documents that users see during signup</p>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-gray-600">Changes are effective immediately</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            const hasChanges = hasUnsavedChanges(docType.id);
            
            return (
              <TabsTrigger key={docType.id} value={docType.id} className="relative">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${docType.color}`} />
                  <span>{docType.title}</span>
                  {hasChanges && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {documentTypes.map((docType) => {
          const Icon = docType.icon;
          const currentDoc = getCurrentDoc(docType.id);
          const hasChanges = hasUnsavedChanges(docType.id);
          
          return (
            <TabsContent key={docType.id} value={docType.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-50`}>
                        <Icon className={`h-5 w-5 ${docType.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{docType.title}</CardTitle>
                        <p className="text-sm text-gray-600">{docType.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasChanges && (
                        <Badge variant="secondary" className="text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Modified
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        v{currentDoc?.version || '1.0'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`content-${docType.id}`}>
                        Document Content
                      </Label>
                      <Textarea
                        id={`content-${docType.id}`}
                        placeholder={`Enter your ${docType.title.toLowerCase()} content here...`}
                        value={getDocumentContent(docType.id)}
                        onChange={(e) => handleContentChange(docType.id, e.target.value)}
                        rows={20}
                        className="min-h-96 font-mono text-sm"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {currentDoc?.updatedAt && (
                          <span>Last updated: {new Date(currentDoc.updatedAt).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const content = getDocumentContent(docType.id);
                            if (content) {
                              navigator.clipboard.writeText(content);
                              toast({
                                title: "Copied to Clipboard",
                                description: "Document content has been copied to your clipboard.",
                              });
                            }
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          onClick={() => handleSave(docType.id)}
                          disabled={updateDocumentMutation.isPending || !hasChanges}
                          className="gap-2"
                        >
                          {updateDocumentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Important Legal Notice</h4>
            <p className="text-sm text-blue-800 mt-1">
              These legal documents are binding agreements between you and your users. Consider consulting with a legal professional before making significant changes. Documents are displayed to users during the signup process and can be accessed from the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}