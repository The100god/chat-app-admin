"use client";

import React, { useState } from "react";
import ActionDropdown from "./ActionDropdown";
import {
  Clock,
  User,
  Copy,
  Check,
  Eye,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Code,
  Globe,
  Smartphone,
  Shield,
  Layers,
  FileJson,
} from "lucide-react";

export interface AuditFeedItemProps {
  log: any;
  onInspect?: (log: any) => void;
  showLinkToAudit?: boolean;
}

export function parseAuditDetails(log: any) {
  const details = log.details || {};
  let summary = "";
  const chips: { label: string; value: string; copyable?: boolean }[] = [];

  let obj = details;
  if (typeof details === "string") {
    try {
      obj = JSON.parse(details);
    } catch {
      summary = details;
      return { summary, chips, rawObject: null };
    }
  }

  if (typeof obj === "object" && obj !== null) {
    if (obj.summary) {
      summary = obj.summary;
    } else if (log.action === "activity.delete" || obj.deletedLogId) {
      summary = `Deleted API activity log${obj.action ? ` for action '${obj.action}'` : ""}${
        obj.platform ? ` (${obj.platform})` : ""
      }`;
    } else if (log.action === "activity.bulk_delete" || obj.deletedCount !== undefined) {
      summary = `Bulk deleted ${obj.deletedCount ?? obj.requestedCount ?? ""} activity telemetry records`;
    } else if (log.action === "activity.export" || obj.format) {
      summary = `Exported ${obj.count ?? ""} activity telemetry records (${(
        obj.format || "JSON"
      ).toUpperCase()})`;
    } else if (log.action === "activity.retention.verify") {
      summary = "Verified 15-day TTL retention policy and synchronized log collection indexes";
    } else if (obj.targetUsername || obj.deletedUsername) {
      summary = `Account operation on user @${obj.targetUsername || obj.deletedUsername}`;
    } else if (obj.createdAdminEmail) {
      summary = `Created administrator account for ${obj.createdAdminEmail} (${obj.createdAdminRole || "admin"})`;
    } else if (obj.deletedEmail) {
      summary = `Deleted administrator account for ${obj.deletedEmail}`;
    } else if (obj.keysUpdated) {
      const keys = Array.isArray(obj.keysUpdated) ? obj.keysUpdated.join(", ") : obj.keysUpdated;
      summary = `Updated ${log.category || "system"} configuration (${keys})`;
    } else {
      summary = log.action
        ? `${log.action.replace(/[._]/g, " ")} executed`
        : "Administrative operation performed";
    }

    // Extract structured chips
    if (obj.action && obj.action !== log.action) {
      chips.push({ label: "Action", value: String(obj.action) });
    }
    if (obj.platform) {
      chips.push({ label: "Platform", value: String(obj.platform) });
    }
    if (obj.requestId) {
      chips.push({ label: "Req ID", value: String(obj.requestId), copyable: true });
    }
    if (obj.deletedLogId) {
      chips.push({ label: "Log ID", value: String(obj.deletedLogId), copyable: true });
    }
    if (obj.deletedCount !== undefined) {
      chips.push({ label: "Deleted", value: `${obj.deletedCount} items` });
    }
    if (obj.targetUserId) {
      chips.push({ label: "User ID", value: String(obj.targetUserId), copyable: true });
    }
    if (obj.format) {
      chips.push({ label: "Format", value: String(obj.format).toUpperCase() });
    }
    if (obj.keysUpdated && Array.isArray(obj.keysUpdated)) {
      chips.push({ label: "Keys", value: `${obj.keysUpdated.length} updated` });
    }
  }

  return { summary, chips, rawObject: obj };
}

export function getActionBadgeStyle(action: string = "") {
  const lower = action.toLowerCase();
  if (lower.includes("delete") || lower.includes("remove") || lower.includes("ban")) {
    return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  }
  if (lower.includes("create") || lower.includes("add") || lower.includes("login")) {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }
  if (lower.includes("update") || lower.includes("change") || lower.includes("edit")) {
    return "bg-sky-500/15 text-sky-300 border-sky-500/30";
  }
  if (lower.includes("reset") || lower.includes("suspend") || lower.includes("verify")) {
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }
  return "bg-white/[0.08] text-zinc-200 border-white/[0.12]";
}

