import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Globe, 
  Image, 
  Settings, 
  Star,
  TrendingUp,
  Eye,
  CheckCircle,
  AlertTriangle,
  Upload,
  Download,
  Share2,
  Zap,
  FileText,
  Link,
  Tags
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SEOSettings {
  // Basic SEO
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteName: string;
  siteUrl: string;
  
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  
  // Twitter Card
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: string;
  
  // Technical SEO
  robotsTxt: string;
  sitemapUrl: string;
  canonicalUrl: string;
  
  // Images
  favicon: string;
  appleTouchIcon: string;
  favicon16: string;
  favicon32: string;
  
  // Schema.org
  schemaType: string;
  schemaData: string;
  
  // Analytics
  googleAnalyticsId: string;
  googleSearchConsole: string;
  
  // Performance
  preloadCriticalResources: boolean;
  enableServiceWorker: boolean;
  compressionEnabled: boolean;
}

export default function AdminSEOSettings() {
  const [settings, setSettings] = useState<SEOSettings>({
    siteTitle: "FokusHub360 - Premium Virtual Focus Group Platform",
    siteDescription: "Transform your market research with FokusHub360's AI-powered virtual focus group platform. Get instant insights, automated participant matching, and comprehensive analytics for better business decisions.",
    siteKeywords: "virtual focus group, market research, AI analysis, participant matching, survey platform, consumer insights, FokusHub360, focus group software, market research tools, customer feedback, user research",
    siteName: "FokusHub360",
    siteUrl: "https://fokushub360.com",
    
    ogTitle: "FokusHub360 - Premium Virtual Focus Group Platform",
    ogDescription: "Transform your market research with AI-powered virtual focus groups. Get instant insights and automated participant matching.",
    ogImage: "/images/og-image.jpg",
    ogType: "website",
    
    twitterTitle: "FokusHub360 - Premium Virtual Focus Group Platform",
    twitterDescription: "Transform your market research with AI-powered virtual focus groups.",
    twitterImage: "/images/twitter-card.jpg",
    twitterCard: "summary_large_image",
    
    robotsTxt: `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Sitemap: https://fokushub360.com/sitemap.xml`,
    sitemapUrl: "/sitemap.xml",
    canonicalUrl: "https://fokushub360.com",
    
    favicon: "/favicon.ico",
    appleTouchIcon: "/images/apple-touch-icon.png",
    favicon16: "/images/favicon-16x16.png",
    favicon32: "/images/favicon-32x32.png",
    
    schemaType: "SoftwareApplication",
    schemaData: `{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "FokusHub360",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Premium virtual focus group platform with AI-powered participant matching and automated insights generation.",
  "url": "https://fokushub360.com",
  "provider": {
    "@type": "Organization",
    "name": "FokusHub360",
    "url": "https://fokushub360.com"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}`,
    
    googleAnalyticsId: "",
    googleSearchConsole: "",
    
    preloadCriticalResources: true,
    enableServiceWorker: true,
    compressionEnabled: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/seo-settings"],
    onSuccess: (data) => {
      if (data) setSettings(data);
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: SEOSettings) => {
      return await apiRequest("POST", "/api/admin/seo-settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-settings"] });
      toast({
        title: "SEO Settings Updated",
        description: "SEO settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update SEO settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleImageUpload = (field: keyof SEOSettings, file: File) => {
    // In a real implementation, you'd upload to cloud storage
    const imageUrl = URL.createObjectURL(file);
    setSettings(prev => ({ ...prev, [field]: imageUrl }));
  };

  const generateSitemap = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${settings.siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${settings.siteUrl}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${settings.siteUrl}/pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${settings.siteUrl}/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
    
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Search className="w-6 h-6 text-purple-600" />
            <span>SEO Management</span>
          </h2>
          <p className="text-gray-600">Optimize your site for search engines and social media</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          SEO Ready
        </Badge>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>Basic SEO Settings</span>
              </CardTitle>
              <CardDescription>
                Configure the fundamental SEO elements for your site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input
                    id="siteTitle"
                    value={settings.siteTitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
                    placeholder="Your site title"
                  />
                  <p className="text-xs text-gray-500">Max 60 characters for optimal display</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="FokusHub360"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  placeholder="Describe your site..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">Max 160 characters for optimal display</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteKeywords">Keywords</Label>
                <Textarea
                  id="siteKeywords"
                  value={settings.siteKeywords}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteKeywords: e.target.value }))}
                  placeholder="keyword1, keyword2, keyword3"
                  rows={2}
                />
                <p className="text-xs text-gray-500">Separate keywords with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  placeholder="https://fokushub360.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-blue-500" />
                  <span>Open Graph (Facebook)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">OG Title</Label>
                  <Input
                    id="ogTitle"
                    value={settings.ogTitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, ogTitle: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogDescription">OG Description</Label>
                  <Textarea
                    id="ogDescription"
                    value={settings.ogDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, ogDescription: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogImage">OG Image</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="ogImage"
                      value={settings.ogImage}
                      onChange={(e) => setSettings(prev => ({ ...prev, ogImage: e.target.value }))}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Recommended: 1200x630px</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-400 rounded" />
                  <span>Twitter Card</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterTitle">Twitter Title</Label>
                  <Input
                    id="twitterTitle"
                    value={settings.twitterTitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, twitterTitle: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterDescription">Twitter Description</Label>
                  <Textarea
                    id="twitterDescription"
                    value={settings.twitterDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, twitterDescription: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterImage">Twitter Image</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="twitterImage"
                      value={settings.twitterImage}
                      onChange={(e) => setSettings(prev => ({ ...prev, twitterImage: e.target.value }))}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Recommended: 1200x600px</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Technical SEO</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="robotsTxt">Robots.txt</Label>
                <Textarea
                  id="robotsTxt"
                  value={settings.robotsTxt}
                  onChange={(e) => setSettings(prev => ({ ...prev, robotsTxt: e.target.value }))}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sitemapUrl">Sitemap URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="sitemapUrl"
                      value={settings.sitemapUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, sitemapUrl: e.target.value }))}
                    />
                    <Button variant="outline" size="sm" onClick={generateSitemap}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={settings.canonicalUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schemaData">Schema.org Markup</Label>
                <Textarea
                  id="schemaData"
                  value={settings.schemaData}
                  onChange={(e) => setSettings(prev => ({ ...prev, schemaData: e.target.value }))}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-purple-500" />
                <span>Site Images & Icons</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon (32x32)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="favicon"
                        value={settings.favicon}
                        onChange={(e) => setSettings(prev => ({ ...prev, favicon: e.target.value }))}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appleTouchIcon">Apple Touch Icon (180x180)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="appleTouchIcon"
                        value={settings.appleTouchIcon}
                        onChange={(e) => setSettings(prev => ({ ...prev, appleTouchIcon: e.target.value }))}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="favicon16">Favicon 16x16</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="favicon16"
                        value={settings.favicon16}
                        onChange={(e) => setSettings(prev => ({ ...prev, favicon16: e.target.value }))}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favicon32">Favicon 32x32</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="favicon32"
                        value={settings.favicon32}
                        onChange={(e) => setSettings(prev => ({ ...prev, favicon32: e.target.value }))}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Analytics & Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleSearchConsole">Google Search Console</Label>
                  <Input
                    id="googleSearchConsole"
                    value={settings.googleSearchConsole}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleSearchConsole: e.target.value }))}
                    placeholder="Verification meta tag content"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Performance Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="preloadCritical">Preload Critical Resources</Label>
                      <p className="text-sm text-gray-600">Improve loading speed by preloading critical assets</p>
                    </div>
                    <Switch
                      id="preloadCritical"
                      checked={settings.preloadCriticalResources}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, preloadCriticalResources: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableServiceWorker">Enable Service Worker</Label>
                      <p className="text-sm text-gray-600">Cache resources for better performance</p>
                    </div>
                    <Switch
                      id="enableServiceWorker"
                      checked={settings.enableServiceWorker}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableServiceWorker: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compressionEnabled">Enable Compression</Label>
                      <p className="text-sm text-gray-600">Compress assets for faster loading</p>
                    </div>
                    <Switch
                      id="compressionEnabled"
                      checked={settings.compressionEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, compressionEnabled: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span>SEO Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Google Search Result Preview</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {settings.siteTitle}
                  </div>
                  <div className="text-green-600 text-sm">
                    {settings.siteUrl}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {settings.siteDescription}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Facebook Share Preview</h3>
                <div className="border rounded-lg overflow-hidden max-w-md">
                  <div className="bg-gray-200 h-32 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-sm">{settings.ogTitle}</div>
                    <div className="text-xs text-gray-600 mt-1">{settings.ogDescription}</div>
                    <div className="text-xs text-gray-500 mt-1">{settings.siteUrl}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Twitter Card Preview</h3>
                <div className="border rounded-lg overflow-hidden max-w-md">
                  <div className="bg-gray-200 h-40 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-sm">{settings.twitterTitle}</div>
                    <div className="text-xs text-gray-600 mt-1">{settings.twitterDescription}</div>
                    <div className="text-xs text-gray-500 mt-1">{settings.siteUrl}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setSettings(currentSettings || settings)}>
          Reset Changes
        </Button>
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {updateSettingsMutation.isPending ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Save SEO Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}