import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Users, Target, ArrowRight, Sparkles, Crown, Star, Shield, Zap, TrendingUp, BarChart3, Globe, Calendar, Calculator } from "lucide-react";

export function PricingSection() {

  const pricingFeatures = [
    {
      icon: Target,
      title: "Flexible Participant Scaling",
      description: "From intimate focus groups to large-scale research studies",
      benefits: ["10-10,000+ participants", "Dynamic scaling", "Cost-efficient tiers"],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Crown,
      title: "Premium AI-Powered Matching",
      description: "Advanced algorithms ensure perfect participant selection",
      benefits: ["Behavioral analysis", "Demographic targeting", "Quality scoring"],
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Deep insights and actionable intelligence from your research",
      benefits: ["Real-time dashboards", "Custom reports", "Trend analysis"],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Enterprise-Grade Security",
      description: "Your data is protected with industry-leading security",
      benefits: ["End-to-end encryption", "GDPR compliance", "Secure storage"],
      gradient: "from-red-500 to-rose-500"
    }
  ];

  const scaleOptions = [
    { 
      range: "10-50", 
      title: "Small Scale", 
      description: "Perfect for concept testing and initial feedback",
      icon: Zap,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      range: "50-200", 
      title: "Medium Scale", 
      description: "Ideal for market research and product validation",
      icon: Target,
      color: "from-green-500 to-emerald-500"
    },
    { 
      range: "200-500", 
      title: "Large Scale", 
      description: "Comprehensive research for major decisions",
      icon: Users,
      color: "from-purple-500 to-indigo-500"
    },
    { 
      range: "500+", 
      title: "Enterprise Scale", 
      description: "Massive campaigns for global insights",
      icon: Crown,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            Customized Pricing
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Scale, Your Price
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete control from 10 participants to thousands. Pay only for what you need with transparent, 
            flexible pricing that scales with your research goals.
          </p>
        </div>

        {/* Scale Options */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {scaleOptions.map((option, index) => (
            <Card key={index} className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{option.title}</CardTitle>
                <Badge variant="outline" className="w-fit mx-auto">
                  {option.range} participants
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {pricingFeatures.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Pricing CTA */}
        <Card className="max-w-4xl mx-auto mb-16 shadow-2xl border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              Tailored Solutions for Every Scale
            </CardTitle>
            <CardDescription className="text-lg text-slate-300">
              From startups to Fortune 500 companies, we customize pricing to fit your research needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-slate-800 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h4 className="font-semibold text-white mb-2">Scalable Pricing</h4>
                <p className="text-slate-300 text-sm">Pay-as-you-grow model with volume discounts</p>
              </div>
              <div className="text-center p-6 bg-slate-800 rounded-lg">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <h4 className="font-semibold text-white mb-2">No Hidden Fees</h4>
                <p className="text-slate-300 text-sm">Transparent pricing with no surprise charges</p>
              </div>
              <div className="text-center p-6 bg-slate-800 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <h4 className="font-semibold text-white mb-2">Flexible Terms</h4>
                <p className="text-slate-300 text-sm">Monthly, quarterly, or annual billing options</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg">
                  Get Custom Pricing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-slate-400 text-sm mt-4">
                Free consultation • No commitment • Custom quote in 24 hours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Section */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              Enterprise Solutions
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              For organizations requiring massive scale and custom solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-4">Enterprise Features</h4>
                <ul className="space-y-2">
                  {[
                    "Unlimited participants",
                    "Custom AI models",
                    "White-label platform",
                    "Dedicated success manager",
                    "24/7 phone support",
                    "API access & webhooks",
                    "Advanced security",
                    "Custom integrations"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-4">Custom Pricing</div>
                <p className="text-slate-300 mb-6">
                  Tailored solutions for your specific needs and budget
                </p>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}