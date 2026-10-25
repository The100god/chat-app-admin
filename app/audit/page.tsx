"use client";

import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi } from "@/lib/api";
import ActionDropdown from "@/components/ActionDropdown";
import AuditFeedItem from "@/components/AuditFeedItem";
import {
  ScrollText,
  Clock,
  User,
  Copy,
  Eye,
  Download,
  Filter,
  Search,
  Check,
  X,
  FileJson,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadAuditJson = (log: any) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(log, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `audit-${log.action || "log"}-${log._id || Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Audit JSON downloaded");
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set);
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchCat =
        categoryFilter === "all" ||
        log.category?.toLowerCase() === categoryFilter.toLowerCase();
      if (!matchCat) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const actionMatch = log.action?.toLowerCase().includes(term);
      const emailMatch = log.adminEmail?.toLowerCase().includes(term);
      const catMatch = log.category?.toLowerCase().includes(term);
      const detailsMatch =
        typeof log.details === "object"
          ? JSON.stringify(log.details).toLowerCase().includes(term)
          : String(log.details || "").toLowerCase().includes(term);

      return actionMatch || emailMatch || catMatch || detailsMatch;
    });
  }, [logs, searchTerm, categoryFilter]);

  return (
    <AdminLayout
      title="Audit Trail & System Governance"
      subtitle="Immutable record of administrative operations, policy changes, and configuration diffs"
      onRefresh={loadLogs}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-500/30 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, email, or details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-500 ml-1.5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-zinc-300 text-xs outline-none pr-3 py-1 cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">
                All Categories
              </option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-zinc-900 text-white">
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-zinc-400 whitespace-nowrap pl-2">
            Showing <strong className="text-white">{filteredLogs.length}</strong> of {logs.length}
          </div>
        </div>
      </div>

      {/* Audit Feed Table / Cards */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Chronological Audit Trail
            </span>
          </div>
          <button
            onClick={loadLogs}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {loading && logs.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-600" />
              Loading audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              No audit log events matching filters
            </div>
          ) : (
            filteredLogs.map((log) => (
              <AuditFeedItem
                key={log._id || Math.random()}
                log={log}
                onInspect={(item) => setSelectedAuditLog(item)}
              />
            ))
          )}
        </div>
      </div>

      {/* MODAL: Full Audit Event Inspection */}
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
                  onClick={() => downloadAuditJson(selectedAuditLog)}
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
                  copyToClipboard(
                    JSON.stringify(selectedAuditLog, null, 2),
                    "modal_json"
                  );
                }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
