import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    if (!uidb64 || !token) {
      setInvalidLink(true);
    }
  }, [uidb64, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      await api.post("/auth/password-reset-confirm/", {
        uidb64,
        token,
        new_password: password
      });
      setSuccess(true);
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.name === 'ApiError' && err.data) {
        if (err.data.errors) {
          setFieldErrors(err.data.errors);
          if (err.data.errors.token) {
            setError(err.data.errors.token[0]);
          } else if (err.data.errors.non_field_errors) {
            setError(err.data.errors.non_field_errors[0]);
          }
        } else {
          setError(err.data.message || "Failed to reset password.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (invalidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button onClick={() => navigate("/forgot-password")} className="w-full bg-[#FCBD78] hover:bg-[#faa94f] text-[#293F55]">
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-up">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#293F55] dark:text-white mb-2">Set New Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Please enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
              Your password has been successfully reset.
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 text-base font-bold bg-[#FCBD78] hover:bg-[#faa94f] text-[#293F55]"
            >
              Sign In
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
              <Label className="text-[#293F55] dark:text-slate-300 font-semibold text-sm">
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#293F55]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.new_password && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.new_password[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[#293F55] dark:text-slate-300 font-semibold text-sm">
                Confirm Password
              </Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold bg-[#FCBD78] hover:bg-[#faa94f] text-[#293F55]"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
