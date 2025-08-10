import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Home, 
  Users, 
  Rocket, 
  Mail, 
  ArrowLeft,
  Sparkles,
  Target,
  MessageCircle
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Main illustration/icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for seems to have wandered off into the digital void. 
            But don't worry - we've got some great alternatives for you!
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
            <Link href="/auth/signup?type=participant">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Join as Participant
                </h3>
                <p className="text-sm text-gray-600">
                  Share your opinions and earn rewards by participating in focus groups
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
            <Link href="/auth/signup?type=client">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Rocket className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Launch Campaign
                </h3>
                <p className="text-sm text-gray-600">
                  Get valuable market insights with our AI-powered focus group platform
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
            <Link href="/contact">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Contact Us
                </h3>
                <p className="text-sm text-gray-600">
                  Need help? Our support team is ready to assist you
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Additional navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="text-gray-700 hover:text-gray-900"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>

        {/* Fun fact or helpful tip */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
            <Target className="w-5 h-5" />
            <span className="font-medium">Did you know?</span>
          </div>
          <p className="text-sm text-blue-600">
            FokusHub360 connects thousands of participants with brands to create meaningful market research. 
            Join our community and be part of shaping the future of products and services!
          </p>
        </div>
      </div>
    </div>
  );
}
