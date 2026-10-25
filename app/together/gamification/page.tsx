"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  adminApi,
  GameGamificationConfigItem,
  GameLevelConfig,
  GamificationVersionItem,
  PointTransactionItem,
  GamificationPairItem,
  GamificationUserItem,
} from "@/lib/api";
import {
  Trophy,
  Gamepad2,
  Sparkles,
  Zap,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  History,
  RotateCcw,
  Sliders,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Search,
  ChevronRight,
  TrendingUp,
  Settings2,
  Flame,
  Award,
  Copy,
  Check,
} from "lucide-react";

export default function GamificationPage() {
  const [configs, setConfigs] = useState<GameGamificationConfigItem[]>([]);
  const [activeVersion, setActiveVersion] = useState<number>(1);
  const [selectedGameId, setSelectedGameId] = useState<string>("tictactoe");
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Modals
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [publishChangelog, setPublishChangelog] = useState<string>("");
  const [showVersionsModal, setShowVersionsModal] = useState<boolean>(false);
  const [versions, setVersions] = useState<GamificationVersionItem[]>([]);
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);
  const [ledgerData, setLedgerData] = useState<PointTransactionItem[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState<number>(0);
  const [ledgerPage, setLedgerPage] = useState<number>(1);
  const [ledgerLoading, setLedgerLoading] = useState<boolean>(false);

  // Adjustment Modal & Pairs/Users Directory
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [adjustPairId, setAdjustPairId] = useState<string>("");
  const [adjustUserId, setAdjustUserId] = useState<string>("");
  const [adjustPoints, setAdjustPoints] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState<string>("Promotion bonus");
  const [pairsList, setPairsList] = useState<GamificationPairItem[]>([]);
  const [usersList, setUsersList] = useState<GamificationUserItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadPairsAndUsers = async () => {
    try {
      const data = await adminApi.getGamificationPairsAndUsers();
      if (data) {
        setPairsList(data.pairs || []);
        setUsersList(data.users || []);
        if (data.pairs?.length && !adjustPairId) {
          setAdjustPairId(data.pairs[0].pairId);
          setAdjustUserId(data.pairs[0].userA?._id || data.users[0]?._id || "");
        }
      }
    } catch (err) {
      console.error("Failed to load pairs & users:", err);
    }
  };

  const openAdjustModal = () => {
    loadPairsAndUsers();
    setShowAdjustModal(true);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getGamificationConfig();
      if (res && res.configs) {
        setConfigs(res.configs);
        setActiveVersion(res.activeVersion || 1);
        if (res.configs.length > 0 && !res.configs.some((g) => g.gameId === selectedGameId)) {
          setSelectedGameId(res.configs[0].gameId);
        }
      }
    } catch (err) {
      console.error("Failed to load gamification configs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeGame = configs.find((g) => g.gameId === selectedGameId) || configs[0];

  const activeLevelConfig: GameLevelConfig =
    activeGame?.levelConfigs?.find((l) => l.level === selectedLevel) ||
    activeGame?.levelConfigs?.[0] || {
      level: selectedLevel,
      title: `Level ${selectedLevel}`,
      timeSec: 30,
      gridConfig: {},
      courtyardLayout: {
        preset: "open_field",
        obstacles: [],
        catcherSpeed: 150,
        runnerSpeed: 160,
      },
      rewards: { participationPoints: 20, winBonusPoints: 50 },
    };

  const updateActiveGame = (updater: (prev: GameGamificationConfigItem) => GameGamificationConfigItem) => {
    if (!activeGame) return;
    const updated = updater(activeGame);
    setConfigs((prev) =>
      prev.map((g) => (g.gameId === updated.gameId ? updated : g))
    );
  };

  const updateActiveLevel = (updater: (prev: GameLevelConfig) => GameLevelConfig) => {
    if (!activeGame) return;
    const updatedLevel = updater(activeLevelConfig);
    const updatedLevels = (activeGame.levelConfigs || []).map((l) =>
      l.level === selectedLevel ? updatedLevel : l
    );
    // If level doesn't exist yet in array, push it
    if (!updatedLevels.some((l) => l.level === selectedLevel)) {
      updatedLevels.push(updatedLevel);
    }
    updateActiveGame((game) => ({
      ...game,
      levelConfigs: updatedLevels,
    }));
  };

  const handleSaveActiveGame = async () => {
    if (!activeGame) return;
    setSaving(true);
    try {
      await adminApi.updateGameGamification(activeGame.gameId, activeGame);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`Error saving game: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCurve = async () => {
    if (!activeGame) return;
    if (
      !confirm(
        `Are you sure you want to regenerate a balanced difficulty curve (Levels 1 to 20) for ${activeGame.title}? This will update timers, grid, and courtyard layouts.`
      )
    )
      return;

    try {
      setSaving(true);
      const newLevels = await adminApi.generateDifficultyCurve(
        activeGame.gameId,
        activeGame.levelConfigs?.[0]?.timeSec || 30
      );
      updateActiveGame((game) => ({
        ...game,
        levelConfigs: newLevels,
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`Error generating curve: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      const res = await adminApi.publishGamificationConfig(
        publishChangelog || "Updated gamification and level configs"
      );
      setActiveVersion(res.version);
      setShowPublishModal(false);
      setPublishChangelog("");
      alert(`Successfully published Version ${res.version}! All live game rooms now reflect this version.`);
    } catch (err: any) {
      alert(`Failed to publish: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openVersionsModal = async () => {
    setShowVersionsModal(true);
    try {
      const vers = await adminApi.getGamificationVersions();
      setVersions(vers);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRollback = async (v: number) => {
    if (!confirm(`Are you sure you want to rollback all configurations to Version ${v}?`)) return;
    try {
      setSaving(true);
      await adminApi.rollbackGamificationVersion(v);
      setShowVersionsModal(false);
      await loadData();
      alert(`Successfully rolled back to Version ${v}`);
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openLedgerModal = async (page = 1) => {
    setShowLedgerModal(true);
    setLedgerLoading(true);
    try {
      const data = await adminApi.getGamificationLedger({ page, limit: 20 });
      setLedgerData(data.transactions);
      setLedgerTotal(data.total);
      setLedgerPage(data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleManualAdjust = async () => {
    if (!adjustPairId || !adjustUserId) {
      alert("Please provide both Pair ID and User ID");
      return;
    }
    try {
      await adminApi.adjustPoints({
        pairId: adjustPairId,
        userId: adjustUserId,
        points: Number(adjustPoints),
        reason: adjustReason,
      });
      setShowAdjustModal(false);
      alert(`Successfully adjusted points by ${adjustPoints}!`);
      if (showLedgerModal) {
        openLedgerModal(1);
      }
    } catch (err: any) {
      alert(`Failed to adjust points: ${err.message}`);
    }
  };

  const handleAddObstacle = () => {
    const newObstacle = {
      x: 350,
      y: 250,
      w: 80,
      h: 40,
      type: "wall",
    };
    updateActiveLevel((lvl) => ({
      ...lvl,
      courtyardLayout: {
        ...lvl.courtyardLayout,
        obstacles: [...(lvl.courtyardLayout?.obstacles || []), newObstacle],
      },
    }));
  };

  const handleRemoveObstacle = (index: number) => {
    updateActiveLevel((lvl) => {
      const obs = [...(lvl.courtyardLayout?.obstacles || [])];
      obs.splice(index, 1);
      return {
        ...lvl,
        courtyardLayout: {
          ...lvl.courtyardLayout,
          obstacles: obs,
        },
      };
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Game Progression & Levels">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Together Games Progression & Difficulty Matrix"
      subtitle="Configure pair-bound unlocks, points rules, and Level 1–20 parameters (Time, Grid, & Courtyard Layouts)"
    >
      {/* Top Header Summary & Global Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Gamification Control Center</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Version {activeVersion}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {configs.length} Games Managed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Level ladders 1–20 are pair-bound. Changes apply immediately or can be published into snapshot versions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openAdjustModal}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Adjust Points
          </button>

          <button
            onClick={() => openLedgerModal(1)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            Points Ledger
          </button>

          <button
            onClick={openVersionsModal}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            Version History
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Publish Version
          </button>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin scrollbar-thumb-white/10">
        {configs.map((g) => {
          const isSelected = g.gameId === selectedGameId;
          return (
            <button
              key={g.gameId}
              onClick={() => setSelectedGameId(g.gameId)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10"
                  : "bg-slate-900/40 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Gamepad2 className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
              <span>{g.title}</span>
              {g.isStarter && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                  Starter
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeGame && (
        <div className="space-y-6">
          {/* Active Game Settings Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">{activeGame.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 capitalize">
                    {activeGame.category}
                  </span>
                  {activeGame.isStarter ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Starter Game (Unlocked by default)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Requires {activeGame.unlockRequirements?.pointsRequired || 0} Pair Points
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeGame.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateCurve}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
                  title="Auto-generates balanced time, grid, and courtyard configs for Levels 1 to 20"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Auto-Curve (1–20)
                </button>

                <button
                  onClick={handleSaveActiveGame}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  ) : saveSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Save className="w-4 h-4 text-white" />
                  )}
                  {saveSuccess ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>

            {/* General Game Rules & Unlock Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              {/* Starter & Status */}
              <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  Status & Starter Rule
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Game Enabled</span>
                  <input
                    type="checkbox"
                    checked={activeGame.enabled}
                    onChange={(e) =>
                      updateActiveGame((g) => ({ ...g, enabled: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-300 block">Default Starter Game</span>
                    <span className="text-[10px] text-slate-500">
                      First available game for all couples
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeGame.isStarter}
                    onChange={(e) =>
                      updateActiveGame((g) => ({ ...g, isStarter: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                </div>
              </div>

              {/* Base Match Rewards */}
              <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Base Point Rewards
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Participation Points</span>
                  <input
                    type="number"
                    value={activeGame.rules?.participationPoints ?? 20}
                    onChange={(e) =>
                      updateActiveGame((g) => ({
                        ...g,
                        rules: { ...g.rules, participationPoints: Number(e.target.value) },
                      }))
                    }
                    className="w-20 px-2 py-1 text-xs rounded bg-slate-900 border border-white/10 text-right text-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Win Bonus Points</span>
                  <input
                    type="number"
                    value={activeGame.rules?.winBonusPoints ?? 50}
                    onChange={(e) =>
                      updateActiveGame((g) => ({
                        ...g,
                        rules: { ...g.rules, winBonusPoints: Number(e.target.value) },
                      }))
                    }
                    className="w-20 px-2 py-1 text-xs rounded bg-slate-900 border border-white/10 text-right text-white"
                  />
                </div>
              </div>

              {/* Unlock Requirements */}
              <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Pair Unlock Prerequisites
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Points Required</span>
                  <input
                    type="number"
                    disabled={activeGame.isStarter}
                    value={activeGame.unlockRequirements?.pointsRequired ?? 0}
                    onChange={(e) =>
                      updateActiveGame((g) => ({
                        ...g,
                        unlockRequirements: {
                          ...g.unlockRequirements,
                          pointsRequired: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-24 px-2 py-1 text-xs rounded bg-slate-900 border border-white/10 text-right text-white disabled:opacity-40"
                  />
                </div>

                <div className="text-[11px] text-slate-400">
                  {activeGame.isStarter
                    ? "Starter game has no unlock requirements."
                    : activeGame.unlockRequirements?.requiredPreviousGames?.length
                    ? `Prereq: ${activeGame.unlockRequirements.requiredPreviousGames
                        .map((r) => `${r.gameId} (${r.minWins} wins)`)
                        .join(", ")}`
                    : "No specific previous game wins required."}
                </div>
              </div>
            </div>
          </div>

          {/* 20-Level Difficulty Ladder Selector */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Level Ladder (Levels 1 to 20)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Admin-managed time, grid, and courtyard layout per level for this game. Winning advances the pair to the next level.
                </p>
              </div>

              <div className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-semibold">
                Viewing Level {selectedLevel} of 20
              </div>
            </div>

            {/* Level Quick-Selector Tabs (1 to 20) */}
            <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 mb-6">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => {
                const isSelected = lvl === selectedLevel;
                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all text-center ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105"
                        : "bg-slate-800/60 text-slate-300 border-white/5 hover:bg-slate-700/80 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            {/* Selected Level Editor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Level Parameters: Time & Rewards */}
              <div className="bg-slate-800/40 border border-white/5 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Timer & Scaled Rewards (Level {selectedLevel})
                </h4>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Turn / Round Timer (Seconds)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={activeLevelConfig.timeSec ?? 30}
                    onChange={(e) =>
                      updateActiveLevel((l) => ({
                        ...l,
                        timeSec: Math.max(5, Number(e.target.value)),
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Lower timers increase fast-paced tension at higher levels.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      Participation Pts
                    </label>
                    <input
                      type="number"
                      value={activeLevelConfig.rewards?.participationPoints ?? 20}
                      onChange={(e) =>
                        updateActiveLevel((l) => ({
                          ...l,
                          rewards: {
                            ...l.rewards,
                            participationPoints: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      Win Bonus Pts
                    </label>
                    <input
                      type="number"
                      value={activeLevelConfig.rewards?.winBonusPoints ?? 50}
                      onChange={(e) =>
                        updateActiveLevel((l) => ({
                          ...l,
                          rewards: {
                            ...l.rewards,
                            winBonusPoints: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Game-Specific Grid Configuration */}
              <div className="bg-slate-800/40 border border-white/5 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Grid & Logic Sizing (Level {selectedLevel})
                </h4>

                {activeGame.gameId === "memory" ? (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Total Cards Count</label>
                    <select
                      value={activeLevelConfig.gridConfig?.cardsCount || 12}
                      onChange={(e) =>
                        updateActiveLevel((l) => ({
                          ...l,
                          gridConfig: {
                            cardsCount: Number(e.target.value),
                            pairsCount: Number(e.target.value) / 2,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-white/10 text-white"
                    >
                      <option value={12}>12 Cards (6 Pairs - Novice)</option>
                      <option value={16}>16 Cards (8 Pairs - Standard)</option>
                      <option value={20}>20 Cards (10 Pairs - Advanced)</option>
                      <option value={24}>24 Cards (12 Pairs - Master)</option>
                    </select>
                  </div>
                ) : activeGame.gameId === "rps" ? (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Match Best-of Rounds</label>
                    <select
                      value={activeLevelConfig.gridConfig?.bestOfRounds || 3}
                      onChange={(e) =>
                        updateActiveLevel((l) => ({
                          ...l,
                          gridConfig: { bestOfRounds: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-white/10 text-white"
                    >
                      <option value={3}>Best of 3 Rounds</option>
                      <option value={5}>Best of 5 Rounds</option>
                      <option value={7}>Best of 7 Rounds</option>
                      <option value={9}>Best of 9 Rounds</option>
                    </select>
                  </div>
                ) : activeGame.gameId === "quiz" ? (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Questions Count</label>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={activeLevelConfig.gridConfig?.questionsCount || 5}
                      onChange={(e) =>
                        updateActiveLevel((l) => ({
                          ...l,
                          gridConfig: { questionsCount: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-4">
                    Standard fixed grid format ({activeGame.title}). Difficulty scales primarily via Timer and Courtyard obstacles.
                  </div>
                )}
              </div>

              {/* Pakdam Pakdai Courtyard Layout Parameters */}
              <div className="bg-slate-800/40 border border-white/5 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Courtyard & Speed Tuning
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Runner Speed</label>
                    <input
                      type="number"
                      value={activeLevelConfig.courtyardLayout?.runnerSpeed ?? 160}
                      onChange={(e) =>
                        updateActiveLevel((l) => ({
                          ...l,
                          courtyardLayout: {
                            ...l.courtyardLayout,
                            runnerSpeed: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Catcher Speed</label>
                    <input
                      type="number"
                      value={activeLevelConfig.courtyardLayout?.catcherSpeed ?? 150}
                      onChange={(e) =>
                        updateActiveLevel((l) => ({
                          ...l,
                          courtyardLayout: {
                            ...l.courtyardLayout,
                            catcherSpeed: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Layout Preset</label>
                  <select
                    value={activeLevelConfig.courtyardLayout?.preset || "open_field"}
                    onChange={(e) =>
                      updateActiveLevel((l) => ({
                        ...l,
                        courtyardLayout: {
                          ...l.courtyardLayout,
                          preset: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-white/10 text-white capitalize"
                  >
                    <option value="open_field">Open Field / Garden</option>
                    <option value="cross_corridors">Cross Corridors</option>
                    <option value="maze_courtyard">Maze Courtyard</option>
                    <option value="fortress_citadel">Fortress Citadel</option>
                    <option value="grand_labyrinth">Grand Labyrinth</option>
                    <option value="custom">Custom Layout</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Courtyard Interactive Arena Preview & Obstacles Editor (for Pakdam Pakdai or Tag mode) */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    Courtyard Obstacle Grid & Arena Map (Level {selectedLevel})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Obstacles physically block players and bullets/tags inside the 800×600 arena.
                  </p>
                </div>

                <button
                  onClick={handleAddObstacle}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Obstacle
                </button>
              </div>

              {/* Arena Visual Preview (scaled 800x600 canvas) */}
              <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-slate-950 border-2 border-white/20 rounded-xl overflow-hidden shadow-2xl mb-6">
                {/* Arena Grid Lines */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Catcher spawn */}
                <div
                  className="absolute w-5 h-5 rounded-full bg-rose-500 border border-white flex items-center justify-center text-[8px] font-bold text-white shadow-lg shadow-rose-500/50"
                  style={{ left: `${(100 / 800) * 100}%`, top: `${(300 / 600) * 100}%` }}
                  title="Catcher Spawn (100, 300)"
                >
                  C
                </div>

                {/* Runner spawn */}
                <div
                  className="absolute w-5 h-5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] font-bold text-white shadow-lg shadow-emerald-500/50"
                  style={{ left: `${(700 / 800) * 100}%`, top: `${(300 / 600) * 100}%` }}
                  title="Runner Spawn (700, 300)"
                >
                  R
                </div>

                {/* Obstacles Rendering */}
                {(activeLevelConfig.courtyardLayout?.obstacles || []).map((obs, idx) => (
                  <div
                    key={idx}
                    className="absolute bg-gradient-to-br from-amber-600/80 to-amber-900/90 border border-amber-400/60 rounded-md shadow-lg flex items-center justify-center text-[9px] text-amber-200 font-mono font-bold select-none"
                    style={{
                      left: `${(obs.x / 800) * 100}%`,
                      top: `${(obs.y / 600) * 100}%`,
                      width: `${(obs.w / 800) * 100}%`,
                      height: `${(obs.h / 600) * 100}%`,
                    }}
                  >
                    #{idx + 1}
                  </div>
                ))}

                <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/10">
                  Arena Dimensions: 800 × 600 px | {activeLevelConfig.courtyardLayout?.obstacles?.length || 0} Obstacles
                </div>
              </div>

              {/* Obstacles Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">X</th>
                      <th className="py-2 px-3">Y</th>
                      <th className="py-2 px-3">Width</th>
                      <th className="py-2 px-3">Height</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200 font-mono">
                    {(activeLevelConfig.courtyardLayout?.obstacles || []).map((obs, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 font-sans font-bold text-amber-400">#{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={obs.type || "wall"}
                            onChange={(e) => {
                              const newObs = [...(activeLevelConfig.courtyardLayout?.obstacles || [])];
                              newObs[idx].type = e.target.value;
                              updateActiveLevel((l) => ({
                                ...l,
                                courtyardLayout: { ...l.courtyardLayout, obstacles: newObs },
                              }));
                            }}
                            className="w-20 px-2 py-1 rounded bg-slate-900 border border-white/10 text-white font-sans text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={obs.x}
                            onChange={(e) => {
                              const newObs = [...(activeLevelConfig.courtyardLayout?.obstacles || [])];
                              newObs[idx].x = Number(e.target.value);
                              updateActiveLevel((l) => ({
                                ...l,
                                courtyardLayout: { ...l.courtyardLayout, obstacles: newObs },
                              }));
                            }}
                            className="w-16 px-2 py-1 rounded bg-slate-900 border border-white/10 text-white text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={obs.y}
                            onChange={(e) => {
                              const newObs = [...(activeLevelConfig.courtyardLayout?.obstacles || [])];
                              newObs[idx].y = Number(e.target.value);
                              updateActiveLevel((l) => ({
                                ...l,
                                courtyardLayout: { ...l.courtyardLayout, obstacles: newObs },
                              }));
                            }}
                            className="w-16 px-2 py-1 rounded bg-slate-900 border border-white/10 text-white text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={obs.w}
                            onChange={(e) => {
                              const newObs = [...(activeLevelConfig.courtyardLayout?.obstacles || [])];
                              newObs[idx].w = Number(e.target.value);
                              updateActiveLevel((l) => ({
                                ...l,
                                courtyardLayout: { ...l.courtyardLayout, obstacles: newObs },
                              }));
                            }}
                            className="w-16 px-2 py-1 rounded bg-slate-900 border border-white/10 text-white text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={obs.h}
                            onChange={(e) => {
                              const newObs = [...(activeLevelConfig.courtyardLayout?.obstacles || [])];
                              newObs[idx].h = Number(e.target.value);
                              updateActiveLevel((l) => ({
                                ...l,
                                courtyardLayout: { ...l.courtyardLayout, obstacles: newObs },
                              }));
                            }}
                            className="w-16 px-2 py-1 rounded bg-slate-900 border border-white/10 text-white text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => handleRemoveObstacle(idx)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Version Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Publish New Gamification Version
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Freezes an immutable snapshot of all 7 games and their 20 level difficulty matrices. All active game sessions will immediately use this published version.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Changelog / Notes</label>
                <textarea
                  rows={3}
                  value={publishChangelog}
                  onChange={(e) => setPublishChangelog(e.target.value)}
                  placeholder="e.g. Tuned Level 1-20 Pakdam Pakdai obstacles and reduced Connect 4 turn timers..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 text-white text-xs font-bold"
              >
                {saving ? "Publishing..." : "Confirm & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                Gamification Version History
              </h3>
              <button
                onClick={() => setShowVersionsModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {versions.map((ver) => {
                const isActive = ver.version === activeVersion;
                return (
                  <div
                    key={ver.version}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      isActive
                        ? "bg-amber-500/10 border-amber-500/40"
                        : "bg-slate-800/40 border-white/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Version {ver.version}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            Active
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          by {ver.publishedBy} • {new Date(ver.publishedAt || "").toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{ver.changelog || "No changelog notes"}</p>
                    </div>

                    {!isActive && (
                      <button
                        onClick={() => handleRollback(ver.version)}
                        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-amber-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Rollback
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Points Audit Ledger Modal */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-4xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Points Transaction Ledger (Audit Trail)
                </h3>
                <p className="text-xs text-slate-400">
                  Immutable record of participation points, win bonuses, and level-up awards.
                </p>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {ledgerLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400" />
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 border-b border-white/10 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Pair Name & ID</th>
                      <th className="py-2.5 px-3">User & ID</th>
                      <th className="py-2.5 px-3">Game</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">IDs</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-sans">
                    {ledgerData.map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()}{" "}
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white max-w-[150px] truncate" title={tx.pairNames || tx.pairId}>
                              👫 {tx.pairNames || "Pair"}
                            </span>
                            <button
                              onClick={() => handleCopyId(tx.pairId)}
                              title={`Copy Pair ID: ${tx.pairId}`}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                            >
                              {copiedId === tx.pairId ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[140px]">
                            {tx.pairId}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white max-w-[120px] truncate" title={tx.userName || tx.userId}>
                              👤 {tx.userName || tx.userId}
                            </span>
                            <button
                              onClick={() => handleCopyId(tx.userId)}
                              title={`Copy User ID: ${tx.userId}`}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                            >
                              {copiedId === tx.userId ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[110px]">
                            {tx.userId}
                          </span>
                        </td>
                        <td className="py-2 px-3 capitalize">{tx.gameId}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === "win_bonus"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : tx.type === "admin_adjustment"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono">Lvl {tx.levelAtMatch}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyId(tx.transactionId)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1 font-mono transition"
                              title={`Copy Tx ID: ${tx.transactionId}`}
                            >
                              {copiedId === tx.transactionId ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              <span>Tx</span>
                            </button>
                            <button
                              onClick={() => handleCopyId(tx.matchId)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1 font-mono transition"
                              title={`Copy Match ID: ${tx.matchId}`}
                            >
                              {copiedId === tx.matchId ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              <span>Match</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-400 font-mono">
                          {tx.points > 0 ? `+${tx.points}` : tx.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Point Adjustment Modal with Dropdowns & Copy Options */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Manual Point Adjustment
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Select an existing user pair and member to award or deduct progression points with audit logging.
            </p>

            <div className="space-y-4 mb-6">
              {/* Pair Selection Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>1. Select User Pair</span>
                    <span className="text-[10px] text-slate-400 font-normal">({pairsList.length} pairs available)</span>
                  </label>
                  {adjustPairId && (
                    <button
                      type="button"
                      onClick={() => handleCopyId(adjustPairId)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition"
                      title="Copy selected Pair ID"
                    >
                      {copiedId === adjustPairId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>Copy Pair ID</span>
                    </button>
                  )}
                </div>

                <select
                  value={adjustPairId}
                  onChange={(e) => {
                    const newPairId = e.target.value;
                    setAdjustPairId(newPairId);
                    const selectedPair = pairsList.find((p) => p.pairId === newPairId);
                    if (selectedPair?.userA?._id) {
                      setAdjustUserId(selectedPair.userA._id);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose a Couple Pair --</option>
                  {pairsList.map((pair) => (
                    <option key={pair.pairId} value={pair.pairId}>
                      {pair.displayName} • {pair.totalPoints} pts (Streak: {pair.currentStreak})
                    </option>
                  ))}
                </select>

                {adjustPairId && (
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/5">
                    <span className="text-slate-500">Pair ID:</span>
                    <span className="text-slate-300 truncate flex-1">{adjustPairId}</span>
                  </div>
                )}
              </div>

              {/* Target User Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    2. Target User (Credit/Debit Recipient)
                  </label>
                  {adjustUserId && (
                    <button
                      type="button"
                      onClick={() => handleCopyId(adjustUserId)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition"
                      title="Copy selected User ID"
                    >
                      {copiedId === adjustUserId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>Copy User ID</span>
                    </button>
                  )}
                </div>

                <select
                  value={adjustUserId}
                  onChange={(e) => setAdjustUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose User --</option>
                  {(() => {
                    const selPair = pairsList.find((p) => p.pairId === adjustPairId);
                    if (selPair) {
                      return (
                        <>
                          <optgroup label="Members of Selected Pair">
                            {selPair.userA?._id && (
                              <option value={selPair.userA._id}>
                                {selPair.userA.name} (@{selPair.userA.username})
                              </option>
                            )}
                            {selPair.userB?._id && (
                              <option value={selPair.userB._id}>
                                {selPair.userB.name} (@{selPair.userB.username})
                              </option>
                            )}
                          </optgroup>
                          <optgroup label="All Registered Users">
                            {usersList
                              .filter((u) => u._id !== selPair.userA?._id && u._id !== selPair.userB?._id)
                              .map((u) => (
                                <option key={u._id} value={u._id}>
                                  {u.name} (@{u.username})
                                </option>
                              ))}
                          </optgroup>
                        </>
                      );
                    }
                    return usersList.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} (@{u.username})
                      </option>
                    ));
                  })()}
                </select>

                {adjustUserId && (
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/5">
                    <span className="text-slate-500">User ID:</span>
                    <span className="text-slate-300 truncate flex-1">{adjustUserId}</span>
                  </div>
                )}
              </div>

              {/* Points Delta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                    Points Delta (+ or -)
                  </label>
                  <input
                    type="number"
                    value={adjustPoints}
                    onChange={(e) => setAdjustPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    placeholder="e.g. 50 or -20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                    Quick Preset
                  </label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[25, 50, 100, 250].map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setAdjustPoints(pt)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                          adjustPoints === pt
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        +{pt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Reason / Notes for Audit
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Compensation bonus, promotional event reward"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAdjust}
                disabled={!adjustPairId || !adjustUserId}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
                  !adjustPairId || !adjustUserId
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                }`}
              >
                <Zap size={13} />
                <span>Apply Point Adjustment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
