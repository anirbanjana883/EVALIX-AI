import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Building2, 
  GraduationCap, 
  Hash, 
  Loader2, 
  Save, 
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Info // Added the Info icon
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- ENUMS ---
const DEPARTMENTS = [
  { value: "COMPUTER_SCIENCE_ENGINEERING", label: "Computer Science Engineering" },
  { value: "ELECTRONICS_AND_COMMUNICATION_ENGINEERING", label: "Electronics & Communication Engineering" },
  { value: "ELECTRICAL_AND_ELECTRONICS_ENGINEERING", label: "Electrical & Electronics Engineering" },
  { value: "MECHANICAL_ENGINEERING", label: "Mechanical Engineering" },
  { value: "CIVIL_ENGINEERING", label: "Civil Engineering" },
  { value: "AUTOMOBILE_ENGINEERING", label: "Automobile Engineering" },
  { value: "CHEMICAL_ENGINEERING", label: "Chemical Engineering" },
  { value: "INFORMATION_TECHNOLOGY", label: "Information Technology" },
  { value: "BIOTECHNOLOGY", label: "Biotechnology" },
  { value: "PETROLEUM_ENGINEERING", label: "Petroleum Engineering" },
  { value: "AEROSPACE_ENGINEERING", label: "Aerospace Engineering" },
  { value: "METALLURGICAL_ENGINEERING", label: "Metallurgical Engineering" },
  { value: "INDUSTRIAL_ENGINEERING", label: "Industrial Engineering" },
  { value: "ENVIRONMENTAL_ENGINEERING", label: "Environmental Engineering" },
  { value: "DATA_SCIENCE_ENGINEERING", label: "Data Science Engineering" },
  { value: "ARTIFICIAL_INTELLIGENCE_ENGINEERING", label: "Artificial Intelligence Engineering" },
  { value: "ROBOTICS_ENGINEERING", label: "Robotics Engineering" },
];

const YEARS = [
  { value: "BTECH_YEAR_1", label: "B.Tech - 1st Year" },
  { value: "BTECH_YEAR_2", label: "B.Tech - 2nd Year" },
  { value: "BTECH_YEAR_3", label: "B.Tech - 3rd Year" },
  { value: "BTECH_YEAR_4", label: "B.Tech - 4th Year" },
  { value: "MTECH_YEAR_1", label: "M.Tech - 1st Year" },
  { value: "MTECH_YEAR_2", label: "M.Tech - 2nd Year" },
];

