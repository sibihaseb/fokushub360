import { Shield, UserCog, Lock } from "lucide-react";

export function AuthSection() {
  const features = [
    {
      icon: Shield,
      title: "Traditional Authentication Support",
      description: "Connect with your existing OAuth providers, SAML, Active Directory, or custom authentication systems for seamless user management.",
      color: "text-emerald-500"
    },
    {
      icon: UserCog,
      title: "Role-Based Access Control",
      description: "Define custom roles and permissions for Clients, Participants, Managers, and Admins with granular control over platform features.",
      color: "text-amber-500"
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "SOC 2 compliant with end-to-end encryption, audit logs, and enterprise-grade security measures to protect your sensitive research data.",
      color: "text-slate-700"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">
            Enterprise-Grade
            <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent"> Security</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Seamlessly integrate with your existing authentication systems for secure, scalable access management.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="High-end technology security setup" 
              className="rounded-2xl shadow-2xl w-full h-auto" 
            />
          </div>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl">
                <h3 className="text-xl font-display font-bold text-slate-900 mb-3 flex items-center">
                  <feature.icon className={`${feature.color} mr-2 h-6 w-6`} />
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
