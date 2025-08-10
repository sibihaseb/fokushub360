import { Brain, Palette, TrendingUp, Check, Bot, Shield, Users, Zap, BarChart3, Target } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Our intelligent system matches your project with the perfect participants based on 100+ profile attributes, ensuring relevant and actionable feedback.",
      gradient: "from-emerald-500 to-teal-600",
      items: [
        "Smart demographic targeting",
        "Behavioral pattern analysis", 
        "Automated report generation",
        "Real-time matching algorithms"
      ]
    },
    {
      icon: Palette,
      title: "Visual Campaign Studio",
      description: "Upload and showcase your digital assets with professional presentation tools. From movie trailers to app mockups, everything looks pixel-perfect.",
      gradient: "from-amber-500 to-orange-600",
      items: [
        "Secure cloud storage",
        "Watermarking protection",
        "Multi-format support",
        "Interactive preview tools"
      ]
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Get comprehensive insights with sentiment analysis, keyword clouds, and AI-generated recommendations that turn feedback into actionable strategies.",
      gradient: "from-blue-500 to-indigo-600",
      items: [
        "Real-time dashboards",
        "Exportable reports",
        "Sentiment heatmaps",
        "Predictive insights"
      ]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption, GDPR compliance, and SOC 2 Type II certification for ultimate peace of mind.",
      gradient: "from-purple-500 to-violet-600",
      items: [
        "End-to-end encryption",
        "GDPR compliance",
        "SOC 2 certified",
        "Role-based access control"
      ]
    },
    {
      icon: Users,
      title: "Global Participant Network",
      description: "Access our verified network of 50,000+ participants across 150+ countries with detailed profiles and engagement history.",
      gradient: "from-pink-500 to-rose-600",
      items: [
        "Verified participant profiles",
        "150+ countries covered",
        "Quality scoring system",
        "Instant availability checks"
      ]
    },
    {
      icon: Zap,
      title: "Lightning Fast Results",
      description: "Get results in minutes, not weeks. Our automated system handles everything from recruitment to report generation.",
      gradient: "from-cyan-500 to-blue-600",
      items: [
        "Results in under 24 hours",
        "Automated recruitment",
        "Instant notifications",
        "One-click campaign launch"
      ]
    }
  ];

  return (
    <section id="features" className="py-32 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
            <Bot className="w-4 h-4 mr-2" />
            Powered by Advanced AI
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-6">
            Everything You Need for
            <span className="text-gradient-animated block">Perfect Market Research</span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Our AI-powered platform handles everything from participant matching to advanced analytics, delivering insights that drive better decisions across every stage of your research.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="card-premium hover-lift group">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <feature.icon className="text-white h-8 w-8" />
              </div>
              
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-3">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-sm text-slate-600">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="text-emerald-600 h-3 w-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Advanced Features Showcase */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-display font-bold mb-4">
                Advanced Features That Set Us Apart
              </h3>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Discover the cutting-edge capabilities that make FokusHub360 the premium choice for market research professionals.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="card-glass text-center p-8">
                <BarChart3 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Real-Time Analytics</h4>
                <p className="text-white/70">Watch insights unfold as participants engage with your content</p>
              </div>
              
              <div className="card-glass text-center p-8">
                <Target className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Precision Targeting</h4>
                <p className="text-white/70">Reach exactly the right audience with our advanced matching algorithms</p>
              </div>
              
              <div className="card-glass text-center p-8">
                <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Lightning Speed</h4>
                <p className="text-white/70">From setup to results in under 24 hours with full automation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
