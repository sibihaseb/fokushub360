import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Menu, Eye, EyeOff, Settings, Type, Save } from "lucide-react";

interface MenuSection {
  enabled: boolean;
  visible: boolean;
  title: string;
}

interface MenuSettings {
  features: MenuSection;
  how_it_works: MenuSection;
  testimonials: MenuSection;
  pricing: MenuSection;
  auth: MenuSection;
  cta: MenuSection;
}

export function AdminMenuControl() {
  const [menuSettings, setMenuSettings] = useState<MenuSettings | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch menu settings
  const { data: fetchedSettings, isLoading } = useQuery<MenuSettings>({
    queryKey: ["/api/admin/menu-settings"],
    onSuccess: (data) => {
      setMenuSettings(data);
    }
  });

  // Update menu settings mutation
  const updateMenuMutation = useMutation({
    mutationFn: (settings: MenuSettings) => 
      apiRequest("/api/admin/menu-settings", "POST", settings),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Menu settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu settings",
        variant: "destructive",
      });
    },
  });

  // Initialize settings on first load
  if (!menuSettings && fetchedSettings) {
    setMenuSettings(fetchedSettings);
  }

  const handleSectionUpdate = (section: keyof MenuSettings, updates: Partial<MenuSection>) => {
    if (menuSettings) {
      setMenuSettings({
        ...menuSettings,
        [section]: { ...menuSettings[section], ...updates }
      });
    }
  };

  const handleSaveSettings = () => {
    if (menuSettings) {
      updateMenuMutation.mutate(menuSettings);
    }
  };

  const getStatusColor = (section: MenuSection) => {
    if (!section.enabled) return "bg-red-500";
    if (!section.visible) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = (section: MenuSection) => {
    if (!section.enabled) return "Disabled";
    if (!section.visible) return "Hidden";
    return "Active";
  };

  if (isLoading) {
    return <div className="text-white">Loading menu settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Menu className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Menu Control System</h2>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-slate-300">
          Control which sections appear on the landing page and customize their content.
        </p>
        <Button
          onClick={handleSaveSettings}
          disabled={updateMenuMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateMenuMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuSettings && Object.entries(menuSettings).map(([key, section]) => (
          <Card key={key} className="glass-effect border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white capitalize text-lg">
                  {key.replace('_', ' ')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(section)}`} />
                  <span className="text-xs text-slate-400">{getStatusText(section)}</span>
                </div>
              </div>
              <CardDescription className="text-slate-400">
                Configure the {key.replace('_', ' ')} section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${key}_title`} className="text-slate-200">Section Title</Label>
                <Input
                  id={`${key}_title`}
                  value={section.title}
                  onChange={(e) => handleSectionUpdate(key as keyof MenuSettings, { title: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Section title"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-white font-medium">Enable Section</p>
                    <p className="text-slate-400 text-xs">Turn section on/off</p>
                  </div>
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={(checked) => handleSectionUpdate(key as keyof MenuSettings, { enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-white font-medium">Visible</p>
                    <p className="text-slate-400 text-xs">Show in navigation</p>
                  </div>
                  <Switch
                    checked={section.visible}
                    onCheckedChange={(checked) => handleSectionUpdate(key as keyof MenuSettings, { visible: checked })}
                    disabled={!section.enabled}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-600">
                <div className="flex items-center gap-2 text-sm">
                  {section.enabled ? (
                    <Eye className="w-4 h-4 text-green-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-slate-300">
                    {section.enabled ? "Section is active" : "Section is disabled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-effect border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Menu Preview</CardTitle>
          <CardDescription className="text-slate-300">
            Preview how the menu will appear on the landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 p-4 rounded-lg">
            <div className="flex flex-wrap gap-4">
              {menuSettings && Object.entries(menuSettings).map(([key, section]) => (
                section.enabled && section.visible ? (
                  <div
                    key={key}
                    className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600"
                  >
                    <span className="text-white text-sm">{section.title}</span>
                  </div>
                ) : null
              ))}
            </div>
            {menuSettings && Object.values(menuSettings).every(section => !section.enabled || !section.visible) && (
              <p className="text-slate-400 text-center py-4">No menu items are currently visible</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => {
                if (menuSettings) {
                  const updatedSettings = { ...menuSettings };
                  Object.keys(updatedSettings).forEach(key => {
                    (updatedSettings as any)[key].enabled = true;
                    (updatedSettings as any)[key].visible = true;
                  });
                  setMenuSettings(updatedSettings);
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Enable All Sections
            </Button>
            <Button
              onClick={() => {
                if (menuSettings) {
                  const updatedSettings = { ...menuSettings };
                  Object.keys(updatedSettings).forEach(key => {
                    (updatedSettings as any)[key].enabled = false;
                    (updatedSettings as any)[key].visible = false;
                  });
                  setMenuSettings(updatedSettings);
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Disable All Sections
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menuSettings && Object.entries(menuSettings).map(([key, section]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(section)}`} />
                    <span className="text-sm text-slate-400">{getStatusText(section)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}