import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationHeader } from "@/components/navigation-header";
import { 
  Settings, 
  Clock, 
  Shield, 
  Users, 
  AlertTriangle,
  Save,
  RotateCcw,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Bell
} from "lucide-react";
import AdminSEOSettings from "@/components/admin-seo-settings";

interface AdminSetting {
  id: number;
  key: string;
  value: any;
  description: string;
  category: string;
  updatedBy: number;
  updatedAt: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSettings, setEditingSettings] = useState<{[key: string]: any}>({});

  const { data: settings, isLoading } = useQuery<AdminSetting[]>({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (data: { key: string; value: any; description?: string; category?: string }) => {
      const response = await apiRequest("PUT", `/api/admin/settings/${data.key}`, {
        value: data.value,
        description: data.description,
        category: data.category
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Setting updated successfully" });
      setEditingSettings({});
    },
    onError: (error) => {
      toast({ title: "Error updating setting", description: error.message, variant: "destructive" });
    },
  });

  const handleUpdateSetting = (key: string, value: any) => {
    const setting = settings?.find(s => s.key === key);
    if (setting) {
      updateSettingMutation.mutate({
        key,
        value,
        description: setting.description,
        category: setting.category
      });
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setEditingSettings(prev => ({ ...prev, [key]: value }));
  };

  const getValue = (key: string) => {
    const setting = settings?.find((s: AdminSetting) => s.key === key);
    return editingSettings[key] !== undefined ? editingSettings[key] : setting?.value;
  };

  const renderSettingControl = (setting: AdminSetting) => {
    const currentValue = getValue(setting.key);
    const isEditing = editingSettings[setting.key] !== undefined;

    switch (setting.key) {
      case 'default_response_deadline_hours':
        return (
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              value={currentValue || ''}
              onChange={(e) => handleInputChange(setting.key, parseInt(e.target.value))}
              className="w-20"
              min="1"
              max="168"
            />
            <span className="text-white/60 text-sm">hours</span>
          </div>
        );
      
      case 'max_warnings_before_ban':
        return (
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              value={currentValue || ''}
              onChange={(e) => handleInputChange(setting.key, parseInt(e.target.value))}
              className="w-20"
              min="1"
              max="10"
            />
            <span className="text-white/60 text-sm">warnings</span>
          </div>
        );
      
      case 'session_timeout_minutes':
        return (
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              value={currentValue || ''}
              onChange={(e) => handleInputChange(setting.key, parseInt(e.target.value))}
              className="w-20"
              min="15"
              max="1440"
            />
            <span className="text-white/60 text-sm">minutes</span>
          </div>
        );
      
      case 'auto_archive_campaigns_days':
        return (
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              value={currentValue || ''}
              onChange={(e) => handleInputChange(setting.key, parseInt(e.target.value))}
              className="w-20"
              min="1"
              max="365"
            />
            <span className="text-white/60 text-sm">days</span>
          </div>
        );
      
      case 'require_email_verification':
        return (
          <Switch
            checked={currentValue === 'true' || currentValue === true}
            onCheckedChange={(checked) => handleInputChange(setting.key, checked.toString())}
          />
        );
      
      default:
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="max-w-md"
          />
        );
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings?.filter((setting: AdminSetting) => setting.category === category) || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <NavigationHeader 
          title="Admin Settings"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin", href: "/admin" },
            { label: "Settings" }
          ]}
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <NavigationHeader 
        title="Admin Settings"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/admin" },
          { label: "Settings" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
          <p className="text-white/60">
            Configure system-wide settings for user sessions, campaigns, and platform behavior.
          </p>
        </div>

        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="session" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Session Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('session').map((setting: AdminSetting) => (
                  <div key={setting.id} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-white/60 text-sm">{setting.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {renderSettingControl(setting)}
                        <Button
                          onClick={() => handleUpdateSetting(setting.key, getValue(setting.key))}
                          disabled={updateSettingMutation.isPending}
                          size="sm"
                          className="btn-premium"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security & Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('security').map((setting: AdminSetting) => (
                  <div key={setting.id} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-white/60 text-sm">{setting.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {renderSettingControl(setting)}
                        <Button
                          onClick={() => handleUpdateSetting(setting.key, getValue(setting.key))}
                          disabled={updateSettingMutation.isPending}
                          size="sm"
                          className="btn-premium"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Campaign Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('campaigns').map((setting: AdminSetting) => (
                  <div key={setting.id} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-white/60 text-sm">{setting.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {renderSettingControl(setting)}
                        <Button
                          onClick={() => handleUpdateSetting(setting.key, getValue(setting.key))}
                          disabled={updateSettingMutation.isPending}
                          size="sm"
                          className="btn-premium"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>SEO Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminSEOSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Pricing Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    <h4 className="text-blue-400 font-medium">Dynamic Pricing System</h4>
                  </div>
                  <p className="text-white/70 text-sm">
                    Configure base pricing for campaigns, AI features, and premium services. Pricing is automatically adjusted based on demand and complexity.
                  </p>
                </div>
                
                {getSettingsByCategory('pricing').map((setting: AdminSetting) => (
                  <div key={setting.id} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-white/60 text-sm">{setting.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {renderSettingControl(setting)}
                        <Button
                          onClick={() => handleUpdateSetting(setting.key, getValue(setting.key))}
                          disabled={updateSettingMutation.isPending}
                          size="sm"
                          className="btn-premium"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="w-4 h-4 text-green-400" />
                    <h4 className="text-green-400 font-medium">Automated Notification System</h4>
                  </div>
                  <p className="text-white/70 text-sm">
                    Control frequency and timing of automated notifications to participants, including reminders, warnings, and campaign invitations.
                  </p>
                </div>
                
                {getSettingsByCategory('notifications').map((setting: AdminSetting) => (
                  <div key={setting.id} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-white/60 text-sm">{setting.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {renderSettingControl(setting)}
                        <Button
                          onClick={() => handleUpdateSetting(setting.key, getValue(setting.key))}
                          disabled={updateSettingMutation.isPending}
                          size="sm"
                          className="btn-premium"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>General Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('general').map((setting: AdminSetting) => (
                  <div key={setting.id} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-white/60 text-sm">{setting.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {renderSettingControl(setting)}
                        <Button
                          onClick={() => handleUpdateSetting(setting.key, getValue(setting.key))}
                          disabled={updateSettingMutation.isPending}
                          size="sm"
                          className="btn-premium"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Warning System Configuration */}
        <Card className="card-glass mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Warning System</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <h4 className="text-yellow-400 font-medium">Automatic Ban System</h4>
              </div>
              <p className="text-white/70 text-sm">
                Participants who don't respond to campaign invitations within the deadline will receive automatic warnings.
                After reaching the maximum warning count, they will be automatically banned from the platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Current Configuration</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>Response deadline: {getValue('default_response_deadline_hours') || 48} hours</li>
                  <li>Max warnings: {getValue('max_warnings_before_ban') || 3}</li>
                  <li>Session timeout: {getValue('session_timeout_minutes') || 60} minutes</li>
                  <li>Auto-archive: {getValue('auto_archive_campaigns_days') || 90} days</li>
                </ul>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">System Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Warning System</span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Auto-ban System</span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Email Verification</span>
                    <span className={`text-sm ${getValue('require_email_verification') === 'true' ? 'text-green-400' : 'text-red-400'}`}>
                      {getValue('require_email_verification') === 'true' ? 'Required' : 'Optional'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}