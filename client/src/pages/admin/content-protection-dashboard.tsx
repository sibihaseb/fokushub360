import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, 
  Eye, 
  Download, 
  Users, 
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Lock,
  UserCheck,
  Settings,
  BarChart3,
  Fingerprint,
  FileText,
  Calendar
} from 'lucide-react';

interface ContentProtectionOptions {
  watermark: {
    text: string;
    position: string;
    opacity: number;
    fontSize: number;
    color: string;
    rotation: number;
    enabled: boolean;
  };
  downloadProtection: boolean;
  viewTracking: boolean;
  expirationDate?: string;
  allowedViewers?: number[];
  maxViews?: number;
}

interface ContentAsset {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  campaignId: number;
  campaignTitle: string;
  protection?: ContentProtectionOptions;
  analytics?: {
    totalViews: number;
    uniqueViewers: number;
    downloadAttempts: number;
    securityViolations: number;
    lastAccessed: string;
  };
}

interface SecurityReport {
  totalAssets: number;
  protectedAssets: number;
  totalViews: number;
  totalViolations: number;
  highRiskAssets: number;
  recentActivity: Array<{
    assetId: number;
    filename: string;
    eventType: string;
    timestamp: string;
    userId: number;
    username: string;
  }>;
}

export default function ContentProtectionDashboard() {
  const [selectedAsset, setSelectedAsset] = useState<ContentAsset | null>(null);
  const [protectionDialogOpen, setProtectionDialogOpen] = useState(false);
  const [protectionSettings, setProtectionSettings] = useState<ContentProtectionOptions>({
    watermark: {
      text: "FokusHub360 - Confidential",
      position: "bottom-right",
      opacity: 0.3,
      fontSize: 24,
      color: "#ffffff",
      rotation: -45,
      enabled: true
    },
    downloadProtection: false,
    viewTracking: true,
    maxViews: undefined
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch content assets
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['/api/admin/content-assets'],
    queryFn: () => apiRequest('/api/admin/content-assets'),
  });

  // Fetch security overview
  const { data: securityReport, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/admin/content-security-report'],
    queryFn: () => apiRequest('/api/admin/content-security-report'),
  });

  // Protection mutations
  const protectContentMutation = useMutation({
    mutationFn: (data: { assetId: number; options: ContentProtectionOptions }) =>
      apiRequest('POST', '/api/content/protect', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content protection enabled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-assets'] });
      setProtectionDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to enable content protection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const removeProtectionMutation = useMutation({
    mutationFn: (assetId: number) =>
      apiRequest('DELETE', `/api/content/protect/${assetId}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content protection disabled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-assets'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to disable content protection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleProtectContent = () => {
    if (!selectedAsset) return;
    
    protectContentMutation.mutate({
      assetId: selectedAsset.id,
      options: protectionSettings
    });
  };

  const handleRemoveProtection = (assetId: number) => {
    removeProtectionMutation.mutate(assetId);
  };

  const filteredAssets = assets?.filter((asset: ContentAsset) => {
    const matchesSearch = asset.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'protected') return matchesSearch && asset.protection;
    if (filterStatus === 'unprotected') return matchesSearch && !asset.protection;
    if (filterStatus === 'high-risk') return matchesSearch && asset.analytics?.securityViolations > 0;
    
    return matchesSearch;
  });

  const getStatusBadge = (asset: ContentAsset) => {
    if (asset.protection) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Protected</Badge>;
    }
    if (asset.analytics?.securityViolations > 0) {
      return <Badge variant="destructive">High Risk</Badge>;
    }
    return <Badge variant="secondary">Unprotected</Badge>;
  };

  const getSecurityScore = (asset: ContentAsset) => {
    if (!asset.protection) return 0;
    
    let score = 30; // Base score for having protection
    if (asset.protection.watermark.enabled) score += 25;
    if (asset.protection.downloadProtection) score += 20;
    if (asset.protection.viewTracking) score += 15;
    if (asset.protection.maxViews) score += 10;
    
    return score;
  };

  if (assetsLoading || reportLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Protection</h1>
          <p className="text-gray-600">Manage content security and access controls</p>
        </div>
        <Button
          onClick={() => {
            setSelectedAsset(null);
            setProtectionDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Shield className="w-4 h-4 mr-2" />
          Global Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityReport?.totalAssets || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Protected Assets</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityReport?.protectedAssets || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {securityReport?.totalAssets > 0 
                    ? `${Math.round((securityReport?.protectedAssets / securityReport?.totalAssets) * 100)}% protected`
                    : 'No assets'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityReport?.totalViews || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{securityReport?.totalViolations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityReport?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium">{activity.filename}</p>
                        <p className="text-sm text-gray-600">{activity.eventType} by {activity.username}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assets</SelectItem>
                    <SelectItem value="protected">Protected</SelectItem>
                    <SelectItem value="unprotected">Unprotected</SelectItem>
                    <SelectItem value="high-risk">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredAssets?.map((asset: ContentAsset) => (
                <Card key={asset.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{asset.filename}</h3>
                          <p className="text-sm text-gray-600">{asset.campaignTitle}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(asset)}
                            <span className="text-sm text-gray-500">
                              Security Score: {getSecurityScore(asset)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {asset.analytics?.totalViews || 0} views
                          </p>
                          <p className="text-sm text-gray-600">
                            {asset.analytics?.uniqueViewers || 0} unique viewers
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline" className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white"
                            size="sm"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setProtectionDialogOpen(true);
                            }}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                          {asset.protection && (
                            <Button
                              variant="outline" className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white"
                              size="sm"
                              onClick={() => handleRemoveProtection(asset.id)}
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {asset.protection && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Protection Active</span>
                          <div className="flex items-center space-x-4 text-sm text-green-700">
                            {asset.protection.watermark.enabled && (
                              <div className="flex items-center space-x-1">
                                <Fingerprint className="w-4 h-4" />
                                <span>Watermark</span>
                              </div>
                            )}
                            {asset.protection.downloadProtection && (
                              <div className="flex items-center space-x-1">
                                <Lock className="w-4 h-4" />
                                <span>Download Protection</span>
                              </div>
                            )}
                            {asset.protection.viewTracking && (
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>View Tracking</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Protection Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Protected Assets</span>
                    <span className="font-semibold">
                      {securityReport?.protectedAssets || 0} / {securityReport?.totalAssets || 0}
                    </span>
                  </div>
                  <Progress 
                    value={securityReport?.totalAssets > 0 
                      ? (securityReport?.protectedAssets / securityReport?.totalAssets) * 100 
                      : 0
                    } 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>High Risk Assets</span>
                    <span className="font-semibold text-red-600">
                      {securityReport?.highRiskAssets || 0}
                    </span>
                  </div>
                  <Progress 
                    value={securityReport?.totalAssets > 0 
                      ? (securityReport?.highRiskAssets / securityReport?.totalAssets) * 100 
                      : 0
                    } 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Content Access Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityReport?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.filename}</p>
                        <p className="text-sm text-gray-600">
                          {activity.eventType} by {activity.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Protection Configuration Dialog */}
      <Dialog open={protectionDialogOpen} onOpenChange={setProtectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAsset ? `Configure Protection: ${selectedAsset.filename}` : 'Global Protection Settings'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Watermark Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="watermark-text">Watermark Text</Label>
                  <Input
                    id="watermark-text"
                    value={protectionSettings.watermark.text}
                    onChange={(e) => setProtectionSettings({
                      ...protectionSettings,
                      watermark: { ...protectionSettings.watermark, text: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="watermark-position">Position</Label>
                  <Select
                    value={protectionSettings.watermark.position}
                    onValueChange={(value) => setProtectionSettings({
                      ...protectionSettings,
                      watermark: { ...protectionSettings.watermark, position: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="watermark-opacity">Opacity</Label>
                  <Input
                    id="watermark-opacity"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={protectionSettings.watermark.opacity}
                    onChange={(e) => setProtectionSettings({
                      ...protectionSettings,
                      watermark: { ...protectionSettings.watermark, opacity: parseFloat(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="watermark-size">Font Size</Label>
                  <Input
                    id="watermark-size"
                    type="number"
                    min="12"
                    max="72"
                    value={protectionSettings.watermark.fontSize}
                    onChange={(e) => setProtectionSettings({
                      ...protectionSettings,
                      watermark: { ...protectionSettings.watermark, fontSize: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="watermark-enabled"
                  checked={protectionSettings.watermark.enabled}
                  onCheckedChange={(checked) => setProtectionSettings({
                    ...protectionSettings,
                    watermark: { ...protectionSettings.watermark, enabled: checked }
                  })}
                />
                <Label htmlFor="watermark-enabled">Enable Watermark</Label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Access Controls</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="download-protection"
                    checked={protectionSettings.downloadProtection}
                    onCheckedChange={(checked) => setProtectionSettings({
                      ...protectionSettings,
                      downloadProtection: checked
                    })}
                  />
                  <Label htmlFor="download-protection">Download Protection</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="view-tracking"
                    checked={protectionSettings.viewTracking}
                    onCheckedChange={(checked) => setProtectionSettings({
                      ...protectionSettings,
                      viewTracking: checked
                    })}
                  />
                  <Label htmlFor="view-tracking">View Tracking</Label>
                </div>
                
                <div>
                  <Label htmlFor="max-views">Max Views (Optional)</Label>
                  <Input
                    id="max-views"
                    type="number"
                    min="1"
                    value={protectionSettings.maxViews || ''}
                    onChange={(e) => setProtectionSettings({
                      ...protectionSettings,
                      maxViews: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline" className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white"
                onClick={() => setProtectionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProtectContent}
                disabled={protectContentMutation.isPending}
              >
                {protectContentMutation.isPending ? 'Applying...' : 'Apply Protection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}