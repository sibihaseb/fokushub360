import { NavigationHeader } from "@/components/navigation-header";

export default function Notifications() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationHeader />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Notifications</h1>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8 text-center">
            <p className="text-white/60">Notifications page coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}