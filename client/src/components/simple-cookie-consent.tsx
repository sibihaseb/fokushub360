import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Settings, Cookie } from 'lucide-react';

interface SimpleCookieConsentProps {
  onAccept?: () => void;
  onReject?: () => void;
  onCustomize?: () => void;
}

export function SimpleCookieConsent({ onAccept, onReject, onCustomize }: SimpleCookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: true
  });

  useEffect(() => {
    // Check if user has already made a cookie choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieSettings', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }));
    setIsVisible(false);
    onAccept?.();
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieSettings', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    }));
    setIsVisible(false);
    onReject?.();
  };

  const handleCustomize = () => {
    setShowCustomize(true);
    onCustomize?.();
  };

  const handleSaveCustom = () => {
    localStorage.setItem('cookieConsent', 'customized');
    localStorage.setItem('cookieSettings', JSON.stringify(cookieSettings));
    setIsVisible(false);
    setShowCustomize(false);
    onAccept?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="bg-white border border-gray-200 shadow-lg max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Cookie Consent</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use cookies to enhance your experience, analyze site usage, and personalize content. 
                  By continuing to use our platform, you consent to our use of cookies in accordance with our Privacy Policy.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              onClick={handleAcceptAll}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Accept All
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              Reject All
            </Button>
            <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cookie Preferences</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="necessary" className="font-medium">Necessary</Label>
                      <p className="text-sm text-gray-600">Required for basic site functionality</p>
                    </div>
                    <Switch id="necessary" checked={cookieSettings.necessary} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics" className="font-medium">Analytics</Label>
                      <p className="text-sm text-gray-600">Help us improve our website</p>
                    </div>
                    <Switch 
                      id="analytics" 
                      checked={cookieSettings.analytics}
                      onCheckedChange={(checked) => setCookieSettings(prev => ({ ...prev, analytics: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing" className="font-medium">Marketing</Label>
                      <p className="text-sm text-gray-600">Personalized ads and content</p>
                    </div>
                    <Switch 
                      id="marketing" 
                      checked={cookieSettings.marketing}
                      onCheckedChange={(checked) => setCookieSettings(prev => ({ ...prev, marketing: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="preferences" className="font-medium">Preferences</Label>
                      <p className="text-sm text-gray-600">Remember your settings</p>
                    </div>
                    <Switch 
                      id="preferences" 
                      checked={cookieSettings.preferences}
                      onCheckedChange={(checked) => setCookieSettings(prev => ({ ...prev, preferences: checked }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleSaveCustom} className="flex-1">
                    Save Preferences
                  </Button>
                  <Button variant="outline" onClick={() => setShowCustomize(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}