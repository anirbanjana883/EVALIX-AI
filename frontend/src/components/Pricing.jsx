import { CheckCircle2, X, Zap, Sparkles, Building2, BrainCircuit } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "0",
      description: "Perfect for individual tutors trying out AI evaluation.",
      icon: <BrainCircuit size={24} className="text-text-secondary shrink-0" />,
      features: [
        { name: "Up to 50 evaluations per day", included: true },
        { name: "Basic descriptive & MCQ grading", included: true },
        { name: "Standard plagiarism detection", included: true },
        { name: "Auto Question Generation", included: false },
        { name: "Priority Support", included: false },
      ],
      cta: "Get Started Free",
      popular: false,
      buttonClass: "bg-bg-primary border border-border-strong text-white hover:border-brand-400 transition-colors"
    },
    {
      name: "Pro Educator",
      price: "1,599",
      description: "Ideal for full-time teachers handling multiple batches.",
      icon: <Zap size={24} className="text-amber-400 shrink-0" />,
      features: [
        { name: "Up to 500 evaluations per day", included: true },
        { name: "Advanced AI grading with RAG context", included: true },
        { name: "Deep vector plagiarism checks", included: true },
        { name: "Detailed analytics & PDF exports", included: true },
        { name: "Auto Question Generation", included: false },
      ],
      cta: "Start 7-Day Trial",
      popular: false,
      buttonClass: "bg-bg-secondary border border-amber-400/50 text-amber-400 hover:bg-amber-400/10 transition-colors"
    },
    {
      name: "Elite AI",
      price: "2,599",
      description: "The ultimate automated evaluation suite for heavy workloads.",
      icon: <Sparkles size={24} className="text-brand-400 shrink-0" />,
      features: [
        { name: "Up to 1,000 evaluations per day", included: true },
        { name: "Auto Question Generation (AI Syllabus Parsing)", included: true },
        { name: "Advanced AI grading with RAG context", included: true },
        { name: "Deep vector plagiarism checks", included: true },
        { name: "Priority 24/7 Email & Chat Support", included: true },
      ],
      cta: "Upgrade to Elite",
      popular: true,
      buttonClass: "bg-brand-400 border border-transparent text-white hover:bg-brand-600 shadow-[0_0_20px_rgba(216,90,48,0.3)] transition-all hover:-translate-y-[1px]"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For universities and large-scale coaching institutions.",
      icon: <Building2 size={24} className="text-teal-400 shrink-0" />,
      features: [
        { name: "Unlimited daily evaluations", included: true },
        { name: "Custom AI Model Fine-Tuning", included: true },
        { name: "SSO & Custom Domain Branding", included: true },
        { name: "Dedicated Account Manager", included: true },
        { name: "On-Premise Deployment Options", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
      buttonClass: "bg-bg-primary border border-border-strong text-white hover:border-teal-400 transition-colors"
    }
  ];

  return (
    <section className="py-24 bg-bg-base text-text-primary font-sans relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <h2 className="font-display text-brand-400 font-bold tracking-widest uppercase text-[12px] mb-3">
            Transparent Pricing
          </h2>
          <h3 className="font-display text-[clamp(32px,5vw,48px)] font-extrabold text-white leading-tight mb-6 tracking-tight">
            Scale your teaching, <br /> not your workload.
          </h3>
          <p className="text-[16px] text-text-secondary leading-relaxed">
            Choose the perfect plan for your classroom size. Upgrade, downgrade, or cancel anytime. All plans are billed securely in INR.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <div 
              key={plan.name} 
              className={`relative flex flex-col bg-bg-secondary rounded-3xl p-8 transition-all duration-300 animate-fade-up ${
                plan.popular 
                  ? "border-2 border-brand-400 shadow-[0_0_40px_rgba(216,90,48,0.1)] -translate-y-2" 
                  : "border border-border-strong hover:border-border-hi"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-400 text-white font-display font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-bg-primary border border-border-strong shrink-0 ${plan.popular ? 'border-brand-400/30 bg-brand-400/10' : ''}`}>
                  {plan.icon}
                </div>
                <div>
                  <h4 className="font-display text-[18px] font-bold text-white leading-tight">{plan.name}</h4>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-end gap-1">
                  {plan.price !== "Custom" && <span className="text-[24px] font-bold text-text-dim font-display leading-none mb-1">₹</span>}
                  <span className="font-display text-[42px] font-extrabold text-white leading-none tracking-tight">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && <span className="text-[14px] text-text-dim font-medium mb-1">/mo</span>}
                </div>
              </div>

              <p className="text-[13.5px] text-text-secondary leading-relaxed mb-8 min-h-[40px]">
                {plan.description}
              </p>

              <div className="w-full h-px bg-border-strong mb-8" />

              {/* Features List */}
              <ul className="flex flex-col gap-4 mb-10 flex-1">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <CheckCircle2 size={18} className="text-brand-400 shrink-0 mt-0.5" />
                    ) : (
                      <X size={18} className="text-text-muted shrink-0 mt-0.5" />
                    )}
                    <span className={`text-[13.5px] leading-snug ${feature.included ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className={`w-full py-3.5 rounded-xl font-display font-bold text-[14px] tracking-wide mt-auto ${plan.buttonClass}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;