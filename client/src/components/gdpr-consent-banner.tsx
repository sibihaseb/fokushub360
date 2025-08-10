import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LegalDocumentsModal } from "./legal-documents-modal";
import { Shield, Cookie, Eye, Settings, CheckCircle, X } from "lucide-react";

interface GDPRConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function GDPRConsentBanner({ onAccept, onDecline }: GDPRConsentBannerProps) {
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a consent decision
    const consentDecision = localStorage.getItem('gdpr-consent');
    if (!consentDecision) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('gdpr-consent', 'accepted');
    localStorage.setItem('gdpr-consent-date', new Date().toISOString());
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('gdpr-consent', 'declined');
    localStorage.setItem('gdpr-consent-date', new Date().toISOString());
    setIsVisible(false);
    onDecline();
  };

  const handleViewLegal = () => {
    setShowLegalModal(true);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-background/95 to-background/50 backdrop-blur-sm">
        <Card className="max-w-3xl mx-auto border border-primary/20 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">Privacy & Cookies</h3>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    GDPR
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  We use cookies to enhance your experience and comply with privacy laws.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewLegal}
                  className="h-8 px-3 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Details
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDecline}
                  className="h-8 px-3 text-xs"
                >
                  Decline
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAccept}
                  className="h-8 px-3 text-xs"
                >
                  Accept
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <LegalDocumentsModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        onAccept={handleAccept}
        showAcceptButton={true}
      />
    </>
  );
}

// Cookie consent management hook
export function useGDPRConsent() {
  const [consentStatus, setConsentStatus] = useState<'accepted' | 'declined' | null>(null);
  const [consentDate, setConsentDate] = useState<string | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('gdpr-consent') as 'accepted' | 'declined' | null;
    const date = localStorage.getItem('gdpr-consent-date');
    setConsentStatus(consent);
    setConsentDate(date);
  }, []);

  const updateConsent = (status: 'accepted' | 'declined') => {
    const date = new Date().toISOString();
    localStorage.setItem('gdpr-consent', status);
    localStorage.setItem('gdpr-consent-date', date);
    setConsentStatus(status);
    setConsentDate(date);
  };

  const withdrawConsent = () => {
    localStorage.removeItem('gdpr-consent');
    localStorage.removeItem('gdpr-consent-date');
    setConsentStatus(null);
    setConsentDate(null);
  };

  return {
    consentStatus,
    consentDate,
    updateConsent,
    withdrawConsent,
    hasConsent: consentStatus === 'accepted',
    hasDeclined: consentStatus === 'declined',
    needsConsent: consentStatus === null
  };
}