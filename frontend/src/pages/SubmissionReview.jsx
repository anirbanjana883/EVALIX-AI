import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Bot,
  User,
  CheckCircle2,
  FileText,
  Save,
  Edit3,
  BrainCircuit,
  ShieldAlert,
  XCircle,
  TriangleAlert,
  Flag
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SubmissionReview = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");
        
        const response = await fetch(`${API_URL}/api/teacher/submissions/${submissionId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        
        if (!response.ok) {
          if (response.status === 404) throw new Error("Submission not found.");
          throw new Error("Failed to load submission data.");
        }
        
        const json = await response.json();
        const data = json.data || json.submission; // Graceful fallback
        
        if (data) {
          const calculatedMaxScore = (data.answers || []).reduce(
            (sum, ans) => sum + (ans.max_marks || ans.question?.max_marks || 0), 0
          );
          setSubmission({ 
            ...data, 
            student_name: data.student?.name || data.student_name || "Unknown Student", 
            university_roll: data.student?.university_roll || "",
            max_score: calculatedMaxScore 
          });
          setAnswers(data.answers || []);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Could not load the submission.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  const handleOverrideChange = (answerId, field, value) => {
    setOverrides((prev) => ({ ...prev, [answerId]: { ...prev[answerId], [field]: value } }));
  };

  const initOverride = (answer) => {
    if (!overrides[answer.id]) {
      setOverrides((prev) => ({ 
        ...prev, 
        [answer.id]: { score: answer.final_score ?? answer.ai_score ?? answer.score ?? 0, feedback: answer.teacher_feedback ?? "" } 
      }));
    }
  };

  // 🌟 FIX: Updated to use newScore and strictly parse numbers to prevent NaN
  const submitOverride = async (answerId, maxMarks) => {
    const overrideData = overrides[answerId];
    if (!overrideData) return;
    
    // Safely parse the input as a strict number
    const parsedScore = Number(overrideData.score);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > maxMarks) {
      return toast.error(`Score must be a valid number between 0 and ${maxMarks}.`);
    }
      
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = { 
        newScore: parsedScore, // Using the newScore key as requested
        teacher_feedback: overrideData.feedback 
      };
      
      const response = await fetch(
        `${API_URL}/api/teacher/submissions/${submissionId}/answers/${answerId}/override`,
        { 
          method: "PATCH", 
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, 
          body: JSON.stringify(payload) 
        }
      );
      
      if (!response.ok) throw new Error("Failed to save override.");
      
      toast.success("Grade successfully updated!");
      
      // Update local state synchronously to prevent NaN and stale closures
      setAnswers((prevAnswers) => {
        const updatedAnswers = prevAnswers.map((ans) => 
          ans.id === answerId ? { 
            ...ans, 
            final_score: payload.newScore, 
            score: payload.newScore, 
            teacher_feedback: payload.teacher_feedback 
          } : ans
        );
        
        // Calculate new total safely inside the array update
        const newTotal = updatedAnswers.reduce((sum, ans) => {
          const val = Number(ans.final_score ?? ans.ai_score ?? ans.score ?? 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
        
        // Push safe new total to submission header
        setSubmission((prevSub) => ({ ...prevSub, total_score: newTotal }));
        
        return updatedAnswers;
      });
      
      setOverrides((prev) => { const n = { ...prev }; delete n[answerId]; return n; });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update the score.");
    } finally {
      setIsSaving(false);
    }
  };

  const isImage = (url) => url && url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

  if (isLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center text-text-dim font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-brand-400 mb-4" />
        <p className="font-display text-[14px] font-bold text-text-secondary tracking-wide">Loading submission & AI insights...</p>
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="h-screen bg-bg-base text-text-primary font-sans flex flex-col overflow-hidden selection:bg-brand-400/30 selection:text-white">

      {/* ── Header ── */}
      <header className="shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong h-[68px] flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-4">
          <button 
            className="w-9 h-9 rounded-[8px] bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors" 
            onClick={() => navigate(-1)} 
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-3 border-l border-border-strong pl-4 ml-1">
            <div className="hidden sm:flex w-8 h-8 rounded-full border border-brand-400 bg-brand-400/10 items-center justify-center shrink-0">
              <BrainCircuit size={14} className="text-brand-400" />
            </div>
            <div>
              <h1 className="font-display text-[16px] font-bold text-white tracking-wide leading-tight">
                Review: {submission.student_name}
              </h1>
              <p className="text-[11px] text-text-dim font-display tracking-widest uppercase mt-0.5">
                {submission.university_roll ? `Roll: ${submission.university_roll}` : `Sub #${submission.id.substring(0, 8)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 bg-bg-secondary border border-border-strong rounded-xl px-4 py-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.1em] font-display">Final Score</span>
              <div className="font-display font-extrabold text-[18px] text-white leading-none mt-1">
                {submission.total_score}
                <span className="text-brand-400 text-[14px]"> / {submission.max_score}</span>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-border-strong"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.1em] font-display">Status</span>
              <div className="mt-1">
                {submission.status === "GRADED" ? (
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-teal-400 font-display uppercase tracking-wide">
                    <CheckCircle2 size={14} /> Finalized
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-amber-400 font-display uppercase tracking-wide">
                    <AlertCircle size={14} /> Needs Review
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Scrollable Main Content ── */}
      <main className="flex-1 overflow-y-auto w-full p-6 lg:p-8 custom-scrollbar pb-24">
        <div className="max-w-[1520px] mx-auto">
          
          {/* 🚨 Plagiarism High-Contrast Warning Banner */}
          {submission.plagiarism_reports?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-fade-up">
               <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/40">
                 <ShieldAlert className="text-red-500 w-5 h-5" />
               </div>
               <div>
                 <h3 className="text-red-500 font-display text-[16px] font-bold uppercase tracking-wide mb-1.5">Plagiarism Detected</h3>
                 <div className="flex flex-col gap-1">
                   {submission.plagiarism_reports.map((report, i) => (
                     <p key={i} className="text-[13.5px] text-red-200/80 font-medium">
                       Similarity Score: <strong className="text-white">{(report.similarity_score * 100).toFixed(1)}%</strong> semantic match found with <strong className="text-white">{report.matched_submission?.student?.name || "another student"}</strong>.
                     </p>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {/* Answers Mapping */}
          <div className="flex flex-col gap-8">
            {answers.map((answer, index) => {
              const displayScore = answer.final_score ?? answer.ai_score ?? answer.score ?? 0;
              const isOverridden = !!answer.teacher_feedback;
              const isEditing = overrides[answer.id] !== undefined;
              
              const filesToDisplay = answer.file_urls || (answer.file_url ? [answer.file_url] : []);
              const maxMarks = answer.max_marks || answer.question?.max_marks || 0;

              return (
                <div key={answer.id} className="bg-bg-secondary border border-border-strong rounded-2xl overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                  
                  {/* Question Header */}
                  <div className="px-6 py-4 border-b border-border-strong bg-bg-primary flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-bg-secondary border border-border-strong flex items-center justify-center font-display font-bold text-[14px] text-brand-400 shrink-0">
                        {index + 1}
                      </div>
                      <div className="mt-0.5">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-bg-hover border border-border-strong text-[10px] font-bold text-text-dim tracking-widest uppercase font-display mb-1.5">
                          Question
                        </span>
                        <h3 className="text-[15px] font-bold text-white leading-relaxed">
                          {answer.question_text || answer.question?.question_text || "No question text."}
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-display font-bold text-[15px] text-text-secondary bg-bg-hover px-3 py-1 rounded-lg border border-border-strong">
                        {maxMarks} pts
                      </span>
                      {answer.flagged && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-1 rounded-md uppercase tracking-wide">
                          <Flag size={12} /> Flagged by AI
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Split Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-strong">
                    
                    {/* ── Left Column: Student Submission ── */}
                    <div className="p-6 bg-bg-secondary flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <User size={15} className="text-brand-400" /> 
                        <h4 className="font-display text-[12px] font-bold text-text-dim uppercase tracking-[0.15em]">Student Response</h4>
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-4">
                        {answer.ocr_text && (
                          <div className="bg-bg-primary border border-border-strong rounded-xl p-4 text-[14px] text-text-secondary font-medium leading-relaxed italic border-l-4 border-l-brand-400 shadow-inner">
                            "{answer.ocr_text}"
                          </div>
                        )}
                        
                        {filesToDisplay.length > 0 && filesToDisplay.map((fileUrl, fIdx) => (
                          isImage(fileUrl) ? (
                            <div key={fIdx} className="rounded-xl overflow-hidden border border-border-strong bg-bg-primary p-2">
                              <img src={fileUrl} alt={`Student submission page ${fIdx+1}`} className="w-full h-auto rounded-lg block" />
                            </div>
                          ) : (
                            <a key={fIdx} href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-border-strong bg-bg-primary hover:border-brand-400 transition-colors group">
                              <div className="w-12 h-12 rounded-lg bg-brand-400/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-400 group-hover:text-white transition-colors">
                                <FileText size={20} />
                              </div>
                              <div>
                                <div className="text-[14px] font-bold text-white mb-0.5">View Uploaded Document {fIdx+1}</div>
                                <div className="text-[12px] text-text-dim">Opens in new tab</div>
                              </div>
                            </a>
                          )
                        ))}
                        
                        {!answer.ocr_text && filesToDisplay.length === 0 && (
                          <div className="flex items-center justify-center h-full min-h-[120px] bg-bg-primary border border-dashed border-border-strong rounded-xl text-[13px] text-text-dim italic">
                            No response submitted.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Right Column: AI Evaluation & HITL ── */}
                    <div className="p-6 bg-bg-primary flex flex-col">
                      
                      {/* AI Evaluation */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <Bot size={15} className="text-teal-400" /> 
                            <h4 className="font-display text-[12px] font-bold text-text-dim uppercase tracking-[0.15em]">AI Evaluation</h4>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[12px] font-bold font-display ${isOverridden ? "bg-bg-hover text-text-dim line-through border border-border-strong" : "bg-teal-400/10 text-teal-400 border border-teal-400/30"}`}>
                            AI Score: {answer.ai_score ?? answer.score ?? 0} / {maxMarks}
                          </span>
                        </div>
                        
                        {/* Styled Lists for RAG Output */}
                        <div className="flex flex-col gap-5">
                          {answer.strengths?.length > 0 && (
                            <div>
                              <h5 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest font-display mb-2">Strengths</h5>
                              <ul className="flex flex-col gap-2">
                                {answer.strengths.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary leading-snug">
                                     <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
                                     <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {answer.weaknesses?.length > 0 && (
                            <div>
                              <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-display mb-2">Weaknesses</h5>
                              <ul className="flex flex-col gap-2">
                                {answer.weaknesses.map((w, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary leading-snug">
                                     <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                     <span>{w}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {answer.missing_concepts?.length > 0 && (
                            <div>
                              <h5 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-display mb-2">Missing Concepts</h5>
                              <ul className="flex flex-col gap-2">
                                {answer.missing_concepts.map((m, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary leading-snug">
                                     <TriangleAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                     <span>{m}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Fallback AI Feedback Text */}
                          {!answer.strengths?.length && !answer.weaknesses?.length && !answer.missing_concepts?.length && (
                             <div className="text-[13.5px] text-text-secondary leading-relaxed bg-bg-secondary p-4 rounded-xl border border-border-strong">
                               {answer.ai_feedback || "No detailed AI feedback provided."}
                             </div>
                          )}
                        </div>
                      </div>

                      {/* HITL Override Section */}
                      <div className="mt-auto pt-6 border-t border-border-strong">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Edit3 size={15} className="text-brand-400" /> 
                            <h4 className="font-display text-[12px] font-bold text-text-dim uppercase tracking-[0.15em]">Instructor Grading</h4>
                          </div>
                          {!isEditing && (
                            <button 
                              className="text-[12px] font-bold text-brand-400 hover:text-brand-200 transition-colors uppercase tracking-wide font-display border border-brand-400/30 px-3 py-1 rounded-md hover:bg-brand-400/10" 
                              onClick={() => initOverride(answer)}
                            >
                              {isOverridden ? "Edit Override" : "Override Score"}
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="bg-bg-secondary border border-brand-400/40 rounded-xl p-5 shadow-[0_0_15px_rgba(216,90,48,0.1)]">
                            <div className="flex flex-col sm:flex-row gap-4 mb-5">
                              <div className="w-full sm:w-24 shrink-0">
                                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">New Score</label>
                                <input
                                  type="number" min="0" max={maxMarks}
                                  value={overrides[answer.id].score}
                                  onChange={(e) => handleOverrideChange(answer.id, "score", e.target.value)}
                                  className="w-full px-3 py-2 bg-bg-primary border border-border-strong rounded-lg text-[14px] font-bold text-brand-400 focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all text-center"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Remarks (Optional)</label>
                                <input
                                  type="text" placeholder="Why are you overriding the AI?"
                                  value={overrides[answer.id].feedback}
                                  onChange={(e) => handleOverrideChange(answer.id, "feedback", e.target.value)}
                                  className="w-full px-3 py-2 bg-bg-primary border border-border-strong rounded-lg text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => submitOverride(answer.id, maxMarks)}
                                disabled={isSaving}
                                className="flex-1 py-2.5 px-4 flex items-center justify-center gap-2 rounded-lg text-[13px] font-bold cursor-pointer transition-all border border-transparent bg-brand-400 text-white hover:bg-brand-600 font-display disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save Grade
                              </button>
                              <button
                                className="px-4 py-2.5 rounded-lg text-[13px] font-bold text-text-secondary hover:text-white border border-border-strong hover:bg-bg-hover transition-colors font-display"
                                onClick={() => { const n = { ...overrides }; delete n[answer.id]; setOverrides(n); }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          isOverridden && (
                            <div className="bg-brand-400/5 border border-brand-400/30 rounded-xl p-4 flex items-center justify-between gap-4">
                              <div>
                                <div className="text-[13px] font-bold text-brand-400 font-display mb-1 flex items-center gap-1.5">
                                  <User size={14} /> Manual Override Applied
                                </div>
                                {answer.teacher_feedback && (
                                  <div className="text-[13px] text-text-secondary italic">"{answer.teacher_feedback}"</div>
                                )}
                              </div>
                              <div className="text-[20px] font-extrabold text-white font-display shrink-0">
                                {displayScore} <span className="text-[14px] text-text-dim font-medium">/ {maxMarks}</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
};

export default SubmissionReview;