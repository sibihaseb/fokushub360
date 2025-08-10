import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Users, Clock, CheckCircle } from "lucide-react";

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preFilledData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export function InvitationModal({ isOpen, onClose, preFilledData }: InvitationModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Update form data when preFilledData changes or modal opens
  useEffect(() => {
    if (isOpen && preFilledData) {

      setFormData(prev => ({
        ...prev,
        firstName: preFilledData.firstName || "",
        lastName: preFilledData.lastName || "",
        email: preFilledData.email || ""
      }));
    }
  }, [isOpen, preFilledData]);

  const submitToWaitlist = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/invitation/waitlist", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll review your application and get back to you soon.",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields (First Name, Last Name, Email, Company).",
        variant: "destructive",
      });
      return;
    }

    submitToWaitlist.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || null,
      company: formData.company,
      message: formData.message || null,
      status: "pending"
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      message: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join Our Exclusive Platform
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 dark:text-slate-400 mt-2">
            FokusHub360 is currently accepting new clients by invitation only
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-6">
            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <Users className="h-8 w-8 text-blue-600 mx-auto" />
                  <CardTitle className="text-sm text-center">Premium Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-xs">
                    Get priority access to our advanced focus group platform
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <Mail className="h-8 w-8 text-purple-600 mx-auto" />
                  <CardTitle className="text-sm text-center">Direct Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-xs">
                    Work directly with our team for personalized setup
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <Clock className="h-8 w-8 text-green-600 mx-auto" />
                  <CardTitle className="text-sm text-center">Fast Track</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-xs">
                    Skip the waiting list and start immediately
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Application Form */}
            <Card className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Request Access</CardTitle>
                <CardDescription>
                  Fill out this form to join our waitlist. We'll review your application and send you an invitation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Your Company Inc."
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your research needs, team size, or any specific requirements..."
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={submitToWaitlist.isPending}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {submitToWaitlist.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Application Submitted!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Thank you for your interest in FokusHub360. We've received your application and will review it shortly.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                What happens next?
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• Our team will review your application and get back to you soon</li>
                <li>• You'll receive an email invitation if approved</li>
                <li>• The invitation will include your unique registration link</li>
              </ul>
            </div>

            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}