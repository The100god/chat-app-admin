"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi, FeatureFlag } from "@/lib/api";
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Globe,
  Layers,
  Save,
} from "lucide-react";

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Record<string, FeatureFlag>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadFeatures = async () => {
    try {
      const data = await adminApi.getConfig<Record<string, FeatureFlag>>("features");
      setFeatures(data || {});
    } catch (err) {
      console.error("Failed to load features:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const handleToggle = (key: string) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled,
      },
    }));
  };

  const handlePlatformChange = (key: string, platform: "all" | "web" | "mobile") => {
    setFeatures((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        platform,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateConfig("features", features);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to save feature flags");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Dynamic Feature Flag Studio"
      subtitle="Enable, disable, and platform-gate core chat features across Web and Mobile in real-time"
      onRefresh={loadFeatures}
    >
      {/* Top Banner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/[0.08]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Global Feature Switchboard
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Changes propagate via Socket.io directly to running Web & Mobile apps without rebuilds.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Flags Broadcasted!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? "Broadcasting..." : "Save & Broadcast"}</span>
            </>
          )}
        </button>
      </div>

      {/* Feature Flag Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(features).map(([key, item]) => {
          const isMaintenance = key === "maintenance_mode";

          return (
            <div
              key={key}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                item.enabled
                  ? isMaintenance
                    ? "border-amber-500/50 bg-amber-950/20"
                    : "border-emerald-500/30 bg-emerald-950/10"
                  : "border-white/[0.07] opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {item.name}
                    </span>
                    {isMaintenance && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        Killswitch
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {item.description || item.message || "Ecosystem feature module"}
                  </p>
                </div>

                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    item.enabled
                      ? isMaintenance
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                      : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      item.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Platform Selector Buttons */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Target Platforms:</span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => handlePlatformChange(key, "all")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      item.platform === "all"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    All
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlatformChange(key, "web")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      item.platform === "web"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    Web
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlatformChange(key, "mobile")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      item.platform === "mobile"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    Mobile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
