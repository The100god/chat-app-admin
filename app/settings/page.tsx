"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi, AdminUser, getBackendUrl } from "@/lib/api";
import {
  Settings,
  Shield,
  Server,
  Download,
  RefreshCw,
  CheckCircle2,
  Lock,
  UserPlus,
  Trash2,
  KeyRound,
  AlertCircle,
  ShieldAlert,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Admin Management State
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);
  const [newRole, setNewRole] = useState("admin");
  const [newPermissions, setNewPermissions] = useState<string[]>(["features", "themes", "together", "mobile"]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Diagnostic State
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      const meRes = await adminApi.getMe();
      if (meRes.admin) {
        setCurrentUser(meRes.admin);
        if (meRes.admin.role === "super_admin") {
          loadAdmins();
        }
      }
    } catch {
      // Fallback
    }
  };

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const list = await adminApi.getAdminsList();
      setAdminsList(list);
    } catch (e: any) {
      console.warn("Could not load admins list:", e.message);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match", error: true });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ text: "Password must be at least 6 characters long", error: true });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await adminApi.changeSuperAdminPassword(currentPassword, newPassword);
      setPasswordMessage({ text: res.message || "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ text: err.message || "Failed to change password", error: true });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePermissionToggle = (perm: string) => {
    if (newPermissions.includes(perm)) {
      setNewPermissions(newPermissions.filter((p) => p !== perm));
    } else {
      setNewPermissions([...newPermissions, perm]);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage(null);

    if (!newUsername || !newEmail || !newAdminPassword) {
      setCreateMessage({ text: "Please fill in all fields", error: true });
      return;
    }

    setCreateLoading(true);
    try {
      await adminApi.createAdmin({
        username: newUsername,
        email: newEmail,
        password: newAdminPassword,
        role: newRole,
        permissions: newPermissions,
      });

      setCreateMessage({ text: `Admin account '${newUsername}' created successfully!` });
      setNewUsername("");
      setNewEmail("");
      setNewAdminPassword("");
      setShowCreateForm(false);
      loadAdmins();
    } catch (err: any) {
      setCreateMessage({ text: err.message || "Failed to create admin account", error: true });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete admin '${username}'?`)) return;

    try {
      await adminApi.deleteAdmin(id);
      loadAdmins();
    } catch (err: any) {
      alert(err.message || "Failed to delete admin");
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/health`);
      const data = await res.json();
      if (res.ok) {
        setTestResult(`Success! Backend status: ${data.status} (DB: ${data.dbState})`);
      } else {
        setTestResult(`Failed: Backend returned ${res.status}`);
      }
    } catch (e: any) {
      setTestResult(`Error: Could not reach backend: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleExportConfigs = async () => {
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/config/public`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chugli-admin-config-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch {
      alert("Failed to export configuration");
    }
  };

  const isSuperAdmin = currentUser?.role === "super_admin";

  return (
    <AdminLayout
      title="System Settings & Security Management"
      subtitle="Super Admin credentials, role delegation, API connectivity, and ecosystem diagnostics"
      onRefresh={loadInitialData}
    >
      {/* Super Admin Notice if not Super Admin */}
      {!isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            You are logged in with role <strong className="uppercase font-mono">{currentUser?.role || "Admin"}</strong>. Privileged actions like creating new admins or changing the Super Admin password require <strong>Super Admin</strong> authorization.
          </span>
        </div>
      )}

      {/* Super Admin Exclusive Row: Password Change & Admin Creation */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Super Admin Password */}
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Change Super Admin Password
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Super Admin Only
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Update the master security credentials for the Super Admin account ({currentUser?.email}).
            </p>

            {passwordMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passwordMessage.error
                    ? "bg-red-500/10 border border-red-500/20 text-red-300"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                }`}
              >
                {passwordMessage.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    title={showCurrentPass ? "Hide password" : "Show password"}
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    title={showNewPass ? "Hide password" : "Show password"}
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    title={showConfirmPass ? "Hide password" : "Show password"}
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{passwordLoading ? "Updating Password..." : "Update Super Admin Password"}</span>
              </button>
            </form>
          </div>

          {/* Create New Admin Account Form */}
          <div className="glass-panel rounded-2xl p-6 border border-indigo-500/30 bg-indigo-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                Create New Admin Account
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Super Admin Only
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Provision administrative credentials for moderators, operators, or support team members.
            </p>

            {createMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  createMessage.error
                    ? "bg-red-500/10 border border-red-500/20 text-red-300"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                }`}
              >
                {createMessage.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{createMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. alex_mod"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="admin">Administrator (Full Access)</option>
                    <option value="moderator">Moderator (Users & Chat)</option>
                    <option value="support">Support (Read Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="alex@chugli.app"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showNewAdminPass ? "text" : "password"}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPass(!showNewAdminPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    title={showNewAdminPass ? "Hide password" : "Show password"}
                  >
                    {showNewAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Granular Permissions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "features", label: "Features" },
                    { id: "themes", label: "Themes" },
                    { id: "together", label: "Together Games" },
                    { id: "mobile", label: "Mobile Policies" },
                    { id: "users", label: "User Moderation" },
                    { id: "audit", label: "Audit Logs" },
                  ].map((p) => {
                    const active = newPermissions.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handlePermissionToggle(p.id)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                          active
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                            : "bg-white/[0.02] text-zinc-500 border-white/[0.05]"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{createLoading ? "Creating Admin..." : "Create Admin Account"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Exclusive: Active Admins Table */}
      {isSuperAdmin && (
        <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Administrative Staff Directory ({adminsList.length})
            </h3>
            <button
              onClick={loadAdmins}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAdmins ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] border-b border-white/[0.06] text-zinc-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Admin Username</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {adminsList.map((adm) => (
                  <tr key={adm.id || (adm as any)._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-[10px] text-white">
                        {adm.username?.charAt(0).toUpperCase()}
                      </div>
                      <span>{adm.username}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-mono text-[11px]">
                      {adm.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono border ${
                          adm.role === "super_admin"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : adm.role === "moderator"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {adm.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-[11px]" suppressHydrationWarning>
                      {adm.lastLogin ? new Date(adm.lastLogin).toLocaleString() : "Never"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {adm.role !== "super_admin" ? (
                        <button
                          onClick={() => handleDeleteAdmin(adm.id || (adm as any)._id, adm.username)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Admin Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagnostics & Snapshots Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Health & Diagnostics */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            Backend Connectivity Diagnostic
          </h3>
          <p className="text-xs text-zinc-400">
            Verify HTTP & WebSocket connectivity to the Node/Express backend on port 5001.
          </p>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Target Backend URL:</span>
              <span className="font-mono text-zinc-200">http://localhost:5001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Admin Control Port:</span>
              <span className="font-mono text-emerald-400">Port 3001</span>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/[0.08] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{testing ? "Testing Ping..." : "Run Health Diagnostic"}</span>
          </button>

          {testResult && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
              {testResult}
            </div>
          )}
        </div>

        {/* Configuration Backup & Snapshot */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-400" />
            Configuration Export & Backup
          </h3>
          <p className="text-xs text-zinc-400">
            Export all current system feature flags, theme tokens, animated background settings, and Together game registries as a portable JSON snapshot.
          </p>

          <button
            onClick={handleExportConfigs}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Configuration Snapshot (.json)</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
