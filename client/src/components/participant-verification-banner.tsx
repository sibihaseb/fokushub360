import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Star, 
  Crown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Gift,
  TrendingUp,
  X,
  ArrowRight,
  Lock
} from "lucide-react";

interface VerificationInfo {
  isVerified: boolean;
  verificationStatus: string;
  reminderCount: number;
  lastReminderSent: string | null;
  daysSinceJoined: number;
  priorityBenefits: string[];
  verificationSteps: string[];
  nextReminder: string | null;
}

export default function ParticipantVerificationBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch real verification status
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: verificationStatus } = useQuery({
    queryKey: ['/api/verification/status'],
    retry: false,
  });

  // Create verification data based on real user data
  const verificationData: VerificationInfo = {
    isVerified: user?.isVerified || false,
    verificationStatus: verificationStatus?.status || user?.verificationStatus || 'pending',
    reminderCount: user?.reminderCount || 0,
    lastReminderSent: user?.lastReminderSent || null,
    daysSinceJoined: user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    priorityBenefits: [
      'First access to high-paying campaigns',
      'Up to 3x higher rewards',
      'Exclusive premium focus groups',
      'Priority customer support',
      'Advanced campaign matching'
    ],
    verificationSteps: [
      'Upload government-issued ID',
      'Provide address verification',
      'Complete selfie verification',
      'Submit for review'
    ],
    nextReminder: user?.nextReminder || null
  };

  const getUrgencyLevel = (daysSinceJoined: number, reminderCount: number): 'low' | 'medium' | 'high' | 'urgent' => {
    if (daysSinceJoined > 14 && reminderCount < 3) return 'urgent';
    if (daysSinceJoined > 7 && reminderCount < 2) return 'high';
    if (daysSinceJoined > 3) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getUrgencyMessage = (level: string) => {
    switch (level) {
      case 'urgent': return 'Action Required - Verify Now to Avoid Missing Premium Opportunities!';
      case 'high': return 'High Priority - Complete Verification for Premium Access';
      case 'medium': return 'Verification Pending - Unlock Premium Features';
      case 'low': return 'Complete Verification for Priority Access';
      default: return 'Complete Verification';
    }
  };

  if (verificationData.isVerified || isDismissed) {
    return null;
  }

  const urgencyLevel = getUrgencyLevel(verificationData.daysSinceJoined, verificationData.reminderCount);
  // Check if verification is actually submitted (has documents or is under review)
  const isSubmitted = verificationStatus?.documents?.length > 0 || 
                      verificationData.verificationStatus === 'submitted' || 
                      verificationData.verificationStatus === 'under_review';

  return (
    <div className="mb-6">
      <Card className={`${getUrgencyColor(urgencyLevel)} border-l-4 shadow-md`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {getUrgencyMessage(urgencyLevel)}
                  </h3>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {verificationData.verificationStatus}
                </Badge>
                {urgencyLevel === 'urgent' && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800 animate-pulse">
                    URGENT
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    Priority Benefits
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {[
                      "First access to premium campaigns",
                      "3x higher earnings potential",
                      "Priority customer support",
                      "Advanced AI matching",
                      "Exclusive campaign invitations"
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Verification Steps
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {[
                      "Submit verification request",
                      "Admin review (24-48 hours)",
                      "Email confirmation",
                      "Instant priority access"
                    ].map((step, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">
                    Verified users earn up to 3x more and get first access to premium campaigns
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <Button 
                  onClick={() => {
                    if (!isSubmitted || user?.role === 'admin' || user?.role === 'manager') {
                      window.location.href = '/verification';
                    }
                  }}
                  disabled={isSubmitted && user?.role !== 'admin' && user?.role !== 'manager'}
                  className={`${isSubmitted && user?.role !== 'admin' && user?.role !== 'manager'
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {isSubmitted ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      {user?.role === 'admin' || user?.role === 'manager' ? 'Resubmit Verification' : 'Verification Submitted'}
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Start Verification
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    You've been with us for {verificationData.daysSinceJoined} days. 
                    {verificationData.reminderCount > 0 && (
                      <span className="ml-1">
                        This is reminder #{verificationData.reminderCount}.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}