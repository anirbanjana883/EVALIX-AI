import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  GraduationCap,
  Award,
  AlertCircle,
  Lightbulb,
  BrainCircuit,
  TriangleAlert,
  ShieldAlert
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ResultsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [maxTotalMarks, setMaxTotalMarks] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");
        
        const response = await fetch(`${API_URL}/api/assignments/${id}/result`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await response.json();
        
        if (!response.ok) {
          if (response.status === 403) { setErrorMsg(json.error || "Results are not released yet."); return; }
          throw new Error(json.error || "Failed to load results.");
        }
        
        if (json.success && json.submission) {
          setResultData(json.submission);
          // Safely calculate total possible marks if not quarantined
          if (!json.is_quarantined) {
            const totalMax = (json.submission.assignment?.questions || []).reduce((sum, q) => sum + (q.max_marks || 0), 0);
            setMaxTotalMarks(totalMax);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Could not load the results.");
        setErrorMsg("An error occurred while fetching your results.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  const isImage = (url) => url && url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

  /* ── Loading State ── */
  if (isLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center text-text-dim font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-brand-400 mb-4 shrink-0" />
        <p className="font-display font-bold text-[14px] text-text-secondary tracking-wide">Retrieving your evaluated results…</p>
      </div>
    );
  }

  /* ── General Locked / Error State ── */
  if (errorMsg) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-bg-secondary border border-border-strong rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <Lock className="w-14 h-14 text-amber-400 mx-auto mb-4 shrink-0" />
          <h2 className="font-display text-[18px] font-bold text-white mb-2">Results Locked</h2>
          <p className="text-text-secondary text-[13.5px] mb-6 leading-relaxed">{errorMsg}</p>
          <button onClick={() => navigate("/student-dashboard")} className="px-6 py-3 bg-bg-primary text-white hover:border-brand-400 border border-border-strong rounded-lg font-bold text-[13px] transition-colors font-display w-full">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!resultData) return null;

  /* ── 🚨 Quarantine State (AI Flagged, Awaiting Teacher Override) ── */
  if (resultData.is_quarantined) {
    return (
      <div className="h-screen bg-bg-base flex flex-col font-sans selection:bg-brand-400/30 selection:text-white overflow-hidden">
        {/* Simple Header for Quarantined View */}
        <header className="shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong h-[68px] flex items-center justify-between px-6 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="w-9 h-9 rounded-[8px] bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors shrink-0" 
              onClick={() => navigate("/student-dashboard")} 
              title="Go back"
            >
              <ArrowLeft size={16} className="shrink-0" />
            </button>
            <div className="flex items-center gap-3 border-l border-border-strong pl-4 ml-1">
              <div className="hidden sm:flex w-8 h-8 rounded-full border border-brand-400 bg-brand-400/10 items-center justify-center shrink-0">
                <BrainCircuit size={14} className="text-brand-400 shrink-0" />
              </div>
              <h1 className="font-display text-[16px] font-bold text-white tracking-wide leading-tight">
                {resultData.assignment?.title || "Assignment"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-400/10 border border-amber-400/25 text-[11px] font-bold text-amber-400 tracking-widest font-display uppercase shrink-0">
            <Lock size={12} className="shrink-0" /> Pending Review
          </div>
        </header>

        {/* Scrollable Quarantine Body */}
        <main className="flex-1 overflow-y-auto w-full p-6">
          <div className="min-h-full flex items-center justify-center animate-fade-up">
            <div className="bg-bg-secondary border border-red-500/30 rounded-2xl p-8 md:p-12 max-w-4xl w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.1)]">
              <div className="bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <ShieldAlert size={48} className="text-red-500 shrink-0" />
              </div>
              <h2 className="text-[clamp(24px,4vw,32px)] font-display font-extrabold text-white mb-4 tracking-tight">
                Submission Under Review
              </h2>
              <p className="text-[15px] md:text-[16px] text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
                Your submission was flagged by our automated systems for unusual activity, poor image readability, or potential similarity matches. 
                <br/><br/>
                Your results are temporarily hidden until your professor manually reviews your answers and clears the flag. Once reviewed, your final grade will appear here.
              </p>
              <button 
                onClick={() => navigate("/student-dashboard")}
                className="px-8 py-3.5 bg-bg-primary border border-border-strong text-white hover:border-brand-400 rounded-lg font-bold text-[14px] transition-colors font-display"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Normal Results Rendering (Teacher Cleared Flag or AI Passed) ── */
  const { assignment, answers, plagiarism_reports, teacher_review } = resultData;
  const hasGlobalTeacherReview = !!teacher_review;

  return (
    <div className="h-screen bg-bg-base text-text-primary font-sans flex flex-col overflow-hidden selection:bg-brand-400/30 selection:text-white">

      {/* ── Header ── */}
      <header className="shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong h-[68px] flex items-center justify-between px-6 lg:px-8 z-30">
        <div className="flex items-center gap-4">
          <button 
            className="w-9 h-9 rounded-[8px] bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors shrink-0" 
            onClick={() => navigate("/student-dashboard")} 
            title="Go back"
          >
            <ArrowLeft size={16} className="shrink-0" />
          </button>
          
          <div className="flex items-center gap-3 border-l border-border-strong pl-4 ml-1">
            <div className="hidden sm:flex w-8 h-8 rounded-full border border-brand-400 bg-brand-400/10 items-center justify-center shrink-0">
              <BrainCircuit size={14} className="text-brand-400 shrink-0" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-[16px] font-bold text-white tracking-wide leading-tight truncate max-w-[200px] sm:max-w-md">
                {assignment?.title || "Assignment Results"}
              </h1>
              <div className="flex items-center gap-1.5 text-[10.5px] text-text-dim font-display uppercase tracking-widest mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="text-brand-400 font-bold">{assignment?.subject || "Subject"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-bg-secondary border border-border-strong rounded-xl px-4 py-1.5 shrink-0">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.1em] font-display">Final Score</span>
              <div className="font-display font-extrabold text-[16px] text-white leading-none mt-0.5">
                {teacher_review?.final_score ?? resultData.total_score}
                <span className="text-brand-400 text-[13px]"> / {maxTotalMarks}</span>
              </div>
            </div>
            <div className="w-[1px] h-6 bg-border-strong hidden sm:block"></div>
            <div className="flex-col hidden sm:flex">
              <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.1em] font-display">Status</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-teal-400 font-display uppercase tracking-wide mt-0.5">
                <CheckCircle2 size={12} className="shrink-0" /> Evaluated
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Scrollable Main ── */}
      <main className="flex-1 overflow-y-auto w-full custom-scrollbar p-6 lg:p-8 pb-24">
        {/* Expanded max-w to 1520px to fit screen nicely, just like the dashboard */}
        <div className="max-w-[1520px] mx-auto flex flex-col gap-6">

          {/* 🚨 Persistent Plagiarism Warning Banner (If teacher cleared flag but left the report) */}
          {plagiarism_reports && plagiarism_reports.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-fade-up">
               <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/40">
                 <ShieldAlert className="text-red-500 w-5 h-5 shrink-0" />
               </div>
               <div>
                 <h3 className="text-red-500 font-display text-[15px] font-bold uppercase tracking-wide mb-1">Warning: Semantic Similarity Detected</h3>
                 <p className="text-[13.5px] text-red-200/80 font-medium leading-relaxed">
                   Portions of this submission triggered plagiarism detection alerts. Your instructor has reviewed these matches and applied final grades accordingly.
                 </p>
               </div>
            </div>
          )}

          {/* 👨‍🏫 Global Teacher Override Banner */}
          {hasGlobalTeacherReview && (
            <div className="bg-brand-400/10 border border-brand-400/30 rounded-2xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(216,90,48,0.1)] animate-fade-up">
               <div className="w-10 h-10 rounded-full bg-brand-400/20 flex items-center justify-center shrink-0 border border-brand-400/40">
                 <Award className="text-brand-400 w-5 h-5 shrink-0" />
               </div>
               <div>
                 <h3 className="text-brand-400 font-display text-[15px] font-bold uppercase tracking-wide mb-1">👨‍🏫 Grade Updated by Professor</h3>
                 <p className="text-[13.5px] text-text-secondary font-medium leading-relaxed italic">
                   "{teacher_review.teacher_feedback}"
                 </p>
               </div>
            </div>
          )}

          {/* Intro Card */}
          <div className="bg-bg-secondary border border-border-strong rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm animate-fade-up">
            <div className="w-12 h-12 rounded-xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center shrink-0">
              <GraduationCap size={24} className="text-brand-400 shrink-0" />
            </div>
            <div>
              <h2 className="font-display text-[17px] font-bold text-white mb-1">Evaluation Complete</h2>
              <p className="text-[13.5px] text-text-secondary">Review the detailed AI breakdown and instructor notes below to understand your score and areas for improvement.</p>
            </div>
          </div>

          {/* Questions Render Loop */}
          <div className="flex flex-col gap-8 mt-4">
            {assignment?.questions?.map((question, index) => {
              const studentAnswer = answers?.find((a) => a.question_id === question.id || a.question?.id === question.id);
              const score = studentAnswer?.score ?? 0;
              const hasTeacherNote = !!studentAnswer?.teacher_feedback;
              const isMCQ = assignment.type === "MCQ" || (question.mcq_options && question.mcq_options.length > 0);
              
              // Normalize file tracking
              const filesArray = studentAnswer?.file_urls || (studentAnswer?.file_url ? [studentAnswer.file_url] : []);

              return (
                <div key={question.id} className="bg-bg-secondary border border-border-strong rounded-2xl overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                  
                  {/* Question Header */}
                  <div className="px-6 py-5 border-b border-border-strong bg-bg-primary flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 w-full">
                      <div className="w-9 h-9 rounded-full bg-bg-secondary border border-border-strong flex items-center justify-center font-display font-bold text-[14px] text-brand-400 shrink-0 shadow-inner">
                        {index + 1}
                      </div>
                      <div className="mt-0.5 flex-1 min-w-0">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-bg-hover border border-border-strong text-[10px] font-bold text-text-dim tracking-widest uppercase font-display mb-2">
                          {isMCQ ? "Multiple Choice" : "Descriptive"}
                        </span>
                        <h3 className="text-[15px] font-bold text-white leading-relaxed">
                          {question.question_text}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 ml-13 sm:ml-0">
                      <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest font-display">Score Achieved</span>
                      <span className="font-display font-extrabold text-[18px] text-white bg-bg-hover px-3 py-1.5 rounded-lg border border-border-strong">
                        {score} <span className="text-[13px] text-text-dim font-medium">/ {question.max_marks}</span>
                      </span>
                    </div>
                  </div>

                  {/* Question Reference Image */}
                  {question.image_url && (
                    <div className="p-4 bg-bg-primary border-b border-border-strong flex justify-center">
                      <img src={question.image_url} alt="Question Reference" className="max-h-[250px] w-auto object-contain rounded-lg border border-border-strong" />
                    </div>
                  )}

                  {/* ── MCQ Body ── */}
                  {isMCQ ? (
                    <div className="p-6 bg-bg-primary flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {question.mcq_options?.map((option, optIdx) => {
                          const studentChoice = studentAnswer?.mcq_selected?.trim();
                          const correctAnswer = question.mcq_answer?.trim();
                          const currentOption = option?.trim();
                          
                          const isSelected = studentChoice === currentOption;
                          const isCorrect = correctAnswer === currentOption;

                          let containerClasses = "bg-bg-secondary border-border-strong text-text-secondary opacity-70";
                          let badge = null;

                          if (isSelected && isCorrect) {
                            containerClasses = "bg-teal-400/10 border-teal-400 text-teal-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]";
                            badge = <span className="flex items-center gap-1 text-[11px] font-bold font-display uppercase tracking-widest text-teal-400 shrink-0"><CheckCircle2 size={13} className="shrink-0"/> Correct</span>;
                          } else if (isSelected && !isCorrect) {
                            containerClasses = "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                            badge = <span className="flex items-center gap-1 text-[11px] font-bold font-display uppercase tracking-widest text-red-500 shrink-0"><XCircle size={13} className="shrink-0"/> Wrong</span>;
                          } else if (!isSelected && isCorrect) {
                            containerClasses = "bg-teal-400/5 border-teal-400/50 text-white";
                            badge = <span className="flex items-center gap-1 text-[11px] font-bold font-display uppercase tracking-widest text-teal-400/70 shrink-0">Correct Answer</span>;
                          }

                          return (
                            <div key={optIdx} className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-all ${containerClasses}`}>
                              <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`flex items-center justify-center w-6 h-6 rounded border text-[11px] font-bold font-display shrink-0 ${isSelected || isCorrect ? 'border-current bg-current/20' : 'border-border-strong bg-bg-primary'}`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="text-[14px] font-medium truncate">{option}</span>
                              </div>
                              {badge && badge}
                            </div>
                          );
                        })}
                      </div>

                      {question.mcq_explanation && (
                        <div className="mt-4 bg-amber-400/10 border border-amber-400/20 rounded-xl p-5">
                          <h4 className="flex items-center gap-2 text-[11px] font-bold text-amber-400 uppercase tracking-widest font-display mb-2">
                            <Lightbulb size={14} className="shrink-0" /> Explanation
                          </h4>
                          <p className="text-[13.5px] text-amber-400/80 leading-relaxed">{question.mcq_explanation}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── Descriptive Body ── */
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-strong">
                      
                      {/* Left: Student Response */}
                      <div className="p-6 bg-bg-secondary flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                          <User size={15} className="text-brand-400 shrink-0" /> 
                          <h4 className="font-display text-[12px] font-bold text-text-dim uppercase tracking-[0.15em]">Your Response</h4>
                        </div>
                        
                        {!studentAnswer ? (
                          <div className="flex items-center justify-center h-full min-h-[120px] bg-bg-primary border border-dashed border-border-strong rounded-xl text-[13px] text-text-dim italic gap-2">
                            <AlertCircle size={15} className="shrink-0" /> No answer submitted.
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col gap-4">
                            {studentAnswer.ocr_text && (
                              <div className="bg-bg-primary border border-border-strong rounded-xl p-4 text-[14px] text-text-secondary font-medium leading-relaxed italic border-l-4 border-l-brand-400 shadow-inner">
                                "{studentAnswer.ocr_text}"
                              </div>
                            )}
                            
                            {filesArray.map((url, fIdx) => (
                              isImage(url) ? (
                                <div key={fIdx} className="rounded-xl overflow-hidden border border-border-strong bg-bg-primary p-2">
                                  <img src={url} alt={`Submission part ${fIdx + 1}`} className="w-full h-auto rounded-lg block" />
                                </div>
                              ) : (
                                <a key={fIdx} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-border-strong bg-bg-primary hover:border-brand-400 transition-colors group">
                                  <div className="w-11 h-11 rounded-lg bg-brand-400/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-400 group-hover:text-white transition-colors shrink-0">
                                    <FileText size={18} className="shrink-0" />
                                  </div>
                                  <div>
                                    <div className="text-[14px] font-bold text-white mb-0.5">View Uploaded Document</div>
                                    <div className="text-[12px] text-text-dim">Opens in new tab</div>
                                  </div>
                                </a>
                              )
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: AI + Teacher Feedback */}
                      <div className="p-6 bg-bg-primary flex flex-col gap-6">
                        
                        {/* 👨‍🏫 Local Answer Teacher Override Banner */}
                        {hasTeacherNote && (
                          <div className="bg-brand-400/10 border border-brand-400/30 rounded-xl p-4 shadow-sm">
                            <h4 className="flex items-center gap-2 text-[11px] font-bold text-brand-400 uppercase tracking-widest font-display mb-2">
                              <Award size={14} className="shrink-0" /> Instructor Remarks
                            </h4>
                            <p className="text-[13.5px] text-brand-400/90 italic leading-relaxed">
                              "{studentAnswer.teacher_feedback}"
                            </p>
                          </div>
                        )}

                        {/* AI Detailed Feedback Lists */}
                        {studentAnswer && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Bot size={15} className="text-teal-400 shrink-0" /> 
                              <h4 className="font-display text-[12px] font-bold text-text-dim uppercase tracking-[0.15em]">AI Evaluation</h4>
                            </div>

                            <div className="flex flex-col gap-5">
                              {studentAnswer.strengths?.length > 0 && (
                                <div>
                                  <h5 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest font-display mb-2">Strengths</h5>
                                  <ul className="flex flex-col gap-2">
                                    {studentAnswer.strengths.map((s, i) => (
                                      <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary leading-snug">
                                         <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
                                         <span>{s}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {studentAnswer.weaknesses?.length > 0 && (
                                <div>
                                  <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-display mb-2">Areas for Improvement</h5>
                                  <ul className="flex flex-col gap-2">
                                    {studentAnswer.weaknesses.map((w, i) => (
                                      <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary leading-snug">
                                         <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                         <span>{w}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {studentAnswer.missing_concepts?.length > 0 && (
                                <div>
                                  <h5 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-display mb-2">Missing Concepts</h5>
                                  <ul className="flex flex-col gap-2">
                                    {studentAnswer.missing_concepts.map((m, i) => (
                                      <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary leading-snug">
                                         <TriangleAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                         <span>{m}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Fallback AI Feedback Text */}
                              {!studentAnswer.strengths?.length && !studentAnswer.weaknesses?.length && !studentAnswer.missing_concepts?.length && studentAnswer.ai_feedback && (
                                 <div className="text-[13.5px] text-text-secondary leading-relaxed bg-bg-secondary p-4 rounded-xl border border-border-strong">
                                   {studentAnswer.ai_feedback}
                                 </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Model Answer Ref */}
                        {question.model_answer && (
                          <div className="mt-auto pt-5 border-t border-border-strong">
                            <h4 className="flex items-center gap-2 text-[11px] font-bold text-text-dim uppercase tracking-[0.15em] mb-2 font-display">
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Ideal Model Answer
                            </h4>
                            <p className="text-[13px] text-text-secondary leading-relaxed bg-teal-400/5 border border-teal-400/20 p-4 rounded-xl italic">
                              {question.model_answer}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResultsView;