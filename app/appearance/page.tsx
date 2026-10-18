"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi, ThemesConfig, ThemeTokenSet } from "@/lib/api";
import {
  Palette,
  CheckCircle2,
  Save,
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  AlertCircle,
  X,
} from "lucide-react";

export const ORIGINAL_THEMES: Record<string, ThemeTokenSet> = {
  light: {
    id: "light",
    name: "Clean Light",
    background: "#ffffff",
    foreground: "#111b21",
    primary: "#00a884",
    secondary: "#25d366",
    accent: "#00a884",
    muted: "#f0f2f5",
    mutedText: "#667781",
    card: "#ffffff",
    border: "#e2e8f0",
    bubbleSent: "#d9fdd3",
    bubbleSentText: "#111b21",
    bubbleReceived: "#ffffff",
    bubbleReceivedText: "#111b21",
  },
  dark: {
    id: "dark",
    name: "Midnight Dark",
    background: "#0f172a",
    foreground: "#f8fafc",
    primary: "#8b5cf6",
    secondary: "#ec4899",
    accent: "#8b5cf6",
    muted: "#1e293b",
    mutedText: "#94a3b8",
    card: "#1e293b",
    border: "#334155",
    bubbleSent: "#8b5cf6",
    bubbleSentText: "#ffffff",
    bubbleReceived: "#1e293b",
    bubbleReceivedText: "#f8fafc",
  },
  aurora: {
    id: "aurora",
    name: "Aurora Glow",
    background: "#0f172a",
    foreground: "#e0f7fa",
    primary: "#00bcd4",
    secondary: "#ff4081",
    accent: "#4caf50",
    muted: "#1e293b",
    mutedText: "#94a3b8",
    card: "#1e293b",
    border: "#334155",
    bubbleSent: "#1e3a5f",
    bubbleSentText: "#e0f7fa",
    bubbleReceived: "#1e293b",
    bubbleReceivedText: "#e0f7fa",
  },
};

