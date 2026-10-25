"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi, DashboardStats } from "@/lib/api";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  UsersRound,
  Activity,
  Sliders,
  Palette,
  Sparkles,
  Smartphone,
  Gamepad2,
  Server,
  Database,
  ArrowUpRight,
  ShieldAlert,
  FileJson,
  X,
  Download,
  Copy,
  Check,
} from "lucide-react";
import AuditFeedItem from "@/components/AuditFeedItem";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAuditLogs(),
      ]);
      setStats(statsRes);
      setAuditLogs(logsRes.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout
      title="Central Control Dashboard"
      subtitle="Real-time multi-platform status, active connections, and ecosystem controls"
      onRefresh={loadData}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Total Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats ? stats.totalUsers : "..."}
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <span>●</span> Dual-Platform Accounts (Web + Mobile)
          </p>
        </div>

        {/* Total Messages */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Total Chat Messages</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats ? stats.totalMessages : "..."}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            1-on-1 & Group communications
          </p>
        </div>

        {/* Groups */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Active Groups</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats ? stats.totalGroups : "..."}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Multi-user channels
          </p>
        </div>

        {/* Active Sockets */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Active Live Sockets</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{stats ? stats.activeSockets : "..."}</span>
            <span className="text-xs font-normal text-emerald-400 animate-pulse">Online</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Connected Web & Mobile clients
          </p>
        </div>
      </div>

      {/* Control Module Shortcuts */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
          Quick Control Hubs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/features"
            className="glass-card rounded-2xl p-5 hover:border-emerald-500/40 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-base group-hover:text-emerald-300 transition-colors">
              Feature Flags & Platform Gates
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Toggle 1-on-1, groups, voice notes, maintenance mode, and audio/video calls for Web, Mobile, or All.
            </p>
          </Link>

          <Link
            href="/appearance"
            className="glass-card rounded-2xl p-5 hover:border-indigo-500/40 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <Palette className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors">
              Theme Studio & Tokens
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Customize Light, Dark, and Aurora color palettes, chat bubbles, and instant cross-platform sync.
            </p>
          </Link>

          <Link
            href="/animated-bg"
            className="glass-card rounded-2xl p-5 hover:border-pink-500/40 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-pink-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-base group-hover:text-pink-300 transition-colors">
              Animated Floating Background
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Adjust floating speed, particle density, default emojis, custom text limit, and text moderation words.
            </p>
          </Link>

          <Link
            href="/together"
            className="glass-card rounded-2xl p-5 hover:border-amber-500/40 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-base group-hover:text-amber-300 transition-colors">
              Together Hub & 7 Games
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Manage TicTacToe, RPS, Connect 4, Memory, Drawing, Quiz, Pakdam Pakdai, and Couple Question Packs.
            </p>
          </Link>

          <Link
            href="/mobile"
            className="glass-card rounded-2xl p-5 hover:border-purple-500/40 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-base group-hover:text-purple-300 transition-colors">
              Mobile App & Security Policies
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              SemVer minimum version gates, force-update prompts, App Lock PIN policies, and Push Notifications.
            </p>
          </Link>

          <Link
            href="/audit"
            className="glass-card rounded-2xl p-5 hover:border-cyan-500/40 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-base group-hover:text-cyan-300 transition-colors">
              Audit Trail & Governance
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Inspect immutable change history, operator IP addresses, and previous configuration snapshots.
            </p>
          </Link>
        </div>
      </div>

      {/* Infrastructure Health & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            Infrastructure Status
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-white/[0.05]">
              <span className="text-zinc-400">Node API Engine</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Port 5001 Online
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-white/[0.05]">
              <span className="text-zinc-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-zinc-500" />
                MongoDB Primary
              </span>
              <span className="text-emerald-400 font-mono">
                {stats?.dbConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-white/[0.05]">
              <span className="text-zinc-400">Memory RSS</span>
              <span className="text-zinc-200 font-mono">
                {stats?.memoryUsageMB ? `${stats.memoryUsageMB} MB` : "84 MB"}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-white/[0.05]">
              <span className="text-zinc-400">Server Uptime</span>
              <span className="text-zinc-200 font-mono">
                {stats?.serverUptimeSeconds
                  ? `${Math.floor(stats.serverUptimeSeconds / 3600)}h ${Math.floor((stats.serverUptimeSeconds % 3600) / 60)}m`
                  : "Active"}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-zinc-400">Dual Sync Protocol</span>
              <span className="text-indigo-400 font-mono">Socket.io v4</span>
            </div>
          </div>
        </div>

        {/* Recent Audit Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Recent Administrative Activity
            </h3>
            <Link href="/audit" className="text-xs text-emerald-400 hover:underline">
              View All Logs →
            </Link>
          </div>

          <div className="space-y-3">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <AuditFeedItem
                  key={log._id || Math.random()}
                  log={log}
                  showLinkToAudit={true}
                  onInspect={(item) => setSelectedAuditLog(item)}
                />
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No recent activity recorded
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inspect Audit Log Modal */}
      {selectedAuditLog && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedAuditLog(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-zinc-950 border border-white/[0.15] p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    {selectedAuditLog.action}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Category: <span className="text-white font-mono">{selectedAuditLog.category}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dataStr =
                      "data:text/json;charset=utf-8," +
                      encodeURIComponent(JSON.stringify(selectedAuditLog, null, 2));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute(
                      "download",
                      `audit-${selectedAuditLog.action}-${Date.now()}.json`
                    );
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setSelectedAuditLog(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-mono text-zinc-500">Operator</div>
                <div className="font-mono text-zinc-300 truncate mt-0.5">
                  {selectedAuditLog.adminEmail}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-mono text-zinc-500">Timestamp</div>
                <div className="font-mono text-zinc-300 truncate mt-0.5" suppressHydrationWarning>
                  {new Date(selectedAuditLog.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-mono text-zinc-500">Audit ID</div>
                <div className="font-mono text-zinc-300 truncate mt-0.5">
                  {selectedAuditLog._id || "N/A"}
                </div>
              </div>
            </div>

            {/* Formatted JSON Payload */}
            <div className="flex-1 overflow-y-auto rounded-xl bg-black/60 border border-white/[0.08] p-4 font-mono text-xs text-emerald-300/90 leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(selectedAuditLog, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
              <span className="text-zinc-500">Cryptographically verifiable event log</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedAuditLog, null, 2));
                  setCopiedKey("modal_json");
                  setTimeout(() => setCopiedKey(null), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === "modal_json" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedKey === "modal_json" ? "Copied!" : "Copy Raw JSON"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
