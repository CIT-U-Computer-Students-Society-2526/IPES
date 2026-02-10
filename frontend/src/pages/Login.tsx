import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(0);

  const organizations = [
    { logo: "/css-logo.svg", name: "Computer Students' Society" },
    { logo: "/ssg2-logo.svg", name: "CIT-U Supreme Student Government" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOrg((prev) => (prev + 1) % organizations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/officer/dashboard");
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
        <div className="relative z-20 px-12 pt-20">

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
            <div className="space-y-2 animate-fade-up delay-100">
              <Label htmlFor="email" className="text-[#293F55] font-semibold text-sm">
                Institutional Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="id.number@cit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#293F55] focus-visible:ring-offset-0 focus-visible:border-[#293F55] transition-all"
              />
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
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#293F55] focus-visible:ring-offset-0 focus-visible:border-[#293F55] transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#293F55] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 animate-fade-up delay-300">
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-[#FCBD78] hover:bg-[#faa94f] text-[#293F55] shadow-md hover:shadow-lg transition-all duration-300"
              >
                Access System
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center animate-fade-up delay-300">
            <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest">System Preview</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/officer/dashboard")}
                className="border-slate-200 text-[#293F55] hover:bg-slate-50 hover:text-[#293F55]"
              >
                Officer View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
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