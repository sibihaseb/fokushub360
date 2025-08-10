import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle, TrendingUp, Calendar, Target } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuestionnaireHealthData {
  completionPercentage: number;
  healthStatus: 'poor' | 'fair' | 'good' | 'great' | 'excellent';
  totalQuestions: number;
  answeredQuestions: number;
  reminderCount: number;
  lastReminderSent: string | null;
  canSendReminder: boolean;
}

interface HealthIndicatorProps {
  userId?: number;
  showManagerActions?: boolean;
}

export function QuestionnaireHealthIndicator({ userId, showManagerActions = false }: HealthIndicatorProps) {
  const { toast } = useToast();
 
  // Get questionnaire health data with forced refresh
  const { data: healthData, isLoading, refetch } = useQuery({
    queryKey: ["/api/questionnaire/health", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/questionnaire/health${userId ? `?userId=${userId}` : ""}`);
      return response.json() as Promise<QuestionnaireHealthData>;
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache results
  });

  // Force refresh for testing
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/questionnaire/reminder", { userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Questionnaire completion reminder has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/health"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="card-glass">
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

  if (!healthData) {
    return null;
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'poor': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'fair': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'good': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'great': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'excellent': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'poor':
      case 'fair':
        return <AlertTriangle className="w-5 h-5" />;
      case 'good':
      case 'great':
        return <TrendingUp className="w-5 h-5" />;
      case 'excellent':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getHealthMessage = (status: string, percentage: number) => {
    switch (status) {
      case 'poor':
        return `Only ${percentage}% complete. Complete your profile to unlock opportunities!`;
      case 'fair':
        return `${percentage}% complete. You're making progress! Keep going to unlock more campaigns.`;
      case 'good':
        return `${percentage}% complete. Great progress! A few more questions to maximize your opportunities.`;
      case 'great':
        return `${percentage}% complete. Excellent! You're almost ready for premium campaigns.`;
      case 'excellent':
        return `${percentage}% complete. Perfect! Your profile is optimized for the best opportunities.`;
      default:
        return `${percentage}% complete. Continue building your profile for better matches.`;
    }
  };

  return (
    <Card className="card-glass border-2 hover:border-blue-500/30 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-3">
          <div className={`p-2 rounded-full ${getHealthColor(healthData.healthStatus)}`}>
            {getHealthIcon(healthData.healthStatus)}
          </div>
          <div className="flex-1">
            <span>Profile Completion Health</span>
            <Badge 
              variant="outline" 
              className={`ml-3 ${getHealthColor(healthData.healthStatus)} capitalize`}
            >
              {healthData.healthStatus}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Completion Progress</span>
            <span className="text-white font-medium">{healthData.completionPercentage}%</span>
          </div>
          <Progress 
            value={healthData.completionPercentage} 
            className="h-3 bg-white/10"
            style={{
              background: `linear-gradient(to right, 
                ${healthData.completionPercentage < 20 ? '#ef4444' : 
                  healthData.completionPercentage < 40 ? '#f97316' : 
                  healthData.completionPercentage < 60 ? '#eab308' : 
                  healthData.completionPercentage < 80 ? '#22c55e' : '#10b981'} 0%, 
                rgba(255,255,255,0.1) 0%)`
            }}
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Questions Answered</div>
            <div className="text-white text-lg font-bold">
              {healthData.answeredQuestions}
              <span className="text-white/60 text-sm font-normal"> / {healthData.totalQuestions}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Reminders Sent</div>
            <div className="text-white text-lg font-bold">{healthData.reminderCount}</div>
          </div>
        </div>

        {/* Health Message */}
        <div className={`p-4 rounded-lg border ${getHealthColor(healthData.healthStatus)}`}>
          <p className="text-white text-sm leading-relaxed">
            {getHealthMessage(healthData.healthStatus, healthData.completionPercentage)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {healthData.completionPercentage < 100 && (
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => window.location.href = '/onboarding/'}
            >
              <Target className="w-4 h-4 mr-2" />
              Complete Profile
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/health"] });
              refetch();
              toast({
                title: "Data Refreshed",
                description: "Questionnaire completion data has been updated.",
              });
            }}
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 min-w-[120px]"
          >
            🔄 Refresh
          </Button>
          
          {showManagerActions && healthData.canSendReminder && (
            <Button
              variant="outline"
              onClick={() => sendReminderMutation.mutate()}
              disabled={sendReminderMutation.isPending}
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Bell className="w-4 h-4 mr-2" />
              {sendReminderMutation.isPending ? 'Sending...' : 'Send Reminder'}
            </Button>
          )}
        </div>

        {/* Last Reminder Info */}
        {healthData.lastReminderSent && (
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Calendar className="w-3 h-3" />
            Last reminder: {new Date(healthData.lastReminderSent).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}