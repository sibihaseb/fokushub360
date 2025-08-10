import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, Download, Edit, Trash2, Eye, UserCheck, 
  Info, Mail, Phone, Clock, CheckCircle, AlertTriangle,
  FileText, Database, Settings, Lock, LogOut
} from "lucide-react";

export function DataRightsPage() {
  const [requestType, setRequestType] = useState<string>('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/legal/data-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: requestType,
          email,
          description,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        toast({
          title: "Request Submitted",
          description: "Your data rights request has been submitted successfully. We'll respond within 30 days.",
        });
        setRequestType('');
        setEmail('');
        setDescription('');
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dataRights = [
    {
      title: "Right to Access",
      description: "Request a copy of all personal data we hold about you",
      icon: Eye,
      action: "access"
    },
    {
      title: "Right to Rectification",
      description: "Correct inaccurate or incomplete personal data",
      icon: Edit,
      action: "rectification"
    },
    {
      title: "Right to Erasure",
      description: "Request deletion of your personal data ('right to be forgotten')",
      icon: Trash2,
      action: "erasure"
    },
    {
      title: "Right to Restrict Processing",
      description: "Limit how we process your personal data",
      icon: Lock,
      action: "restriction"
    },
    {
      title: "Right to Data Portability",
      description: "Receive your data in a structured, machine-readable format",
      icon: Download,
      action: "portability"
    },
    {
      title: "Right to Object",
      description: "Object to processing based on legitimate interests",
      icon: Shield,
      action: "objection"
    }
  ];

  const contactInfo = [
    {
      label: "Data Protection Officer",
      value: "dpo@fokushub360.com",
      icon: Mail
    },
    {
      label: "Privacy Team",
      value: "privacy@fokushub360.com",
      icon: Mail
    },
    {
      label: "Response Time",
      value: "Within 30 days",
      icon: Clock
    },
    {
      label: "Phone Support",
      value: "+1 (555) 123-4567",
      icon: Phone
    }
  ];

  const dataCategories = [
    {
      title: "Account Information",
      items: ["Name, email, phone number", "Account settings and preferences", "Login history and IP addresses"]
    },
    {
      title: "Profile Data",
      items: ["Demographics and personal characteristics", "Interests and preferences", "Behavioral patterns and tags"]
    },
    {
      title: "Campaign Data",
      items: ["Survey responses and feedback", "Campaign participation history", "Ratings and quality scores"]
    },
    {
      title: "Communication Data",
      items: ["Messages and notifications", "Email preferences", "Support interactions"]
    },
    {
      title: "Technical Data",
      items: ["Device information and browser data", "Usage analytics and session data", "Performance metrics"]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Shield className="w-8 h-8" />
          Your Data Rights
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Under GDPR and other privacy laws, you have important rights regarding your personal data. 
          Learn about your rights and how to exercise them.
        </p>
      </div>

      {/* Data Rights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataRights.map((right, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <right.icon className="w-5 h-5" />
                {right.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{right.description}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRequestType(right.action)}
                className="w-full"
              >
                Request This Right
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data We Collect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data We Collect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-sm">{category.title}</h4>
                <ul className="space-y-1">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submit a Data Rights Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="request-type">Request Type</Label>
                <select
                  id="request-type"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                >
                  <option value="">Select a request type</option>
                  <option value="access">Access - Get my data</option>
                  <option value="rectification">Rectification - Correct my data</option>
                  <option value="erasure">Erasure - Delete my data</option>
                  <option value="restriction">Restriction - Limit processing</option>
                  <option value="portability">Portability - Export my data</option>
                  <option value="objection">Objection - Stop processing</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide additional details about your request..."
                rows={4}
              />
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                We'll verify your identity before processing your request. You'll receive a confirmation email 
                and we'll respond within 30 days as required by law.
              </AlertDescription>
            </Alert>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Our Privacy Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactInfo.map((contact, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <contact.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{contact.label}</p>
                  <p className="text-sm text-muted-foreground">{contact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Your Rights Are Protected
              </h4>
              <p className="text-sm text-muted-foreground">
                These rights are guaranteed under GDPR, CCPA, and other privacy laws. 
                We're committed to honoring your requests promptly and completely.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Identity Verification
              </h4>
              <p className="text-sm text-muted-foreground">
                We may need to verify your identity before processing requests to protect 
                your privacy and prevent unauthorized access.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Response Timeline
              </h4>
              <p className="text-sm text-muted-foreground">
                We'll acknowledge your request within 72 hours and provide a full response 
                within 30 days as required by law.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <LogOut className="w-4 h-4 text-red-600" />
                Account Deletion
              </h4>
              <p className="text-sm text-muted-foreground">
                If you request account deletion, we'll permanently remove your data while 
                retaining only what's legally required for business purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}