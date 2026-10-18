"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi, AnimatedBgConfig } from "@/lib/api";
import {
  Sparkles,
  Save,
  CheckCircle2,
  Plus,
  X,
  Gauge,
  ShieldAlert,
  Pipette,
} from "lucide-react";

export default function AnimatedBgPage() {
  const [config, setConfig] = useState<AnimatedBgConfig | null>(null);
  const [newEmoji, setNewEmoji] = useState("");
  const [newProhibitedWord, setNewProhibitedWord] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadConfig = async () => {
    try {
      const data = await adminApi.getConfig<AnimatedBgConfig>("animated_bg");
      if (data) setConfig(data);
    } catch (err) {
      console.error("Failed to load animated_bg config:", err);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleAddEmoji = () => {
    if (!newEmoji.trim() || !config) return;
    if (!config.defaultEmojis.includes(newEmoji.trim())) {
      setConfig({
        ...config,
        defaultEmojis: [...config.defaultEmojis, newEmoji.trim()],
      });
    }
    setNewEmoji("");
  };

  const handleRemoveEmoji = (emoji: string) => {
    if (!config) return;
    setConfig({
      ...config,
      defaultEmojis: config.defaultEmojis.filter((e) => e !== emoji),
    });
  };

  const handleAddProhibitedWord = () => {
    if (!newProhibitedWord.trim() || !config) return;
    const word = newProhibitedWord.trim().toLowerCase();
    if (!config.prohibitedWords.includes(word)) {
      setConfig({
        ...config,
        prohibitedWords: [...config.prohibitedWords, word],
      });
    }
    setNewProhibitedWord("");
  };

  const handleRemoveProhibitedWord = (word: string) => {
    if (!config) return;
    setConfig({
      ...config,
      prohibitedWords: config.prohibitedWords.filter((w) => w !== word),
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await adminApi.updateConfig("animated_bg", config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to save animated background configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Animated Floating Background Manager"
      subtitle="Configure floating emojis, particle physics, custom text length, and moderation limits"
      onRefresh={loadConfig}
    >
      {/* Top Banner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shadow-lg shadow-pink-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Particle Physics & Custom Text Rules
            </h2>
            <p className="text-xs text-zinc-400">
              Affects background animation rendering across Web and Mobile Chat Preferences.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !config}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Settings Saved & Broadcasted!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? "Broadcasting..." : "Save & Broadcast"}</span>
            </>
          )}
        </button>
      </div>

      {config && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Global Switches & Physics */}
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-5">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-pink-400" />
                Animation Switches & Particle Speed
              </h3>

              {/* Global Enable Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div>
                  <span className="text-sm font-medium text-white block">
                    Enable Animated Background Feature
                  </span>
                  <span className="text-xs text-zinc-400">
                    Master toggle for floating background particles across all clients.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    config.enabled ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                      config.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Color Picker Permission Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Pipette className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white block">
                      Allow User Custom Text Color Picker
                    </span>
                    <span className="text-xs text-zinc-400">
                      When enabled, users can select custom text colors in their settings.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, allowCustomColor: !config.allowCustomColor })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    config.allowCustomColor ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                      config.allowCustomColor ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Particle Density */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-300">
                    Particle Density (Count: {config.particleDensity})
                  </span>
                  <span className="font-mono text-pink-400">
                    {config.particleDensity} items
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="36"
                  step="2"
                  value={config.particleDensity}
                  onChange={(e) =>
                    setConfig({ ...config, particleDensity: Number(e.target.value) })
                  }
                  className="w-full accent-pink-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Floating Speed Multiplier */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-300">
                    Floating Speed Multiplier ({config.floatingSpeed}x)
                  </span>
                  <span className="font-mono text-pink-400">
                    {config.floatingSpeed}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={config.floatingSpeed}
                  onChange={(e) =>
                    setConfig({ ...config, floatingSpeed: Number(e.target.value) })
                  }
                  className="w-full accent-pink-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Custom Text Max Length */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-300">
                    Max Custom Text Character Limit
                  </span>
                  <span className="font-mono text-zinc-400">
                    {config.maxCustomTextLength} chars
                  </span>
                </div>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={config.maxCustomTextLength}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxCustomTextLength: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Default Emoji Tags */}
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Default Floating Emoji Palette
              </h3>
              <p className="text-xs text-zinc-400">
                Shown to users who have not configured custom floating text or emojis.
              </p>

              <div className="flex flex-wrap gap-2">
                {config.defaultEmojis.map((emoji) => (
                  <span
                    key={emoji}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-lg text-white"
                  >
                    <span>{emoji}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmoji(emoji)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Enter emoji (e.g. 🚀)"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-pink-500"
                />
                <button
                  type="button"
                  onClick={handleAddEmoji}
                  className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Prohibited Words Filter */}
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Moderation Filter: Prohibited Background Words
              </h3>
              <p className="text-xs text-zinc-400">
                Any custom text containing these words will be rejected in Chat Preferences.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {config.prohibitedWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProhibitedWord(word)}
                      className="text-red-400 hover:text-red-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add banned word (e.g. offensive)"
                  value={newProhibitedWord}
                  onChange={(e) => setNewProhibitedWord(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleAddProhibitedWord}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-red-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Block Word
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Realtime Canvas Simulation
            </h3>

            {/* Animated Canvas Simulation Box */}
            <div className="relative h-96 rounded-2xl border border-white/[0.08] bg-[#0b0f19] overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
              {/* Floating Emojis background simulation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {config.defaultEmojis.slice(0, config.particleDensity).map((emoji, idx) => (
                  <div
                    key={idx}
                    className="absolute text-xl select-none animate-bounce"
                    style={{
                      left: `${(idx * 17 + 8) % 85}%`,
                      top: `${(idx * 23 + 12) % 80}%`,
                      opacity: config.themeOpacity?.dark || 0.2,
                      animationDuration: `${3 / config.floatingSpeed + (idx % 2)}s`,
                      animationDelay: `${idx * 0.4}s`,
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>

              {/* Foreground Chat Simulator overlay */}
              <div className="relative z-10 space-y-3">
                <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.1] text-xs text-zinc-300 flex items-center justify-between">
                  <span>Chat Conversation</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {config.enabled ? "Animation ACTIVE" : "Disabled"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs max-w-[70%] ml-auto shadow-md">
                  Check out the subtle floating background behind this message!
                </div>
              </div>

              <div className="relative z-10 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/[0.1] text-[11px] text-zinc-400 flex justify-between">
                <span>Speed: {config.floatingSpeed}x</span>
                <span>Density: {config.particleDensity}</span>
                <span>Custom Color: {config.allowCustomColor ? "Allowed" : "Locked"}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400">
              💡 <span className="text-zinc-200">Instant Sync:</span> Both `chat-app-frontend` and `chat-app-mobile` listen to `animated_bg:updated` socket events and dynamically adjust their floating particle loop parameters without requiring app restarts.
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
