import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CircleUser, Eye, EyeOff, Shield, FileText } from "lucide-react";
import { InvitationModal } from "@/components/invitation-modal";
import { LegalDocumentsModal } from "@/components/legal-documents-modal";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { signUp, isSigningUp } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'gdpr_rights'>('terms');
  const [legalAgreements, setLegalAgreements] = useState({
    terms: false,
    privacy: false,
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "",
  });

  // Get role from URL params if present
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get("role");
    if (roleParam && ["client", "participant"].includes(roleParam)) {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role) {
      toast({
        title: "Account type required",
        description: "Please select whether you're a Client or Participant to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!legalAgreements.terms || !legalAgreements.privacy) {
      toast({
        title: "Legal agreements required",
        description: "You must agree to our Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signUp(formData);
      toast({
        title: "Account created!",
        description: "Welcome to FokusHub360. Your account has been created successfully.",
      });
      
      // Redirect based on role
      if (formData.role === "participant") {
        setLocation("/onboarding");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      // Handle signup error (removed console.log for production)
      
      // Check if it's an invitation-only error
      if (error.invitationOnly === true) {
        // Opening invitation modal
        setShowInvitationModal(true);
        return;
      }
      
      toast({
        title: "Sign up failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-lg flex items-center justify-center">
              <CircleUser className="text-white h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-bold">Join FokusHub360</CardTitle>
          <CardDescription>
            Create your account and start getting valuable feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold">Account Type *</Label>
              <p className="text-xs text-gray-600 mb-2">Choose the type of account you need:</p>
              <Select value={formData.role} onValueChange={handleRoleChange} required>
                <SelectTrigger className={`${!formData.role ? 'border-amber-500' : ''} h-auto min-h-[44px]`}>
                  <SelectValue placeholder="⚠️ Please select your account type">
                    {formData.role === 'client' && (
                      <div className="flex flex-col items-start py-1">
                        <div className="font-medium">Client</div>
                        <div className="text-xs text-gray-500">Create and manage focus groups</div>
                      </div>
                    )}
                    {formData.role === 'participant' && (
                      <div className="flex flex-col items-start py-1">
                        <div className="font-medium">Participant</div>
                        <div className="text-xs text-gray-500">Join focus groups and provide feedback</div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">
                    <div className="flex flex-col items-start py-1">
                      <div className="font-medium">Client</div>
                      <div className="text-xs text-gray-500">Create and manage focus groups</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="participant">
                    <div className="flex flex-col items-start py-1">
                      <div className="font-medium">Participant</div>
                      <div className="text-xs text-gray-500">Join focus groups and provide feedback</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {!formData.role && (
                <p className="text-xs text-amber-600 mt-1">
                  You must select an account type to continue
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Legal Agreements Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-sm">Legal Agreements</h3>
              </div>
              <p className="text-xs text-gray-600">
                By creating an account, you must agree to our legal documents:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={legalAgreements.terms}
                    onCheckedChange={(checked) => 
                      setLegalAgreements(prev => ({ ...prev, terms: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setLegalModalTab('terms');
                          setShowLegalModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        Terms of Service
                      </button>
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={legalAgreements.privacy}
                    onCheckedChange={(checked) => 
                      setLegalAgreements(prev => ({ ...prev, privacy: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="privacy" className="text-sm cursor-pointer">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setLegalModalTab('privacy');
                          setShowLegalModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        Privacy Policy
                      </button>
                    </Label>
                  </div>
                </div>
              </div>
              
              {(!legalAgreements.terms || !legalAgreements.privacy) && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <FileText className="w-4 h-4" />
                  <p className="text-xs">
                    You must agree to both documents to create your account
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full ${
                !formData.role || !legalAgreements.terms || !legalAgreements.privacy
                  ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
              disabled={isSigningUp || !formData.role || !legalAgreements.terms || !legalAgreements.privacy}
            >
              {isSigningUp ? "Creating account..." : 
               !formData.role ? "Select Account Type First" :
               (!legalAgreements.terms || !legalAgreements.privacy) ? "Agree to Legal Terms" :
               "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/sign-in" className="text-emerald-500 hover:text-emerald-600 font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <InvitationModal
        isOpen={showInvitationModal}
        onClose={() => setShowInvitationModal(false)}
        preFilledData={{
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        }}
      />
      
      <LegalDocumentsModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalModalTab}
        showAcceptButton={false}
      />
    </div>
  );
}
