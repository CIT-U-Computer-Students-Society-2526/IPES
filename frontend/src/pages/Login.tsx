import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, Eye, EyeOff } from "lucide-react";

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
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: navigate to officer dashboard
    navigate("/officer/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(215 72% 47%) 0%, hsl(230 65% 55%) 50%, hsl(215 72% 47%) 100%)', backgroundSize: '200% 200%', animation: 'gradientHero 8s ease infinite' }}>
        <style>{`
          @keyframes gradientHero {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <img src="/ipes-logo.svg" alt="IPES Logo" className="w-7 h-7" />
            </div>
            <span className="text-2xl font-semibold">IPES</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Individual Performance<br />Evaluation System
          </h1>
          <p className="font-['Montserrat'] text-lg text-primary-foreground/80 max-w-md leading-relaxed">
            A centralized platform for fair, transparent, and efficient evaluation of student organization officers.
          </p>
          <div className="mt-12">
            <p className="font-['Montserrat'] text-sm text-primary-foreground/70 mb-4">In collaboration with:</p>
            <div className="relative h-16 flex items-center justify-start">
              {organizations.map((org, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 absolute transition-all duration-500 ease-in-out"
                  style={{
                    opacity: index === currentOrg ? 1 : 0,
                    transform: index === currentOrg ? 'translateX(0)' : 'translateX(20px)',
                    visibility: index === currentOrg ? 'visible' : 'hidden',
                  }}
                >
                  <img src={org.logo} alt={org.name} className="h-12" />
                  <span className="font-medium">{org.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">IPES</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome back!</h2>
            <p className="font-['Montserrat'] text-muted-foreground">Log in to access your evaluations</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="firstname.lastname@cit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-['Montserrat'] h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>                
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-['Montserrat'] h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base">
              Log in
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Demo accounts available:
            </p>
            <div className="mt-3 flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/officer/dashboard")}
              >
                Officer Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
              >
                Admin Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
