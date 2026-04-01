import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AuthLayout() {
  const [currentOrg, setCurrentOrg] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const organizations = [
    { logo: "/css-logo.svg", name: "Computer Students' Society" },
    { logo: "/ssg2-logo.svg", name: "CIT-U Supreme Student Government" },
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100); // 100ms debounce buffer for resizing/zooming
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOrg((prev) => (prev + 1) % organizations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <DotLottieReact
            key={`${windowSize.width}x${windowSize.height}`}
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

      {/* RIGHT SIDE - CONTENT OUTLET */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#293F55] lg:bg-[#F8FAFC] relative overflow-y-auto">
        {/* Top Left Logo for Right Pane (Desktop/Tablet) */}
        <div className="hidden lg:flex absolute top-10 left-10 items-center gap-3 animate-fade-up">
          <img src="/ipes-logo-colored.svg" alt="IPES Logo" className="w-10 h-10 object-contain" />
          <span className="text-[#293F55] font-bold text-2xl tracking-tight">IPES</span>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
