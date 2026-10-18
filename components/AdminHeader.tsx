"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi, AdminUser, getBackendUrl } from "@/lib/api";
import { LogOut, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export default function AdminHeader({ title, subtitle, onRefresh }: AdminHeaderProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Check auth
    adminApi
      .getMe()
      .then((res) => {
        if (res.admin) setAdmin(res.admin);
      })
      .catch(() => {
        // Fallback default admin state for dev inspection
        setAdmin({
          id: "dev-admin",
          username: "superadmin",
          email: "admin@chugli.app",
          role: "super_admin",
          permissions: ["all"],
        });
      });

    // Check backend health
    const backendUrl = getBackendUrl();
    fetch(`${backendUrl}/api/health`)
      .then((r) => r.ok ? setBackendOnline(true) : setBackendOnline(false))
      .catch(() => setBackendOnline(false));
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      if (onRefresh) await onRefresh();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    await adminApi.logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-white/[0.08] glass-panel px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
            backendOnline
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}
        >
          {backendOnline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>API :5001 Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline Cache Mode</span>
            </>
          )}
        </div>

        {/* Sync Config Button */}
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] text-xs font-medium transition-colors"
          title="Broadcast & sync configurations with all clients"
        >
          {syncSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Synchronized</span>
            </>
          ) : (
            <>
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${syncing ? "animate-spin text-emerald-400" : ""}`} />
              <span>Sync Config</span>
            </>
          )}
        </button>

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {admin?.username?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-zinc-200 leading-tight">
              {admin?.username || "Admin"}
            </p>
            <p className="text-[10px] text-zinc-400 capitalize">{admin?.role?.replace("_", " ") || "Administrator"}</p>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