export default function AuditFeedItem({
  log,
  onInspect,
  showLinkToAudit = false,
}: AuditFeedItemProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { summary, chips, rawObject } = parseAuditDetails(log);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadJson = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  };

  const actionStyle = getActionBadgeStyle(log.action);

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-2.5 group">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Action Badge */}
          <span
            className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border tracking-wide ${actionStyle}`}
          >
            {log.action}
          </span>

          {/* Category Pill */}
          {log.category && (
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
              {log.category}
            </span>
          )}
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title={log.adminEmail}>
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-mono text-[11px] text-zinc-300 max-w-[170px] truncate">
                {log.adminEmail}
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span suppressHydrationWarning>
                {new Date(log.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Three Dots Dropdown Action Menu */}
          <div onClick={(e) => e.stopPropagation()}>
            <ActionDropdown
              size="sm"
              buttonTitle={`Actions for ${log.action}`}
              items={[
                onInspect
                  ? {
                      id: "inspect-payload",
                      label: "Inspect Full Event Payload",
                      description: "Formatted JSON & trace",
                      icon: Eye,
                      onClick: () => onInspect(log),
                      dividerAfter: true,
                    }
                  : false,
                {
                  id: "toggle-json",
                  label: showRawJson ? "Hide Raw JSON" : "View Raw JSON Inline",
                  icon: Code,
                  onClick: () => setShowRawJson((prev) => !prev),
                },
                {
                  id: "copy-action",
                  label: "Copy Action Name",
                  icon: Copy,
                  onClick: () => copyText(log.action, "action"),
                },
                {
                  id: "copy-email",
                  label: "Copy Admin Email",
                  icon: Copy,
                  onClick: () => copyText(log.adminEmail, "email"),
                },
                rawObject?.requestId
                  ? {
                      id: "copy-req-id",
                      label: "Copy Request ID",
                      icon: Copy,
                      onClick: () => copyText(rawObject.requestId, "req_id"),
                    }
                  : false,
                rawObject?.deletedLogId
                  ? {
                      id: "copy-log-id",
                      label: "Copy Deleted Log ID",
                      icon: Copy,
                      onClick: () => copyText(rawObject.deletedLogId, "log_id"),
                    }
                  : false,
                log._id
                  ? {
                      id: "copy-audit-id",
                      label: "Copy Audit ID",
                      icon: Copy,
                      onClick: () => copyText(log._id, "audit_id"),
                      dividerAfter: true,
                    }
                  : false,
                showLinkToAudit
                  ? {
                      id: "view-audit-trail",
                      label: "Open in Audit Trail",
                      description: "Search in full logs",
                      icon: ExternalLink,
                      onClick: () => {
                        window.location.href = `/audit`;
                      },
                    }
                  : false,
                {
                  id: "download-json",
                  label: "Download Record JSON",
                  icon: Download,
                  onClick: downloadJson,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Narrative Summary */}
      <div className="text-xs text-zinc-300 font-medium leading-relaxed">
        {summary}
      </div>

      {/* Metadata Badges / Chips */}
      {chips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {chips.map((chip, idx) => {
            const isCopied = copiedKey === `chip_${idx}`;
            return (
              <span
                key={idx}
                onClick={() => {
                  if (chip.copyable) {
                    copyText(chip.value, `chip_${idx}`);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all ${
                  chip.copyable
                    ? "bg-black/40 border-white/[0.08] text-zinc-300 hover:text-white hover:border-emerald-500/40 cursor-pointer"
                    : "bg-white/[0.03] border-white/[0.05] text-zinc-400"
                }`}
                title={chip.copyable ? "Click to copy" : undefined}
              >
                <span className="text-zinc-500">{chip.label}:</span>
                <span className="font-semibold truncate max-w-[180px]">{chip.value}</span>
                {chip.copyable && (
                  isCopied ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5 shrink-0" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 text-zinc-500 hover:text-white ml-0.5 shrink-0" />
                  )
                )}
              </span>
            );
          })}

          {/* Quick Inline JSON Toggle Button */}
          <button
            type="button"
            onClick={() => setShowRawJson((p) => !p)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer ml-auto"
          >
            <Code className="w-3 h-3" />
            <span>{showRawJson ? "Hide Raw" : "Raw JSON"}</span>
            {showRawJson ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      )}

      {/* Expandable Raw JSON Box */}
      {showRawJson && (
        <div className="p-3 rounded-xl bg-black/70 border border-white/[0.08] text-[11px] font-mono text-emerald-300/90 overflow-x-auto relative animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-[10px] text-zinc-500">
            <span>Raw Details Payload</span>
            <button
              type="button"
              onClick={() => copyText(JSON.stringify(log.details, null, 2), "raw_json")}
              className="flex items-center gap-1 text-zinc-400 hover:text-white cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">
            {typeof log.details === "object"
              ? JSON.stringify(log.details, null, 2)
              : String(log.details)}
          </pre>
        </div>
      )}
    </div>
  );
}
