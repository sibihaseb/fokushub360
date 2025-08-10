import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [, params] = useRoute("/auth/reset-password/:token");
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [tokenValid, setTokenValid] = useState(false);

  const token = params?.token;

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setIsVerifying(false);
      setMessage("No reset token provided");
      setMessageType("error");
    }
  }, [token]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-reset-token/${token}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setTokenValid(true);
      } else {
        setMessage(data.message || "Invalid or expired reset token");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setMessage("Failed to verify reset token");
      setMessageType("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setMessageType(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType("success");
        setPassword("");
        setConfirmPassword("");
        
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          setLocation("/auth/signin");
        }, 3000);
      } else {
        setMessage(data.message || "Failed to reset password. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("Network error. Please check your connection and try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass-effect border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 text-slate-300">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Verifying reset token...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass-effect border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-slate-300">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-900/20 border-red-500 text-red-200">
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Link href="/auth/forgot-password">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass-effect border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" />
              Reset Password
            </CardTitle>
            <CardDescription className="text-slate-300">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  required
                  minLength={8}
                />
              </div>

              {message && (
                <Alert className={`${
                  messageType === "success" 
                    ? "bg-green-900/20 border-green-500 text-green-200" 
                    : "bg-red-900/20 border-red-500 text-red-200"
                }`}>
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            {messageType === "success" && (
              <div className="text-center text-slate-400 text-sm">
                Redirecting to sign in page in 3 seconds...
              </div>
            )}

            <div className="text-center">
              <Link href="/auth/signin">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}