import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react"; // 🌟 ADDED: Eye and EyeOff icons
import toast from "react-hot-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 🌟 ADDED: State to toggle password visibility

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("STUDENT");

  const { login, signup, user, role: userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRole) {
      navigate(userRole === "TEACHER" ? "/teacher-dashboard" : "/student-dashboard");
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Authentication successful!");
      } else {
        if (!fullName) throw new Error("Full name is required for registration.");
        if (!department) throw new Error("Please select your department.");
        
        const metadata = { full_name: fullName, department, role };
        const data = await signup(email, password, metadata);
        if (data?.user && !data?.session) {
          toast.success("Registration successful! Please check your email to verify.");
          setIsLogin(true);
        } else {
          toast.success("Registration and sync complete!");
        }
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectBg = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C8C5BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-base px-4 py-12 font-sans relative overflow-hidden selection:bg-brand-400/30 selection:text-white">
      
      {/* ── Ambient Radial Glows ── */}
      <div className="fixed -top-[15%] left-1/2 -translate-x-1/2 w-[720px] h-[480px] rounded-full bg-brand-400/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-[20%] -right-[10%] w-[500px] h-[400px] rounded-full bg-teal-400/10 blur-[120px] pointer-events-none z-0" />

      {/* ── Auth Card ── */}
      <div className="relative z-10 w-full max-w-[440px] bg-bg-secondary border border-border-strong rounded-3xl p-8 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-fade-up">

        {/* ── Brand Block ── */}
        <div className="flex flex-col items-center mb-8">
          
          {/* Logo with Pulse */}
          <div className="relative mb-5">
            {/* Background Pulse */}
            <div className="absolute inset-[-6px] rounded-full border border-brand-400/30 animate-[ping_3s_ease-in-out_infinite] z-0" />
            
            <div className="relative w-20 h-20 rounded-full bg-bg-primary border-2 border-brand-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(216,90,48,0.2)] z-10">
              <img 
                src="/logo.jpeg" 
                alt="Evalix AI Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Fallback if image fails to load */}
              <span className="hidden text-[10px] text-brand-400 font-bold tracking-widest font-display text-center leading-tight">EVALIX<br/>LOGO</span>
            </div>
          </div>

          {/* Wordmark */}
          <div className="text-center leading-none">
            <span className="font-display font-extrabold text-[28px] tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-400 to-[#7BB8D4]">
              EVALIX
            </span>
            <span className="block font-display font-medium text-[11px] tracking-[0.55em] text-white/30 mt-1 pl-[0.55em]">
              AI
            </span>
          </div>

          <p className="mt-4 font-sans text-[14px] text-text-secondary tracking-wide">
            {isLogin ? "Sign in to your account" : "Create your workspace"}
          </p>
        </div>

        {/* ── Tab Toggle ── */}
        <div className="flex bg-bg-primary border border-border-strong rounded-xl p-1 gap-1 mb-8">
          {[["Sign In", true], ["Sign Up", false]].map(([label, forLogin]) => {
            const active = isLogin === forLogin;
            return (
              <button
                key={label}
                onClick={() => setIsLogin(forLogin)}
                type="button"
                className={`flex-1 py-2.5 rounded-lg font-display text-[13.5px] font-bold tracking-wide transition-all duration-200 ${
                  active 
                    ? "bg-brand-400/10 border border-brand-400/40 text-white shadow-[0_0_15px_rgba(216,90,48,0.15)]" 
                    : "border border-transparent bg-transparent text-text-dim hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {!isLogin && (
            <div className="animate-fade-up">
              {/* Role Selection */}
              <p className="text-[11px] font-bold text-text-dim uppercase tracking-widest font-display mb-2">
                I am a
              </p>
              <div className="flex gap-3 mb-5">
                {["STUDENT", "TEACHER"].map((r) => (
                  <label 
                    key={r} 
                    className={`flex-1 flex items-center justify-center py-3 rounded-xl border font-sans text-[13.5px] font-bold tracking-wide cursor-pointer transition-all duration-200 ${
                      role === r 
                        ? "bg-brand-400/10 border-brand-400/60 text-white shadow-[0_0_15px_rgba(216,90,48,0.15)]" 
                        : "bg-bg-primary border-border-strong text-text-secondary hover:border-border-hi"
                    }`}
                  >
                    <input
                      type="radio" name="role" value={r}
                      checked={role === r}
                      onChange={(e) => setRole(e.target.value)}
                      className="hidden"
                    />
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>

              {/* Department */}
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required={!isLogin}
                className={`w-full px-4 py-3.5 bg-bg-primary border border-border-strong rounded-xl text-[14px] transition-colors focus:outline-none focus:border-brand-400 appearance-none cursor-pointer mb-4 ${
                  department ? "text-white" : "text-text-muted"
                }`}
                style={selectBg}
              >
                <option value="" disabled className="bg-bg-secondary text-text-muted">Select Department</option>
                <option value="COMPUTER_SCIENCE_ENGINEERING" className="bg-bg-secondary text-white">Computer Science Engineering</option>
                <option value="ELECTRONICS_AND_COMMUNICATION_ENGINEERING" className="bg-bg-secondary text-white">Electronics & Communication Engineering</option>
                <option value="ELECTRICAL_AND_ELECTRONICS_ENGINEERING" className="bg-bg-secondary text-white">Electrical & Electronics Engineering</option>
                <option value="MECHANICAL_ENGINEERING" className="bg-bg-secondary text-white">Mechanical Engineering</option>
                <option value="CIVIL_ENGINEERING" className="bg-bg-secondary text-white">Civil Engineering</option>
                <option value="AUTOMOBILE_ENGINEERING" className="bg-bg-secondary text-white">Automobile Engineering</option>
                <option value="CHEMICAL_ENGINEERING" className="bg-bg-secondary text-white">Chemical Engineering</option>
                <option value="INFORMATION_TECHNOLOGY" className="bg-bg-secondary text-white">Information Technology</option>
                <option value="BIOTECHNOLOGY" className="bg-bg-secondary text-white">Biotechnology</option>
                <option value="PETROLEUM_ENGINEERING" className="bg-bg-secondary text-white">Petroleum Engineering</option>
                <option value="AEROSPACE_ENGINEERING" className="bg-bg-secondary text-white">Aerospace Engineering</option>
                <option value="METALLURGICAL_ENGINEERING" className="bg-bg-secondary text-white">Metallurgical Engineering</option>
                <option value="INDUSTRIAL_ENGINEERING" className="bg-bg-secondary text-white">Industrial Engineering</option>
                <option value="ENVIRONMENTAL_ENGINEERING" className="bg-bg-secondary text-white">Environmental Engineering</option>
                <option value="DATA_SCIENCE_ENGINEERING" className="bg-bg-secondary text-white">Data Science Engineering</option>
                <option value="ARTIFICIAL_INTELLIGENCE_ENGINEERING" className="bg-bg-secondary text-white">Artificial Intelligence Engineering</option>
                <option value="ROBOTICS_ENGINEERING" className="bg-bg-secondary text-white">Robotics Engineering</option>
              </select>

              {/* Full Name */}
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"><User size={18} /></span>
                <input
                  type="text" required={!isLogin}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-primary border border-border-strong rounded-xl text-[14px] text-white placeholder:text-text-muted focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"><Mail size={18} /></span>
            <input
              type="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3.5 bg-bg-primary border border-border-strong rounded-xl text-[14px] text-white placeholder:text-text-muted focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>

          {/* 🌟 ADDED: Password Input with Custom Eye Button 🌟 */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"><Lock size={18} /></span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-12 pr-12 py-3.5 bg-bg-primary border border-border-strong rounded-xl text-[14px] text-white placeholder:text-text-muted focus:outline-none focus:border-brand-400 transition-colors"
            />
            {/* The Eye Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-white transition-colors cursor-pointer"
              tabIndex="-1" // Prevents tab from focusing the eye instead of the submit button
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-brand-400 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-hover hover:-translate-y-px font-display text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              isLogin ? "Sign In →" : "Create Account →"
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Auth;