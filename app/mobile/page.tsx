"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi, MobileAppConfig } from "@/lib/api";
import {
  Smartphone,
  Save,
  CheckCircle2,
  Lock,
  Bell,
  Download,
  AlertTriangle,
  Send,
} from "lucide-react";

export default function MobilePage() {
  const [config, setConfig] = useState<MobileAppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testPushTitle, setTestPushTitle] = useState("");
  const [testPushBody, setTestPushBody] = useState("");
  const [pushSent, setPushSent] = useState(false);

  const loadConfig = async () => {
    try {
      const data = await adminApi.getConfig<MobileAppConfig>("mobile_app");
      if (data) setConfig(data);
    } catch (err) {
      console.error("Failed to load mobile_app config:", err);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleTimeoutToggle = (timeout: string) => {
    if (!config) return;
    const exists = config.appLockPolicy.allowedTimeouts.includes(timeout);
    const updated = exists
      ? config.appLockPolicy.allowedTimeouts.filter((t) => t !== timeout)
      : [...config.appLockPolicy.allowedTimeouts, timeout];

    setConfig({
      ...config,
      appLockPolicy: {
        ...config.appLockPolicy,
        allowedTimeouts: updated,
      },
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await adminApi.updateConfig("mobile_app", config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to save mobile app configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestPush = () => {
    if (!testPushTitle || !testPushBody) return;
    setPushSent(true);
    setTimeout(() => {
      setPushSent(false);
      setTestPushTitle("");
      setTestPushBody("");
    }, 3000);
  };

  return (
    <AdminLayout
      title="Mobile Application Management"
      subtitle="Enforce minimum app versions, App Lock PIN policies, and manage push notifications"
      onRefresh={loadConfig}
    >
      {/* Top Banner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Expo & Native App Policies</h2>
            <p className="text-xs text-zinc-400">
              Configure SemVer minimum gates and native security rules for the React Native mobile client.
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
              <span>Policies Published!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? "Publishing..." : "Publish Policies"}</span>
            </>
          )}
        </button>
      </div>

      {config && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Versioning & Force Update */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-400" />
              App Versioning & Force Update Gate
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Min Supported Version (SemVer)
                </label>
                <input
                  type="text"
                  value={config.minSupportedVersion}
                  onChange={(e) =>
                    setConfig({ ...config, minSupportedVersion: e.target.value })
                  }
                  placeholder="1.0.0"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Latest Version in Store
                </label>
                <input
                  type="text"
                  value={config.latestVersion}
                  onChange={(e) =>
                    setConfig({ ...config, latestVersion: e.target.value })
                  }
                  placeholder="1.0.1"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Force Update Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div>
                <span className="text-sm font-medium text-white block">
                  Enforce Force-Update Dialog
                </span>
                <span className="text-xs text-zinc-400">
                  Block users on older versions from proceeding until updated.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    forceUpdateEnabled: !config.forceUpdateEnabled,
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  config.forceUpdateEnabled ? "bg-purple-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                    config.forceUpdateEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Store Links */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Google Play Store URL
                </label>
                <input
                  type="text"
                  value={config.playStoreUrl}
                  onChange={(e) =>
                    setConfig({ ...config, playStoreUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Apple App Store URL
                </label>
                <input
                  type="text"
                  value={config.appStoreUrl}
                  onChange={(e) =>
                    setConfig({ ...config, appStoreUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* App Lock PIN & Security Policies */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              App Lock PIN Security & Timeout Policy
            </h3>

            {/* Enforced PIN Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div>
                <span className="text-sm font-medium text-white block">
                  Mandatory App Lock PIN
                </span>
                <span className="text-xs text-zinc-400">
                  Force all mobile users to configure a security PIN upon login.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    appLockPolicy: {
                      ...config.appLockPolicy,
                      enforced: !config.appLockPolicy.enforced,
                    },
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  config.appLockPolicy.enforced ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                    config.appLockPolicy.enforced ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Allowed Auto-Lock Timeouts */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Allowed Auto-Lock Inactivity Timeouts
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["immediate", "1m", "5m", "15m", "30m", "never"].map((t) => {
                  const isChecked = config.appLockPolicy.allowedTimeouts.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTimeoutToggle(t)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono transition-all border ${
                        isChecked
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-white/[0.02] text-zinc-500 border-white/[0.06] hover:bg-white/[0.05]"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Push Notification Broadcast Tool */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                Broadcast Push Notification to Mobile Users
              </h4>

              <input
                type="text"
                placeholder="Notification Title (e.g. Chugli Update)"
                value={testPushTitle}
                onChange={(e) => setTestPushTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-indigo-500"
              />

              <textarea
                placeholder="Notification Message body..."
                rows={2}
                value={testPushBody}
                onChange={(e) => setTestPushBody(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={handleSendTestPush}
                disabled={!testPushTitle || !testPushBody}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {pushSent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Push Broadcast Sent!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Broadcast Push</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
