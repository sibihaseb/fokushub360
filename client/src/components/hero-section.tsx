import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Sparkles, Zap, Globe } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-hero"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-32 left-20 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-amber-500/20 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 blur-3xl animate-pulse-slow"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2" />
            Premium Virtual Focus Groups
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight mb-8 animate-slide-up">
            <span className="block mb-2">Experience the</span>
            <span className="text-gradient-animated block mb-2">Future of Market</span>
            <span className="block">Research</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up">
            Transform how you gather insights with our AI-powered platform. Connect with perfectly matched participants, analyze sentiment in real-time, and get actionable feedback in minutes, not weeks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up">
            <Link href="/auth/sign-up?role=client">
              <Button size="lg" className="btn-premium text-white px-8 py-4 text-lg font-semibold hover-lift shadow-premium">
                <Plus className="mr-2 h-5 w-5" />
                Launch Your Campaign
              </Button>
            </Link>
            <Link href="/auth/sign-up?role=participant">
              <Button size="lg" variant="outline" className="glass-effect text-white border-white/30 hover:bg-white/20 px-8 py-4 text-lg font-semibold hover-lift">
                <UserPlus className="mr-2 h-5 w-5" />
                Join as Participant
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-slide-up">
          <div className="card-glass text-center p-8 hover-lift">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">85%</h3>
            <p className="text-white/70">Faster than traditional focus groups</p>
          </div>
          
          <div className="card-glass text-center p-8 hover-lift">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-full mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">150+</h3>
            <p className="text-white/70">Countries and regions covered</p>
          </div>
          
          <div className="card-glass text-center p-8 hover-lift">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">98%</h3>
            <p className="text-white/70">Client satisfaction rate</p>
          </div>
        </div>
        
        {/* Video/Demo Section */}
        <div className="relative max-w-5xl mx-auto animate-slide-up">
          <div className="relative rounded-2xl overflow-hidden shadow-premium">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-amber-500/20 animate-pulse-slow"></div>
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900" 
              alt="Modern focus group platform interface" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110">
                <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
              </button>
            </div>
          </div>
          
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-primary rounded-full blur-xl animate-pulse-slow"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-secondary rounded-full blur-xl animate-pulse-slow"></div>
        </div>
      </div>
    </section>
  );
}
