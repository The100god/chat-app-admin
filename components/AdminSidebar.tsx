"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sliders,
  Palette,
  Sparkles,
  Gamepad2,
  Smartphone,
  Users,
  ScrollText,
  Settings,
  ShieldCheck,
  Radio,
  Activity,
  Clock,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "User API Activity", href: "/monitoring/activity", icon: Activity, badge: "Web + App", badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { name: "Retention Policy", href: "/monitoring/retention", icon: Clock, badge: "15 Days", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { name: "Feature Flags", href: "/features", icon: Sliders, badge: "Live", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { name: "Themes & Appearance", href: "/appearance", icon: Palette },
  { name: "Animated Background", href: "/animated-bg", icon: Sparkles },
  { name: "Together & Games", href: "/together", icon: Gamepad2, badge: "7 Games", badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  { name: "Mobile Management", href: "/mobile", icon: Smartphone, badge: "App Lock", badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { name: "Users & Moderation", href: "/users", icon: Users },
  { name: "Audit Trail", href: "/audit", icon: ScrollText },
  { name: "System Settings", href: "/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/[0.08] glass-panel flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-wide flex items-center gap-1.5">
              Chugli
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Admin
              </span>
            </span>
            <p className="text-[11px] text-zinc-400">Control Hub</p>
          </div>
        </Link>
      </div>

      {/* Real-time Status Pill */}
      <div className="px-4 py-3 border-b border-white/[0.05]">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-300">Live Dual Sync</span>
          </div>
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-indigo-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                    item.badgeColor || "bg-white/[0.06] text-zinc-300 border-white/[0.1]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/[0.08] text-xs text-zinc-500 flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Backend API</span>
          <span className="text-zinc-300 font-mono">Port 5001</span>
        </div>
        <div className="flex justify-between">
          <span>Environment</span>
          <span className="text-emerald-400 font-mono">Development</span>
        </div>
      </div>
    </aside>
  );
}
