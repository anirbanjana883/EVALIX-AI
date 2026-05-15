import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit, Sparkles, ShieldCheck, Zap, Users, BarChart3,
  FileEdit, CheckCircle2, ArrowRight, ChevronDown, Mail,
  GraduationCap, Clock, Bot, Award, Target,
  Play, Star, Menu, X
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Pricing from "../components/Pricing"; // 🌟 Importing the Pricing Component

/* ─── Intersection Observer hook (Tailwind version) ─── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { 
        if (e.isIntersecting) { 
          e.target.classList.remove("opacity-0", "translate-y-12");
          e.target.classList.add("opacity-100", "translate-y-0");
          obs.unobserve(e.target); 
        } 
      }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

/* ─── Component ─── */
const Home = () => {
  useReveal();
  const navigate = useNavigate();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [formSent, setFormSent]       = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    ["Features", "features"], 
    ["How it Works", "how"], 
    ["Pricing", "pricing"], // 🌟 Added Pricing Link
    ["Tech", "tech"], 
    ["Contact", "contact"]
  ];

  const features = [
    { icon: <BrainCircuit size={20} />, title: "Multimodal AI Grading", desc: "Gemini reads student handwriting, diagrams, and pseudo-code — then scores against your model answer with human-level understanding.", tag: { label: "Vision AI", cls: "text-brand-400 bg-brand-400/10 border-brand-400/20" } },
    { icon: <Zap size={20} />, title: "Instant MCQ Evaluation", desc: "Auto-graded MCQs with colour-coded correctness feedback, detailed explanations, and score analytics — delivered in milliseconds.", tag: { label: "Real-time", cls: "text-teal-400 bg-teal-400/10 border-teal-400/20" } },
    { icon: <ShieldCheck size={20} />, title: "Bulletproof Time-Locks", desc: "Strict start/end/release timestamps ensure students can't access exams early or view results before the release window.", tag: { label: "Security", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" } },
    { icon: <Award size={20} />, title: "Human-in-the-Loop (HITL)", desc: "Teachers retain ultimate control — override AI scores, attach personal remarks, and the total recalculates instantly.", tag: { label: "Override", cls: "text-brand-400 bg-brand-400/10 border-brand-400/20" }, large: true },
    { icon: <Sparkles size={20} />, title: "AI Exam Generator", desc: "Paste a syllabus + past papers. Get a perfectly formatted question set with model answers, exported to Excel in one click.", tag: { label: "Generator", cls: "text-teal-400 bg-teal-400/10 border-teal-400/20" }, large: true },
    { icon: <BarChart3 size={20} />, title: "Real-Time Analytics", desc: "Class averages, completion rates, and pending evaluations all live on the teacher dashboard.", tag: { label: "Insights", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" } },
    { icon: <Target size={20} />, title: "Cohort-Based Routing", desc: "Assignments auto-route to the right Department, Year, and Batch — no manual distribution needed.", tag: { label: "Smart", cls: "text-brand-400 bg-brand-400/10 border-brand-400/20" } },
    { icon: <Clock size={20} />, title: "Same-Day Results", desc: "Reduce grading turnaround from weeks to minutes. Students get constructive AI feedback before their next class.", tag: { label: "Fast", cls: "text-teal-400 bg-teal-400/10 border-teal-400/20" } },
    { icon: <Bot size={20} />, title: "Dual AI Agents", desc: "A Vision Agent (OCR) and an Evaluator Agent work in tandem — one reads, one grades. Separate concerns, maximum accuracy.", tag: { label: "Pipeline", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" } },
  ];

  const techStack = [
    { label: "React 19 + Vite", color: "#61DAFB" },
    { label: "Node.js + Express 5", color: "#68A063" },
    { label: "PostgreSQL + Prisma", color: "#336791" },
    { label: "Gemini 2.5 Pro", color: "#4285F4" },
    { label: "Gemini 2.5 Flash", color: "#34A853" },
    { label: "Supabase Auth", color: "#3ECF8E" },
    { label: "Supabase Storage", color: "#3ECF8E" },
    { label: "Tailwind CSS 4", color: "#38BDF8" },
    { label: "React Router v7", color: "#F44250" },
    { label: "XLSX Export", color: "#217346" },
  ];

  const roadmap = [
    { icon: "🎯", title: "UPSC Civil Services", desc: "Long-form essay evaluation against complex rubrics — analytical depth, ethical reasoning, and multidimensional perspectives.", tags: ["Essay Grading", "250-word Mains", "RAG Pipeline"] },
    { icon: "📐", title: "JEE Joint Entrance", desc: "Step-by-step derivation tracking, spatial diagram reasoning for circuit diagrams, and customizable partial marking.", tags: ["Derivation Tracking", "Diagram AI", "Partial Marks"] },
    { icon: "🧬", title: "NEET Medical Entrance", desc: "OMR + Descriptive hybrid grading, NCERT-aligned question generation, and NTA-standard mock tests.", tags: ["OMR Hybrid", "NCERT Aligned", "NTA Standard"] },
    { icon: "🏢", title: "B2B Coaching Centers", desc: "Multi-tenant architecture for large institutes — manage 10,000+ students with branch and batch-level analytics.", tags: ["Multi-tenant", "10K+ Students", "Branch Analytics"] },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans selection:bg-brand-400/30 selection:text-white">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? "bg-bg-primary/80 backdrop-blur-lg border-border-strong shadow-sm py-3" : "bg-transparent border-transparent py-5"}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex items-center justify-between">
          <button className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollTo("hero")}>
            <div className="w-8 h-8 rounded-full border-2 border-brand-400 bg-brand-400/10 flex items-center justify-center shrink-0">
              <BrainCircuit size={16} className="text-brand-400 shrink-0" />
            </div>
            <span className="font-display font-extrabold text-[16px] tracking-wide text-white">
              EVALIX <span className="text-brand-400">AI</span>
            </span>
          </button>
          
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(([l, id]) => (
              <button key={id} className="text-[13px] font-bold text-text-secondary hover:text-brand-400 transition-colors font-display uppercase tracking-widest" onClick={() => scrollTo(id)}>{l}</button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-[14px] font-bold text-white hover:text-brand-400 transition-colors" onClick={() => navigate("/auth")}>Sign In</button>
            <button className="hidden sm:flex items-center justify-center px-6 py-2.5 bg-brand-400 hover:bg-brand-600 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(216,90,48,0.3)] hover:shadow-[0_0_25px_rgba(216,90,48,0.5)] hover:-translate-y-px font-display text-[13px]" onClick={() => navigate("/auth")}>
              Get Started →
            </button>
            <button className="lg:hidden text-text-secondary hover:text-white" onClick={() => setMobileOpen(true)}><Menu size={24} /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-bg-base/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center gap-6 transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <button className="absolute top-6 right-6 text-text-secondary hover:text-white p-2" onClick={() => setMobileOpen(false)}><X size={28} /></button>
        {navLinks.map(([l, id]) => (
          <button key={id} className="text-[20px] font-display font-bold text-white uppercase tracking-widest hover:text-brand-400 transition-colors" onClick={() => scrollTo(id)}>{l}</button>
        ))}
        <button className="mt-4 px-8 py-3.5 bg-brand-400 text-white font-bold rounded-xl font-display text-[16px]" onClick={() => { setMobileOpen(false); navigate("/auth"); }}>Get Started →</button>
      </div>

      {/* ── HERO ── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden">
        {/* Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-400/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-[1000px] mx-auto px-6 text-center reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary border border-border-strong text-[12px] font-bold text-text-secondary uppercase tracking-widest font-display mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" /> Enterprise AI Exam Evaluation
          </div>
          <h1 className="font-display font-extrabold text-[clamp(40px,8vw,80px)] leading-[1.1] text-white tracking-tight mb-6">
            Grade Smarter.<br />
            Teach <span className="text-brand-400">Faster.</span>
          </h1>
          <p className="text-[clamp(16px,2vw,20px)] text-text-secondary leading-relaxed max-w-3xl mx-auto mb-10">
            EVALIX AI uses multimodal LLMs to read student handwriting, evaluate answers against model solutions, and deliver instant, constructive feedback — while teachers retain full control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="w-full sm:w-auto px-8 py-4 bg-brand-400 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(216,90,48,0.4)] hover:shadow-[0_0_30px_rgba(216,90,48,0.6)] hover:-translate-y-1 font-display text-[15px] flex items-center justify-center gap-2" onClick={() => navigate("/auth")}>
              <Sparkles size={18} className="shrink-0" /> Start for Free
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-bg-secondary hover:bg-bg-hover text-white border border-border-strong font-bold rounded-xl transition-all hover:-translate-y-1 font-display text-[15px] flex items-center justify-center gap-2" onClick={() => scrollTo("how")}>
              <Play size={18} className="shrink-0" /> See How It Works
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-border-strong pt-10">
            {[
              { val: "< 2", unit: "min", label: "Average Grading Time" },
              { val: "99", unit: "%", label: "Handwriting Accuracy" },
              { val: "10x", unit: "", label: "Faster than Manual Grading" },
              { val: "HITL", unit: "", label: "Human Override Always On" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="font-display font-extrabold text-[32px] text-white leading-none mb-1">
                  {s.val}<span className="text-brand-400 text-[20px]">{s.unit}</span>
                </div>
                <div className="text-[12px] text-text-dim uppercase tracking-widest font-bold font-display text-center">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-text-dim text-[11px] uppercase tracking-widest font-bold font-display animate-bounce">
          <span className="mb-2">Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          <div className="flex items-center justify-center gap-2 text-brand-400 font-bold uppercase tracking-widest text-[12px] font-display mb-4">
            <Zap size={14} className="shrink-0" /> How It Works
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,48px)] font-extrabold text-white leading-tight mb-4 tracking-tight">From paper to grades in minutes</h2>
          <p className="text-[16px] text-text-secondary leading-relaxed">A fully automated pipeline that handles the entire exam lifecycle — creation to results.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[40px] left-[50px] right-[50px] h-[2px] bg-border-strong z-0" />
          
          {[
            { n: "1", icon: <FileEdit size={24} />, label: "Teacher Creates Exam", desc: "Adds questions, model answers, and strict time-locks" },
            { n: "2", icon: <GraduationCap size={24} />, label: "Student Submits", desc: "Uploads handwritten sheets or selects MCQ options" },
            { n: "3", icon: <BrainCircuit size={24} />, label: "Vision Agent", desc: "Gemini reads and transcribes handwriting with near-perfect accuracy" },
            { n: "4", icon: <Bot size={24} />, label: "Evaluator Agent", desc: "Scores against model answer, generates detailed feedback" },
            { n: "5", icon: <Award size={24} />, label: "Teacher Reviews", desc: "Overrides if needed, then releases marks to students" },
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-4 w-full md:w-1/5 group">
              <div className="w-[80px] h-[80px] rounded-2xl bg-bg-secondary border-2 border-border-strong flex items-center justify-center text-text-secondary group-hover:border-brand-400 group-hover:text-brand-400 transition-colors shrink-0 relative shadow-sm">
                {step.icon}
                <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-brand-400 text-white flex items-center justify-center font-display font-bold text-[12px] border-[3px] border-bg-base">
                  {step.n}
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-[16px] text-white mb-2">{step.label}</h3>
                <p className="text-[13.5px] text-text-dim leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="mb-16 reveal opacity-0 translate-y-12 transition-all duration-700 ease-out text-center">
          <div className="flex items-center justify-center gap-2 text-brand-400 font-bold uppercase tracking-widest text-[12px] font-display mb-4">
            <Sparkles size={14} className="shrink-0" /> Features
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,48px)] font-extrabold text-white leading-tight tracking-tight">Everything you need to<br />run modern exams</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`bg-bg-secondary border border-border-strong rounded-3xl p-8 hover:border-brand-400/50 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all duration-300 reveal opacity-0 translate-y-12 ease-out ${f.large ? "md:col-span-2" : ""}`} style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="w-12 h-12 rounded-xl bg-bg-primary border border-border-strong flex items-center justify-center text-text-primary mb-6">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-[20px] text-white mb-3">{f.title}</h3>
              <p className="text-[14.5px] text-text-secondary leading-relaxed mb-6 flex-1">{f.desc}</p>
              <div className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest font-display border ${f.tag.cls}`}>
                {f.tag.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      {/* ── SHOWCASE: TEACHER ── */}
      <section className="py-24 px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-brand-400 font-bold uppercase tracking-widest text-[12px] font-display mb-4">
              <Users size={14} className="shrink-0" /> For Teachers
            </div>
            <h2 className="font-display text-[clamp(28px,4vw,40px)] font-extrabold text-white leading-tight mb-6 tracking-tight">Split-screen grading with AI superpowers</h2>
            <p className="text-[16px] text-text-secondary leading-relaxed mb-8">Review student submissions, AI scores, and model answers side by side. Override with a single click — the total recalculates instantly.</p>
            <div className="flex flex-col gap-4 mb-10">
              {["Handwriting transcription by Vision AI", "Side-by-side student vs model answer", "One-click score override with remarks", "Auto-recalculated total score", "Batch analytics on the dashboard"].map((item, i) => (
                <div className="flex items-center gap-3 text-[14.5px] text-text-primary font-medium" key={i}>
                  <CheckCircle2 size={18} className="text-brand-400 shrink-0" /> {item}
                </div>
              ))}
            </div>
            <button className="px-8 py-3.5 bg-brand-400 hover:bg-brand-600 text-white font-bold rounded-xl transition-all font-display text-[14.5px] flex items-center justify-center gap-2" onClick={() => navigate("/auth")}>
              Start as Teacher <ArrowRight size={16} className="shrink-0" />
            </button>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-brand-400/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative bg-bg-secondary border border-border-strong rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-bg-primary px-4 py-3 border-b border-border-strong flex items-center gap-2">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-[12px] text-text-dim font-display uppercase tracking-widest font-bold">Submission Review</div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {[
                  { name: "Aryan Sharma", score: "18/20", badge: "Graded", bClass: "bg-teal-400/10 text-teal-400 border-teal-400/20", active: true },
                  { name: "Priya Patel", score: "15/20", badge: "Graded", bClass: "bg-teal-400/10 text-teal-400 border-teal-400/20" },
                  { name: "Rahul Verma", score: "—", badge: "AI Eval…", bClass: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
                  { name: "Sneha Gupta", score: "12/20", badge: "Override", bClass: "bg-brand-400/10 text-brand-400 border-brand-400/20" },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${row.active ? "bg-bg-hover border-border-hi" : "bg-bg-primary border-border-strong"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-primary font-bold font-display text-[12px]">{row.name[0]}</div>
                      <div className="font-bold text-[14px] text-white">{row.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-display font-extrabold text-[15px] text-white">{row.score}</div>
                      <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest font-display border ${row.bClass}`}>{row.badge}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOWCASE: STUDENT ── */}
      <section className="py-24 px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16 reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-teal-400/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative bg-bg-secondary border border-border-strong rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-bg-primary px-4 py-3 border-b border-border-strong flex items-center gap-2">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-[12px] text-text-dim font-display uppercase tracking-widest font-bold">AI Feedback — Q3</div>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-teal-400 flex items-center justify-center shrink-0 shadow-md">
                    <Bot size={16} className="text-bg-base" />
                  </div>
                  <div className="bg-bg-primary border border-border-strong rounded-2xl rounded-tl-none p-5 text-[14px] text-text-secondary leading-relaxed">
                    <strong className="text-white font-display text-[15px] block mb-2">Score: 7 / 10</strong>
                    Your answer correctly identified Newton's 2nd Law and applied F = ma accurately. However, you missed discussing the <strong className="text-white">net force</strong> concept and the role of friction in the system. The diagram was partially correct.
                  </div>
                </div>
                <div className="bg-teal-400/5 border border-teal-400/20 rounded-xl p-5 ml-12">
                  <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest font-display mb-2">✓ Model Answer</div>
                  <div className="text-[13px] text-teal-100/80 leading-relaxed italic">
                    Newton's 2nd Law states F = ma where net force accounts for all forces including friction. In this system, friction reduces the net force, therefore acceleration = (F − μmg) / m…
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-teal-400 font-bold uppercase tracking-widest text-[12px] font-display mb-4">
              <GraduationCap size={14} className="shrink-0" /> For Students
            </div>
            <h2 className="font-display text-[clamp(28px,4vw,40px)] font-extrabold text-white leading-tight mb-6 tracking-tight">Instant feedback that actually helps you learn</h2>
            <p className="text-[16px] text-text-secondary leading-relaxed mb-8">No more waiting weeks for results. Get a detailed breakdown of your score — question by question — with AI feedback and the model answer shown side by side.</p>
            <div className="flex flex-col gap-4 mb-10">
              {["Live, Upcoming & Completed assignment tabs", "MCQ results with colour-coded correctness", "Descriptive AI feedback + model answer", "Locked results until teacher-set release time", "Real-time submission status badges"].map((item, i) => (
                <div className="flex items-center gap-3 text-[14.5px] text-text-primary font-medium" key={i}>
                  <CheckCircle2 size={18} className="text-teal-400 shrink-0" /> {item}
                </div>
              ))}
            </div>
            <button className="px-8 py-3.5 bg-bg-secondary hover:bg-bg-hover text-white border border-border-strong font-bold rounded-xl transition-all font-display text-[14.5px] flex items-center justify-center gap-2" onClick={() => navigate("/auth")}>
              Start as Student <ArrowRight size={16} className="shrink-0" />
            </button>
          </div>

        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      {/* ── PRICING SECTION ── */}
      <div id="pricing">
        <Pricing />
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      {/* ── TECH STACK ── */}
      <section id="tech" className="py-24 px-6 text-center max-w-[1000px] mx-auto">
        <div className="mb-12 reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          <div className="flex items-center justify-center gap-2 text-brand-400 font-bold uppercase tracking-widest text-[12px] font-display mb-4">
            <Zap size={14} className="shrink-0" /> Tech Stack
          </div>
          <h2 className="font-display text-[clamp(28px,4vw,40px)] font-extrabold text-white leading-tight mb-4 tracking-tight">Built on production-grade infrastructure</h2>
          <p className="text-[16px] text-text-secondary leading-relaxed">Every component selected for reliability, speed, and scale.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          {techStack.map((t, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-bg-secondary border border-border-strong text-[14px] font-medium text-white shadow-sm hover:border-border-hi transition-colors">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
              {t.label}
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      {/* ── ROADMAP ── */}
      <section id="roadmap" className="py-24 px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-[12px] font-display mb-4">
            <Star size={14} className="shrink-0" /> Roadmap
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,48px)] font-extrabold text-white leading-tight mb-4 tracking-tight">Scaling to India's competitive exams</h2>
          <p className="text-[16px] text-text-secondary leading-relaxed">Our multimodal AI architecture is built to handle the most demanding high-stakes examinations in the country.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmap.map((r, i) => (
            <div key={i} className="bg-bg-secondary border border-border-strong rounded-3xl p-8 hover:border-amber-400/30 transition-colors reveal opacity-0 translate-y-12 ease-out" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="text-[32px] mb-4">{r.icon}</div>
              <h3 className="font-display font-bold text-[20px] text-white mb-3">{r.title}</h3>
              <p className="text-[14.5px] text-text-secondary leading-relaxed mb-6">{r.desc}</p>
              <div className="flex flex-wrap gap-2">
                {r.tags.map((t, j) => (
                  <span key={j} className="px-3 py-1 rounded bg-bg-primary border border-border-strong text-[11px] font-bold text-text-dim uppercase tracking-widest font-display">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 px-6 lg:px-8 max-w-[1200px] mx-auto">
        <div className="text-center mb-16 reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
          <div className="flex items-center justify-center gap-2 text-brand-400 font-bold uppercase tracking-widest text-[12px] font-display mb-4">
            <Mail size={14} className="shrink-0" /> Contact
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,48px)] font-extrabold text-white leading-tight mb-4 tracking-tight">Get in touch</h2>
          <p className="text-[16px] text-text-secondary leading-relaxed">Questions, partnership inquiries, or just want a demo? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-bg-secondary border border-border-strong rounded-3xl p-8 shadow-sm reveal opacity-0 translate-y-12 ease-out">
            {formSent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <CheckCircle2 size={48} className="text-teal-400 mb-4" />
                <h3 className="font-display font-bold text-[22px] text-white mb-2">Message Sent!</h3>
                <p className="text-[14.5px] text-text-secondary">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-text-dim uppercase tracking-widest font-display mb-2">First Name</label>
                    <input className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[14px] text-white focus:outline-none focus:border-brand-400 transition-colors placeholder:text-text-muted" placeholder="Aryan" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-dim uppercase tracking-widest font-display mb-2">Last Name</label>
                    <input className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[14px] text-white focus:outline-none focus:border-brand-400 transition-colors placeholder:text-text-muted" placeholder="Sharma" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-dim uppercase tracking-widest font-display mb-2">Email</label>
                  <input className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[14px] text-white focus:outline-none focus:border-brand-400 transition-colors placeholder:text-text-muted" type="email" placeholder="aryan@college.edu" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-dim uppercase tracking-widest font-display mb-2">Institution</label>
                  <input className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[14px] text-white focus:outline-none focus:border-brand-400 transition-colors placeholder:text-text-muted" placeholder="e.g., IIT Bombay" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-dim uppercase tracking-widest font-display mb-2">Message</label>
                  <textarea className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[14px] text-white focus:outline-none focus:border-brand-400 transition-colors placeholder:text-text-muted min-h-[120px] resize-y" placeholder="Tell us about your use case…" />
                </div>
                <button className="w-full py-4 bg-brand-400 hover:bg-brand-600 text-white font-bold rounded-xl transition-all font-display text-[14.5px] flex items-center justify-center gap-2 mt-2" onClick={() => setFormSent(true)}>
                  <Mail size={16} className="shrink-0" /> Send Message
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 reveal opacity-0 translate-y-12 ease-out" style={{ transitionDelay: "100ms" }}>
            {[
              { icon: <Mail size={20} />, title: "Email Us", val: "hello@evalixai.com" },
              { icon: <FaGithub size={20} />, title: "Open Source", val: "github.com/anirbanjana883/EVALIX-AI" },
              { icon: <BrainCircuit size={20} />, title: "Built for", val: "Educational institutions, coaching centres, universities" },
              { icon: <Sparkles size={20} />, title: "AI Stack", val: "Google Gemini 2.5 Pro · Gemini 2.5 Flash · Supabase" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-5 p-6 bg-bg-secondary border border-border-strong rounded-2xl hover:border-brand-400/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-bg-primary border border-border-strong flex items-center justify-center text-brand-400 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-display font-bold text-[16px] text-white mb-1">{item.title}</h4>
                  <p className="text-[14px] text-text-secondary leading-relaxed">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-6 lg:px-8 py-12 max-w-[1200px] mx-auto w-full reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="relative bg-brand-400 rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden shadow-[0_20px_50px_rgba(216,90,48,0.3)]">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-600 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[12px] font-bold text-white uppercase tracking-widest font-display mb-8">
              <Sparkles size={14} className="shrink-0" /> Ready to transform grading?
            </div>
            <h2 className="font-display text-[clamp(32px,5vw,56px)] font-extrabold text-white leading-tight mb-6 tracking-tight">Start using EVALIX AI today</h2>
            <p className="text-[16px] md:text-[18px] text-white/80 leading-relaxed max-w-2xl mx-auto mb-10">
              Join educators who've already automated their grading pipeline. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-bg-base hover:bg-bg-secondary text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-1 font-display text-[15px] flex items-center justify-center gap-2" onClick={() => navigate("/auth")}>
                <Zap size={18} className="shrink-0 text-amber-400" /> Get Started Free
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold rounded-xl transition-all hover:-translate-y-1 font-display text-[15px]" onClick={() => scrollTo("contact")}>
                Request a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border-strong bg-bg-primary pt-20 pb-10 px-6 lg:px-8 mt-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <button className="flex items-center gap-2.5 mb-6" onClick={() => scrollTo("hero")}>
                <div className="w-8 h-8 rounded-full border-2 border-brand-400 bg-brand-400/10 flex items-center justify-center shrink-0">
                  <BrainCircuit size={16} className="text-brand-400 shrink-0" />
                </div>
                <span className="font-display font-extrabold text-[16px] tracking-wide text-white">
                  EVALIX <span className="text-brand-400">AI</span>
                </span>
              </button>
              <p className="text-[14px] text-text-secondary leading-relaxed max-w-sm">
                Enterprise-grade AI exam evaluation platform. Transforming academic grading with multimodal LLMs, automated rubrics, and Human-in-the-Loop overrides.
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-[14px] text-white mb-6">Product</h4>
              <ul className="flex flex-col gap-4">
                {["Features", "How It Works", "Pricing", "Roadmap", "Tech Stack"].map(l => (
                  <li key={l}><button className="text-[13.5px] text-text-secondary hover:text-brand-400 transition-colors" onClick={() => scrollTo(l.toLowerCase().replace(/ /g, ""))}>{l}</button></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-[14px] text-white mb-6">Platform</h4>
              <ul className="flex flex-col gap-4">
                {["Teacher Portal", "Student Portal", "AI Exam Generator", "Analytics"].map(l => (
                  <li key={l}><button className="text-[13.5px] text-text-secondary hover:text-brand-400 transition-colors" onClick={() => navigate("/auth")}>{l}</button></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-[14px] text-white mb-6">Company</h4>
              <ul className="flex flex-col gap-4">
                {["About", "Contact", "GitHub", "Privacy Policy"].map(l => (
                  <li key={l}><button className="text-[13.5px] text-text-secondary hover:text-brand-400 transition-colors" onClick={() => scrollTo("contact")}>{l}</button></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border-strong">
            <p className="text-[13px] text-text-dim">
              © 2025 <span className="text-white font-bold">EVALIX AI</span>. Made with 💡 and ☕ by the EVALIX AI Team.
            </p>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors" onClick={() => window.open("https://github.com/anirbanjana883/EVALIX-AI", "_blank")}>
                <FaGithub size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors" onClick={() => scrollTo("contact")}>
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;