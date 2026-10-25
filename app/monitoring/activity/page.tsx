"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  adminApi,
  UserApiActivityItem,
  ActivityStats,
  ActivityFilterParams,
} from "@/lib/api";
import {
  Activity,
  Globe,
  Smartphone,
  HelpCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Radio,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  X,
  ShieldAlert,
  Server,
  Zap,
  Trash2,
  Eye,
  User,
} from "lucide-react";
import ActionDropdown from "@/components/ActionDropdown";

export default function UserActivityPage() {
  const [activities, setActivities] = useState<UserApiActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selection & Deletion state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters state
  const [platformFilter, setPlatformFilter] = useState<"all" | "web" | "mobile" | "unknown">("all");
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | "success" | "failure">("all");
  const [transportFilter, setTransportFilter] = useState<"all" | "http" | "socket">("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Auto-refresh interval (in seconds, 0 = disabled, default = 0 / Off)
  const [refreshInterval, setRefreshInterval] = useState<number>(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Inspect slide-over modal state
  const [selectedActivity, setSelectedActivity] = useState<UserApiActivityItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Stats
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await adminApi.getActivityStats();
      setStats(data);
    } catch (err: any) {
      console.error("Error loading activity stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Activity Logs
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ActivityFilterParams = {
        page,
        limit,
        platform: platformFilter,
        outcome: outcomeFilter,
        transport: transportFilter,
        method: methodFilter !== "all" ? methodFilter : undefined,
        search: debouncedSearch.trim() || undefined,
      };

      const res = await adminApi.getActivityLogs(params);
      setActivities(res.activities || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load user API activity logs");
    } finally {
      setLoading(false);
    }
  }, [page, limit, platformFilter, outcomeFilter, transportFilter, methodFilter, debouncedSearch]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Setup auto-refresh polling
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(() => {
      loadActivities();
      loadStats();
      setLastSyncedAt(new Date());
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, loadActivities, loadStats]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    try {
      setIsManualRefreshing(true);
      await Promise.all([loadActivities(), loadStats()]);
      setLastSyncedAt(new Date());
    } finally {
      setTimeout(() => setIsManualRefreshing(false), 400);
    }
  };

  // Handle Export
  const handleExport = async (format: "csv" | "json") => {
    try {
      setIsExporting(true);
      const params: ActivityFilterParams = {
        platform: platformFilter,
        outcome: outcomeFilter,
        transport: transportFilter,
        method: methodFilter !== "all" ? methodFilter : undefined,
        search: debouncedSearch.trim() || undefined,
        limit: 1000,
      };
      await adminApi.exportActivityLogs(params, format);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Selection helpers
  const allCurrentPageSelected =
    activities.length > 0 && activities.every((act) => selectedIds.includes(act._id));

  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIds = new Set(activities.map((a) => a._id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newSelected = new Set(selectedIds);
      activities.forEach((act) => newSelected.add(act._id));
      setSelectedIds(Array.from(newSelected));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Perform Single Delete
  const confirmSingleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      const res = await adminApi.deleteActivityLog(deleteTargetId);
      setActionFeedback({ type: "success", message: res.message || "Activity log successfully deleted." });
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
      if (selectedActivity?._id === deleteTargetId) {
        setSelectedActivity(null);
      }
      setDeleteTargetId(null);
      await loadActivities();
      await loadStats();
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message || "Failed to delete activity log." });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Perform Bulk Delete
  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsDeleting(true);
      const res = await adminApi.bulkDeleteActivities(selectedIds);
      setActionFeedback({ type: "success", message: res.message || `Deleted ${res.deletedCount} log(s).` });
      if (selectedActivity && selectedIds.includes(selectedActivity._id)) {
        setSelectedActivity(null);
      }
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      await loadActivities();
      await loadStats();
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message || "Failed to delete selected activity logs." });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadSingleActivityJson = (act: UserApiActivityItem) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(act, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `activity-${act.requestId || act._id}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      iso: d.toISOString(),
    };
  };

  const getMethodBadge = (method?: string) => {
    switch ((method || "").toUpperCase()) {
      case "GET":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "POST":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "PUT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "DELETE":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "SOCKET":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusBadge = (code?: number, outcome?: string) => {
    if (outcome === "failure" || (code && code >= 400)) {
      if (code && code >= 500) {
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      }
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  };

  const getDurationColor = (ms?: number) => {
    if (ms === undefined || ms === null) return "text-zinc-400";
    if (ms < 100) return "text-emerald-400";
    if (ms < 400) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <AdminLayout
      title="User API Activity Monitoring"
      subtitle="Unified cross-platform telemetry and audit pipeline for Web & Mobile with 15-day automated TTL expiration"
      onRefresh={() => {
        loadActivities();
        loadStats();
      }}
    >
      {/* 1. Header Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total 24h */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Total Events (24h)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {statsLoading ? "..." : (stats?.total24h ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400">events</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>7-day volume: {statsLoading ? "..." : (stats?.total7d ?? 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Web Traffic */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Web Client</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {statsLoading ? "..." : (stats?.webCount24h ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400">
              ({stats?.total24h ? Math.round(((stats.webCount24h || 0) / stats.total24h) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">Desktop & Mobile Browser</div>
        </div>

        {/* Mobile App Traffic */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Mobile App</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400 font-mono">
              {statsLoading ? "..." : (stats?.mobileCount24h ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400">
              ({stats?.total24h ? Math.round(((stats.mobileCount24h || 0) / stats.total24h) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">Expo Native & Mobile Clients</div>
        </div>

        {/* Failure Rate */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Failure Rate</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {statsLoading ? "..." : `${stats?.failureRatePercent ?? "0.0"}%`}
            </span>
            <span className="text-xs text-rose-400">({stats?.failureCount24h ?? 0} errors)</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">4xx & 5xx HTTP & Socket errors</div>
        </div>

        {/* Average Latency */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Avg Duration</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400 font-mono">
              {statsLoading ? "..." : `${stats?.avgDurationMs ?? 0}`}
            </span>
            <span className="text-xs text-zinc-400">ms</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">Server response latency</div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] space-y-4">
        {/* Top Filter Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Platform Segmented Tabs */}
          <div className="flex items-center p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] overflow-x-auto">
            <button
              onClick={() => {
                setPlatformFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                platformFilter === "all"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Platforms
            </button>
            <button
              onClick={() => {
                setPlatformFilter("web");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                platformFilter === "web"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web</span>
            </button>
            <button
              onClick={() => {
                setPlatformFilter("mobile");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                platformFilter === "mobile"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
            <button
              onClick={() => {
                setOutcomeFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                outcomeFilter === "all" ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => {
                setOutcomeFilter("success");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                outcomeFilter === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Success
            </button>
            <button
              onClick={() => {
                setOutcomeFilter("failure");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                outcomeFilter === "failure" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Failures
            </button>
          </div>

          {/* Polling & Export Controls */}
          <div className="flex items-center gap-2">
            {/* Manual Live Sync Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isManualRefreshing || loading}
              title={lastSyncedAt ? `Last synced at ${lastSyncedAt.toLocaleTimeString()}. Click to sync now.` : "Click to refresh live sync"}
              className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer group shadow-sm active:scale-95"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${
                  isManualRefreshing || loading ? "animate-spin" : "group-hover:rotate-180 duration-500"
                }`}
              />
              <span className="font-medium">Refresh</span>
            </button>

            {/* Auto-refresh interval */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 rounded-xl text-xs text-zinc-300">
              <Radio className={`w-3 h-3 ${refreshInterval > 0 ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`} />
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent border-none text-zinc-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-zinc-900">Live Sync: Off</option>
                <option value={60} className="bg-zinc-900">Live Sync: 1 min</option>
                <option value={120} className="bg-zinc-900">Live Sync: 2 min</option>
                <option value={240} className="bg-zinc-900">Live Sync: 4 min</option>
                <option value={300} className="bg-zinc-900">Live Sync: 5 min</option>
                <option value={600} className="bg-zinc-900">Live Sync: 10 min</option>
              </select>
            </div>

            {/* Export CSV / JSON */}
            <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden text-xs">
              <button
                onClick={() => handleExport("csv")}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>
              <div className="w-[1px] h-4 bg-white/[0.1]" />
              <button
                onClick={() => handleExport("json")}
                disabled={isExporting}
                className="px-2.5 py-1.5 text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Search & Filter Detail Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by username, email, action (e.g. auth.login), route, or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Transport filter */}
          <select
            value={transportFilter}
            onChange={(e) => {
              setTransportFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all" className="bg-zinc-900">All Transports (HTTP & Socket)</option>
            <option value="http" className="bg-zinc-900">HTTP REST APIs</option>
            <option value="socket" className="bg-zinc-900">Socket.io Events</option>
          </select>

          {/* HTTP Method filter */}
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all" className="bg-zinc-900">All Methods</option>
            <option value="GET" className="bg-zinc-900">GET</option>
            <option value="POST" className="bg-zinc-900">POST</option>
            <option value="PUT" className="bg-zinc-900">PUT</option>
            <option value="DELETE" className="bg-zinc-900">DELETE</option>
            <option value="SOCKET" className="bg-zinc-900">SOCKET</option>
          </select>
        </div>
      </div>

      {/* Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200 ${
            actionFeedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-zinc-900 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-rose-950/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold text-rose-200">
              {selectedIds.length} activity log{selectedIds.length > 1 ? "s" : ""} selected for deletion
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Activity Logs Table */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
        {loading && activities.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm">Streaming activity events from backend...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadActivities}
              className="mt-3 px-4 py-1.5 text-xs rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <Activity className="w-8 h-8 mx-auto mb-2 text-zinc-500 opacity-60" />
            <p className="text-sm font-medium">No activity records match your filter criteria.</p>
            <p className="text-xs text-zinc-500 mt-1">Try clearing filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-medium">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] accent-emerald-500 cursor-pointer"
                      title="Select / deselect all on this page"
                    />
                  </th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Method & Route</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {activities.map((act) => {
                  const { time, date } = formatTimestamp(act.createdAt);
                  const userDisplay = act.username || act.userEmail || (typeof act.userId === "object" && act.userId?.username) || "anonymous";

                  return (
                    <tr
                      key={act._id}
                      onClick={() => setSelectedActivity(act)}
                      className={`hover:bg-white/[0.03] transition-colors cursor-pointer group ${
                        selectedIds.includes(act._id) ? "bg-rose-500/[0.04]" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(act._id)}
                          onChange={() => toggleSelectOne(act._id)}
                          className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] accent-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-zinc-200">{time}</div>
                        <div className="text-[10px] text-zinc-500">{date}</div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 border border-white/[0.1] flex items-center justify-center text-[10px] font-bold text-zinc-300">
                            {userDisplay.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200">{userDisplay}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {act.actorType}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {act.platform === "web" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Globe className="w-3 h-3" />
                            <span>Web</span>
                          </span>
                        ) : act.platform === "mobile" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Smartphone className="w-3 h-3" />
                            <span>Mobile</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                            <HelpCircle className="w-3 h-3" />
                            <span>Unknown</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-zinc-100 font-medium">{act.action}</span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono border ${
                              act.transport === "socket"
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            }`}
                          >
                            {act.transport}
                          </span>
                        </div>
                      </td>

                      {/* Method & Route */}
                      <td className="py-3 px-4 max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getMethodBadge(
                              act.method
                            )}`}
                          >
                            {act.method || "N/A"}
                          </span>
                          <span className="font-mono text-zinc-300 text-xs truncate" title={act.route}>
                            {act.route || "/"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono border ${getStatusBadge(
                            act.statusCode,
                            act.outcome
                          )}`}
                        >
                          {act.outcome === "success" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{act.statusCode || (act.outcome === "success" ? 200 : 400)}</span>
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span className={getDurationColor(act.durationMs)}>
                          {act.durationMs !== undefined ? `${act.durationMs}ms` : "-"}
                        </span>
                      </td>

                      {/* Request ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                            {act.requestId.slice(0, 8)}...
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(act.requestId, act._id);
                            }}
                            className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                            title="Copy full Request ID"
                          >
                            {copiedId === act._id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <ActionDropdown
                            buttonTitle={`Actions for ${act.requestId}`}
                            items={[
                              {
                                id: "inspect",
                                label: "Inspect Event Details",
                                description: "Payload, headers & trace",
                                icon: Eye,
                                onClick: () => setSelectedActivity(act),
                                dividerAfter: true,
                              },
                              {
                                id: "copy-id",
                                label: "Copy Request ID",
                                icon: Copy,
                                onClick: () => copyToClipboard(act.requestId, act._id),
                              },
                              {
                                id: "copy-route",
                                label: "Copy Endpoint Route",
                                icon: ExternalLink,
                                onClick: () => copyToClipboard(`${act.method} ${act.route}`, act._id),
                                dividerAfter: true,
                              },
                              userDisplay && userDisplay !== "anonymous"
                                ? {
                                    id: "filter-user",
                                    label: `Filter by @${userDisplay}`,
                                    icon: User,
                                    onClick: () => {
                                      setSearchTerm(userDisplay);
                                    },
                                  }
                                : false,
                              act.action
                                ? {
                                    id: "filter-action",
                                    label: `Filter by '${act.action}'`,
                                    icon: Zap,
                                    onClick: () => {
                                      setSearchTerm(act.action);
                                    },
                                  }
                                : false,
                              act.ipAddress
                                ? {
                                    id: "filter-ip",
                                    label: `Filter by IP ${act.ipAddress}`,
                                    icon: Globe,
                                    onClick: () => {
                                      setSearchTerm(act.ipAddress!);
                                    },
                                    dividerAfter: true,
                                  }
                                : false,
                              {
                                id: "export-json",
                                label: "Export Record JSON",
                                description: "Download event snapshot",
                                icon: Download,
                                onClick: () => downloadSingleActivityJson(act),
                                dividerAfter: true,
                              },
                              {
                                id: "delete",
                                label: "Delete Activity Log",
                                description: "Audit trail recorded",
                                icon: Trash2,
                                danger: true,
                                onClick: () => setDeleteTargetId(act._id),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              Showing {(page - 1) * limit + (activities.length > 0 ? 1 : 0)} - {Math.min(page * limit, totalCount)} of{" "}
              {totalCount.toLocaleString()} events
            </span>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white/[0.05] border border-white/[0.1] rounded px-1.5 py-0.5 text-zinc-200 focus:outline-none"
              >
                <option value={25} className="bg-zinc-900">25</option>
                <option value={50} className="bg-zinc-900">50</option>
                <option value={100} className="bg-zinc-900">100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-zinc-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Slide-Over Event Inspector Drawer */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="w-full max-w-xl h-full bg-[#0d1322] border-l border-white/[0.1] shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">
                    {selectedActivity.action}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getStatusBadge(
                      selectedActivity.statusCode,
                      selectedActivity.outcome
                    )}`}
                  >
                    {selectedActivity.statusCode || 200} {selectedActivity.outcome.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>{new Date(selectedActivity.createdAt).toUTCString()}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 15-Day TTL Notice */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Automated 15-Day TTL Retention:</span>
                <p className="text-amber-300/80 mt-0.5 text-[11px]">
                  This log record will be automatically deleted from MongoDB on{" "}
                  <span className="font-mono text-white font-medium">
                    {new Date(selectedActivity.expiresAt).toLocaleDateString()} at{" "}
                    {new Date(selectedActivity.expiresAt).toLocaleTimeString()}
                  </span>{" "}
                  via asynchronous TTL indexing.
                </p>
              </div>
            </div>

            {/* User Identity Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                User Identity & Actor
              </h3>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Username:</span>
                  <span className="text-zinc-200 font-medium">
                    {selectedActivity.username || "anonymous"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">User Email:</span>
                  <span className="text-zinc-200 font-medium">
                    {selectedActivity.userEmail || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Actor Type:</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {selectedActivity.actorType}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">User ID:</span>
                  <span className="text-zinc-300 font-mono text-[11px] truncate block" title={String(selectedActivity.userId || "N/A")}>
                    {typeof selectedActivity.userId === "object" && selectedActivity.userId !== null
                      ? selectedActivity.userId._id
                      : String(selectedActivity.userId || "N/A")}
                  </span>
                </div>
              </div>
            </div>

            {/* Client & Device Context */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Client & Device Context
              </h3>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Platform:</span>
                  <span className="text-cyan-400 font-medium uppercase font-mono">
                    {selectedActivity.platform}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Client Hint:</span>
                  <span className="text-zinc-300">
                    {selectedActivity.clientPlatformHint || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Browser / Engine:</span>
                  <span className="text-zinc-200">
                    {selectedActivity.browser || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Operating System:</span>
                  <span className="text-zinc-200">
                    {selectedActivity.os || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Device Type:</span>
                  <span className="text-zinc-200">
                    {selectedActivity.deviceType || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Client IP Address:</span>
                  <span className="text-zinc-300 font-mono">
                    {selectedActivity.ipAddress || "Hidden/Local"}
                  </span>
                </div>
              </div>
            </div>

            {/* Request Lifecycle Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Request & Telemetry Lifecycle
              </h3>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Request ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-zinc-200 bg-black/40 px-2 py-0.5 rounded text-[11px]">
                      {selectedActivity.requestId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedActivity.requestId, "drawer_req")}
                      className="text-zinc-400 hover:text-white"
                      title="Copy Request ID"
                    >
                      {copiedId === "drawer_req" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Normalized Route:</span>
                  <span className="font-mono text-zinc-200">{selectedActivity.route || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Method & Transport:</span>
                  <span className="font-mono text-zinc-200">
                    {selectedActivity.method} via {selectedActivity.transport.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Duration (Latency):</span>
                  <span className={`font-mono font-medium ${getDurationColor(selectedActivity.durationMs)}`}>
                    {selectedActivity.durationMs}ms
                  </span>
                </div>
                {selectedActivity.errorCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Normalized Error Code:</span>
                    <span className="font-mono text-rose-400 font-medium">{selectedActivity.errorCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Safe Metadata Tree */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Sanitized Metadata Payload
                </h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  Redaction Active
                </span>
              </div>
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(selectedActivity.metadata || {}, null, 2)}
              </pre>
              <p className="text-[10px] text-zinc-500 leading-normal">
                * Strict security allowlist: Passwords, tokens, bearer authorizations, raw cookies, and full message bodies are strictly redacted and never recorded.
              </p>
            </div>

            {/* Drawer Delete Button */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">
                Log ID: {selectedActivity._id}
              </span>
              <button
                onClick={() => setDeleteTargetId(selectedActivity._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete This Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Single Log Delete Confirmation Modal */}
      {deleteTargetId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isDeleting && setDeleteTargetId(null)}
        >
          <div
            className="w-full max-w-md bg-[#0f172a] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Delete Activity Log</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to permanently delete this telemetry log? This action will be recorded in the Admin Audit Trail and cannot be undone.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-[11px] text-zinc-500 font-mono">Log ID: {deleteTargetId}</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmSingleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isDeleting && setShowBulkDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-md bg-[#0f172a] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Bulk Delete Activity Logs</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You are about to permanently delete{" "}
                <span className="font-bold text-rose-400 font-mono">
                  {selectedIds.length}
                </span>{" "}
                selected activity records. This operation will purge them immediately from MongoDB and will be audited.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Permanent action: These logs cannot be restored once deleted.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting {selectedIds.length} logs...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete {selectedIds.length} Logs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
