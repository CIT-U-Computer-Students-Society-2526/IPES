import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/password-reset-request/", { email });
      const data = await response.json();
      setMessage(data.message || "If an account with this email exists, a reset link has been sent.");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      // We still want to show a generic message to prevent enumeration if the server throws a 400 for some reason
      setMessage("If an account with this email exists, a reset link has been sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-up">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#293F55] dark:text-white mb-2">Reset Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {message ? (
          <div className="space-y-6">
            <div className="p-4 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
              {message}
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 text-base font-bold bg-[#FCBD78] hover:bg-[#faa94f] text-[#293F55]"
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#293F55] dark:text-slate-300 font-semibold text-sm">
                Institutional Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="firstname.lastname@cit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold bg-[#FCBD78] hover:bg-[#faa94f] text-[#293F55]"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm font-semibold text-[#FCBD78] hover:text-[#faa94f] transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
