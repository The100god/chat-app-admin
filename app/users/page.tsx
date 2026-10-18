"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi } from "@/lib/api";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
  ShieldAlert,
  Calendar,
  Mail,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(page, search);
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  return (
    <AdminLayout
      title="User Directory & Moderation"
      subtitle="Search users, inspect accounts, verify emails, and enforce moderation bans"
      onRefresh={loadUsers}
    >
      {/* Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-white/[0.08]">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500"
          />
        </form>

        <div className="text-xs text-zinc-400">
          Showing {users.length} {pagination?.total ? `of ${pagination.total}` : ""} accounts
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/[0.06] text-zinc-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                        {u.profilePic && u.profilePic.startsWith("http") ? (
                          <img src={u.profilePic} alt={u.username} className="w-full h-full object-cover" />
                        ) : (
                          u.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u.username}</div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                          {u.about || "Using Chugli 💬"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{u.email}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {u.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                        <XCircle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span suppressHydrationWarning>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => alert(`Moderation action for user: ${u.username}`)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] transition-colors"
                      >
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
