import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Mail,
  Shield,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  AlertTriangle,
  Settings as SettingsIcon,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  MapPin,
  Languages
} from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  campaignInvites: z.boolean(),
  weeklyDigest: z.boolean(),
  systemUpdates: z.boolean(),
  marketingEmails: z.boolean(),
});

const privacySchema = z.object({
  profileVisibility: z.enum(["public", "private", "limited"]),
  dataSharing: z.boolean(),
  analyticsTracking: z.boolean(),
  locationTracking: z.boolean(),
});

const accountSchema = z.object({
  timeZone: z.string(),
  language: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  emailFrequency: z.enum(["immediate", "daily", "weekly", "never"]),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;
type PrivacyFormData = z.infer<typeof privacySchema>;
type AccountFormData = z.infer<typeof accountSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("account");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["/api/user/settings"],
    enabled: !!user,
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      campaignInvites: true,
      weeklyDigest: false,
      systemUpdates: true,
      marketingEmails: false,
    },
  });

  const privacyForm = useForm<PrivacyFormData>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: "limited",
      dataSharing: true,
      analyticsTracking: true,
      locationTracking: false,
    },
  });

  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      timeZone: "America/New_York",
      language: "en",
      theme: "dark",
      emailFrequency: "daily",
    },
  });

  useEffect(() => {
    if (userSettings) {
      notificationForm.reset(userSettings.notifications || {});
      privacyForm.reset(userSettings.privacy || {});
      accountForm.reset(userSettings.account || {});
    }
  }, [userSettings, notificationForm, privacyForm, accountForm]);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await apiRequest("PUT", "/api/auth/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { type: string; settings: any }) => {
      const response = await apiRequest("PUT", "/api/user/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/user/account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      // Redirect to homepage after account deletion
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/export-data");
      return response.blob();
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'my-data-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Data exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const onNotificationSubmit = (data: NotificationFormData) => {
    updateSettingsMutation.mutate({ type: "notifications", settings: data });
  };

  const onPrivacySubmit = (data: PrivacyFormData) => {
    updateSettingsMutation.mutate({ type: "privacy", settings: data });
  };

  const onAccountSubmit = (data: AccountFormData) => {
    updateSettingsMutation.mutate({ type: "account", settings: data });
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
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 mb-8">
              <TabsTrigger value="account" className="text-slate-300 data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-slate-300 data-[state=active]:text-white">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-slate-300 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="security" className="text-slate-300 data-[state=active]:text-white">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    General Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeZone" className="text-slate-300">Time Zone</Label>
                        <Select
                          value={accountForm.watch("timeZone")}
                          onValueChange={(value) => accountForm.setValue("timeZone", value)}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="language" className="text-slate-300">Language</Label>
                        <Select
                          value={accountForm.watch("language")}
                          onValueChange={(value) => accountForm.setValue("language", value)}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="theme" className="text-slate-300">Theme</Label>
                        <Select
                          value={accountForm.watch("theme")}
                          onValueChange={(value) => accountForm.setValue("theme", value as "light" | "dark" | "system")}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4" />
                                Light
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <Moon className="w-4 h-4" />
                                Dark
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                System
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="emailFrequency" className="text-slate-300">Email Frequency</Label>
                        <Select
                          value={accountForm.watch("emailFrequency")}
                          onValueChange={(value) => accountForm.setValue("emailFrequency", value as "immediate" | "daily" | "weekly" | "never")}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="daily">Daily Digest</SelectItem>
                            <SelectItem value="weekly">Weekly Summary</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Email Notifications</Label>
                          <p className="text-sm text-slate-400">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notificationForm.watch("emailNotifications")}
                          onCheckedChange={(checked) => notificationForm.setValue("emailNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Push Notifications</Label>
                          <p className="text-sm text-slate-400">Receive browser push notifications</p>
                        </div>
                        <Switch
                          checked={notificationForm.watch("pushNotifications")}
                          onCheckedChange={(checked) => notificationForm.setValue("pushNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Campaign Invites</Label>
                          <p className="text-sm text-slate-400">Get notified about new campaign opportunities</p>
                        </div>
                        <Switch
                          checked={notificationForm.watch("campaignInvites")}
                          onCheckedChange={(checked) => notificationForm.setValue("campaignInvites", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Weekly Digest</Label>
                          <p className="text-sm text-slate-400">Receive weekly summary of your activity</p>
                        </div>
                        <Switch
                          checked={notificationForm.watch("weeklyDigest")}
                          onCheckedChange={(checked) => notificationForm.setValue("weeklyDigest", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">System Updates</Label>
                          <p className="text-sm text-slate-400">Important system and security updates</p>
                        </div>
                        <Switch
                          checked={notificationForm.watch("systemUpdates")}
                          onCheckedChange={(checked) => notificationForm.setValue("systemUpdates", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Marketing Emails</Label>
                          <p className="text-sm text-slate-400">Receive promotional emails and updates</p>
                        </div>
                        <Switch
                          checked={notificationForm.watch("marketingEmails")}
                          onCheckedChange={(checked) => notificationForm.setValue("marketingEmails", checked)}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Preferences"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Profile Visibility</Label>
                        <p className="text-sm text-slate-400 mb-2">Control who can see your profile information</p>
                        <Select
                          value={privacyForm.watch("profileVisibility")}
                          onValueChange={(value) => privacyForm.setValue("profileVisibility", value as "public" | "private" | "limited")}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public - Visible to everyone</SelectItem>
                            <SelectItem value="limited">Limited - Visible to campaign managers only</SelectItem>
                            <SelectItem value="private">Private - Visible to you only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Data Sharing</Label>
                          <p className="text-sm text-slate-400">Allow anonymous data sharing for research</p>
                        </div>
                        <Switch
                          checked={privacyForm.watch("dataSharing")}
                          onCheckedChange={(checked) => privacyForm.setValue("dataSharing", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Analytics Tracking</Label>
                          <p className="text-sm text-slate-400">Help improve the platform with usage analytics</p>
                        </div>
                        <Switch
                          checked={privacyForm.watch("analyticsTracking")}
                          onCheckedChange={(checked) => privacyForm.setValue("analyticsTracking", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Location Tracking</Label>
                          <p className="text-sm text-slate-400">Allow location-based campaign matching</p>
                        </div>
                        <Switch
                          checked={privacyForm.watch("locationTracking")}
                          onCheckedChange={(checked) => privacyForm.setValue("locationTracking", checked)}
                        />
                      </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Data Management</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          type="button"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          onClick={() => exportDataMutation.mutate()}
                          disabled={exportDataMutation.isPending}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {exportDataMutation.isPending ? "Exporting..." : "Export My Data"}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Privacy Settings"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Password & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordForm.register("currentPassword")}
                        className="bg-slate-800/50 border-slate-600 text-white"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...passwordForm.register("newPassword")}
                        className="bg-slate-800/50 border-slate-600 text-white"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register("confirmPassword")}
                        className="bg-slate-800/50 border-slate-600 text-white"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={changePasswordMutation.isPending}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                  </form>

                  <Separator className="bg-slate-600" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white text-red-400">Danger Zone</h3>
                    <div className="p-4 border border-red-600/50 rounded-lg bg-red-900/10">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-red-400 font-medium">Delete Account</h4>
                          <p className="text-slate-400 text-sm mt-1">
                            Once you delete your account, there is no going back. This will permanently delete your profile, data, and remove your access to all campaigns.
                          </p>
                          {!showDeleteConfirm ? (
                            <Button 
                              variant="destructive"
                              className="mt-3"
                              onClick={() => setShowDeleteConfirm(true)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </Button>
                          ) : (
                            <div className="mt-3 space-y-2">
                              <p className="text-red-400 text-sm font-medium">Are you absolutely sure?</p>
                              <div className="flex gap-2">
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteAccountMutation.mutate()}
                                  disabled={deleteAccountMutation.isPending}
                                >
                                  {deleteAccountMutation.isPending ? "Deleting..." : "Yes, Delete Forever"}
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowDeleteConfirm(false)}
                                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}