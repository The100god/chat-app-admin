"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const rawAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "saurabhgoyal8055@gmail.com";
  const primaryAdminEmail = rawAdminEmails.split(/[,\s;]+/)[0]?.trim() || "";
  const [identifier, setIdentifier] = useState(primaryAdminEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await adminApi.login(identifier, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdminEmail = () => {
    setIdentifier(primaryAdminEmail);
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-white/[0.08]">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Chugli Admin Hub
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Multi-Platform Central Control Center
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@chugli.app"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/[0.08] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-zinc-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-zinc-900/80 border border-white/[0.08] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-zinc-500 text-sm outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin mr-2">⟳</span>
              ) : (
                <>
                  <span>Sign In to Admin Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Authorized Admin Helper */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col gap-2">
            <button
              type="button"
              onClick={handleFillAdminEmail}
              className="flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-emerald-400 transition-colors py-1.5 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fill Authorized Admin Email</span>
            </button>
            <p className="text-[11px] text-zinc-500 text-center">
              Authorized Admin: {primaryAdminEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
