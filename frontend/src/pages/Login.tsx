import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { api } from "@/lib/api";

interface LoginResponse {
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  message: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const organizations = [
    { logo: "/css-logo.svg", name: "Computer Students' Society" },
    { logo: "/ssg2-logo.svg", name: "CIT-U Supreme Student Government" },
  ];

  // Redirect if already logged in - prevents back navigation to login after logging in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/select-organization", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOrg((prev) => (prev + 1) % organizations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await api.post("/auth/login/", { email, password });
      const data: LoginResponse & { token: string } = await response.json();

      // Store user info & token in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("authToken", data.token);

      // Redirect to Organization Selector Hub with replace to prevent back navigation
      navigate("/select-organization", { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMsg = "";

      if (err.name === 'ApiError' && err.data) {
        const errorData = err.data as any; // Cast to any to access properties

        // Handle field-specific errors if available
        if (errorData.errors) {
          const newFieldErrors: Record<string, string[]> = {};
          let hasFieldErrors = false;

          Object.entries(errorData.errors).forEach(([field, msgs]: [string, any]) => {
            if (field === 'non_field_errors') {
              // Collect non-field errors to show in the main alert
              const nonFieldMsgs = Array.isArray(msgs) ? msgs.join('; ') : msgs;
              errorMsg = errorMsg ? `${errorMsg}; ${nonFieldMsgs}` : nonFieldMsgs;
            } else {
              // Collect field-specific errors
              newFieldErrors[field] = Array.isArray(msgs) ? msgs : [msgs];
              hasFieldErrors = true;
            }
          });

          if (hasFieldErrors) {
            setFieldErrors(newFieldErrors);
          }
        }

        // Fallback to message if no specific errors parsed or if message is present
        if (!errorMsg && !Object.keys(fieldErrors).length) {
          errorMsg = errorData.message || "Login failed";
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      if (errorMsg) {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-[#293F55]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>

      {/* LEFT SIDE - BRANDING PANEL */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between"
        style={{ backgroundColor: '#293F55' }}>

        <div className="absolute inset-0  pointer-events-none flex items-center justify-center">
          <DotLottieReact
            src="/assets/anim_getthingsdone.json"
            loop
            autoplay
            className="w-full h-full"
            renderConfig={{
              autoResize: true
            }}
          />
        </div>

        {/* Decorative Yellow Accent Sideline */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#FCBD78] z-20 shadow-[0_0_15px_rgba(252,189,120,0.3)]"></div>

        {/* Top Content */}
        <div className="relative z-20 px-12 pt-10">

          <div className="flex items-start gap-5 animate-fade-up delay-100 mb-6">
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              <span className="text-[#FCBD78]">Individual Performance</span>
              <br />Evaluation System
            </h1>
          </div>

          <p className="text-blue-100/80 text-lg leading-relaxed max-w-sm animate-fade-up delay-200">
            Ensuring transparency and excellence in student governance through data-driven assessment.
          </p>
        </div>

        {/* Bottom Content (Partners) */}
        <div className="relative z-10 px-12 pb-12">
          <p className="text-[#FCBD78] text-xs font-bold uppercase tracking-wider mb-4">Authorized Partners</p>
          <div className="relative h-14">
            {organizations.map((org, index) => (
              <div
                key={index}
                className="flex items-center gap-4 absolute transition-all duration-700 ease-in-out w-full"
                style={{
                  opacity: index === currentOrg ? 1 : 0,
                  transform: index === currentOrg ? 'translateY(0)' : 'translateY(10px)',
                  pointerEvents: index === currentOrg ? 'auto' : 'none',
                }}
              >
                <div className="rounded-full flex items-center justify-center">
                  <img src={org.logo} alt="" className="w-10 h-10 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <span className="text-white font-medium text-sm border-l-2 border-[#FCBD78] pl-3">{org.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#293F55] lg:bg-[#F8FAFC] relative">

        {/* Top Left Logo for Right Pane (Desktop/Tablet) */}
        <div className="hidden lg:flex absolute top-10 left-10 items-center gap-3 animate-fade-up">
          <img src="/ipes-logo-colored.svg" alt="IPES Logo" className="w-10 h-10 object-contain" />
          <span className="text-[#293F55] font-bold text-2xl tracking-tight">IPES</span>
        </div>

        <div className="w-full max-w-[420px] bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100 animate-fade-up">

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center text-[#293F55]">
            <img src="/ipes-logo-colored.svg" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">IPES Portal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#293F55] mb-2">Sign In</h2>
            <p className="text-slate-500 text-sm">Please enter your official credentials to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 animate-fade-up">
                {error}
              </div>
            )}
            <div className="space-y-2 animate-fade-up delay-100">
              <Label htmlFor="email" className="text-[#293F55] font-semibold text-sm">
                Institutional Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="firstname.lastname@cit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#293F55] focus-visible:ring-offset-0 focus-visible:border-[#293F55] transition-all ${fieldErrors.email ? "border-red-500 focus-visible:border-red-500" : ""}`}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-500 mt-1 animate-fade-up">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 animate-fade-up delay-200">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#293F55] font-semibold text-sm">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#293F55] focus-visible:ring-offset-0 focus-visible:border-[#293F55] transition-all pr-10 ${fieldErrors.password ? "border-red-500 focus-visible:border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#293F55] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-500 mt-1 animate-fade-up">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            <div className="pt-2 animate-fade-up delay-300">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-bold bg-[#FCBD78] hover:bg-[#faa94f] text-[#293F55] shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center animate-fade-up delay-300">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <button
                onClick={() => navigate("/register")}
                className="font-semibold text-[#FCBD78] hover:text-[#faa94f] transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center animate-fade-up delay-300">
            <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest">System Preview</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/preview/member/dashboard")}
                className="border-slate-200 text-[#293F55] hover:bg-slate-50 hover:text-[#293F55]"
              >
                Member View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/preview/admin/dashboard")}
                className="border-slate-200 text-[#293F55] hover:bg-slate-50 hover:text-[#293F55]"
              >
                Admin View
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;