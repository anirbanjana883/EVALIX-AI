import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  LogOut,
  Clock,
  CheckCircle,
  FileEdit,
  Calendar,
  Loader2,
  User,
  HelpCircle,
  PlayCircle,
  Lock,
  Award,
  AlertCircle,
  Settings
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Active Tasks");
  const [assignments, setAssignments] = useState([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [studentData, setStudentData] = useState({ year: null, batch: null, dept: null });

  const tabs = ["Active Tasks", "Upcoming", "Completed"];

  const handleLogout = async () => { 
    await logout(); 
    navigate("/auth"); 
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");
        
        // 1. Fetch fresh profile directly from the Prisma database
        const profileRes = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        const dbUser = profileData.user;

        setStudentData({ year: dbUser?.year, batch: dbUser?.batch, dept: dbUser?.department });

        // 2. Gatekeeper: Check if profile is complete
        if (!dbUser?.year || !dbUser?.batch) {
          setIsProfileComplete(false);
          setIsLoading(false);
          return; 
        }

        setIsProfileComplete(true);

        // 3. Fetch Assignments using the fresh database variables
        const assignRes = await fetch(`${API_URL}/api/assignments/student?year=${dbUser.year}&batch=${dbUser.batch}`, { 
          headers: { Authorization: `Bearer ${session.access_token}` } 
        });
        
        if (!assignRes.ok) throw new Error("Failed to fetch assignments");
        
        const assignData = await assignRes.json();
        if (assignData.success) {
          setAssignments(assignData.assignments);
        }

      } catch (error) {
        console.error(error); 
        toast.error("Could not load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []); // Run exactly once on mount

  // UTC to Local Timezone evaluation
  const now = new Date();
  const activeAssignments = assignments.filter((a) => new Date(a.start_time) <= now && new Date(a.end_time) >= now);
  const upcomingAssignments = assignments.filter((a) => new Date(a.start_time) > now);
  const completedAssignments = assignments.filter((a) => new Date(a.end_time) < now);
  
  const getDisplayList = () => {
    if (activeTab === "Active Tasks") return activeAssignments;
    if (activeTab === "Upcoming") return upcomingAssignments;
    return completedAssignments;
  };

  // Uses Intl.DateTimeFormat to render standard JS dates in the user's local timezone
  const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-US", { 
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit" 
    }).format(new Date(dateString));

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-bg-primary border-b border-border-strong h-[64px] flex items-center justify-between px-7">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-[10px]">
            <div className="w-[34px] h-[34px] rounded-full border-2 border-brand-400 bg-brand-400/10 flex items-center justify-center shadow-[0_0_14px_rgba(216,90,48,0.25)] shrink-0">
              <BrainCircuit size={16} className="text-brand-400 shrink-0" />
            </div>
            <span className="font-display font-extrabold text-[15px] tracking-wide text-white whitespace-nowrap hidden sm:block">
              EVALIX <span className="text-brand-400">AI</span>
            </span>
          </div>
          <span className="hidden md:inline-flex px-[10px] py-[3px] rounded-[5px] bg-bg-hover border border-border-strong text-[10.5px] font-bold text-text-dim tracking-[0.1em] uppercase font-display shrink-0">
            Student Portal
          </span>
        </div>
        
        <div className="flex items-center gap-[14px]">
          <div className="hidden md:block text-right">
            <div className="text-[13px] font-semibold text-text-primary whitespace-nowrap">
              {user?.user_metadata?.full_name || "Student"}
            </div>
            <div className="text-[11px] text-text-dim uppercase tracking-[0.05em] whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] mt-[1px]">
              {studentData.dept ? studentData.dept.replace(/_/g, " ") : "No"} Dept
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center justify-center w-[36px] h-[36px] rounded-[7px] border border-border-strong bg-transparent text-text-secondary hover:text-brand-400 hover:border-brand-400 transition-colors shrink-0" 
              onClick={() => navigate('/profile')} 
              title="My Profile"
            >
              <User size={15} className="shrink-0" />
            </button>
            <button 
              className="flex items-center justify-center w-[36px] h-[36px] rounded-[7px] border border-border-strong bg-transparent text-text-secondary hover:text-brand-400 hover:border-brand-400 transition-colors shrink-0" 
              onClick={handleLogout} 
              title="Sign Out"
            >
              <LogOut size={15} className="shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Wrap (Exact 1520px layout) ── */}
      <main className="max-w-[1520px] mx-auto px-7 pt-8 pb-20">
        <h1 className="font-display text-[22px] font-bold text-text-primary tracking-tight mb-1">My Assignments</h1>
        <p className="text-[13.5px] text-text-dim mb-6 leading-[1.5]">Your evaluations are automatically synced with your academic cohort.</p>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-secondary border border-border-subtle rounded-[10px] p-1 w-full mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button 
              key={t} 
              type="button" 
              className={`flex-1 py-[9px] px-3 rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-[7px] cursor-pointer border transition-all duration-200 whitespace-nowrap shrink-0 ${
                activeTab === t 
                  ? "bg-bg-hover text-text-primary border-border-strong" 
                  : "bg-transparent text-text-dim border-transparent hover:text-text-secondary"
              }`} 
              onClick={() => setActiveTab(t)}
            >
              {t}
              {t === "Active Tasks" && activeAssignments.length > 0 && <span className="w-[7px] h-[7px] rounded-full bg-brand-400 animate-pulse shrink-0" />}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-[80px] px-6 flex flex-col items-center justify-center gap-[14px]">
            <Loader2 size={32} className="text-brand-400 animate-spin shrink-0" />
            <div className="font-display text-[14px] font-bold text-text-secondary">Syncing your cohort data…</div>
          </div>
        ) : !isProfileComplete ? (
          <div className="py-[60px] px-6 text-center border-[1.5px] border-dashed border-border-strong rounded-[16px] bg-bg-secondary">
            <div className="w-[56px] h-[56px] rounded-[14px] bg-bg-primary border border-border-strong flex items-center justify-center mx-auto mb-4 shrink-0">
              <Settings size={22} className="text-text-dim shrink-0" />
            </div>
            <div className="font-display text-[16px] font-bold text-text-secondary mb-1.5">Profile Incomplete</div>
            <p className="text-[13px] text-text-dim max-w-[280px] mx-auto leading-[1.6]">You need to set your Academic Year and Batch in your profile before we can fetch your assignments.</p>
            <button 
              onClick={() => navigate('/profile')}
              className="mt-[16px] mx-auto py-[12px] px-[16px] flex items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-bold cursor-pointer transition-all bg-brand-400 text-white border-none hover:bg-brand-600 shadow-[0_4px_18px_-4px_rgba(216,90,48,0.25)] font-display" 
            >
              <User size={15} className="shrink-0"/> Complete Profile
            </button>
          </div>
        ) : getDisplayList().length === 0 ? (
          <div className="py-[60px] px-6 text-center border-[1.5px] border-dashed border-border-strong rounded-[16px] bg-bg-secondary">
            <div className="w-[56px] h-[56px] rounded-[14px] bg-bg-primary border border-border-strong flex items-center justify-center mx-auto mb-4 shrink-0">
              {activeTab === "Active Tasks"
                ? <CheckCircle size={22} className="text-text-dim shrink-0" />
                : <Calendar size={22} className="text-text-dim shrink-0" />}
            </div>
            <div className="font-display text-[16px] font-bold text-text-secondary mb-1.5">Nothing to show here</div>
            <p className="text-[13px] text-text-dim max-w-[280px] mx-auto leading-[1.6]">
              {activeTab === "Active Tasks"
                ? "You're all caught up! No active assignments for this cohort."
                : "Check back later for updates."}
            </p>
          </div>
        ) : (
          <div className="grid gap-[16px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
            {getDisplayList().map((assignment, idx) => {
              // Time extraction and comparison (safe due to exact Date objects)
              const releaseMarksAt = new Date(assignment.release_marks_at);
              const isLive = now >= new Date(assignment.start_time) && now <= new Date(assignment.end_time);
              const isUpcoming = now < new Date(assignment.start_time);
              
              // Exactly matches new backend structure
              const hasSubmitted = assignment.submissions && assignment.submissions.length > 0; 
              const resultsReady = hasSubmitted && now >= releaseMarksAt;

              return (
                <div key={assignment.id} className="bg-bg-secondary border border-border-subtle hover:border-border-strong rounded-[14px] p-[20px] flex flex-col transition-colors animate-fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  
                  <div className="flex items-start justify-between gap-2 mb-[14px]">
                    <span className="px-[10px] py-[3px] rounded-[5px] bg-bg-hover border border-border-strong text-[11px] font-bold text-text-secondary font-display tracking-[0.04em] whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px] shrink-0">
                      {assignment.subject}
                    </span>
                    {activeTab === "Active Tasks" && !hasSubmitted && (
                      <span className="flex items-center gap-[5px] shrink-0 px-[10px] py-[3px] rounded-[5px] bg-brand-400/10 border border-brand-400/25 text-[10.5px] font-bold text-brand-400 tracking-[0.06em] font-display">
                        <span className="w-[6px] h-[6px] rounded-full bg-brand-400 animate-pulse shrink-0" />LIVE
                      </span>
                    )}
                  </div>

                  <div className="font-display text-[16px] font-bold text-text-primary leading-[1.3] mb-[6px]">{assignment.title}</div>
                  <div className="flex items-center gap-[6px] text-[12.5px] text-text-dim mb-[16px]">
                    <User size={13} className="shrink-0" /> {assignment.teacher?.name || "Instructor"}
                  </div>

                  {/* Meta Box */}
                  <div className="bg-bg-primary border border-border-subtle rounded-[10px] p-[13px] flex flex-col gap-[9px] mb-[16px] mt-auto">
                    <div className="flex items-center justify-between text-[12.5px] gap-2">
                      <span className="flex items-center gap-[6px] text-text-dim shrink-0"><FileEdit size={13} className="shrink-0" /> Format</span>
                      <span className="font-semibold text-text-secondary text-right truncate min-w-0">{assignment.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12.5px] gap-2">
                      <span className="flex items-center gap-[6px] text-text-dim shrink-0"><HelpCircle size={13} className="shrink-0" /> Questions</span>
                      <span className="font-semibold text-text-secondary text-right truncate min-w-0">{assignment._count?.questions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12.5px] gap-2">
                      <span className="flex items-center gap-[6px] text-text-dim shrink-0"><Clock size={13} className="shrink-0" /> {activeTab === "Upcoming" ? "Opens" : "Deadline"}</span>
                      <span className={`text-right truncate min-w-0 font-semibold ${activeTab === "Active Tasks" && !hasSubmitted ? "text-brand-400" : "text-text-secondary"}`}>
                        {formatDate(activeTab === "Upcoming" ? assignment.start_time : assignment.end_time)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {hasSubmitted ? (
                    resultsReady ? (
                      <button className="w-full py-[12px] px-[16px] flex items-center justify-center gap-[8px] rounded-[10px] text-[13.5px] font-bold cursor-pointer transition-all border border-border-strong bg-bg-primary text-text-primary hover:border-brand-400 hover:text-brand-400 whitespace-nowrap truncate font-display" onClick={() => navigate(`/student/results/${assignment.id}`)}>
                        <Award size={15} className="text-brand-400 shrink-0" /> View Results
                      </button>
                    ) : (
                      <button className="w-full py-[12px] px-[16px] flex items-center justify-center gap-[8px] rounded-[10px] text-[13.5px] font-bold transition-all border border-border-subtle bg-bg-hover text-text-dim opacity-65 cursor-not-allowed whitespace-nowrap truncate font-display" disabled>
                        <Lock size={14} className="shrink-0" /> Results Pending
                      </button>
                    )
                  ) : isLive ? (
                    <button className="w-full py-[12px] px-[16px] flex items-center justify-center gap-[8px] rounded-[10px] text-[13.5px] font-bold cursor-pointer transition-all border border-transparent bg-brand-400 text-white shadow-[0_4px_18px_-4px_rgba(216,90,48,0.25)] hover:bg-brand-600 hover:-translate-y-[1px] whitespace-nowrap truncate font-display" onClick={() => navigate(`/student/assignments/${assignment.id}`)}>
                      <PlayCircle size={15} className="shrink-0" /> Start Assessment
                    </button>
                  ) : isUpcoming ? (
                    <button className="w-full py-[12px] px-[16px] flex items-center justify-center gap-[8px] rounded-[10px] text-[13.5px] font-bold transition-all border border-border-subtle bg-bg-hover text-text-dim opacity-65 cursor-not-allowed whitespace-nowrap truncate font-display" disabled>
                      <Clock size={14} className="shrink-0" /> Unlocks {formatDate(assignment.start_time)}
                    </button>
                  ) : (
                    <button className="w-full py-[12px] px-[16px] flex items-center justify-center gap-[8px] rounded-[10px] text-[13.5px] font-bold transition-all border border-[#ef444433] bg-[#ef444414] text-[#ef4444] cursor-not-allowed whitespace-nowrap truncate font-display" disabled>
                      <AlertCircle size={14} className="shrink-0" /> Missed Deadline
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;