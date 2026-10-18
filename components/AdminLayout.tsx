"use client";

import React, { ReactNode, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { adminApi } from "@/lib/api";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export default function AdminLayout({
  children,
  title,
  subtitle,
  onRefresh,
}: AdminLayoutProps) {
  useEffect(() => {
    adminApi.ensureAuth().catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-[#090d16] text-zinc-100">
      {/* Fixed Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title={title} subtitle={subtitle} onRefresh={onRefresh} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
