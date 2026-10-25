"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi } from "@/lib/api";
import ActionDropdown from "@/components/ActionDropdown";
import Link from "next/link";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Calendar,
  Mail,
  Eye,
  Activity,
  Copy,
  Check,
  Key,
  Ban,
  Trash2,
  RefreshCw,
  AlertTriangle,
  X,
  ExternalLink,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Pencil,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  // Modals & Active Targets
  const [inspectUser, setInspectUser] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [suspendTargetUser, setSuspendTargetUser] = useState<any | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [deleteTargetUser, setDeleteTargetUser] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showFeedback("success", `Copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(page, search);
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      showFeedback("error", err.message || "Failed to load user directory");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  // Inspect full user profile with live stats
  const handleOpenInspect = async (u: any) => {
    setInspectUser(u);
    setNewDisplayName(u.name || u.username || "");
    setEditingDisplayName(false);
    setInspectLoading(true);
    try {
      const res = await adminApi.getUserById(u._id);
      if (res.user) {
        setInspectUser(res.user);
        setNewDisplayName(res.user.name || res.user.username || "");
      }
    } catch {
      // Keep existing data if detailed endpoint fails
    } finally {
      setInspectLoading(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!inspectUser || !newDisplayName.trim()) return;
    setIsUpdatingProfile(true);
    try {
      await adminApi.updateUserProfile(inspectUser._id, { name: newDisplayName.trim() });
      setUsers((prev) =>
        prev.map((item) => (item._id === inspectUser._id ? { ...item, name: newDisplayName.trim() } : item))
      );
      setInspectUser((prev: any) => prev ? { ...prev, name: newDisplayName.trim() } : null);
      setEditingDisplayName(false);
      showFeedback("success", `Display name updated to '${newDisplayName.trim()}'.`);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update display name");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Toggle Email Verification
  const handleToggleVerification = async (u: any) => {
    const nextVerified = !u.isVerified;
    try {
      await adminApi.updateUserStatus(u._id, { isVerified: nextVerified });
      setUsers((prev) =>
        prev.map((item) => (item._id === u._id ? { ...item, isVerified: nextVerified } : item))
      );
      if (inspectUser && inspectUser._id === u._id) {
        setInspectUser({ ...inspectUser, isVerified: nextVerified });
      }
      showFeedback(
        "success",
        `User '@${u.username}' email marked as ${nextVerified ? "Verified" : "Unverified"}.`
      );
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update verification status");
    }
  };

  // Suspend / Unsuspend
  const handleConfirmSuspension = async () => {
    if (!suspendTargetUser) return;
    setIsSubmitting(true);
    const nextSuspended = !suspendTargetUser.isSuspended;
    try {
      await adminApi.updateUserStatus(suspendTargetUser._id, {
        isSuspended: nextSuspended,
        suspendedReason: nextSuspended ? suspendReason || "Violation of community standards" : "",
      });
      setUsers((prev) =>
        prev.map((item) =>
          item._id === suspendTargetUser._id
            ? {
                ...item,
                isSuspended: nextSuspended,
                suspendedReason: nextSuspended ? suspendReason : "",
              }
            : item
        )
      );
      if (inspectUser && inspectUser._id === suspendTargetUser._id) {
        setInspectUser({
          ...inspectUser,
          isSuspended: nextSuspended,
          suspendedReason: nextSuspended ? suspendReason : "",
        });
      }
      showFeedback(
        "success",
        nextSuspended
          ? `User '@${suspendTargetUser.username}' suspended.`
          : `User '@${suspendTargetUser.username}' unsuspended and restored.`
      );
      setSuspendTargetUser(null);
      setSuspendReason("");
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update suspension status");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Password
  const handleConfirmResetPassword = async () => {
    if (!passwordTargetUser || !newPassword) return;
    if (newPassword.length < 6) {
      showFeedback("error", "Password must be at least 6 characters long.");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.resetUserPassword(passwordTargetUser._id, newPassword);
      showFeedback("success", `Password for '@${passwordTargetUser.username}' successfully reset.`);
      setPasswordTargetUser(null);
      setNewPassword("");
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User
  const handleConfirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setIsSubmitting(true);
    try {
      await adminApi.deleteUser(deleteTargetUser._id);
      setUsers((prev) => prev.filter((item) => item._id !== deleteTargetUser._id));
      if (inspectUser && inspectUser._id === deleteTargetUser._id) {
        setInspectUser(null);
      }
      showFeedback("success", `User account '@${deleteTargetUser.username}' permanently deleted.`);
      setDeleteTargetUser(null);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to delete user account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="User Directory & Moderation Studio"
      subtitle="Comprehensive user management, profile inspection, password resets, and moderation enforcement"
      onRefresh={loadUsers}
    >
      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xl transition-all ${
            actionFeedback.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="p-1 hover:bg-white/10 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      )}

      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-white/[0.08]">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email, or user ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="font-medium text-white">{pagination?.total || users.length}</span>
          <span>registered accounts</span>
          <button
            onClick={loadUsers}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Refresh user list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-white/[0.03] border-b border-white/[0.06] text-zinc-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Display Name & @Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Email Verification</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-600" />
                    Loading registered user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No users matching &quot;{search}&quot; found
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuspended = !!u.isSuspended;
                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => handleOpenInspect(u)}
                    >
                      {/* User Avatar + Display Name + Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden shrink-0">
                            {u.profilePic && u.profilePic.startsWith("http") ? (
                              <img
                                src={u.profilePic}
                                alt={u.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (u.name || u.username)?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate flex items-center gap-1.5">
                              <span>{u.name || u.username}</span>
                              {isSuspended && (
                                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Banned
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono truncate">
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[220px]">{u.email}</span>
                        </div>
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <Ban className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Email Verification Status */}
                      <td className="py-3.5 px-4">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span suppressHydrationWarning>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                      </td>

                      {/* Actions: Three Dots Dropdown */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end">
                          <ActionDropdown
                            buttonTitle={`Actions for @${u.username}`}
                            items={[
                              {
                                id: "inspect-profile",
                                label: "Inspect User Profile",
                                description: "Full bio, stats & activity",
                                icon: Eye,
                                onClick: () => handleOpenInspect(u),
                                dividerAfter: true,
                              },
                              {
                                id: "view-activity",
                                label: "View API Activity Stream",
                                description: "Filter logs by this user",
                                icon: Activity,
                                onClick: () => {
                                  window.location.href = `/monitoring/activity?search=${encodeURIComponent(
                                    u.username
                                  )}`;
                                },
                              },
                              {
                                id: "copy-id",
                                label: "Copy User ID",
                                icon: Copy,
                                onClick: () => copyToClipboard(u._id, `id_${u._id}`),
                              },
                              {
                                id: "copy-email",
                                label: "Copy Email Address",
                                icon: Mail,
                                onClick: () => copyToClipboard(u.email, `email_${u._id}`),
                                dividerAfter: true,
                              },
                              {
                                id: "toggle-verify",
                                label: u.isVerified ? "Mark as Unverified" : "Mark as Verified",
                                description: u.isVerified ? "Revoke email verification" : "Grant verified badge",
                                icon: ShieldCheck,
                                onClick: () => handleToggleVerification(u),
                              },
                              {
                                id: "reset-password",
                                label: "Reset Password",
                                description: "Set new account credentials",
                                icon: Key,
                                onClick: () => {
                                  setPasswordTargetUser(u);
                                  setNewPassword("");
                                },
                                dividerAfter: true,
                              },
                              {
                                id: "toggle-suspend",
                                label: isSuspended ? "Unsuspend & Restore Account" : "Suspend Account",
                                description: isSuspended ? "Restore login privileges" : "Block API & app login",
                                icon: Ban,
                                danger: !isSuspended,
                                onClick: () => {
                                  setSuspendTargetUser(u);
                                  setSuspendReason(u.suspendedReason || "");
                                },
                              },
                              {
                                id: "delete-user",
                                label: "Delete User Account",
                                description: "Permanent deletion",
                                icon: Trash2,
                                danger: true,
                                onClick: () => setDeleteTargetUser(u),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
            <div>
              Page <span className="font-semibold text-white">{pagination.page}</span> of{" "}
              <span className="font-semibold text-white">{pagination.totalPages}</span> ({pagination.total} accounts)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Inspect User Profile */}
      {inspectUser && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setInspectUser(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-white/[0.15] p-6 shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-lg overflow-hidden shrink-0">
                  {inspectUser.profilePic && inspectUser.profilePic.startsWith("http") ? (
                    <img
                      src={inspectUser.profilePic}
                      alt={inspectUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (inspectUser.name || inspectUser.username)?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {editingDisplayName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          maxLength={50}
                          className="bg-black/50 border border-emerald-500/50 rounded-lg px-2.5 py-1 text-sm text-white outline-none focus:border-emerald-500"
                          autoFocus
                        />
                        <button
                          disabled={isUpdatingProfile}
                          onClick={handleUpdateDisplayName}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition cursor-pointer"
                        >
                          {isUpdatingProfile ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingDisplayName(false);
                            setNewDisplayName(inspectUser.name || inspectUser.username || "");
                          }}
                          className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white truncate">
                          {inspectUser.name || inspectUser.username}
                        </h3>
                        <button
                          onClick={() => setEditingDisplayName(true)}
                          title="Edit Display Name"
                          className="p-1 rounded text-zinc-400 hover:text-emerald-400 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {inspectUser.isSuspended ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-zinc-400 font-mono">@{inspectUser.username}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      <Lock className="w-2.5 h-2.5 text-amber-400" /> Permanent
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{inspectUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Bio */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-300">
              <div className="text-[10px] uppercase font-mono text-zinc-500 mb-1">About Bio</div>
              <div>{inspectUser.about || "Hey there! I am using Chugli 💬"}</div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-mono text-zinc-500">User ID</div>
                <div className="font-mono text-zinc-300 truncate mt-0.5 flex items-center justify-between">
                  <span className="truncate">{inspectUser._id}</span>
                  <button
                    onClick={() => copyToClipboard(inspectUser._id, "modal_id")}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-mono text-zinc-500">Joined On</div>
                <div className="text-zinc-300 mt-0.5">
                  {inspectUser.createdAt
                    ? new Date(inspectUser.createdAt).toLocaleDateString()
                    : "Recent"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-mono text-zinc-500">Email Verification</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {inspectUser.isVerified ? (
                    <span className="text-emerald-400 font-medium">Verified</span>
                  ) : (
                    <span className="text-zinc-400 font-medium">Unverified</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-mono text-zinc-500">Friends Count</div>
                <div className="text-zinc-300 mt-0.5 font-semibold">
                  {inspectUser.friends?.length ?? inspectUser.friendCount ?? 0} connections
                </div>
              </div>
            </div>

            {/* Suspension note if suspended */}
            {inspectUser.isSuspended && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                <span className="font-bold">Suspension Reason: </span>
                {inspectUser.suspendedReason || "Community safety guidelines violation."}
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
              <Link
                href={`/monitoring/activity?search=${encodeURIComponent(inspectUser.username)}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Inspect API Activity</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSuspendTargetUser(inspectUser);
                    setSuspendReason(inspectUser.suspendedReason || "");
                    setInspectUser(null);
                  }}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                    inspectUser.isSuspended
                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}
                >
                  {inspectUser.isSuspended ? "Unsuspend Account" : "Suspend Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Reset Password Modal */}
      {passwordTargetUser && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPasswordTargetUser(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-zinc-950 border border-white/[0.15] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Reset User Password</h3>
              </div>
              <button
                onClick={() => setPasswordTargetUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Set a temporary or new password for user{" "}
              <strong className="text-white">@{passwordTargetUser.username}</strong>. This operation
              is logged in the immutable Audit Trail.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-mono text-zinc-400">
                New Password (minimum 6 characters)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.1] text-white text-xs font-mono outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const randomPass =
                      "Pass@" + Math.random().toString(36).substring(2, 8) + "!";
                    setNewPassword(randomPass);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs text-zinc-300 font-mono whitespace-nowrap cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setPasswordTargetUser(null)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || newPassword.length < 6}
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Updating..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Suspend / Unsuspend Confirmation Modal */}
      {suspendTargetUser && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSuspendTargetUser(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-zinc-950 border border-white/[0.15] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    suspendTargetUser.isSuspended
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  <Ban className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {suspendTargetUser.isSuspended ? "Unsuspend Account" : "Suspend Account"}
                </h3>
              </div>
              <button
                onClick={() => setSuspendTargetUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              {suspendTargetUser.isSuspended
                ? `Restore login access and active status for @${suspendTargetUser.username}.`
                : `Suspending @${suspendTargetUser.username} will instantly terminate their active sessions and block them from sending messages or logging in.`}
            </p>

            {!suspendTargetUser.isSuspended && (
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-mono text-zinc-400">
                  Suspension Reason (displayed to user)
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Repeated violation of terms of service..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.1] text-white text-xs outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setSuspendTargetUser(null)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSuspension}
                className={`px-4 py-2 rounded-xl font-semibold text-xs shadow-lg disabled:opacity-50 cursor-pointer ${
                  suspendTargetUser.isSuspended
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                    : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                }`}
              >
                {isSubmitting
                  ? "Processing..."
                  : suspendTargetUser.isSuspended
                  ? "Restore Account"
                  : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete User Confirmation Modal */}
      {deleteTargetUser && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setDeleteTargetUser(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-zinc-950 border border-rose-500/30 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Permanently Delete User?</h3>
              </div>
              <button
                onClick={() => setDeleteTargetUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to permanently delete account{" "}
              <strong className="text-white font-mono">@{deleteTargetUser.username}</strong> (
              {deleteTargetUser.email})?
            </p>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              ⚠️ This action cannot be undone. All profile data and credentials will be removed.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
