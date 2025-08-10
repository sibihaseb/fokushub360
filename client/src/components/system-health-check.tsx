import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Upload,
  Shield,
  Globe,
  Settings,
  Wrench,
  Activity
} from 'lucide-react';

interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: string;
  canAutoFix?: boolean;
  fixFunction?: () => Promise<void>;
}

export function SystemHealthCheck() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const { toast } = useToast();

  const healthChecks = [
    {
      name: 'Database Connection',
      check: async (): Promise<HealthCheckResult> => {
        try {
          const response = await fetch('/api/health/database');
          if (response.ok) {
            return {
              name: 'Database Connection',
              status: 'healthy',
              message: 'PostgreSQL database is connected and responsive'
            };
          }
          throw new Error('Database connection failed');
        } catch (error) {
          return {
            name: 'Database Connection',
            status: 'error',
            message: 'Database connection failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            canAutoFix: true,
            fixFunction: async () => {
              await fetch('/api/health/database/reset', { method: 'POST' });
            }
          };
        }
      }
    },
    {
      name: 'Authentication System',
      check: async (): Promise<HealthCheckResult> => {
        try {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            return {
              name: 'Authentication System',
              status: 'healthy',
              message: 'JWT authentication is working correctly'
            };
          }
          throw new Error('Authentication failed');
        } catch (error) {
          return {
            name: 'Authentication System',
            status: 'error',
            message: 'Authentication system has issues',
            details: error instanceof Error ? error.message : 'Unknown error',
            canAutoFix: true,
            fixFunction: async () => {
              // Refresh token or redirect to login
              window.location.href = '/auth/signin';
            }
          };
        }
      }
    },
    {
      name: 'Legal Documents',
      check: async (): Promise<HealthCheckResult> => {
        try {
          const response = await fetch('/api/legal/documents');
          if (response.ok) {
            const docs = await response.json();
            if (docs.length >= 3) {
              return {
                name: 'Legal Documents',
                status: 'healthy',
                message: `${docs.length} legal documents are properly configured`
              };
            }
            return {
              name: 'Legal Documents',
              status: 'warning',
              message: 'Some legal documents may be missing',
              canAutoFix: true,
              fixFunction: async () => {
                await fetch('/api/admin/seed-legal-documents', { method: 'POST' });
              }
            };
          }
          throw new Error('Failed to fetch legal documents');
        } catch (error) {
          return {
            name: 'Legal Documents',
            status: 'error',
            message: 'Legal documents system has issues',
            details: error instanceof Error ? error.message : 'Unknown error',
            canAutoFix: true,
            fixFunction: async () => {
              await fetch('/api/admin/seed-legal-documents', { method: 'POST' });
            }
          };
        }
      }
    },
    {
      name: 'File Upload System',
      check: async (): Promise<HealthCheckResult> => {
        try {
          // Create a small test file
          const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
          const formData = new FormData();
          formData.append('file', testFile);
          
          const response = await fetch('/api/upload/test', {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            return {
              name: 'File Upload System',
              status: 'healthy',
              message: 'File upload system is working correctly'
            };
          }
          throw new Error('Upload test failed');
        } catch (error) {
          return {
            name: 'File Upload System',
            status: 'warning',
            message: 'File upload system may have issues',
            details: error instanceof Error ? error.message : 'Unknown error',
            canAutoFix: false
          };
        }
      }
    },
    {
      name: 'Email System',
      check: async (): Promise<HealthCheckResult> => {
        try {
          const response = await fetch('/api/health/email');
          if (response.ok) {
            return {
              name: 'Email System',
              status: 'healthy',
              message: 'Email service is configured and ready'
            };
          }
          throw new Error('Email system check failed');
        } catch (error) {
          return {
            name: 'Email System',
            status: 'warning',
            message: 'Email system may need configuration',
            details: error instanceof Error ? error.message : 'Unknown error',
            canAutoFix: false
          };
        }
      }
    },
    {
      name: 'API Endpoints',
      check: async (): Promise<HealthCheckResult> => {
        try {
          const endpoints = [
            '/api/dashboard/admin',
            '/api/campaigns',
            '/api/users',
            '/api/homepage/content'
          ];
          
          const results = await Promise.all(
            endpoints.map(endpoint => fetch(endpoint).then(r => ({ endpoint, ok: r.ok })))
          );
          
          const failedEndpoints = results.filter(r => !r.ok);
          
          if (failedEndpoints.length === 0) {
            return {
              name: 'API Endpoints',
              status: 'healthy',
              message: 'All core API endpoints are responding'
            };
          }
          
          return {
            name: 'API Endpoints',
            status: 'warning',
            message: `${failedEndpoints.length} endpoints are not responding`,
            details: failedEndpoints.map(e => e.endpoint).join(', '),
            canAutoFix: false
          };
        } catch (error) {
          return {
            name: 'API Endpoints',
            status: 'error',
            message: 'API system has critical issues',
            details: error instanceof Error ? error.message : 'Unknown error',
            canAutoFix: false
          };
        }
      }
    }
  ];

  const runHealthCheck = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    
    const totalChecks = healthChecks.length;
    const checkResults: HealthCheckResult[] = [];
    
    for (let i = 0; i < healthChecks.length; i++) {
      const check = healthChecks[i];
      try {
        const result = await check.check();
        checkResults.push(result);
        setResults([...checkResults]);
        setProgress(((i + 1) / totalChecks) * 100);
      } catch (error) {
        checkResults.push({
          name: check.name,
          status: 'error',
          message: 'Health check failed to run',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
        setResults([...checkResults]);
        setProgress(((i + 1) / totalChecks) * 100);
      }
    }
    
    setIsRunning(false);
    
    // Show summary toast
    const healthy = checkResults.filter(r => r.status === 'healthy').length;
    const warnings = checkResults.filter(r => r.status === 'warning').length;
    const errors = checkResults.filter(r => r.status === 'error').length;
    
    toast({
      title: "Health Check Complete",
      description: `${healthy} healthy, ${warnings} warnings, ${errors} errors`,
      variant: errors > 0 ? "destructive" : warnings > 0 ? "default" : "default"
    });
  };

  const autoFix = async (result: HealthCheckResult) => {
    if (!result.fixFunction) return;
    
    try {
      await result.fixFunction();
      toast({
        title: "Auto-fix Applied",
        description: `Attempted to fix: ${result.name}`,
      });
      
      // Re-run the specific check
      setTimeout(() => runHealthCheck(), 2000);
    } catch (error) {
      toast({
        title: "Auto-fix Failed",
        description: `Failed to fix: ${result.name}`,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="card-glass border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Activity className="w-5 h-5 mr-3 text-blue-400" />
          System Health Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={runHealthCheck}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Run Health Check
              </>
            )}
          </Button>
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/80">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="text-white font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.status)}
                    {result.canAutoFix && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => autoFix(result)}
                        className="border-white/20 hover:bg-white/10"
                      >
                        <Wrench className="w-3 h-3 mr-1" />
                        Fix
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-2">{result.message}</p>
                {result.details && (
                  <p className="text-white/60 text-xs font-mono bg-white/5 p-2 rounded">
                    {result.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && !isRunning && (
          <Alert className="border-blue-500/20 bg-blue-500/10">
            <AlertDescription className="text-blue-300">
              Health check complete. Use the Fix buttons to automatically resolve issues where possible.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}