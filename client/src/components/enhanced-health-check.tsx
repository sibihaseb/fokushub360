import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Settings, 
  Mail,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Wrench,
  AlertCircle
} from "lucide-react";

interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
  canAutoFix?: boolean;
  fixFunction?: () => Promise<void>;
  timestamp?: string;
}

interface HealthCheckSummary {
  overallStatus: 'healthy' | 'warning' | 'error';
  summary: {
    healthy: number;
    warnings: number;
    errors: number;
    total: number;
  };
  checks: HealthCheckResult[];
  timestamp: string;
}

export function EnhancedHealthCheck() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [scheduleSettings, setScheduleSettings] = useState({ enabled: false, frequency: 'twice-daily' });
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [scheduleResponse, healthResponse] = await Promise.all([
          fetch('/api/health/schedule'),
          fetch('/api/health/comprehensive')
        ]);
        
        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json();
          setScheduleSettings(scheduleData);
        }
        
        if (healthResponse.ok) {
          const healthData: HealthCheckSummary = await healthResponse.json();
          setResults(healthData.checks);
          setLastCheckTime(healthData.timestamp);
        }
      } catch (error) {
        console.error('Failed to load health check data:', error);
      }
    };
    
    loadData();
  }, []);

  // Run comprehensive health check
  const runHealthCheck = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      const response = await fetch('/api/health/comprehensive');
      
      if (response.ok) {
        const data: HealthCheckSummary = await response.json();
        setResults(data.checks);
        setLastCheckTime(data.timestamp);
        setProgress(100);
        
        toast({
          title: "Health Check Complete",
          description: `${data.summary.healthy} healthy, ${data.summary.warnings} warnings, ${data.summary.errors} errors`,
          variant: data.summary.errors > 0 ? "destructive" : "default"
        });
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health Check Failed",
        description: "Unable to complete system health check",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Update schedule settings
  const updateSchedule = async (enabled: boolean, frequency: string) => {
    setIsUpdatingSchedule(true);
    
    try {
      const response = await fetch('/api/health/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, frequency })
      });
      
      if (response.ok) {
        setScheduleSettings({ enabled, frequency });
        toast({
          title: "Schedule Updated",
          description: enabled ? `Health checks will run ${frequency.replace('-', ' ')}` : "Automated health checks disabled",
        });
      } else {
        throw new Error('Failed to update schedule');
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
      toast({
        title: "Schedule Update Failed",
        description: "Unable to update health check schedule",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  // Send notifications to admins
  const sendNotifications = async () => {
    setSendingNotifications(true);
    
    try {
      const response = await fetch('/api/health/notify-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ healthCheckResults: results })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Notifications Sent",
          description: `Sent to ${data.summary?.successful || 0} admins`,
        });
      } else {
        throw new Error('Failed to send notifications');
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
      toast({
        title: "Notification Failed",
        description: "Unable to send admin notifications",
        variant: "destructive"
      });
    } finally {
      setSendingNotifications(false);
    }
  };

  // Toggle expanded view for a result
  const toggleExpanded = (resultName: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultName)) {
        newSet.delete(resultName);
      } else {
        newSet.add(resultName);
      }
      return newSet;
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const hasIssues = results.some(r => r.status === 'error' || r.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-400" />
              System Health Monitor
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={runHealthCheck}
                disabled={isRunning}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Health Check
              </Button>
              
              {hasIssues && (
                <Button
                  onClick={sendNotifications}
                  disabled={sendingNotifications}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {sendingNotifications ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Notify Admins
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-white/70 text-sm mt-2">Running health checks...</p>
            </div>
          )}
          
          {lastCheckTime && (
            <p className="text-white/70 text-sm">
              Last check: {new Date(lastCheckTime).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card className="card-glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Automated Health Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Enable Automatic Checks</label>
              <p className="text-white/70 text-sm">Run health checks automatically and notify admins of issues</p>
            </div>
            <Switch
              checked={scheduleSettings.enabled}
              onCheckedChange={(enabled) => updateSchedule(enabled, scheduleSettings.frequency)}
              disabled={isUpdatingSchedule}
            />
          </div>
          
          {scheduleSettings.enabled && (
            <div className="flex items-center gap-4">
              <Clock className="w-4 h-4 text-white/70" />
              <div className="flex-1">
                <label className="text-white font-medium block mb-1">Frequency</label>
                <Select 
                  value={scheduleSettings.frequency} 
                  onValueChange={(frequency) => updateSchedule(true, frequency)}
                  disabled={isUpdatingSchedule}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="twice-daily">Twice Daily (8 AM, 8 PM)</SelectItem>
                    <SelectItem value="daily">Daily (9 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="card-glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Health Check Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4">
                <Collapsible 
                  open={expandedResults.has(result.name)}
                  onOpenChange={() => toggleExpanded(result.name)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div className="text-left">
                          <h3 className="font-medium text-white">{result.name}</h3>
                          <p className="text-sm text-white/70">{result.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                        {result.details && (
                          expandedResults.has(result.name) ? 
                            <ChevronUp className="h-4 w-4 text-white/70" /> : 
                            <ChevronDown className="h-4 w-4 text-white/70" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  {result.details && (
                    <CollapsibleContent className="mt-3 pt-3 border-t border-white/20">
                      <div className="bg-white/5 rounded-lg p-3">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Detailed Information
                        </h4>
                        <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono">
                          {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                        </pre>
                        
                        {result.canAutoFix && result.fixFunction && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <Button
                              onClick={result.fixFunction}
                              size="sm"
                              variant="outline"
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Wrench className="h-4 w-4 mr-2" />
                              Auto-Fix Issue
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}