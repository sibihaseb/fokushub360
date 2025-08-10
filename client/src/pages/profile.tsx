import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  Save,
  Edit,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Settings,
  Bell,
  Lock,
  Globe,
  Heart,
  TrendingUp,
  Target,
  Award,
  Star,
  CreditCard,
  DollarSign
} from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female"]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  occupation: z.string().optional(),
  industry: z.string().optional(),
  education: z.string().optional(),
  interests: z.string().optional(),
  bio: z.string().optional(),
  // Payment methods
  zelleEmail: z.string().optional(),
  zellePhone: z.string().optional(),
  cashAppUsername: z.string().optional(),
  paypalEmail: z.string().optional(),
  checkAddress: z.string().optional(),
  payoneerEmail: z.string().optional(),
  westernUnionName: z.string().optional(),
  westernUnionPhone: z.string().optional(),
  venmoUsername: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
  participantProfile?: {
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    occupation?: string;
    industry?: string;
    education?: string;
    interests?: string;
    bio?: string;
    completionScore?: number;
    paymentMethods?: {
      zelleEmail?: string;
      zellePhone?: string;
      cashAppUsername?: string;
      paypalEmail?: string;
      checkAddress?: string;
      payoneerEmail?: string;
      westernUnionName?: string;
      westernUnionPhone?: string;
      venmoUsername?: string;
    };
    isProfileComplete?: boolean;
  };
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  console.log("User:", user);
  console.log("Profile loading state:", { isLoading, profile, error });
  if (error) {
    console.error("Profile API error:", error);
  }

  const { data: verificationStatus } = useQuery({
    queryKey: ["/api/verification/status"],
    enabled: !!user && user.role === "participant",
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: undefined,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      occupation: "",
      industry: "",
      education: "",
      interests: "",
      bio: "",
    },
  });

  useEffect(() => {
    // If profile data is available, use it
    if (profile) {
      console.log("Profile data loaded:", profile);
      const formData = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dateOfBirth: profile.participantProfile?.dateOfBirth || "",
        gender: profile.participantProfile?.gender as "Male" | "Female" | undefined,
        address: profile.participantProfile?.address || "",
        city: profile.participantProfile?.city || "",
        state: profile.participantProfile?.state || "",
        zipCode: profile.participantProfile?.zipCode || "",
        country: profile.participantProfile?.country || "",
        occupation: profile.participantProfile?.occupation || "",
        industry: profile.participantProfile?.industry || "",
        education: profile.participantProfile?.education || "",
        interests: profile.participantProfile?.interests || "",
        bio: profile.participantProfile?.bio || "",
        // Payment methods
        zelleEmail: profile.participantProfile?.paymentMethods?.zelleEmail || "",
        zellePhone: profile.participantProfile?.paymentMethods?.zellePhone || "",
        cashAppUsername: profile.participantProfile?.paymentMethods?.cashAppUsername || "",
        paypalEmail: profile.participantProfile?.paymentMethods?.paypalEmail || "",
        checkAddress: profile.participantProfile?.paymentMethods?.checkAddress || "",
        payoneerEmail: profile.participantProfile?.paymentMethods?.payoneerEmail || "",
        westernUnionName: profile.participantProfile?.paymentMethods?.westernUnionName || "",
        westernUnionPhone: profile.participantProfile?.paymentMethods?.westernUnionPhone || "",
        venmoUsername: profile.participantProfile?.paymentMethods?.venmoUsername || "",
      };
      console.log("Form data being set:", formData);
      form.reset(formData);
    } 
    // Fallback: if profile API fails but we have user data, populate basic fields
    else if (user && !isLoading) {
      console.log("Profile failed, using user data fallback:", user);
      const basicFormData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        dateOfBirth: "",
        gender: undefined,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        occupation: "",
        industry: "",
        education: "",
        interests: "",
        bio: "",
        // Payment methods
        zelleEmail: "",
        zellePhone: "",
        cashAppUsername: "",
        paypalEmail: "",
        checkAddress: "",
        payoneerEmail: "",
        westernUnionName: "",
        westernUnionPhone: "",
        venmoUsername: "",
      };
      console.log("Setting basic form data:", basicFormData);
      form.reset(basicFormData);
    }
  }, [profile, user, isLoading, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-white border-white/20 bg-transparent"><Shield className="w-3 h-3 mr-1" />Not Verified</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationHeader />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={updateProfileMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            <Card className="lg:col-span-1 bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-white">
                  {profile?.firstName} {profile?.lastName}
                </CardTitle>
                <p className="text-slate-400 text-sm capitalize">{profile?.role}</p>
                <div className="flex justify-center mt-2">
                  {getVerificationStatusBadge(profile?.verificationStatus || "not_verified")}
                </div>
                {profile?.verificationStatus !== "verified" && profile?.role === "participant" && (
                  <Button 
                    onClick={() => {
                      // Check if verification is actually submitted (has documents)
                      const hasSubmittedDocuments = (verificationStatus as any)?.documents?.length > 0;
                      if (!hasSubmittedDocuments || user?.role === 'admin' || user?.role === 'manager') {
                        window.location.href = "/verification";
                      }
                    }}
                    disabled={(verificationStatus as any)?.documents?.length > 0 && user?.role !== 'admin' && user?.role !== 'manager'}
                    className={`mt-3 text-white ${(verificationStatus as any)?.documents?.length > 0 && user?.role !== 'admin' && user?.role !== 'manager' 
                      ? 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'}`}
                    size="sm"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    {(verificationStatus as any)?.documents?.length > 0 && user?.role !== 'admin' && user?.role !== 'manager'
                      ? 'Verification Submitted'
                      : 'Get Verified Now'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </span>
                </div>
                {profile?.participantProfile && (
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">Profile Completion</span>
                      <span className="text-sm text-slate-400">
                        {profile.participantProfile.completionScore || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${profile.participantProfile.completionScore || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                    <TabsTrigger value="personal" className="text-slate-300 data-[state=active]:text-black data-[state=active]:bg-white/90">
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="location" className="text-slate-300 data-[state=active]:text-black data-[state=active]:bg-white/90">
                      Location
                    </TabsTrigger>
                    <TabsTrigger value="professional" className="text-slate-300 data-[state=active]:text-black data-[state=active]:bg-white/90">
                      Professional
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="text-slate-300 data-[state=active]:text-black data-[state=active]:bg-white/90">
                      Payment
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                        <Input
                          id="firstName"
                          {...form.register("firstName")}
                          disabled={!isEditing}
                          style={{
                            backgroundColor: 'rgb(30 41 59) !important',
                            borderColor: 'rgb(100 116 139) !important',
                            color: 'white !important',
                            opacity: '1 !important'
                          }}
                          className="text-white"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-red-400 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                        <Input
                          id="lastName"
                          {...form.register("lastName")}
                          disabled={!isEditing}
                          style={{
                            backgroundColor: 'rgb(30 41 59) !important',
                            borderColor: 'rgb(100 116 139) !important',
                            color: 'white !important',
                            opacity: '1 !important'
                          }}
                          className="text-white"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-red-400 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-slate-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        disabled={!isEditing}
                        style={{
                          backgroundColor: 'rgb(30 41 59) !important',
                          borderColor: 'rgb(100 116 139) !important',
                          color: 'white !important',
                          opacity: '1 !important'
                        }}
                        className="text-white"
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-slate-300">Phone</Label>
                        <Input
                          id="phone"
                          {...form.register("phone")}
                          disabled={!isEditing}
                          style={{
                            backgroundColor: 'rgb(30 41 59) !important',
                            borderColor: 'rgb(100 116 139) !important',
                            color: 'white !important',
                            opacity: '1 !important'
                          }}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth" className="text-slate-300">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...form.register("dateOfBirth")}
                          disabled={!isEditing}
                          style={{
                            backgroundColor: 'rgb(30 41 59) !important',
                            borderColor: 'rgb(100 116 139) !important',
                            color: 'white !important',
                            opacity: '1 !important'
                          }}
                          className="text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="gender" className="text-slate-300">Gender</Label>
                      <Select
                        value={form.watch("gender") || ""}
                        onValueChange={(value) => form.setValue("gender", value as "Male" | "Female")}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-slate-700/80 border-slate-500 text-white">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-slate-300">Bio</Label>
                      <Textarea
                        id="bio"
                        {...form.register("bio")}
                        disabled={!isEditing}
                        rows={3}
                        className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="address" className="text-slate-300">Address</Label>
                      <Input
                        id="address"
                        {...form.register("address")}
                        disabled={!isEditing}
                        className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-slate-300">City</Label>
                        <Input
                          id="city"
                          {...form.register("city")}
                          disabled={!isEditing}
                          className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-slate-300">State</Label>
                        <Input
                          id="state"
                          {...form.register("state")}
                          disabled={!isEditing}
                          className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode" className="text-slate-300">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          {...form.register("zipCode")}
                          disabled={!isEditing}
                          className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-slate-300">Country</Label>
                        <Input
                          id="country"
                          {...form.register("country")}
                          disabled={!isEditing}
                          className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="professional" className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="occupation" className="text-slate-300">Occupation</Label>
                      <Input
                        id="occupation"
                        {...form.register("occupation")}
                        disabled={!isEditing}
                        className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="industry" className="text-slate-300">Industry</Label>
                      <Input
                        id="industry"
                        {...form.register("industry")}
                        disabled={!isEditing}
                        className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="education" className="text-slate-300">Education</Label>
                      <Input
                        id="education"
                        {...form.register("education")}
                        disabled={!isEditing}
                        className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="interests" className="text-slate-300">Interests</Label>
                      <Textarea
                        id="interests"
                        {...form.register("interests")}
                        disabled={!isEditing}
                        rows={3}
                        className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                        placeholder="Your interests and hobbies..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="payment" className="space-y-6 mt-6">
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-600/30">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-6">
                        Add your preferred payment methods to receive earnings from focus group participation.
                        You can add multiple methods - we'll use your preferred option for payments.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Zelle */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-blue-400" />
                            <h4 className="font-medium text-white">Zelle</h4>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="zelleEmail" className="text-slate-300 text-sm">Zelle Email</Label>
                              <Input
                                id="zelleEmail"
                                type="email"
                                {...form.register("zelleEmail")}
                                disabled={!isEditing}
                                placeholder="your-email@example.com"
                                className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                              />
                            </div>
                            <div>
                              <Label htmlFor="zellePhone" className="text-slate-300 text-sm">Zelle Phone</Label>
                              <Input
                                id="zellePhone"
                                type="tel"
                                {...form.register("zellePhone")}
                                disabled={!isEditing}
                                placeholder="(555) 123-4567"
                                className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>
                        </div>

                        {/* CashApp */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <h4 className="font-medium text-white">CashApp</h4>
                          </div>
                          <div>
                            <Label htmlFor="cashAppUsername" className="text-slate-300 text-sm">CashApp Username</Label>
                            <Input
                              id="cashAppUsername"
                              {...form.register("cashAppUsername")}
                              disabled={!isEditing}
                              placeholder="$username"
                              className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* PayPal */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-blue-500" />
                            <h4 className="font-medium text-white">PayPal</h4>
                          </div>
                          <div>
                            <Label htmlFor="paypalEmail" className="text-slate-300 text-sm">PayPal Email</Label>
                            <Input
                              id="paypalEmail"
                              type="email"
                              {...form.register("paypalEmail")}
                              disabled={!isEditing}
                              placeholder="your-paypal@example.com"
                              className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Venmo */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-cyan-400" />
                            <h4 className="font-medium text-white">Venmo</h4>
                          </div>
                          <div>
                            <Label htmlFor="venmoUsername" className="text-slate-300 text-sm">Venmo Username</Label>
                            <Input
                              id="venmoUsername"
                              {...form.register("venmoUsername")}
                              disabled={!isEditing}
                              placeholder="@username"
                              className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Payoneer */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-orange-400" />
                            <h4 className="font-medium text-white">Payoneer</h4>
                          </div>
                          <div>
                            <Label htmlFor="payoneerEmail" className="text-slate-300 text-sm">Payoneer Email</Label>
                            <Input
                              id="payoneerEmail"
                              type="email"
                              {...form.register("payoneerEmail")}
                              disabled={!isEditing}
                              placeholder="your-payoneer@example.com"
                              className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Western Union */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            <h4 className="font-medium text-white">Western Union</h4>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="westernUnionName" className="text-slate-300 text-sm">Full Name</Label>
                              <Input
                                id="westernUnionName"
                                {...form.register("westernUnionName")}
                                disabled={!isEditing}
                                placeholder="Full legal name"
                                className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                              />
                            </div>
                            <div>
                              <Label htmlFor="westernUnionPhone" className="text-slate-300 text-sm">Phone Number</Label>
                              <Input
                                id="westernUnionPhone"
                                type="tel"
                                {...form.register("westernUnionPhone")}
                                disabled={!isEditing}
                                placeholder="(555) 123-4567"
                                className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Check Payment */}
                      <div className="mt-6 pt-6 border-t border-slate-600/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <h4 className="font-medium text-white">Check by Mail</h4>
                        </div>
                        <div>
                          <Label htmlFor="checkAddress" className="text-slate-300 text-sm">Mailing Address</Label>
                          <Textarea
                            id="checkAddress"
                            {...form.register("checkAddress")}
                            disabled={!isEditing}
                            rows={3}
                            placeholder="Full mailing address for check delivery..."
                            className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <h5 className="text-white font-medium">Payment Information</h5>
                            <p className="text-blue-200 text-sm mt-1">
                              You can fill out multiple payment methods. When you earn money from focus groups, 
                              we'll contact you to confirm your preferred payment method for each transaction.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}