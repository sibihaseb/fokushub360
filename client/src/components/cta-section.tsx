import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Rocket, Calendar } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-display font-bold text-white mb-6">
          Ready to Transform Your
          <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent"> Market Research?</span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of companies already using FokusHub360 to get faster, more accurate market insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/sign-up?role=client">
            <Button size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600 transform hover:scale-105 transition-all duration-200">
              <Rocket className="mr-2 h-5 w-5" />
              Start Your First Focus Group
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-200">
            <Calendar className="mr-2 h-5 w-5" />
            Schedule a Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