const BATCHES = Array.from({ length: 10 }, (_, i) => ({
  value: `BATCH_${i + 1}`,
  label: `Batch ${i + 1}`,
}));

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    year: "",
    batch: "",
    university_roll: "",
    registration_number: ""
  });

  // --- 1. Fetch Profile on Load ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) throw new Error("Failed to load profile.");

        const json = await response.json();
        setFormData({
          ...json.user,
          year: json.user.year || "",
          batch: json.user.batch || "",
          university_roll: json.user.university_roll || "",
          registration_number: json.user.registration_number || ""
        });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- 2. Update Profile ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        department: formData.department,
      };

      if (formData.role === "STUDENT") {
        payload.year = formData.year;
        payload.batch = formData.batch;
        payload.university_roll = formData.university_roll;
        payload.registration_number = formData.registration_number;
      }

      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Update failed.");
      }

      toast.success("Profile updated successfully!");
      setFormData(prev => ({ ...prev, ...json.user }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center text-text-dim font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-brand-400 mb-4" />
        <p className="font-display text-[14px] font-bold text-text-secondary tracking-wide">Loading your profile...</p>
      </div>
    );
  }

  const isStudent = formData.role === "STUDENT";

  return (
    // Changed to h-screen and overflow-hidden to lock the page dimensions
    <div className="h-screen bg-bg-base text-text-primary font-sans selection:bg-brand-400/30 selection:text-white flex flex-col overflow-hidden">
      
      {/* ── Header ── */}
      <header className="shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong h-[64px] flex items-center justify-between px-7">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-[36px] h-[36px] rounded-[8px] bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-[10px]">
            <div className="w-[34px] h-[34px] rounded-full border-2 border-brand-400 bg-brand-400/10 flex items-center justify-center shadow-[0_0_14px_rgba(216,90,48,0.25)] shrink-0">
              <User size={16} className="text-brand-400" />
            </div>
            <span className="font-display font-extrabold text-[16px] tracking-wide text-white whitespace-nowrap">
              Account Profile
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-[10px] py-[3px] bg-brand-400/10 border border-brand-400/25 rounded-[5px]">
           <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
           <span className="text-[10.5px] font-bold text-brand-400 uppercase tracking-[0.1em] font-display">{formData.role}</span>
        </div>
      </header>

      {/* ── Scrollable Main Form Area ── */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto px-6 py-6 pb-12 animate-fade-up">
          
          <div className="mb-6 flex flex-col items-center text-center">
            {/* Added Info Icon Next to Heading */}
            <div className="inline-flex items-center gap-2.5 mb-1.5">
              <Info className="w-[22px] h-[22px] text-brand-400 drop-shadow-[0_0_8px_rgba(216,90,48,0.5)]" />
              <h1 className="font-display text-[clamp(22px,4vw,28px)] font-extrabold text-white tracking-tight leading-tight">
                Personalization & Settings
              </h1>
            </div>
            <p className="text-[13.5px] text-text-secondary leading-relaxed max-w-[500px] mx-auto">
              Update your institutional details below to ensure you receive the correct assignments and cohort updates.
            </p>
          </div>

          {/* Tightened space-y-8 to space-y-5 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Section 1: Basic Info (Read Only) */}
            {/* Tightened padding p-8 to p-6 */}
            <div className="bg-bg-secondary border border-border-strong rounded-[14px] p-6 shadow-sm transition-all hover:border-border-hi">
              <h2 className="font-display text-[16px] font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-[16px] h-[16px] text-brand-400" /> Identity Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-[6px] font-display">Full Name</label>
                  <div className="flex items-center gap-3 px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-text-secondary cursor-not-allowed opacity-80">
                    <User className="w-[14px] h-[14px] text-text-dim" />
                    <span className="text-[13px] font-medium">{formData.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-[6px] font-display">Email Address</label>
                  <div className="flex items-center gap-3 px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-text-secondary cursor-not-allowed opacity-80">
                    <Mail className="w-[14px] h-[14px] text-text-dim" />
                    <span className="text-[13px] font-medium">{formData.email}</span>
                  </div>
                </div>
              </div>
              
              <p className="mt-4 text-[12px] text-text-dim flex items-center gap-1.5 font-medium bg-bg-primary/50 w-fit px-3 py-1.5 rounded-md border border-border-subtle">
                <AlertCircle className="w-[13px] h-[13px] text-amber-400" /> Note: Name and Email can only be updated via your institution's SSO.
              </p>
            </div>

            {/* Section 2: Institutional Details (Editable) */}
            <div className="bg-bg-secondary border border-border-strong rounded-[14px] p-6 shadow-sm transition-all hover:border-border-hi">
              <h2 className="font-display text-[16px] font-bold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-[16px] h-[16px] text-brand-400" /> Institutional Details
              </h2>
              
              {/* Tightened gap between inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                
                {/* Department - Visible to both */}
                <div className="col-span-full md:col-span-1">
                  <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-[6px] font-display">Department</label>
                  <select 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C8C5BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  >
                    <option value="" disabled className="text-text-dim">Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept.value} value={dept.value} className="bg-bg-secondary">{dept.label}</option>
                    ))}
                  </select>
                </div>

                {/* Student Only Fields */}
                {isStudent && (
                  <>
                    <div className="col-span-full md:col-span-1 flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-[6px] font-display">Academic Year</label>
                        <select 
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          className="w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all cursor-pointer appearance-none"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C8C5BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                        >
                          <option value="" disabled className="text-text-dim">Select Year</option>
                          {YEARS.map(y => (
                            <option key={y.value} value={y.value} className="bg-bg-secondary">{y.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-[6px] font-display">Batch</label>
                        <select 
                          value={formData.batch}
                          onChange={(e) => setFormData({...formData, batch: e.target.value})}
                          className="w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all cursor-pointer appearance-none"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C8C5BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                        >
                          <option value="" disabled className="text-text-dim">Select Batch</option>
                          {BATCHES.map(b => (
                            <option key={b.value} value={b.value} className="bg-bg-secondary">{b.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-[6px] font-display">University Roll Number</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-text-dim" />
                        <input 
                          type="text"
                          value={formData.university_roll}
                          onChange={(e) => setFormData({...formData, university_roll: e.target.value})}
                          placeholder="e.g. 10023456"
                          className="w-full pl-9 pr-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-[6px] font-display">Registration Number</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-text-dim" />
                        <input 
                          type="text"
                          value={formData.registration_number}
                          onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                          placeholder="e.g. REG-2023-456"
                          className="w-full pl-9 pr-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-1">
              <button 
                type="submit"
                disabled={isSaving}
                className="py-[12px] px-[28px] flex items-center justify-center gap-[8px] rounded-[8px] text-[14px] font-bold cursor-pointer transition-all border border-transparent bg-brand-400 text-white shadow-[0_4px_18px_-4px_rgba(216,90,48,0.25)] hover:bg-brand-600 hover:-translate-y-[1px] font-display tracking-wide disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Syncing Details...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Profile Details</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;