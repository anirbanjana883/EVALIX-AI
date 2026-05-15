import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft, Users, Loader2, AlertCircle, CheckCircle2, Clock,
  FileText, Search, BarChart3, BrainCircuit, ExternalLink, TriangleAlert
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AssignmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading]   = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  
  // Default stats aligned with your API blueprint
  const [stats, setStats]           = useState({ 
    totalSubmissions: 0, 
    gradedSubmissions: 0, 
    flaggedSubmissions: 0,
    averageScore: 0,
    totalStudents: 0 // Fallback if provided by your backend
  });

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const { data: { session }, error: se } = await supabase.auth.getSession();
        if (se || !session) throw new Error("Authentication error.");
        
        const res = await fetch(`${API_URL}/api/teacher/assignments/${id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        
        if (!res.ok) { 
          if (res.status === 404) throw new Error("Assignment not found."); 
          throw new Error("Failed to load assignment data."); 
        }
        
        const json = await res.json();
        setAssignment(json.assignmentInfo);
        
        // Merge stats safely
        setStats(prev => ({ ...prev, ...json.stats }));
        
        setSubmissions(json.submissions.map(sub => ({
          id: sub.id,
          student_name: sub.student?.name || "Unknown Student",
          student_email: sub.student?.email || "",
          submitted_at: sub.submitted_at || new Date().toISOString(),
          status: sub.status,
          score: sub.total_score,
          requires_review: sub.requires_review || false // 🚨 From API Blueprint
        })));
      } catch (err) {
        console.error(err); 
        toast.error(err.message || "Could not load assignment details.");
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchAssignmentDetails();
  }, [id]);

  const formatEnum = (str) => {
    if (!str) return "";
    return str.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (val) => {
    if (!val) return "TBD";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return "TBD";
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
    } catch { return "TBD"; }
  };

  const filteredSubmissions = submissions.filter(s =>
    s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initials = (name = "") => name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  /* ── Loading State ── */
  if (isLoading) return (
    <div className="h-screen bg-bg-base flex flex-col items-center justify-center text-text-dim font-sans">
      <Loader2 className="w-10 h-10 animate-spin text-brand-400 mb-4 shrink-0" />
      <div className="font-display text-[16px] font-bold text-white mb-1">Loading Analytics…</div>
      <div className="text-[13px] text-text-dim">Fetching assignment data and AI insights</div>
    </div>
  );

  /* ── Error / Not Found State ── */
  if (!assignment) return (
    <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-sans p-6">
      <div className="bg-bg-secondary border border-border-strong rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4 shrink-0" />
        <h2 className="font-display text-[18px] font-bold text-white mb-2">Assignment Not Found</h2>
        <p className="text-text-secondary text-[13.5px] mb-6 leading-relaxed">This assignment may have been deleted or you don't have access to it.</p>
        <button onClick={() => navigate("/teacher-dashboard")} className="px-6 py-3 bg-bg-primary text-white hover:border-brand-400 border border-border-strong rounded-lg font-bold text-[13px] transition-colors font-display w-full flex items-center justify-center gap-2">
          <ArrowLeft size={15} className="shrink-0" /> Return to Dashboard
        </button>
      </div>
    </div>
  );

  const isLive = assignment.end_time ? new Date(assignment.end_time) > new Date() : false;
  // Calculate completion percentage safely
  const actualTotalStudents = stats.totalStudents || stats.totalSubmissions || 1; // Prevent div by 0
  const submittedCount = stats.totalSubmissions || submissions.length;
  const completionPct = Math.min(Math.round((submittedCount / actualTotalStudents) * 100), 100);

  return (
    <div className="h-screen bg-bg-base text-text-primary font-sans flex flex-col overflow-hidden selection:bg-brand-400/30 selection:text-white">

      {/* ── Header ── */}
      <header className="shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong h-[68px] flex items-center justify-between px-6 lg:px-8 z-30">
        <div className="flex items-center gap-4">
          <button 
            className="w-9 h-9 rounded-[8px] bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors shrink-0" 
            onClick={() => navigate("/teacher-dashboard")} 
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
                {assignment.title}
              </h1>
              <div className="flex items-center gap-1.5 text-[10.5px] text-text-dim font-display uppercase tracking-widest mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                <span className="text-brand-400 font-bold">{assignment.subject}</span>
                <span>·</span>
                <span>{formatEnum(assignment.year)}</span>
                <span>·</span>
                <span>{formatEnum(assignment.batch)}</span>
              </div>
            </div>
          </div>
        </div>

        {isLive ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-400/10 border border-brand-400/25 text-[11px] font-bold text-brand-400 tracking-widest font-display uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse shrink-0" /> Accepting Submissions
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-secondary border border-border-strong text-[11px] font-bold text-text-dim tracking-widest font-display uppercase shrink-0">
            <Clock size={13} className="shrink-0" /> Closed
          </div>
        )}
      </header>

      {/* ── Scrollable Main ── */}
      <main className="flex-1 overflow-y-auto w-full custom-scrollbar p-6 lg:p-8 pb-24">
        <div className="max-w-[1520px] mx-auto flex flex-col gap-6">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Completion Rate */}
            <div className="bg-bg-secondary border border-border-strong rounded-2xl p-5 shadow-sm animate-fade-up" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-brand-400/10 border border-brand-400/20 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-brand-400 shrink-0" />
                </div>
                <span className="font-display text-[12px] font-bold text-text-dim uppercase tracking-widest">Completion Rate</span>
              </div>
              <div className="font-display font-extrabold text-[24px] text-white leading-none mb-3">
                {submittedCount} <span className="text-[14px] text-text-dim font-medium">/ {actualTotalStudents}</span>
              </div>
              <div>
                <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-border-strong">
                  <div className="h-full bg-brand-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionPct}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-text-dim uppercase tracking-wider font-display font-bold">{completionPct}% submitted</div>
              </div>
            </div>

            {/* Class Average */}
            <div className="bg-bg-secondary border border-border-strong rounded-2xl p-5 shadow-sm animate-fade-up" style={{ animationDelay: "50ms" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-teal-400/10 border border-teal-400/20 flex items-center justify-center shrink-0">
                  <BarChart3 size={14} className="text-teal-400 shrink-0" />
                </div>
                <span className="font-display text-[12px] font-bold text-text-dim uppercase tracking-widest">Class Average</span>
              </div>
              <div className="font-display font-extrabold text-[28px] text-white leading-none mb-1">
                {stats.averageScore || 0}<span className="text-[18px] text-text-dim ml-1">%</span>
              </div>
              <div className="text-[12px] text-text-secondary mt-3">Based on graded submissions</div>
            </div>

            {/* Pending AI / Flagged */}
            <div className={`bg-bg-secondary border rounded-2xl p-5 shadow-sm animate-fade-up transition-colors ${stats.flaggedSubmissions > 0 ? "border-amber-400/30 bg-amber-400/5" : "border-border-strong"}`} style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <BrainCircuit size={14} className="text-amber-400 shrink-0" />
                </div>
                <span className="font-display text-[12px] font-bold text-text-dim uppercase tracking-widest">Flagged by AI</span>
              </div>
              <div className="font-display font-extrabold text-[28px] text-white leading-none mb-1">
                {stats.flaggedSubmissions || 0}
              </div>
              <div className={`text-[12px] mt-3 font-bold ${stats.flaggedSubmissions > 0 ? "text-amber-400" : "text-text-secondary"}`}>
                {stats.flaggedSubmissions > 0 ? "Requires your manual review" : "All AI grades look solid"}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-bg-secondary border border-border-strong rounded-2xl p-5 shadow-sm animate-fade-up flex flex-col justify-center gap-4" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-text-dim uppercase tracking-widest font-display">Deadline</div>
                <div className="text-[13px] font-bold text-white font-display">{formatDate(assignment.end_time || assignment.deadline)}</div>
              </div>
              <div className="w-full h-px bg-border-strong" />
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-text-dim uppercase tracking-widest font-display">Results Release</div>
                <div className="text-[13px] font-bold text-brand-400 font-display">{formatDate(assignment.release_marks_at)}</div>
              </div>
            </div>

          </div>

          {/* Submissions Table Box */}
          <div className="bg-bg-secondary border border-border-strong rounded-2xl flex flex-col overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: "200ms" }}>
            
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-border-strong bg-bg-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-text-dim shrink-0" />
                <h2 className="font-display font-bold text-[15px] text-white">Student Submissions</h2>
                <span className="bg-bg-secondary border border-border-strong px-2.5 py-0.5 rounded-md text-[10px] font-bold text-text-dim uppercase tracking-widest font-display ml-2 shrink-0">
                  {filteredSubmissions.length}
                </span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim shrink-0" />
                <input
                  type="text"
                  className="w-full sm:w-[260px] pl-9 pr-3 py-2 bg-bg-secondary border border-border-strong rounded-lg text-[13px] text-white focus:outline-none focus:border-brand-400 transition-colors placeholder:text-text-muted"
                  placeholder="Search by name or email…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table Content */}
            {filteredSubmissions.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-xl bg-bg-primary border border-border-strong flex items-center justify-center mb-4 shrink-0">
                  <AlertCircle size={22} className="text-text-dim shrink-0" />
                </div>
                <div className="font-display text-[16px] font-bold text-white mb-1">{searchQuery ? "No Results Found" : "No Submissions Yet"}</div>
                <div className="text-[13px] text-text-dim max-w-[280px]">
                  {searchQuery ? "Try adjusting your search query." : "When students complete this assignment, they'll appear here."}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="bg-bg-primary/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong w-[35%]">Student</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong">Submitted At</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong">Score</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-strong">
                    {filteredSubmissions.map((sub, i) => (
                      <tr key={sub.id} className="hover:bg-bg-primary/30 transition-colors group">

                        {/* Student Cell */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-bg-primary border border-border-strong flex items-center justify-center font-display font-bold text-[12px] text-brand-400 shrink-0">
                              {initials(sub.student_name)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[14px] font-bold text-white truncate">{sub.student_name}</span>
                              {sub.student_email && <span className="text-[12px] text-text-dim truncate mt-0.5">{sub.student_email}</span>}
                            </div>
                          </div>
                        </td>

                        {/* Submitted At */}
                        <td className="px-6 py-4">
                          <span className="text-[13px] text-text-secondary">{formatDate(sub.submitted_at)}</span>
                        </td>

                        {/* Status (WITH API BLUEPRINT FLAG CHECK) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {sub.status === "GRADED" && !sub.requires_review ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-400/10 border border-teal-400/20 text-[10px] font-bold text-teal-400 uppercase tracking-widest font-display shrink-0">
                                <CheckCircle2 size={12} className="shrink-0" /> Graded
                              </span>
                            ) : sub.status === "PENDING_AI" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-400/10 border border-brand-400/20 text-[10px] font-bold text-brand-400 uppercase tracking-widest font-display shrink-0">
                                <BrainCircuit size={12} className="animate-pulse shrink-0" /> Evaluating
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-400 uppercase tracking-widest font-display shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                                <TriangleAlert size={12} className="shrink-0" /> Review Flag
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4">
                          {sub.score !== null && sub.score !== undefined ? (
                            <span className="font-display font-bold text-[15px] text-white">
                              {sub.score} <span className="text-[12px] text-text-dim font-medium">/ {assignment.total_marks || 0}</span>
                            </span>
                          ) : (
                            <span className="text-text-dim">—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-primary border border-border-strong text-[12px] font-bold text-text-secondary hover:text-brand-400 hover:border-brand-400 transition-all font-display shrink-0"
                            onClick={() => navigate(`/teacher/submissions/${sub.id}`)}
                          >
                            Review <ExternalLink size={13} className="shrink-0" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssignmentView;