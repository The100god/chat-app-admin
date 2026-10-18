"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi } from "@/lib/api";
import { ScrollText, ShieldAlert, Clock, User, HardDrive } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
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

  return (
    <AdminLayout
      title="Audit Trail & System Governance"
      subtitle="Immutable record of administrative operations, policy changes, and configuration diffs"
      onRefresh={loadLogs}
    >
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Chronological Audit Trail
            </span>
          </div>
          <span className="text-xs text-zinc-400">{logs.length} logged events</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {logs.map((log) => (
            <div key={log._id || Math.random()} className="p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-white/[0.06]">
                    {log.action}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {log.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{log.adminEmail}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span suppressHydrationWarning>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Details JSON / Summary */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.05] text-[11px] font-mono text-zinc-300 mt-2 overflow-x-auto">
                {typeof log.details === "object"
                  ? JSON.stringify(log.details, null, 2)
                  : log.details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
