"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi, RetentionStats } from "@/lib/api";
import {
  Clock,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Smartphone,
  HelpCircle,
  Lock,
  CalendarCheck,
  Server,
  Zap,
  Info,
} from "lucide-react";

export default function RetentionDashboardPage() {
  const [retention, setRetention] = useState<RetentionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRetentionStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getRetentionStats();
      setRetention(data);
    } catch (err: any) {
      setError(err.message || "Failed to load retention diagnostics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRetentionStats();
  }, [loadRetentionStats]);

  const handleRunVerification = async () => {
    try {
      setVerifying(true);
      setVerifyMessage(null);
      const res = await adminApi.verifyRetention();
      setVerifyMessage(
        res.message || "TTL indexes and log expiration dates successfully verified."
      );
      await loadRetentionStats();
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "None recorded";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const getExpirationDate = (createdAtStr?: string | null) => {
    if (!createdAtStr) return "N/A";
    const d = new Date(createdAtStr);
    const exp = new Date(d.getTime() + 15 * 24 * 60 * 60 * 1000);
    return `${exp.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const userAct = retention?.collections?.userApiActivity;
  const adminAudit = retention?.collections?.adminAuditLog;
  const webCount = userAct?.platformBreakdown?.web || 0;
  const mobileCount = userAct?.platformBreakdown?.mobile || 0;
  const unknownCount = userAct?.platformBreakdown?.unknown || 0;
  const totalPlatformLogs = webCount + mobileCount + unknownCount || 1;
  const webPercent = Math.round((webCount / totalPlatformLogs) * 100);
  const mobilePercent = Math.round((mobileCount / totalPlatformLogs) * 100);

  return (
    <AdminLayout
      title="15-Day Data Retention & TTL Engine"
      subtitle="Automated MongoDB TTL lifecycle monitoring and compliance verification for covered log collections"
      onRefresh={loadRetentionStats}
    >
      {/* 1. Policy Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                15-Day Fixed Retention Policy
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GDPR & Privacy Compliant</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Automated Asynchronous Log Purging
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Every covered log collection in MongoDB automatically expires exactly 15 days after
              the event timestamp. Documents carry an indexed BSON Date{" "}
              <code className="text-emerald-300 font-mono text-xs px-1 bg-white/[0.05] rounded">expiresAt</code> field
              handled by MongoDB’s background TTL monitor.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunVerification}
              disabled={verifying || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${verifying ? "animate-spin" : ""}`} />
              <span>{verifying ? "Synchronizing TTL..." : "Verify TTL Indexes & Sync"}</span>
            </button>
          </div>
        </div>

        {verifyMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{verifyMessage}</span>
          </div>
        )}

        {/* Engine Status Grid */}
        <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-zinc-500 block">TTL Monitor Status</span>
              <span className="text-emerald-400 font-medium">Active (Polls every ~60s)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-zinc-500 block">Policy Alteration Lock</span>
              <span className="text-zinc-300 font-medium">Immutable (Admin limit locked)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-zinc-500 block">Business Data Isolation</span>
              <span className="text-cyan-400 font-medium">Strictly Preserved (Safe)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Covered Collections Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection 1: UserApiActivity */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">
                  UserApiActivity
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    userAct?.compliant
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {userAct?.compliant ? "100% COMPLIANT" : "ACTION REQUIRED"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Unified HTTP & Socket.io user activity from Web and Mobile clients
              </p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          {/* Metric Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 block">Total Active Logs</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {loading ? "..." : (userAct?.totalCount ?? 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 block">TTL Index Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-emerald-400 font-semibold text-xs">
                  {userAct?.ttlIndex?.status || "CHECKING"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 block">Oldest Record Event</span>
              <span className="text-zinc-300 font-mono text-[11px] mt-1 block truncate">
                {loading ? "..." : formatDate(userAct?.oldestRecord)}
              </span>
              <span className="text-[10px] text-amber-400/80 block mt-0.5">
                Eligible expiry: {getExpirationDate(userAct?.oldestRecord)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 block">Newest Record Event</span>
              <span className="text-zinc-300 font-mono text-[11px] mt-1 block truncate">
                {loading ? "..." : formatDate(userAct?.newestRecord)}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Retained until: {getExpirationDate(userAct?.newestRecord)}
              </span>
            </div>
          </div>

          {/* Non-compliant record alert if any */}
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-zinc-400">Records missing TTL expiry date:</span>
            <span
              className={`font-mono font-bold ${
                (userAct?.missingExpiryCount ?? 0) === 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {userAct?.missingExpiryCount ?? 0}
            </span>
          </div>
        </div>

        {/* Collection 2: AdminAuditLog */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">
                  AdminAuditLog
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    adminAudit?.compliant
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {adminAudit?.compliant ? "100% COMPLIANT" : "ACTION REQUIRED"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Admin configuration changes, user moderation actions, and export audits
              </p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Metric Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 block">Total Active Logs</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {loading ? "..." : (adminAudit?.totalCount ?? 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 block">TTL Index Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-emerald-400 font-semibold text-xs">
                  {adminAudit?.ttlIndex?.status || "CHECKING"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 block">Oldest Audit Record</span>
              <span className="text-zinc-300 font-mono text-[11px] mt-1 block truncate">
                {loading ? "..." : formatDate(adminAudit?.oldestRecord)}
              </span>
              <span className="text-[10px] text-amber-400/80 block mt-0.5">
                Eligible expiry: {getExpirationDate(adminAudit?.oldestRecord)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 block">Newest Audit Record</span>
              <span className="text-zinc-300 font-mono text-[11px] mt-1 block truncate">
                {loading ? "..." : formatDate(adminAudit?.newestRecord)}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Retained until: {getExpirationDate(adminAudit?.newestRecord)}
              </span>
            </div>
          </div>

          {/* Non-compliant record alert if any */}
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-zinc-400">Records missing TTL expiry date:</span>
            <span
              className={`font-mono font-bold ${
                (adminAudit?.missingExpiryCount ?? 0) === 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {adminAudit?.missingExpiryCount ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Platform Log Storage Distribution */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Cross-Platform Activity Storage Distribution
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Current proportion of active telemetry records between Web and Mobile clients
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {((userAct?.totalCount ?? 0)).toLocaleString()} total events stored
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-3 w-full bg-white/[0.05] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${webPercent}%` }}
            className="bg-cyan-500 h-full transition-all duration-500"
            title={`Web: ${webCount} logs (${webPercent}%)`}
          />
          <div
            style={{ width: `${mobilePercent}%` }}
            className="bg-purple-600 h-full transition-all duration-500"
            title={`Mobile: ${mobileCount} logs (${mobilePercent}%)`}
          />
          <div
            style={{ width: `${100 - webPercent - mobilePercent}%` }}
            className="bg-zinc-600 h-full transition-all duration-500"
            title={`Unknown/System: ${unknownCount} logs`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-zinc-300">Web Telemetry:</span>
            <span className="font-mono font-bold text-white">
              {webCount.toLocaleString()} ({webPercent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-600" />
            <span className="text-zinc-300">Mobile Telemetry:</span>
            <span className="font-mono font-bold text-white">
              {mobileCount.toLocaleString()} ({mobilePercent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-zinc-600" />
            <span className="text-zinc-300">System/Unknown:</span>
            <span className="font-mono font-bold text-white">
              {unknownCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Technical Architecture Guide */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>MongoDB TTL Indexing & Lifecycle Specification Details</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400 leading-relaxed">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <span className="font-semibold text-zinc-200 block">1. Asynchronous TTL Mechanics</span>
            <p>
              MongoDB removes expired documents through an internal background thread that runs
              approximately once every 60 seconds. Documents become eligible for removal the exact
              moment <code className="text-zinc-300 font-mono">Date.now() &gt;= doc.expiresAt</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <span className="font-semibold text-zinc-200 block">2. Immutable 15-Day Policy</span>
            <p>
              Per End-to-End Spec Section 72, the 15-day retention policy is an immutable maximum
              configured server-side. Ordinary administrators cannot extend the retention window,
              preventing indefinite storage of sensitive telemetry.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <span className="font-semibold text-zinc-200 block">3. Business Data Separation</span>
            <p>
              TTL expiration strictly governs transient log documents (<code className="text-zinc-300 font-mono">UserApiActivity</code> and <code className="text-zinc-300 font-mono">AdminAuditLog</code>).
              User accounts, friendships, chat history, and media files are stored in independent
              collections and are never deleted by this engine.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <span className="font-semibold text-zinc-200 block">4. Automatic Startup & Sync Check</span>
            <p>
              Upon backend initialization, the MongoDB connection hook automatically verifies and
              creates the <code className="text-zinc-300 font-mono">{`{ expiresAt: 1 }, { expireAfterSeconds: 0 }`}</code> index
              on all covered collections.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
