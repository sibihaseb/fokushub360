import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Settings, Users, CreditCard, Building2, Calculator } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FeeBreakdown } from "./fee-breakdown";

interface GlobalFeeSettings {
  processingFeePercentage: number;
  platformFeeAmount: number;
  platformFeePercentage: number;
}

interface UserFeeSettings {
  userId: number;
  processingFeePercentage: number;
  platformFeeAmount: number;
  platformFeePercentage: number;
  customFeesEnabled: boolean;
}

export function AdminFeeManagement() {
  console.log("AdminFeeManagement component rendered");
  const { toast } = useToast();
  const [globalSettings, setGlobalSettings] = useState<GlobalFeeSettings>({
    processingFeePercentage: 3.50,
    platformFeeAmount: 0.00,
    platformFeePercentage: 0.00
  });
  
  const [testAmount, setTestAmount] = useState<number>(100);

  // Get global fee settings
  const { data: currentGlobalSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/fees/global"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/fees/global");
      const data = await response.json() as GlobalFeeSettings;
      // Update local state with current settings
      setGlobalSettings(data);
      return data;
    },
  });

  // Update global fee settings mutation
  const updateGlobalSettingsMutation = useMutation({
    mutationFn: async (settings: GlobalFeeSettings) => {
      const response = await apiRequest("POST", "/api/admin/fees/global", settings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Global fee settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fees/global"] });
    },
    onError: (error: any) => {
      console.error("Failed to save fee settings:", error);
      toast({
        title: "Error",
        description: "Failed to update global fee settings.",
        variant: "destructive",
      });
    },
  });

  const handleGlobalSettingsUpdate = () => {
    console.log("Saving global settings:", globalSettings);
    alert("Button clicked! Check console for details.");
    updateGlobalSettingsMutation.mutate(globalSettings);
  };

  const testClick = () => {
    console.log("Direct test click worked!");
    alert("Direct test click worked!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    console.log("Fee management loading...");
    return (
      <Card className="bg-[#170c42]">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("About to render fee management, globalSettings:", globalSettings);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-green-500/20 border border-green-500/30">
          <DollarSign className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Fee Management</h2>
          <p className="text-white/60 text-sm">Configure global and user-specific fee structures</p>
        </div>
      </div>
      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/5">
          <TabsTrigger value="global" className="text-white data-[state=active]:bg-blue-500/20 data-[state=active]:text-white hover:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="calculator" className="text-white data-[state=active]:bg-purple-500/20 data-[state=active]:text-white hover:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            Fee Calculator
          </TabsTrigger>
          <TabsTrigger value="users" className="text-white data-[state=active]:bg-orange-500/20 data-[state=active]:text-white hover:text-white">
            <Users className="w-4 h-4 mr-2" />
            User-Specific Fees
          </TabsTrigger>
        </TabsList>

        {/* Global Settings Tab */}
        <TabsContent value="global" className="space-y-6">
          <Card className="bg-[#170c42]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Global Fee Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Processing Fee */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-400" />
                  <Label className="text-[#ffffff] font-medium">Processing Fee (%)</Label>
                  <Badge variant="outline" className="text-red-400 border-red-400 bg-red-400/10">
                    Applied to all payments
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={globalSettings.processingFeePercentage}
                    onChange={(e) => setGlobalSettings(prev => ({
                      ...prev,
                      processingFeePercentage: parseFloat(e.target.value) || 0
                    }))}
                    className="max-w-32 bg-white/10 border-white/20 text-white"
                  />
                  <span className="text-sm font-medium text-[#ffffff]">
                    Current: {globalSettings.processingFeePercentage}% 
                    (${formatCurrency(testAmount * globalSettings.processingFeePercentage / 100)} on ${testAmount})
                  </span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Platform Fee - Fixed Amount */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-400" />
                  <Label className="text-[#ffffff] font-medium">Platform Fee - Fixed Amount ($)</Label>
                  <Badge variant="outline" className="text-orange-400 border-orange-400 bg-orange-400/10">
                    Flat fee per transaction
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={globalSettings.platformFeeAmount}
                    onChange={(e) => setGlobalSettings(prev => ({
                      ...prev,
                      platformFeeAmount: parseFloat(e.target.value) || 0
                    }))}
                    className="max-w-32 bg-white/10 border-white/20 text-white"
                  />
                  <span className="text-sm font-medium text-[#ffffff]">
                    Current: {formatCurrency(globalSettings.platformFeeAmount)} per transaction
                  </span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Platform Fee - Percentage */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-400" />
                  <Label className="text-[#ffffff] font-medium">Platform Fee - Percentage (%)</Label>
                  <Badge variant="outline" className="text-orange-400 border-orange-400 bg-orange-400/10">
                    Percentage of transaction
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    value={globalSettings.platformFeePercentage}
                    onChange={(e) => setGlobalSettings(prev => ({
                      ...prev,
                      platformFeePercentage: parseFloat(e.target.value) || 0
                    }))}
                    className="max-w-32 bg-white/10 border-white/20 text-white"
                  />
                  <span className="text-[#ffffff] text-sm font-medium">
                    Current: {globalSettings.platformFeePercentage}% 
                    (${formatCurrency(testAmount * globalSettings.platformFeePercentage / 100)} on ${testAmount})
                  </span>
                </div>
              </div>

              <Separator className="bg-white/20" />

              <div className="space-y-2">
                <button 
                  onClick={() => {
                    console.log("Raw button clicked!");
                    alert("Raw button clicked!");
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  type="button"
                >
                  TEST RAW BUTTON
                </button>
                <button 
                  onClick={() => {
                    console.log("Save button clicked! Global settings:", globalSettings);
                    alert(`Save clicked! Amount: $${globalSettings.platformFeeAmount}`);
                    handleGlobalSettingsUpdate();
                  }}
                  disabled={updateGlobalSettingsMutation.isPending}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                  type="button"
                >
                  {updateGlobalSettingsMutation.isPending ? 'Updating...' : 'UPDATE GLOBAL SETTINGS'}
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-glass bg-[#123140d9]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-400" />
                  Fee Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#ffffff]">Test Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={testAmount}
                    onChange={(e) => setTestAmount(parseFloat(e.target.value) || 100)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-white/70 text-sm">Quick test amounts:</div>
                  <div className="flex gap-2 flex-wrap">
                    {[25, 50, 100, 250, 500].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        onClick={() => setTestAmount(amount)}
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white !text-white !bg-white/10"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <FeeBreakdown
              grossAmount={testAmount}
              processingFeePercentage={globalSettings.processingFeePercentage}
              platformFeeAmount={globalSettings.platformFeeAmount}
              platformFeePercentage={globalSettings.platformFeePercentage}
              showDetailed={true}
            />
          </div>
        </TabsContent>

        {/* User-Specific Fees Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="rounded-lg border text-card-foreground shadow-sm card-glass bg-[#123140d9]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                User-Specific Fee Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-white/60">
                <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p>User-specific fee management coming soon.</p>
                <p className="text-sm">This will allow setting custom fees for individual participants.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}