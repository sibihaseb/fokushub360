export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Upload Your Assets",
      description: "Upload images, videos, prototypes, or links. Our platform securely stores and presents your content professionally.",
      color: "bg-emerald-500"
    },
    {
      number: "2",
      title: "AI Matches Perfect Participants",
      description: "Our intelligent matching system finds participants who perfectly match your target demographic and use case.",
      color: "bg-amber-500"
    },
    {
      number: "3",
      title: "Automated Feedback Collection",
      description: "Participants provide detailed feedback through our optimized interface, with AI monitoring engagement and quality.",
      color: "bg-slate-700"
    },
    {
      number: "4",
      title: "Instant Insights & Reports",
      description: "Get comprehensive analytics with sentiment analysis, keyword insights, and actionable recommendations.",
      color: "bg-emerald-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">
            From Concept to
            <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent"> Insights</span>
            in Minutes
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our streamlined workflow gets you from idea to actionable feedback faster than any traditional focus group method.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Premium digital interface design" 
              className="rounded-2xl shadow-2xl w-full h-auto" 
            />
          </div>
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