export default function AppearancePage() {
  const [themesConfig, setThemesConfig] = useState<ThemesConfig | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("dark");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  const loadThemes = async () => {
    try {
      const data = await adminApi.getConfig<ThemesConfig>("themes");
      if (data) {
        setThemesConfig(data);
        if (data.activeDefault) setSelectedThemeId(data.activeDefault);
      }
    } catch (err) {
      console.error("Failed to load themes:", err);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const currentTheme: ThemeTokenSet | undefined =
    themesConfig?.themes?.[selectedThemeId];

  const handleTokenChange = (tokenKey: keyof ThemeTokenSet, value: string) => {
    if (!themesConfig || !currentTheme) return;

    setThemesConfig({
      ...themesConfig,
      themes: {
        ...themesConfig.themes,
        [selectedThemeId]: {
          ...currentTheme,
          [tokenKey]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    if (!themesConfig) return;
    setSaving(true);
    try {
      await adminApi.updateConfig("themes", themesConfig);
      setSaveSuccess(true);
      showToast("Theme tokens saved & published across Web and Mobile!");
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      showToast("Failed to save themes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetTheme = async (mode: "current" | "all") => {
    if (!themesConfig) return;
    setResetting(true);
    setResetModalOpen(false);

    try {
      if (mode === "current") {
        const original = ORIGINAL_THEMES[selectedThemeId] || ORIGINAL_THEMES.dark;
        const updatedConfig: ThemesConfig = {
          ...themesConfig,
          themes: {
            ...themesConfig.themes,
            [selectedThemeId]: {
              ...original,
              id: selectedThemeId,
              name: currentTheme?.name || original.name,
            },
          },
        };

        // Immediately update state so color pickers and live simulation reflect original colors
        setThemesConfig(updatedConfig);

        // Persist to server and broadcast via Socket.io
        try {
          const res = await adminApi.resetConfig<ThemesConfig>("themes", { themeId: selectedThemeId });
          if (res?.data) {
            setThemesConfig(res.data);
          }
        } catch {
          await adminApi.updateConfig("themes", updatedConfig);
        }

        showToast(`Original theme colors restored for "${currentTheme?.name || selectedThemeId}" and synchronized!`);
      } else {
        // Reset all 3 themes to factory original presets
        const updatedConfig: ThemesConfig = {
          activeDefault: "dark",
          themes: {
            light: { ...ORIGINAL_THEMES.light },
            dark: { ...ORIGINAL_THEMES.dark },
            aurora: { ...ORIGINAL_THEMES.aurora },
          },
        };

        setThemesConfig(updatedConfig);

        try {
          const res = await adminApi.resetConfig<ThemesConfig>("themes");
          if (res?.data) {
            setThemesConfig(res.data);
          }
        } catch {
          await adminApi.updateConfig("themes", updatedConfig);
        }

        showToast("All themes have been reset to their original colors and synchronized across all clients!");
      }
    } catch (err: any) {
      console.error("Failed to reset theme:", err);
      showToast(err.message || "Failed to reset theme", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminLayout
      title="Appearance & Theme Studio"
      subtitle="Define and publish dynamic CSS variables and React Native ThemeTokens across Web and Mobile"
      onRefresh={loadThemes}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-200 shadow-xl ${
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-medium">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Cross-Platform Theme Studio</h2>
            <p className="text-xs text-zinc-400">
              Live updates Web CSS custom variables and React Native ThemeContext instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetModalOpen(true)}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/15 text-zinc-300 hover:text-rose-200 text-xs font-medium transition-colors border border-white/[0.08] hover:border-rose-500/30"
            title="Reset theme colors to original presets"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            <span>{resetting ? "Resetting..." : "Reset Theme"}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || resetting || !themesConfig}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Tokens Published!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? "Publishing..." : "Publish Theme Tokens"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Theme Selector Tabs */}
      <div className="flex items-center gap-3">
        {[
          { id: "light", name: "Clean Light", icon: Sun, color: "text-amber-400" },
          { id: "dark", name: "Midnight Dark", icon: Moon, color: "text-blue-400" },
          { id: "aurora", name: "Aurora Glow", icon: Sparkles, color: "text-purple-400" },
        ].map((t) => {
          const Icon = t.icon;
          const isSelected = selectedThemeId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedThemeId(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? "bg-white/[0.12] text-white border-white/[0.2] shadow-lg"
                  : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.07] hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${t.color}`} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio: Color Tokens & Live Preview */}
      {currentTheme && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Color Tokens Panel (7 cols) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
                  Theme Color Palette ({currentTheme.name})
                </h3>
                <p className="text-xs text-zinc-400">
                  Adjust the hex color codes or click color swatches to test live.
                </p>
              </div>

              <button
                onClick={() => handleResetTheme("current")}
                disabled={resetting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-zinc-300 hover:text-rose-200 text-xs font-medium transition-colors border border-white/[0.08] hover:border-rose-500/30 self-start sm:self-auto"
                title={`Reset ${currentTheme.name} to original preset colors`}
              >
                <RotateCcw className={`w-3 h-3 ${resetting ? "animate-spin" : ""}`} />
                <span>Reset to Original</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Background", key: "background" },
                { label: "Foreground (Text)", key: "foreground" },
                { label: "Primary Accent", key: "primary" },
                { label: "Secondary / Surface", key: "secondary" },
                { label: "Accent Highlight", key: "accent" },
                { label: "Muted Text", key: "muted" },
                { label: "Card Background", key: "card" },
                { label: "Border Color", key: "border" },
                { label: "Sent Bubble Background", key: "bubbleSent" },
                { label: "Sent Bubble Text", key: "bubbleSentText" },
                { label: "Received Bubble Background", key: "bubbleReceived" },
                { label: "Received Bubble Text", key: "bubbleReceivedText" },
              ].map(({ label, key }) => {
                const val = (currentTheme as any)[key] || "#000000";
                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-3"
                  >
                    <div>
                      <label className="block text-xs font-medium text-zinc-300">
                        {label}
                      </label>
                      <span className="text-[11px] font-mono text-zinc-500 uppercase">
                        {val}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={val.startsWith("#") && val.length === 7 ? val : "#10b981"}
                        onChange={(e) => handleTokenChange(key as any, e.target.value)}
                        className="w-8 h-8 rounded-lg border border-white/[0.1] cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleTokenChange(key as any, e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono rounded-lg bg-black/40 border border-white/[0.1] text-zinc-200 text-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Live Client Simulation
            </h3>

            {/* Simulated Chat Interface Container */}
            <div
              className="rounded-2xl p-5 shadow-2xl transition-all border overflow-hidden"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.foreground,
                borderColor: currentTheme.border,
              }}
            >
              {/* Mock Chat Header */}
              <div
                className="pb-4 mb-4 flex items-center justify-between border-b"
                style={{ borderColor: currentTheme.border }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md"
                    style={{
                      backgroundColor: currentTheme.primary,
                      color: currentTheme.bubbleSentText,
                    }}
                  >
                    C
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight">Chugli Chat</h4>
                    <p className="text-[11px]" style={{ color: currentTheme.muted }}>
                      Online • Dual-Platform Sync
                    </p>
                  </div>
                </div>

                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: currentTheme.card,
                    color: currentTheme.accent,
                    borderColor: currentTheme.border,
                    borderWidth: 1,
                  }}
                >
                  {currentTheme.name}
                </span>
              </div>

              {/* Mock Chat Conversation Area */}
              <div className="space-y-3 py-2 text-xs">
                {/* Received Bubble */}
                <div className="flex justify-start">
                  <div
                    className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm"
                    style={{
                      backgroundColor: currentTheme.bubbleReceived,
                      color: currentTheme.bubbleReceivedText,
                    }}
                  >
                    <p>Hey there! Does this new theme look good on mobile?</p>
                    <span
                      className="text-[9px] block text-right mt-1 opacity-70"
                    >
                      10:42 AM
                    </span>
                  </div>
                </div>

                {/* Sent Bubble */}
                <div className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm"
                    style={{
                      backgroundColor: currentTheme.bubbleSent,
                      color: currentTheme.bubbleSentText,
                    }}
                  >
                    <p>Yes! The colors are automatically synchronized via Socket.io 🚀</p>
                    <span
                      className="text-[9px] block text-right mt-1 opacity-80"
                    >
                      10:43 AM ✓✓
                    </span>
                  </div>
                </div>

                {/* Card Surface Preview */}
                <div
                  className="p-3 rounded-xl border mt-3"
                  style={{
                    backgroundColor: currentTheme.card,
                    borderColor: currentTheme.border,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">Card Component</span>
                    <button
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: currentTheme.primary,
                        color: currentTheme.bubbleSentText,
                      }}
                    >
                      Action
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400">
              💡 <span className="text-zinc-200">Instant Broadcast:</span> Clicking "Reset to Original" or "Publish Theme Tokens" pushes these color values directly to both the Next.js Web frontend and Expo React Native mobile client in real-time.
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/[0.12] shadow-2xl space-y-5 bg-[#0f172a]/95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset Theme Colors</h3>
                  <p className="text-xs text-zinc-400">Restore genuine default factory palettes</p>
                </div>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleResetTheme("current")}
                disabled={resetting}
                className="w-full text-left p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    Reset "{currentTheme?.name || selectedThemeId}" Only
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Revert all color tokens of the currently selected theme back to original factory values and synchronize across Web and Mobile.
                </p>
              </button>

              <button
                onClick={() => handleResetTheme("all")}
                disabled={resetting}
                className="w-full text-left p-4 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">
                    Reset All Themes
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                    All 3 Presets
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Reset Clean Light, Midnight Dark, and Aurora Glow back to factory presets and publish live immediately.
                </p>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
