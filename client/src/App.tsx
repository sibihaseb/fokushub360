import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import SignIn from "@/pages/auth/sign-in";
import SignUp from "@/pages/auth/sign-up";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import ClientDashboard from "@/pages/dashboard/client-dashboard";
import ParticipantDashboard from "@/pages/dashboard/participant-dashboard";
import ManagerDashboard from "@/pages/dashboard/manager-dashboard";
import AdminDashboard from "@/pages/dashboard/admin-dashboard";
import QuestionnaireManager from "@/pages/admin/questionnaire-manager";
import AISettings from "@/pages/admin/ai-settings";
import AIMatchingDashboard from "@/pages/admin/ai-matching-dashboard";
import VerificationDashboard from "@/pages/admin/verification-dashboard";
import PricingDashboard from "@/pages/admin/pricing-dashboard";
import SentimentDashboard from "@/pages/admin/sentiment-dashboard";
import ContentProtectionDashboard from "@/pages/admin/content-protection-dashboard";
import UserManagement from "@/pages/admin/user-management";
import Reports from "@/pages/dashboard/reports";
import CreateCampaign from "@/pages/campaigns/create-campaign";
import Onboarding from "@/pages/onboarding";
import Messages from "@/pages/messages";
import Contact from "@/pages/contact";
import Verification from "@/pages/verification";
import Notifications from "@/pages/notifications";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import CampaignParticipate from "@/pages/campaign-participate";
import { DataRightsPage } from "@/components/data-rights-page";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth/sign-in" component={SignIn} />
      <Route path="/auth/sign-up" component={SignUp} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password/:token" component={ResetPassword} />
      <Route path="/contact" component={Contact} />
      <Route path="/data-rights" component={DataRightsPage} />

      {/* Protected routes */}
      {isAuthenticated && (
        <>
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/dashboard">
            {/* Force participants to complete questionnaire before accessing dashboard */}
            {/* {user?.role === "participant" && !user?.questionnaireCompleted && (
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md mx-auto text-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>
                    <p className="text-white/80 mb-6">
                      You must complete the onboarding questionnaire before accessing the dashboard.
                    </p>
                    <Button
                      onClick={() => window.location.href = "/onboarding"}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Complete Questionnaire
                    </Button>
                  </div>
                </div>
              </div>
            )} */}
            {user?.role === "client" && <ClientDashboard />}
            {user?.role === "participant" &&  <ParticipantDashboard />}
            {user?.role === "manager" && <ManagerDashboard />}
            {user?.role === "admin" && <AdminDashboard />}
          </Route>
          <Route path="/dashboard/client" component={ClientDashboard} />
          <Route path="/dashboard/participant">
            {/* {user?.role === "participant" && !user?.questionnaireCompleted ? (
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md mx-auto text-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>
                    <p className="text-white/80 mb-6">
                      You must complete the onboarding questionnaire before accessing the dashboard.
                    </p>
                    <Button
                      onClick={() => window.location.href = "/onboarding"}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Complete Questionnaire
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ParticipantDashboard />
            )} */}
             <ParticipantDashboard />
          </Route>
          <Route path="/dashboard/manager" component={ManagerDashboard} />
          <Route path="/dashboard/admin" component={AdminDashboard} />
          <Route path="/admin/questionnaire" component={QuestionnaireManager} />
          <Route path="/admin/ai-settings" component={AISettings} />
          <Route path="/admin/ai-matching-dashboard" component={AIMatchingDashboard} />
          <Route path="/admin/verification-dashboard" component={VerificationDashboard} />
          <Route path="/admin/pricing-dashboard" component={PricingDashboard} />
          <Route path="/admin/sentiment-dashboard" component={SentimentDashboard} />
          <Route path="/admin/content-protection-dashboard" component={ContentProtectionDashboard} />
          <Route path="/admin/user-management" component={UserManagement} />
          <Route path="/dashboard/reports" component={Reports} />
          <Route path="/campaigns/create" component={CreateCampaign} />
          <Route path="/campaigns/create-campaign" component={CreateCampaign} />
          <Route path="/messages" component={Messages} />
          <Route path="/verification" component={Verification} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route path="/campaign/:id/participate">
            {(params) => <CampaignParticipate campaignId={params.id} />}
          </Route>
        </>
      )}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
