import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  MoreVertical,
  Clock,
  Loader2,
  AlertCircle,
  Menu,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  FileText,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen]     = useState(false);
  const [isLoading, setIsLoading]                   = useState(true);
  const [dashboardData, setDashboardData]           = useState({
    stats: { activeAssignments: 0, pendingEvaluations: 0, avgPerformance: "0%" },
    assignments: [],
  });

  const handleLogout = async () => { await logout(); navigate("/auth"); };

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/teacher-dashboard" },
    { name: "My Profile", icon: User, path: "/profile" },
    { name: "Create Assignment", icon: Plus, path: "/teacher/assignments/new" },
    { name: "AI Question Generator", icon: Sparkles, path: "/teacher/generate-questions" },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");
        const response = await fetch(`${API_URL}/api/teacher/dashboard`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const json = await response.json();
        setDashboardData({
          stats: {
            activeAssignments:  json.activeAssignments || 0,
            pendingEvaluations: json.pendingEvaluations || 0,
            avgPerformance:     `${json.avgPerformance || 0}%`,
          },
          assignments: json.recentAssignments || [],
        });
      } catch (error) {
        console.error(error);
        toast.error("Could not load your dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatEnum = (str) => {
    if (!str) return "";
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    }).format(new Date(dateString));

  const initials = (name = "") =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "IN";

  const statCards = [
    { label: "Active Assignments",    value: dashboardData.stats.activeAssignments,  sub: "Currently open to students",      icon: BookOpen, color: "text-brand-400", bg: "bg-brand-400/10", border: "border-brand-400/20" },
    { label: "Pending Evaluations",   value: dashboardData.stats.pendingEvaluations, sub: "Requires AI or manual grading",   icon: Users,    color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    { label: "Avg. Class Performance",value: dashboardData.stats.avgPerformance,      sub: "Across all recent cohorts",        icon: TrendingUp, color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/20" },
  ];

  return (
    <div className="h-screen flex bg-bg-base text-text-primary font-sans overflow-hidden selection:bg-brand-400/30 selection:text-white">

      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-bg-primary border-r border-border-strong transition-all duration-300 lg:relative ${isSidebarCollapsed ? "w-[80px]" : "w-64"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

        {/* Collapse toggle (desktop) */}
        <button
          className="hidden lg:flex absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-bg-secondary border border-border-strong items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors z-50"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} className="shrink-0" /> : <ChevronLeft size={14} className="shrink-0" />}
        </button>

        {/* Brand */}
        <div className={`h-[68px] flex items-center shrink-0 border-b border-border-strong ${isSidebarCollapsed ? "justify-center px-0" : "justify-between px-5"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full border border-brand-400 bg-brand-400/10 flex items-center justify-center shrink-0">
              <BrainCircuit size={16} className="text-brand-400 shrink-0" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-display font-extrabold text-[15px] tracking-wide text-white leading-tight">
                  EVALIX <span className="text-brand-400">AI</span>
                </span>
                <span className="text-[9px] text-text-dim uppercase tracking-widest font-display font-bold">Instructor Portal</span>
              </div>
            )}
          </div>
          <button className="lg:hidden text-text-secondary hover:text-white shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} className="shrink-0" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.name}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl font-display font-bold text-[13.5px] transition-all group ${
                  active 
                    ? "bg-brand-400/10 text-brand-400 shadow-[0_0_10px_rgba(216,90,48,0.1)]" 
                    : "text-text-secondary hover:bg-bg-secondary hover:text-white"
                } ${isSidebarCollapsed ? "justify-center" : "justify-start"}`}
                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
              >
                <item.icon size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                
                {/* Tooltip for collapsed state */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-bg-secondary border border-border-strong text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-border-strong bg-bg-primary/50">
          <div className={`flex items-center gap-3 mb-4 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border-strong flex items-center justify-center text-text-primary font-display font-bold text-[12px] shrink-0">
              {initials(user?.user_metadata?.full_name)}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="text-[13px] font-bold text-white truncate">{user?.user_metadata?.full_name || "Instructor"}</div>
                <div className="text-[11px] text-text-dim truncate mt-0.5">{formatEnum(user?.user_metadata?.department) || "Department"}</div>
              </div>
            )}
          </div>
          <button 
            className={`flex items-center gap-2 w-full py-2.5 rounded-lg border border-border-strong text-text-secondary hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all font-display font-bold text-[13px] ${isSidebarCollapsed ? "justify-center px-0" : "justify-center px-4"}`}
            onClick={handleLogout}
            title={isSidebarCollapsed ? "Sign Out" : ""}
          >
            <LogOut size={16} className="shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg-base">

        {/* Header */}
        <header className="h-[68px] shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong flex items-center justify-between px-6 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-text-secondary hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} className="shrink-0" />
            </button>
            <h1 className="font-display text-[18px] font-bold text-white tracking-wide">Dashboard Overview</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-teal-400/10 border border-teal-400/20 text-[11px] font-bold text-teal-400 tracking-widest font-display uppercase shrink-0 shadow-[0_0_10px_rgba(45,212,191,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" /> Live Session
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
          <div className="max-w-[1520px] mx-auto">
            {isLoading ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <Loader2 size={36} className="text-brand-400 animate-spin mb-4 shrink-0" />
                <p className="font-display font-bold text-[15px] text-white">Syncing classroom data…</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {statCards.map((s, i) => (
                    <div className="bg-bg-secondary border border-border-strong rounded-2xl p-6 shadow-sm animate-fade-up" key={i} style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${s.bg} ${s.border} ${s.color}`}>
                          <s.icon size={18} className="shrink-0" />
                        </div>
                        <div className="font-display text-[12px] font-bold text-text-dim uppercase tracking-widest leading-tight">{s.label}</div>
                      </div>
                      <div className="font-display font-extrabold text-[32px] text-white leading-none mb-2">{s.value}</div>
                      <div className="text-[13px] text-text-secondary">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Table Card */}
                <div className="bg-bg-secondary border border-border-strong rounded-2xl flex flex-col overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: "150ms" }}>
                  
                  {/* Table Header / Toolbar */}
                  <div className="px-6 py-5 border-b border-border-strong bg-bg-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <FileText size={18} className="text-brand-400 shrink-0" />
                      <h2 className="font-display font-bold text-[16px] text-white">Recent Assignments</h2>
                    </div>
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim shrink-0" />
                      <input
                        type="text"
                        placeholder="Search assignments…"
                        className="w-full sm:w-[260px] pl-9 pr-4 py-2.5 bg-bg-secondary border border-border-strong rounded-lg text-[13.5px] text-white focus:outline-none focus:border-brand-400 transition-colors placeholder:text-text-muted"
                      />
                    </div>
                  </div>

                  {/* Table Content */}
                  {dashboardData.assignments.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 rounded-xl bg-bg-primary border border-border-strong flex items-center justify-center mb-4 shrink-0">
                        <AlertCircle size={24} className="text-text-dim shrink-0" />
                      </div>
                      <div className="font-display text-[16px] font-bold text-white mb-1">No assignments found</div>
                      <div className="text-[13.5px] text-text-secondary max-w-[280px]">
                        Create your first assignment to start evaluating students with AI.
                      </div>
                      <button 
                        className="mt-6 px-6 py-2.5 bg-brand-400 hover:bg-brand-600 text-white font-bold rounded-lg transition-all font-display text-[13px] flex items-center gap-2"
                        onClick={() => navigate("/teacher/assignments/new")}
                      >
                        <Plus size={16} className="shrink-0" /> Create Assignment
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-bg-primary/50">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong">Title & Cohort</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-widest font-display border-b border-border-strong">Deadline</th>
                            <th className="px-6 py-4 border-b border-border-strong"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-strong">
                          {dashboardData.assignments.map((row) => {
                            const isLive = new Date(row.end_time) > new Date() && new Date(row.start_time) <= new Date();

                            return (
                              <tr 
                                key={row.id} 
                                className="hover:bg-bg-primary/30 transition-colors cursor-pointer group"
                                onClick={() => navigate(`/teacher/assignments/${row.id}`)}
                              >
                                <td className="px-6 py-4">
                                  <div className="font-bold text-[14.5px] text-white mb-1.5">{row.title}</div>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-0.5 bg-bg-primary border border-border-strong rounded text-[10px] font-bold text-text-dim uppercase tracking-widest font-display">{formatEnum(row.year)}</span>
                                    <span className="px-2 py-0.5 bg-bg-primary border border-border-strong rounded text-[10px] font-bold text-text-dim uppercase tracking-widest font-display">{formatEnum(row.batch)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 bg-bg-hover border border-border-strong rounded-md text-[11px] font-bold text-text-secondary font-display uppercase tracking-widest">
                                    {row.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {isLive ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-400/10 border border-teal-400/20 text-[10px] font-bold text-teal-400 uppercase tracking-widest font-display shrink-0">
                                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" /> Live
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-primary border border-border-strong text-[10px] font-bold text-text-dim uppercase tracking-widest font-display shrink-0">
                                      <span className="w-1.5 h-1.5 rounded-full bg-text-dim shrink-0" /> Closed
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-[13px] text-text-secondary">
                                    <Clock size={14} className="text-text-dim shrink-0" />
                                    {formatDate(row.end_time)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    className="p-2 text-text-dim hover:text-white hover:bg-bg-primary rounded-lg transition-colors"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/teacher/assignments/${row.id}`); }}
                                    title="View Details"
                                  >
                                    <MoreVertical size={18} className="shrink-0" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

    </div>
  );
};

export default TeacherDashboard;