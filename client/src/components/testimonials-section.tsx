import { Star, Quote, TrendingUp, Award, Users } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Director, TechCorp",
      company: "Fortune 500 Technology Company",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      content: "FokusHub360 revolutionized our product development cycle. The AI matching is incredibly accurate, and we've reduced our time-to-market by 40% with the quality insights we receive.",
      metric: "40% faster",
      metricLabel: "time-to-market"
    },
    {
      name: "Marcus Rodriguez",
      role: "Creative Director, Studio X",
      company: "Award-Winning Creative Agency",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      content: "The quality of feedback we receive is exceptional. Our campaigns now consistently perform 85% better because we understand our audience deeply before we launch.",
      metric: "85% better",
      metricLabel: "campaign performance"
    },
    {
      name: "Emma Thompson",
      role: "Founder & CEO, InnovateLab",
      company: "Seed-Stage Startup",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      content: "As a startup, professional market research was out of reach. FokusHub360 gave us enterprise-level insights at a fraction of the cost, helping us secure Series A funding.",
      metric: "$2.5M",
      metricLabel: "Series A raised"
    },
    {
      name: "David Kim",
      role: "Head of UX Research, DesignCorp",
      company: "Leading Design Agency",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      content: "The sentiment analysis and real-time insights have transformed how we approach user experience design. We're now data-driven in ways we never thought possible.",
      metric: "92% accuracy",
      metricLabel: "user satisfaction"
    },
    {
      name: "Lisa Wang",
      role: "VP Marketing, GrowthCo",
      company: "B2B SaaS Company",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      content: "FokusHub360's global reach helped us understand cultural nuances across different markets. Our international expansion was seamless thanks to their insights.",
      metric: "150+ countries",
      metricLabel: "market reach"
    },
    {
      name: "James Mitchell",
      role: "Research Director, InsightsCorp",
      company: "Market Research Firm",
      avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      content: "Even as seasoned researchers, we were impressed by the platform's sophistication. The AI-generated reports are indistinguishable from our senior analysts' work.",
      metric: "96% satisfaction",
      metricLabel: "client retention"
    }
  ];

  const stats = [
    { icon: TrendingUp, value: "500+", label: "Companies Trust Us" },
    { icon: Users, value: "50K+", label: "Global Participants" },
    { icon: Award, value: "98%", label: "Success Rate" },
    { icon: Star, value: "4.9/5", label: "Client Rating" }
  ];

  return (
    <section id="testimonials" className="py-32 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
            <Award className="w-4 h-4 mr-2" />
            Trusted by Industry Leaders
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-6">
            What Our Clients
            <span className="text-gradient-animated block">Are Saying</span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            From Fortune 500 companies to innovative startups, discover how FokusHub360 is revolutionizing market research across industries.
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-premium hover-lift group">
              <div className="flex items-center mb-6">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-emerald-500/20" />
                <p className="text-slate-600 italic relative z-10 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full mr-4 object-cover ring-2 ring-emerald-100" 
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-xs text-slate-500">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">{testimonial.metric}</div>
                  <div className="text-xs text-slate-500">{testimonial.metricLabel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-display font-bold mb-4">
              Ready to Transform Your Market Research?
            </h3>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of companies who trust FokusHub360 for their critical market insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-premium px-8 py-3 text-lg font-semibold hover-lift">
                Start Your Free Trial
              </button>
              <button className="glass-effect border-white/30 hover:bg-white/20 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300">
                View Case Studies
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
