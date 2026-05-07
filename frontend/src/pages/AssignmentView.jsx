import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  BarChart3,
  BrainCircuit,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AssignmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Data State
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    gradedSubmissions: 0,
    averageScore: 0,
  });

  // --- API Fetch Logic ---
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");

        const response = await fetch(
          `${API_URL}/api/teacher/assignments/${id}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        );

        if (!response.ok) {
          if (response.status === 404) throw new Error("Assignment not found.");
          throw new Error("Failed to load assignment data.");
        }

        const json = await response.json();

        setAssignment(json.assignmentInfo);
        setStats(json.stats);

        // Map the nested student name to the flat table structure
        const formattedSubmissions = json.submissions.map((sub) => ({
          id: sub.id,
          student_name: sub.student?.name || "Unknown Student", // Safety fallback
          student_email: sub.student?.email || "", // Added for search filter
          submitted_at: sub.submitted_at || new Date().toISOString(),
          status: sub.status,
          score: sub.total_score,
        }));
        
        setSubmissions(formattedSubmissions);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Could not load the assignment details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [id]);

  // --- Helpers ---
  const formatEnum = (str) => {
    if (!str) return "";
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // 🛡️ BULLETPROOF DATE FORMATTER
  const formatDate = (dateValue) => {
    if (!dateValue) return 'TBD';
    try {
      const date = new Date(dateValue);
      // Catch Invalid Dates safely before formatting
      if (isNaN(date.getTime())) return 'TBD';
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.warn("Date formatting error:", error);
      return 'TBD';
    }
  };

  // Filter submissions based on search bar
  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // Search by email instead of student_id since student_id wasn't in the mapped data
      sub.student_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center text-text-dim">
        <Loader2 className="w-10 h-10 animate-spin text-brand-400 mb-4" />
        <p className="font-medium text-[15px]">
          Loading assignment analytics...
        </p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center p-6">
        <div className="bg-bg-primary border border-border-subtle rounded-[12px] p-8 max-w-md w-full text-center shadow-card">
          <AlertCircle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-text-primary mb-2">
            Assignment Not Found
          </h2>
          <p className="text-text-secondary text-[14px] mb-6">
            This assignment may have been deleted or you don't have access to
            it.
          </p>
          <button
            onClick={() => navigate("/teacher-dashboard")}
            className="px-6 py-2.5 bg-bg-tertiary text-text-primary hover:bg-border-subtle border border-border-strong rounded-[8px] font-medium text-[13px] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 🛡️ FIXED: Use assignment.deadline, not end_time. 
  // (We removed start_time check since backend doesn't send it to this specific analytics route)
  const isLive = assignment.deadline 
      ? new Date(assignment.deadline) > new Date() 
      : false;

  return (
    <div className="min-h-screen bg-bg-secondary text-text-primary font-sans pb-24">
      {/* Header Bar */}
      <header className="bg-bg-primary border-b border-border-subtle sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/teacher-dashboard")}
              className="p-2 hover:bg-bg-secondary rounded-[8px] text-text-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-medium tracking-tight leading-tight">
                {assignment.title}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-text-dim mt-0.5">
                <span className="uppercase tracking-wider">
                  {assignment.subject}
                </span>
                <span>•</span>
                <span className="uppercase tracking-wider">
                  {formatEnum(assignment.year)} / {formatEnum(assignment.batch)}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-[6px] border text-[12px] font-medium flex items-center gap-1.5 ${
              isLive
                ? "bg-brand-900/30 border-brand-800/50 text-brand-400"
                : "bg-bg-tertiary border-border-strong text-text-secondary"
            }`}
          >
            {isLive ? (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            {isLive ? "Accepting Submissions" : "Closed"}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] w-full mx-auto px-6 mt-8 space-y-8">
        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-bg-primary border border-border-subtle rounded-[12px] p-5 shadow-card">
            <div className="flex items-center gap-2 text-[12px] text-text-dim uppercase tracking-wider font-medium mb-3">
              <Users className="w-4 h-4 text-brand-400" /> Completion Rate
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-medium text-text-primary">
                {stats.submitted}
              </span>
              <span className="text-[14px] text-text-secondary mb-1">
                / {stats.totalStudents} students
              </span>
            </div>
            <div className="w-full bg-bg-secondary rounded-full h-1.5 mt-4">
              <div
                className="bg-brand-400 h-1.5 rounded-full transition-all"
                style={{
                  width: `${(stats.submitted / Math.max(stats.totalStudents, 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-bg-primary border border-border-subtle rounded-[12px] p-5 shadow-card">
            <div className="flex items-center gap-2 text-[12px] text-text-dim uppercase tracking-wider font-medium mb-3">
              <BarChart3 className="w-4 h-4 text-teal-500" /> Class Average
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-medium text-text-primary">
                {stats.averageScore}%
              </span>
            </div>
            <p className="text-[12px] text-text-secondary mt-3">
              Based on graded submissions
            </p>
          </div>

          <div className="bg-bg-primary border border-border-subtle rounded-[12px] p-5 shadow-card">
            <div className="flex items-center gap-2 text-[12px] text-text-dim uppercase tracking-wider font-medium mb-3">
              <BrainCircuit className="w-4 h-4 text-amber-500" /> Pending AI
              Grading
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-medium text-text-primary">
                {stats.pendingAiGrading}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary mt-3">
              Requires your review
            </p>
          </div>

          <div className="bg-bg-primary border border-border-subtle rounded-[12px] p-5 shadow-card flex flex-col justify-center">
            <p className="text-[12px] text-text-secondary mb-1">Deadline:</p>
            <p className="text-[14px] font-medium text-text-primary mb-3">
              {formatDate(assignment.deadline)}
            </p>
            <p className="text-[12px] text-text-secondary mb-1">
              Results Release:
            </p>
            <p className="text-[14px] font-medium text-text-primary">
              {formatDate(assignment.release_marks_at)}
            </p>
          </div>
        </div>

        {/* Submissions Table Section */}
        <div className="bg-bg-primary border border-border-subtle rounded-[12px] shadow-card overflow-hidden">
          {/* Table Toolbar */}
          <div className="px-6 py-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-secondary/30">
            <h2 className="text-[16px] font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-text-secondary" />
              Student Submissions
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-bg-primary border border-border-strong rounded-[8px] text-[13px] focus:outline-none focus:border-brand-400 transition-colors placeholder:text-text-dim"
              />
            </div>
          </div>

          {/* Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="py-20 text-center">
              <AlertCircle className="w-8 h-8 text-text-dim mx-auto mb-3" />
              <p className="text-[15px] font-medium text-text-primary mb-1">
                No submissions yet
              </p>
              <p className="text-[13px] text-text-secondary">
                When students complete this assignment, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-bg-secondary/50 border-b border-border-subtle">
                    <th className="px-6 py-3 text-[11px] font-medium text-text-dim uppercase tracking-wider w-[30%]">
                      Student
                    </th>
                    <th className="px-6 py-3 text-[11px] font-medium text-text-dim uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th className="px-6 py-3 text-[11px] font-medium text-text-dim uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-[11px] font-medium text-text-dim uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-bg-secondary/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-bg-tertiary border border-border-strong flex items-center justify-center text-[12px] font-medium text-text-secondary">
                            {sub.student_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-text-primary">
                              {sub.student_name}
                            </p>
                            <p className="text-[12px] text-text-dim font-mono">
                              {sub.student_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] text-text-secondary">
                          {formatDate(sub.submitted_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {sub.status === "GRADED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-teal-500/10 text-teal-500 text-[11px] font-medium border border-teal-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Graded
                          </span>
                        ) : sub.status === "PENDING_AI" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-amber-500/10 text-amber-500 text-[11px] font-medium border border-amber-500/20">
                            <BrainCircuit className="w-3 h-3 animate-pulse" />{" "}
                            Evaluating...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-bg-tertiary text-text-secondary text-[11px] font-medium border border-border-strong">
                            <Clock className="w-3 h-3" /> Needs Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {sub.score !== null ? (
                          <span className="text-[14px] font-medium text-text-primary">
                            {sub.score} / {assignment.total_marks}
                          </span>
                        ) : (
                          <span className="text-[13px] text-text-dim italic">
                            --
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(`/teacher/submissions/${sub.id}`)
                          }
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-tertiary hover:bg-border-subtle border border-border-strong text-text-primary text-[12px] font-medium rounded-[6px] transition-colors"
                        >
                          Review <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignmentView;
