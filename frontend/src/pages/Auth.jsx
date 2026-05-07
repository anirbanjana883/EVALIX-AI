import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   Inject fonts + animations once
───────────────────────────────────────────── */
const GLOBAL_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&display=swap');

@keyframes pulseRing {
  0%,100% { opacity:.35; transform:scale(1); }
  50%      { opacity:.1;  transform:scale(1.07); }
}
@keyframes spin {
  to { transform:rotate(360deg); }
}

/* Input placeholder color */
.evalix-input::placeholder { color:rgba(255,255,255,0.25) !important; }
.evalix-input:focus {
  border-color:rgba(216,90,48,.7) !important;
  box-shadow:0 0 0 3px rgba(216,90,48,.12) !important;
  outline:none;
}
.evalix-select:focus { outline:none; border-color:rgba(216,90,48,.7) !important; }
.evalix-select option { background:#2C2C2A; color:#fff; }
.evalix-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
.evalix-btn:active:not(:disabled) { transform:translateY(0); }
`;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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

  /* ── reusable input style ── */
  const inputStyle = {
    width: "100%",
    paddingLeft: 44,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
  };

  const iconStyle = {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255,255,255,0.28)",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>

      {/* ── Page shell ── */}
      <div style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-secondary, #2C2C2A)",
        padding: "48px 16px",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Ambient radial glow */}
        <div style={{
          position: "fixed", top: "-15%", left: "50%",
          transform: "translateX(-50%)",
          width: 720, height: 480, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(216,90,48,0.13) 0%, transparent 68%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "fixed", bottom: "-20%", right: "-10%",
          width: 500, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(58,158,143,0.07) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* ── Auth card ── */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 440,
          background: "var(--color-bg-primary, #1C1B1A)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: "40px 36px 44px",
          boxShadow: "0 0 0 1px rgba(216,90,48,0.07), 0 40px 80px -20px rgba(0,0,0,0.7)",
        }}>

          {/* ── Brand block ── */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:36 }}>

            {/* Circular logo slot */}
            <div style={{ position:"relative", marginBottom:18 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(145deg, #2e2c2a, #1a1918)",
                border: "2px solid rgba(216,90,48,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 0 0 6px rgba(216,90,48,0.07), 0 0 32px rgba(216,90,48,0.22)",
              }}>
                {/*
                  ╔══════════════════════════════╗
                  ║  REPLACE THIS WITH:          ║
                  ║  <img src="/logo.png"        ║
                  ║    alt="Evalix AI"           ║
                  ║    style={{width:"100%"}}/>  ║
                  ╚══════════════════════════════╝
                */}
                <span style={{
                  fontSize: 8.5, color: "rgba(216,90,48,0.45)",
                  textAlign: "center", lineHeight: 1.5,
                  letterSpacing: "0.06em", fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}>YOUR<br/>LOGO</span>
              </div>
              {/* Pulse ring */}
              <div style={{
                position: "absolute", inset: -7, borderRadius: "50%",
                border: "1px solid rgba(216,90,48,0.22)",
                animation: "pulseRing 3.2s ease-in-out infinite",
              }} />
            </div>

            {/* EVALIX AI wordmark */}
            <div style={{ textAlign: "center", lineHeight: 1 }}>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 30,
                letterSpacing: "0.14em",
                background: "linear-gradient(90deg, #D85A30 0%, #F09977 38%, #B8D8EA 65%, #7BB8D4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "block",
              }}>EVALIX</span>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 500,
                fontSize: 11,
                letterSpacing: "0.55em",
                color: "rgba(255,255,255,0.32)",
                display: "block",
                marginTop: 3,
                paddingLeft: "0.55em", /* optical centering */
              }}>AI</span>
            </div>

            <p style={{
              marginTop: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.01em",
            }}>
              {isLogin ? "Sign in to your account" : "Create your workspace"}
            </p>
          </div>

          {/* ── Tab toggle ── */}
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 13,
            padding: 4, gap: 4,
            marginBottom: 30,
          }}>
            {[["Sign In", true], ["Sign Up", false]].map(([label, forLogin]) => {
              const active = isLogin === forLogin;
              return (
                <button
                  key={label}
                  onClick={() => setIsLogin(forLogin)}
                  style={{
                    flex: 1, padding: "10px 0",
                    borderRadius: 10,
                    border: active ? "1px solid rgba(216,90,48,0.38)" : "1px solid transparent",
                    background: active
                      ? "linear-gradient(135deg, rgba(216,90,48,0.18), rgba(216,90,48,0.07))"
                      : "transparent",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.35)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: active ? 700 : 400,
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    transition: "all .2s",
                    boxShadow: active ? "0 0 14px rgba(216,90,48,0.1)" : "none",
                  }}
                >{label}</button>
              );
            })}
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                {/* Role pills */}
                <p style={{
                  fontSize: 11, fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 8, marginTop: 0,
                }}>I am a</p>

                <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                  {["STUDENT","TEACHER"].map((r) => (
                    <label key={r} style={{
                      flex: 1, display:"flex", alignItems:"center", justifyContent:"center",
                      padding: "12px 0",
                      borderRadius: 10,
                      border: role === r ? "1.5px solid rgba(216,90,48,0.6)" : "1px solid rgba(255,255,255,0.09)",
                      background: role === r
                        ? "linear-gradient(135deg, rgba(216,90,48,0.14), rgba(216,90,48,0.05))"
                        : "rgba(255,255,255,0.02)",
                      color: role === r ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                      fontSize: 13,
                      fontWeight: role === r ? 700 : 500,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: "pointer",
                      transition: "all .2s",
                      boxShadow: role === r ? "0 0 12px rgba(216,90,48,0.14)" : "none",
                      letterSpacing: "0.02em",
                    }}>
                      <input
                        type="radio" name="role" value={r}
                        checked={role === r}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ display:"none" }}
                      />
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>

                {/* Department */}
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="evalix-select"
                  style={{
                    width:"100%", padding:"12px 16px",
                    background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:10,
                    color: department ? "#FFFFFF" : "rgba(255,255,255,0.28)",
                    fontSize:14,
                    fontFamily:"'DM Sans', sans-serif",
                    fontWeight:500,
                    appearance:"none",
                    cursor:"pointer",
                    boxSizing:"border-box",
                    marginBottom:14,
                    transition:"border-color .2s",
                  }}
                >
                  <option value="" disabled>Select Department</option>
                  <option value="COMPUTER_SCIENCE_ENGINEERING">Computer Science Engineering</option>
                  <option value="ELECTRONICS_AND_COMMUNICATION_ENGINEERING">Electronics & Communication Engineering</option>
                  <option value="ELECTRICAL_AND_ELECTRONICS_ENGINEERING">Electrical & Electronics Engineering</option>
                  <option value="MECHANICAL_ENGINEERING">Mechanical Engineering</option>
                  <option value="CIVIL_ENGINEERING">Civil Engineering</option>
                  <option value="AUTOMOBILE_ENGINEERING">Automobile Engineering</option>
                  <option value="CHEMICAL_ENGINEERING">Chemical Engineering</option>
                  <option value="INFORMATION_TECHNOLOGY">Information Technology</option>
                  <option value="BIOTECHNOLOGY">Biotechnology</option>
                  <option value="PETROLEUM_ENGINEERING">Petroleum Engineering</option>
                  <option value="AEROSPACE_ENGINEERING">Aerospace Engineering</option>
                  <option value="METALLURGICAL_ENGINEERING">Metallurgical Engineering</option>
                  <option value="INDUSTRIAL_ENGINEERING">Industrial Engineering</option>
                  <option value="ENVIRONMENTAL_ENGINEERING">Environmental Engineering</option>
                  <option value="DATA_SCIENCE_ENGINEERING">Data Science Engineering</option>
                  <option value="ARTIFICIAL_INTELLIGENCE_ENGINEERING">Artificial Intelligence Engineering</option>
                  <option value="ROBOTICS_ENGINEERING">Robotics Engineering</option>
                </select>

                {/* Full Name */}
                <div style={{ position:"relative", marginBottom:14 }}>
                  <span style={iconStyle}><User size={17} /></span>
                  <input
                    type="text" required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="evalix-input"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div style={{ position:"relative", marginBottom:14 }}>
              <span style={iconStyle}><Mail size={17} /></span>
              <input
                type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="evalix-input"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ position:"relative", marginBottom:0 }}>
              <span style={iconStyle}><Lock size={17} /></span>
              <input
                type="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="evalix-input"
                style={inputStyle}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="evalix-btn"
              style={{
                width:"100%",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                padding:"13px 0", marginTop:26,
                background: isLoading
                  ? "rgba(216,90,48,0.35)"
                  : "linear-gradient(135deg, #D85A30 0%, #b83e1a 100%)",
                border:"none", borderRadius:11,
                color:"#FFFFFF",
                fontSize:15, fontWeight:700,
                fontFamily:"'DM Sans', sans-serif",
                letterSpacing:"0.04em",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition:"opacity .2s, transform .15s, box-shadow .2s",
                boxShadow: isLoading ? "none" : "0 6px 24px rgba(216,90,48,0.38)",
              }}
            >
              {isLoading
                ? <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
                : isLogin ? "Sign In →" : "Create Account →"
              }
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Auth;