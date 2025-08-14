import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Home,
  ArrowRight,
  Camera,
  CreditCard,
  Phone
} from "lucide-react";

export default function Verification() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{
    phoneNumber: string;
    idDocument: File | null;
    selfie: File | null;
    address: string;
    additionalInfo: string;
    idDocumentUrl?: string; // Store Wasabi URL or ID for idDocument
    selfieUrl?: string; // Store Wasabi URL or ID for selfie
  }>({
    phoneNumber: "",
    idDocument: null,
    selfie: null,
    address: "",
    additionalInfo: "",
  });

  const handleFileUpload = async (file: File, type: 'idDocument' | 'selfie') => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, JPEG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Upload file to backend
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('file', file);
      formDataToSubmit.append('type', type === 'idDocument' ? 'identity' : 'other');

      const token = localStorage.getItem("fokushub_token");
      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        body: formDataToSubmit,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }

      const result = await response.json();
      setFormData(prev => ({
        ...prev,
        [type]: file,
        [`${type}Url`]: result.wasabiUrl || result.id, // Store URL or ID from backend
      }));

      toast({
        title: `${type === 'idDocument' ? 'ID Document' : 'Selfie'} Uploaded`,
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) uploaded successfully.`,
      });

      console.log(`File uploaded: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}, Wasabi URL: ${result.wasabiUrl}`);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit non-file data or complete verification
      try {
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('phoneNumber', formData.phoneNumber);
        formDataToSubmit.append('address', formData.address);
        formDataToSubmit.append('additionalInfo', formData.additionalInfo);
        if (formData.idDocumentUrl) {
          formDataToSubmit.append('idDocumentUrl', formData.idDocumentUrl);
        }
        if (formData.selfieUrl) {
          formDataToSubmit.append('selfieUrl', formData.selfieUrl);
        }

        const token = localStorage.getItem("fokushub_token");
        const response = await fetch('/api/verification/submit', {
          method: 'POST',
          body: formDataToSubmit,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          toast({
            title: "Verification Submitted",
            description: "Your verification documents have been submitted for review. We'll notify you within 24-48 hours.",
          });
          setLocation("/dashboard");
        } else {
          const error = await response.json();
          throw new Error(error.message || "Failed to submit verification");
        }
      } catch (error) {
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit verification. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSkip = () => {
    setLocation("/dashboard");
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="outline"
              className="glass-effect text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Badge variant="outline" className="text-emerald-400 border-emerald-400">
              Step {step} of 3
            </Badge>
          </div>

          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-slate-300">Help us verify your identity to participate in focus groups</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-slate-400 mt-2">
            <span>Phone</span>
            <span>DocumentsOLED

System: Documents</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="glass-effect border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              {step === 1 && <><Phone className="w-5 h-5 mr-2" /> Phone Verification</>}
              {step === 2 && <><Upload className="w-5 h-5 mr-2" /> Document Upload</>}
              {step === 3 && <><CheckCircle className="w-5 h-5 mr-2" /> Review & Submit</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    We need to verify your phone number to ensure you're a real person and can receive campaign notifications.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-200 text-sm">
                    Please upload a government-issued photo ID (driver's license, passport, etc.) and a selfie for verification.
                  </p>
                  <p className="text-amber-200 text-xs mt-2">
                    Accepted formats: JPG, PNG, GIF, WEBP • Max size: 10MB
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Government ID</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${formData.idDocument
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                        }`}
                      onClick={() => document.getElementById('idUpload')?.click()}
                    >
                      <CreditCard className={`w-8 h-8 mx-auto mb-2 ${formData.idDocument ? 'text-emerald-400' : 'text-slate-400'
                        }`} />
                      <p className={`text-sm ${formData.idDocument ? 'text-emerald-300' : 'text-slate-400'
                        }`}>
                        {formData.idDocument ? `✓ Uploaded: ${formData.idDocument.name}` : 'Click to upload ID'}
                      </p>
                      {formData.idDocument && (
                        <p className="text-xs text-emerald-400 mt-1">
                          {(formData.idDocument.size / 1024 / 1024).toFixed(2)}MB
                        </p>
                      )}
                      <input
                        id="idUpload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'idDocument');
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Selfie</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${formData.selfie
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                        }`}
                      onClick={() => document.getElementById('selfieUpload')?.click()}
                    >
                      <Camera className={`w-8 h-8 mx-auto mb-2 ${formData.selfie ? 'text-emerald-400' : 'text-slate-400'
                        }`} />
                      <p className={`text-sm ${formData.selfie ? 'text-emerald-300' : 'text-slate-400'
                        }`}>
                        {formData.selfie ? `✓ Uploaded: ${formData.selfie.name}` : 'Click to take selfie'}
                      </p>
                      {formData.selfie && (
                        <p className="text-xs text-emerald-400 mt-1">
                          {(formData.selfie.size / 1024 / 1024).toFixed(2)}MB
                        </p>
                      )}
                      <input
                        id="selfieUpload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        capture="user"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'selfie');
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Address (Optional)</Label>
                  <Textarea
                    id="address"
                    placeholder="Your current address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-emerald-200 text-sm">
                    Please review your information before submitting. Our team will review your verification within 24-48 hours.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">Phone Number</span>
                    <span className="text-white">{formData.phoneNumber || "Not provided"}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">Government ID</span>
                    <span className="text-white">{formData.idDocumentUrl ? "Uploaded" : "Not uploaded"}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">Selfie</span>
                    <span className="text-white">{formData.selfieUrl ? "Uploaded" : "Not uploaded"}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">Address</span>
                    <span className="text-white">{formData.address || "Not provided"}</span>
                  </div>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">What happens next?</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Our team will review your documents</li>
                    <li>• You'll receive an email notification with the result</li>
                    <li>• Once verified, you can participate in focus groups</li>
                    <li>• Verification typically takes 24-48 hours</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="glass-effect text-white hover:bg-white/10"
          >
            Skip for Now
          </Button>

          <Button
            onClick={handleNext}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={step === 3 && (!formData.idDocumentUrl || !formData.selfieUrl)}
          >
            {step === 3 ? "Submit for Review" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}