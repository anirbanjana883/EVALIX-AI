import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  BrainCircuit,
  Sparkles,
  Download,
  FileText,
  Loader2,
  BookOpen,
  Bot,
  Zap,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const GenerateQuestionsView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [syllabus, setSyllabus]                   = useState("");
  const [pyqs, setPyqs]                           = useState("");
  const [instructions, setInstructions]           = useState("");
  const [marksDistribution, setMarksDistribution] = useState("Five 2-mark questions, Two 5-mark questions");
  const [isLoading, setIsLoading]                 = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const handleGenerate = async () => {
    if (!syllabus.trim() || !marksDistribution.trim())
      return toast.error("Syllabus and Marks Distribution are required.");
      
    setIsLoading(true);
    setGeneratedQuestions([]);
    
    try {
      const { data: { session }, error: se } = await supabase.auth.getSession();
      if (se || !session) throw new Error("Authentication required.");
      
      const res = await fetch(`${API_URL}/api/teacher/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ syllabus, pyqs, instructions, marksDistribution }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed.");
      
      setGeneratedQuestions(json.questions);
      toast.success("Questions generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to connect to AI engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!generatedQuestions.length) return;
    const excelData = generatedQuestions.map((q, i) => ({
      "Question No.": i + 1,
      "Marks": q.marks,
      "Question Text": q.question_text,
      "Model Answer / Key Points": q.model_answer,
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    ws["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 60 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, ws, "AI Questions");
    XLSX.writeFile(wb, `Generated_Exam_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel file downloaded!");
  };

  return (
    <div className="h-screen bg-bg-base text-text-primary font-sans flex flex-col overflow-hidden selection:bg-brand-400/30 selection:text-white">

      {/* ── Header ── */}
      <header className="shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong h-[68px] flex items-center justify-between px-6 lg:px-8 z-30">
        <div className="flex items-center gap-4">
          <button 
            className="w-9 h-9 rounded-[8px] bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors shrink-0" 
            onClick={() => navigate(-1)} 
            title="Go back"
          >
            <ArrowLeft size={16} className="shrink-0" />
          </button>
          
          <div className="flex items-center gap-3 border-l border-border-strong pl-4 ml-1">
            <div className="hidden sm:flex w-8 h-8 rounded-full border border-brand-400 bg-brand-400/10 items-center justify-center shrink-0">
              <BrainCircuit size={14} className="text-brand-400 shrink-0" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-[16px] font-bold text-white tracking-wide leading-tight">
                AI Exam Generator
              </h1>
              <p className="text-[11px] text-text-dim font-display tracking-widest uppercase mt-0.5">
                Generate questions from your syllabus instantly
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Dual-Scroll Main ── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full max-w-[1600px] mx-auto p-4 lg:p-6 gap-6">

        {/* ── LEFT PANEL: Inputs (Scrolls independently on Desktop) ── */}
        <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1 shrink-0 pb-10 lg:pb-0">

          {/* Source Material Card */}
          <div className="bg-bg-secondary border border-border-strong rounded-2xl overflow-hidden shadow-sm shrink-0">
            <div className="px-5 py-4 border-b border-border-strong bg-bg-primary flex items-center gap-2.5">
              <BookOpen size={16} className="text-brand-400 shrink-0" />
              <h2 className="font-display font-bold text-[14.5px] text-white tracking-wide">Source Material</h2>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div>
                <label className="flex items-center justify-between text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2 font-display">
                  <span>Syllabus / Topics <span className="text-brand-400">*</span></span>
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[13.5px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted resize-y"
                  rows={6}
                  value={syllabus}
                  onChange={e => setSyllabus(e.target.value)}
                  placeholder="Paste syllabus topics here (e.g., 'Thermodynamics: Laws 1 & 2, Entropy, Enthalpy…')"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2 font-display">
                  <span>Previous Year Questions</span>
                  <span className="text-text-muted font-medium tracking-normal">(Optional)</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[13.5px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted resize-y"
                  rows={4}
                  value={pyqs}
                  onChange={e => setPyqs(e.target.value)}
                  placeholder="Paste old questions here so the AI can mimic your style and difficulty…"
                />
              </div>
            </div>
          </div>

          {/* AI Instructions Card */}
          <div className="bg-bg-secondary border border-border-strong rounded-2xl overflow-hidden shadow-sm shrink-0">
            <div className="px-5 py-4 border-b border-border-strong bg-bg-primary flex items-center gap-2.5">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <h2 className="font-display font-bold text-[14.5px] text-white tracking-wide">AI Instructions</h2>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div>
                <label className="flex items-center justify-between text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2 font-display">
                  <span>Marks Distribution <span className="text-brand-400">*</span></span>
                </label>
                <input
                  className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[13.5px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted"
                  type="text"
                  value={marksDistribution}
                  onChange={e => setMarksDistribution(e.target.value)}
                  placeholder="e.g., Five 2-mark questions, Three 5-mark questions"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2 font-display">
                  <span>Custom Rules</span>
                  <span className="text-text-muted font-medium tracking-normal">(Optional)</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-bg-primary border border-border-strong rounded-xl text-[13.5px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted resize-y"
                  rows={3}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g., 'Make all questions scenario-based. No simple definitions.'"
                />
              </div>
              
              <button
                className="w-full py-4 mt-2 bg-brand-400 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-hover hover:-translate-y-[1px] font-display text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin shrink-0" /> Generating…</>
                ) : (
                  <><Zap size={18} className="shrink-0" /> Generate Exam Questions</>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* ── RIGHT PANEL: Output (Scrolls independently on Desktop) ── */}
        <div className="flex-1 flex flex-col bg-bg-secondary border border-border-strong rounded-2xl overflow-hidden shadow-sm min-h-[500px] lg:min-h-0">
          
          {/* Output Header */}
          <div className="px-6 py-4 border-b border-border-strong bg-bg-primary flex items-center justify-between gap-4 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-text-dim shrink-0" />
              <h2 className="font-display font-bold text-[15px] text-white">Output Preview</h2>
              {generatedQuestions.length > 0 && (
                <span className="bg-brand-400/10 border border-brand-400/30 text-brand-400 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest font-display ml-1">
                  {generatedQuestions.length} Questions
                </span>
              )}
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-strong rounded-lg text-[12px] font-bold text-text-secondary hover:text-brand-400 hover:border-brand-400 transition-all font-display disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExportExcel}
              disabled={generatedQuestions.length === 0 || isLoading}
            >
              <Download size={14} className="shrink-0" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>

          {/* Output Scrollable Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-bg-base/30">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-pulse">
                <div className="w-14 h-14 rounded-full bg-brand-400/10 border border-brand-400/30 flex items-center justify-center mb-5">
                  <BrainCircuit size={28} className="text-brand-400 shrink-0 animate-bounce" />
                </div>
                <h3 className="font-display font-bold text-[18px] text-white mb-2">AI is thinking…</h3>
                <p className="text-[14px] text-text-secondary max-w-sm">Generating intelligent, syllabus-aligned exam questions. This may take a moment.</p>
              </div>
            ) : generatedQuestions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-xl bg-bg-primary border border-border-strong flex items-center justify-center mb-5">
                  <Bot size={28} className="text-text-dim shrink-0" />
                </div>
                <h3 className="font-display font-bold text-[18px] text-white mb-2">No Questions Yet</h3>
                <p className="text-[14px] text-text-dim max-w-sm">Fill out the source material and instructions on the left, then hit Generate to see your exam here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {generatedQuestions.map((q, idx) => (
                  <div 
                    key={idx} 
                    className="bg-bg-primary border border-border-strong rounded-xl p-5 shadow-sm animate-fade-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-bg-secondary border border-border-strong">
                        <CheckCircle2 size={12} className="text-brand-400 shrink-0" />
                        <span className="font-display font-bold text-[12px] text-white">Q{idx + 1}</span>
                      </div>
                      <span className="font-display font-bold text-[12px] text-text-dim bg-bg-secondary px-3 py-1 rounded-lg border border-border-strong uppercase tracking-widest">
                        {q.marks} Marks
                      </span>
                    </div>
                    
                    <p className="text-[15px] font-bold text-white leading-relaxed mb-5">
                      {q.question_text}
                    </p>
                    
                    <div className="bg-teal-400/5 border border-teal-400/20 rounded-xl p-4">
                      <h4 className="flex items-center gap-2 text-[11px] font-bold text-teal-400 uppercase tracking-widest font-display mb-2">
                        <CheckCircle2 size={14} className="shrink-0" /> Model Answer / Key Points
                      </h4>
                      <p className="text-[13.5px] text-teal-100/80 leading-relaxed italic">
                        {q.model_answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default GenerateQuestionsView;