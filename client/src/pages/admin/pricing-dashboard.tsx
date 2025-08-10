import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Users, 
  Settings, 
  TrendingUp,
  Calculator,
  Target,
  Zap,
  Save
} from "lucide-react";

export default function PricingDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Pricing calculation state
  const [pricingPreview, setPricingPreview] = useState({
    campaignType: 'standard',
    contentType: 'image',
    participantCount: 15
  });

  // Fetch pricing configurations
  const { data: pricingConfigs } = useQuery({
    queryKey: ["/api/pricing/configs"],
  });

  // Fetch pricing options
  const { data: pricingOptions } = useQuery({
    queryKey: ["/api/pricing/options"],
  });

  // Calculate pricing preview
  const { data: calculatedPricing } = useQuery({
    queryKey: ["/api/pricing/calculate", pricingPreview],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/pricing/calculate", pricingPreview);
      return response.json();
    },
    enabled: !!pricingPreview.campaignType && !!pricingPreview.contentType
  });

  // Update admin settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await apiRequest("POST", "/api/admin/settings", { key, value, category: "pricing" });
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Pricing settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing/configs"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update pricing settings",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Pricing Dashboard
          </h1>
          <p className="text-white/70">
            Configure campaign pricing and participant costs
          </p>
        </div>

        {/* Pricing Preview Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="card-glass lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Pricing Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="campaignType" className="text-white/80">Campaign Type</Label>
                  <select
                    id="campaignType"
                    value={pricingPreview.campaignType}
                    onChange={(e) => setPricingPreview(prev => ({ ...prev, campaignType: e.target.value }))}
                    className="w-full mt-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="contentType" className="text-white/80">Content Type</Label>
                  <select
                    id="contentType"
                    value={pricingPreview.contentType}
                    onChange={(e) => setPricingPreview(prev => ({ ...prev, contentType: e.target.value }))}
                    className="w-full mt-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="participantCount" className="text-white/80">Participants</Label>
                  <Input
                    id="participantCount"
                    type="number"
                    value={pricingPreview.participantCount}
                    onChange={(e) => setPricingPreview(prev => ({ ...prev, participantCount: parseInt(e.target.value) || 1 }))}
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white/80">Participant Count: {pricingPreview.participantCount}</Label>
                <Slider
                  value={[pricingPreview.participantCount]}
                  onValueChange={(value) => setPricingPreview(prev => ({ ...prev, participantCount: value[0] }))}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Price Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculatedPricing ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Base Cost</span>
                    <span className="text-white font-bold">${calculatedPricing.baseCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Participants ({calculatedPricing.participantCount})</span>
                    <span className="text-white">${(calculatedPricing.participantCost * calculatedPricing.participantCount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Extra Participants ({calculatedPricing.extraParticipants})</span>
                    <span className="text-white">${calculatedPricing.extraParticipantCost.toFixed(2)}</span>
                  </div>
                  <hr className="border-white/20" />
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Total Cost</span>
                    <span className="text-emerald-400 font-bold text-xl">${calculatedPricing.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {calculatedPricing.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-emerald-400 border-emerald-400">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pricing Configuration Tables */}
        <Tabs defaultValue="configs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="configs">Pricing Configurations</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="configs">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">Pricing Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pricingConfigs?.map((config: any) => (
                    <Card key={config.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white capitalize">
                                {config.campaign_type} - {config.content_type}
                              </h3>
                              <p className="text-white/70">
                                Base: ${config.base_cost} | Per Participant: ${config.participant_cost}
                              </p>
                              <p className="text-sm text-white/50">
                                Includes {config.included_participants} participants
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={config.is_active ? "default" : "secondary"}>
                              {config.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white">Base Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="baseCost" className="text-white/80">Base Campaign Cost ($)</Label>
                    <Input
                      id="baseCost"
                      type="number"
                      defaultValue="299"
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="includedParticipants" className="text-white/80">Included Participants</Label>
                    <Input
                      id="includedParticipants"
                      type="number"
                      defaultValue="10"
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <Button className="w-full btn-premium">
                    <Save className="w-4 h-4 mr-2" />
                    Save Base Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white">Participant Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="standardCost" className="text-white/80">Standard Cost per Participant ($)</Label>
                    <Input
                      id="standardCost"
                      type="number"
                      defaultValue="15"
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="premiumCost" className="text-white/80">Premium Cost per Participant ($)</Label>
                    <Input
                      id="premiumCost"
                      type="number"
                      defaultValue="20"
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <Button className="w-full btn-premium">
                    <Save className="w-4 h-4 mr-2" />
                    Save Participant Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="card-glass mt-6">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="btn-premium">
                <Target className="w-4 h-4 mr-2" />
                Update All Pricing
              </Button>
              <Button variant="outline" className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
              <Button variant="outline" className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Pricing Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}