"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminApi, TogetherGameItem, CoupleActivityItem } from "@/lib/api";
import {
  Gamepad2,
  Heart,
  Save,
  CheckCircle2,
  Users,
  Trophy,
} from "lucide-react";

export default function TogetherPage() {
  const [games, setGames] = useState<Record<string, TogetherGameItem>>({});
  const [activities, setActivities] = useState<Record<string, CoupleActivityItem>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [gamesData, activitiesData] = await Promise.all([
        adminApi.getConfig<Record<string, TogetherGameItem>>("together_games"),
        adminApi.getConfig<Record<string, CoupleActivityItem>>("couple_activities"),
      ]);
      if (gamesData) setGames(gamesData);
      if (activitiesData) setActivities(activitiesData);
    } catch (err) {
      console.error("Failed to load Together module data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGameToggle = (gameId: string) => {
    setGames((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        enabled: !prev[gameId].enabled,
      },
    }));
  };

  const handleActivityToggle = (actId: string) => {
    setActivities((prev) => ({
      ...prev,
      [actId]: {
        ...prev[actId],
        enabled: !prev[actId].enabled,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        adminApi.updateConfig("together_games", games),
        adminApi.updateConfig("couple_activities", activities),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to save Together module configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Together Hub & Games Management"
      subtitle="Configure multiplayer games, player limits, and couple activity question sets"
      onRefresh={loadData}
    >
      {/* Top Banner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Together Ecosystem Switchboard</h2>
            <p className="text-xs text-zinc-400">
              Enable or disable specific multiplayer games or couple activities across Web & Mobile.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Together Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? "Broadcasting..." : "Save & Broadcast"}</span>
            </>
          )}
        </button>
      </div>

      {/* 7 Multiplayer Games Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Active Multiplayer Games (7 Total)
          </h3>
          <span className="text-xs text-zinc-400">
            {Object.values(games).filter((g) => g.enabled).length} of{" "}
            {Object.keys(games).length} Games Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(games).map(([id, game]) => (
            <div
              key={id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                game.enabled
                  ? "border-amber-500/30 bg-amber-950/10"
                  : "border-white/[0.06] opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {game.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 capitalize">
                      {game.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>
                      {game.minPlayers} to {game.maxPlayers} Players
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleGameToggle(id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    game.enabled ? "bg-amber-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                      game.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                <span>Display Order:</span>
                <span className="font-mono text-zinc-200 font-bold">#{game.order}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Couple Activities Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            Couple Activities & Question Packs (4 Total)
          </h3>
          <span className="text-xs text-zinc-400">
            {Object.values(activities).filter((a) => a.enabled).length} of{" "}
            {Object.keys(activities).length} Packs Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(activities).map(([id, act]) => (
            <div
              key={id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                act.enabled
                  ? "border-pink-500/30 bg-pink-950/10"
                  : "border-white/[0.06] opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="font-semibold text-white text-sm block">
                    {act.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 mt-1 inline-block capitalize">
                    {act.category} pack
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleActivityToggle(id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    act.enabled ? "bg-pink-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                      act.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                <span>Questions in pack:</span>
                <span className="font-mono text-zinc-200">{act.totalQuestions} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
