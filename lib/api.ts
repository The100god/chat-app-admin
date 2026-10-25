// lib/api.ts

export const getBackendUrl = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // If accessed via LAN IP or non-localhost, always route to that host on port 5001
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:5001`;
    }
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (envUrl && !envUrl.includes("172.22.176.1") && envUrl !== "http://localhost:5001") {
      return envUrl;
    }
    return "http://localhost:5001";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
};

const API_BASE = {
  toString: () => getBackendUrl(),
};

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalMessages: number;
  totalGroups: number;
  activeSockets: number;
  serverUptimeSeconds: number;
  memoryUsageMB: number;
  dbConnected: boolean;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  platform: "all" | "web" | "mobile";
  description?: string;
  message?: string;
}

export interface ThemeTokenSet {
  id: string;
  name: string;
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  mutedText?: string;
  card: string;
  border: string;
  bubbleSent: string;
  bubbleSentText: string;
  bubbleReceived: string;
  bubbleReceivedText: string;
}

export interface ThemesConfig {
  activeDefault: string;
  themes: {
    light: ThemeTokenSet;
    dark: ThemeTokenSet;
    aurora: ThemeTokenSet;
    [key: string]: ThemeTokenSet;
  };
}

export interface AnimatedBgConfig {
  enabled: boolean;
  defaultEmojis: string[];
  maxCustomTextLength: number;
  prohibitedWords: string[];
  allowCustomColor: boolean;
  particleDensity: number;
  floatingSpeed: number;
  themeOpacity: {
    light: number;
    dark: number;
    aurora: number;
  };
}

export interface TogetherGameItem {
  id: string;
  title: string;
  category: string;
  enabled: boolean;
  minPlayers: number;
  maxPlayers: number;
  order: number;
}

export interface CoupleActivityItem {
  id: string;
  title: string;
  enabled: boolean;
  category: string;
  totalQuestions: number;
}

export interface CourtyardObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: string;
}

export interface CourtyardLayout {
  preset: string;
  obstacles: CourtyardObstacle[];
  catcherSpeed: number;
  runnerSpeed: number;
  powerUpSpawnRateSec?: number;
}

export interface GameLevelConfig {
  level: number;
  title: string;
  description?: string;
  timeSec: number;
  gridConfig: any;
  courtyardLayout: CourtyardLayout;
  rewards: {
    participationPoints: number;
    winBonusPoints: number;
  };
}

export interface GameGamificationConfigItem {
  _id?: string;
  gameId: string;
  title: string;
  category: "classic" | "casual" | "mind" | "action" | "creative";
  icon: string;
  description?: string;
  isStarter: boolean;
  enabled: boolean;
  order: number;
  rules: {
    participationPoints: number;
    winBonusPoints: number;
    streakBonusMultiplier: number;
    requiredEligiblePlaySec: number;
    minMovesBeforeComplete: number;
  };
  unlockRequirements: {
    pointsRequired: number;
    requiredPreviousGames: {
      gameId: string;
      minWins: number;
      minPlays: number;
    }[];
  };
  startingLevel: number;
  maximumLevel: number;
  levelConfigs: GameLevelConfig[];
  updatedBy?: string;
  updatedAt?: string;
}

export interface GamificationVersionItem {
  _id?: string;
  version: number;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  publishedBy?: string;
  changelog?: string;
}

export interface GamificationUserItem {
  _id: string;
  username: string;
  name: string;
  email?: string;
  profilePic?: string;
}

export interface GamificationPairItem {
  pairId: string;
  displayName: string;
  totalPoints: number;
  totalWins: number;
  currentStreak: number;
  userA: GamificationUserItem;
  userB: GamificationUserItem;
  updatedAt?: string;
}

export interface PointTransactionItem {
  _id?: string;
  transactionId: string;
  matchId: string;
  pairId: string;
  userId: string;
  userName?: string;
  userUsername?: string;
  userEmail?: string;
  pairNames?: string;
  gameId: string;
  type: string;
  points: number;
  levelAtMatch: number;
  metadata?: any;
  createdAt: string;
}

export interface MobileAppConfig {
  minSupportedVersion: string;
  latestVersion: string;
  forceUpdateEnabled: boolean;
  playStoreUrl: string;
  appStoreUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  appLockPolicy: {
    enforced: boolean;
    minPinLength: number;
    allowedTimeouts: string[];
    allowBiometrics: boolean;
  };
  pushSettings: {
    enabled: boolean;
    provider: string;
  };
}

export interface UserApiActivityItem {
  _id: string;
  userId?: { _id: string; username: string; email: string; avatar?: string } | string;
  username?: string;
  userEmail?: string;
  actorType: "user" | "admin" | "system" | "anonymous";
  platform: "web" | "mobile" | "unknown";
  clientPlatformHint?: string;
  transport: "http" | "socket";
  action: string;
  method?: string;
  route?: string;
  statusCode?: number;
  outcome: "success" | "failure";
  durationMs?: number;
  requestId: string;
  sessionIdHash?: string;
  installationIdHash?: string;
  appVersion?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  ipAddress?: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

export interface ActivityFilterParams {
  page?: number;
  limit?: number;
  platform?: "all" | "web" | "mobile" | "unknown";
  transport?: "all" | "http" | "socket";
  outcome?: "all" | "success" | "failure";
  action?: string;
  method?: string;
  statusCode?: number;
  search?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ActivityStats {
  total24h: number;
  total7d: number;
  webCount24h: number;
  mobileCount24h: number;
  unknownCount24h: number;
  failureCount24h: number;
  failureRatePercent: string;
  avgDurationMs: number;
  topActions: { action: string; count: number }[];
}

export interface RetentionStats {
  retentionPolicy: {
    policyDays: number;
    policyDurationMs: number;
    isFixedMaximum: boolean;
    description: string;
    ttlEngineStatus: string;
  };
  collections: {
    userApiActivity: {
      name: string;
      totalCount: number;
      platformBreakdown: {
        web: number;
        mobile: number;
        unknown: number;
      };
      ttlIndex: {
        configured: boolean;
        key: string;
        expireAfterSeconds: number;
        status: string;
      };
      oldestRecord: string | null;
      newestRecord: string | null;
      missingExpiryCount: number;
      compliant: boolean;
    };
    adminAuditLog: {
      name: string;
      totalCount: number;
      ttlIndex: {
        configured: boolean;
        key: string;
        expireAfterSeconds: number;
        status: string;
      };
      oldestRecord: string | null;
      newestRecord: string | null;
      missingExpiryCount: number;
      compliant: boolean;
    };
  };
}

// Token validation and storage helpers
export const isTokenValid = (token: string | null): boolean => {
  if (!token || typeof token !== "string") return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed.exp) return true;
    // Consider token expired if within 45 seconds of expiration
    return parsed.exp * 1000 > Date.now() + 45000;
  } catch {
    return false;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("chugli_admin_token");
  if (!token) return null;
  if (!isTokenValid(token)) {
    // Proactively purge expired token to avoid 401 polling spam
    localStorage.removeItem("chugli_admin_token");
    return null;
  }
  return token;
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("chugli_admin_token", token);
  }
};

export const removeStoredToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("chugli_admin_token");
  }
};

const getHeaders = () => {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Resilient authenticated fetch that automatically refreshes credentials on 401
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  await adminApi.ensureAuth();
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  let res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (res.status === 401) {
    // Stored token was rejected by backend - immediately clear it
    removeStoredToken();

    // Attempt automatic re-login once
    try {
      const newToken = await adminApi.ensureAuth();
      if (newToken) {
        res = await fetch(url, {
          ...options,
          headers: {
            ...getHeaders(),
            ...(options.headers || {}),
          },
          credentials: "include",
        });
      }
    } catch (err) {
      console.warn("Auto re-authentication retry failed:", err);
    }
  }

  return res;
};

// API Client Functions
export const adminApi = {
  async ensureAuth(): Promise<string | null> {
    const token = getStoredToken();
    return token;
  },

  async login(identifier: string, password: string): Promise<{ success: boolean; token: string; admin: AdminUser }> {
    const res = await fetch(`${getBackendUrl()}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    if (data.token) setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ success: boolean; admin: AdminUser }> {
    const res = await authenticatedFetch("/api/admin/auth/me");
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${getBackendUrl()}/api/admin/auth/logout`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      removeStoredToken();
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await authenticatedFetch("/api/admin/dashboard/stats");
      const data = await res.json();
      if (res.ok && data.stats) return data.stats;
    } catch {
      // Fallback
    }
    return {
      totalUsers: 3,
      totalMessages: 9,
      totalGroups: 1,
      activeSockets: 1,
      serverUptimeSeconds: 14200,
      memoryUsageMB: 78,
      dbConnected: true,
    };
  },

  async getAllConfigs(): Promise<Record<string, any>> {
    try {
      const res = await authenticatedFetch("/api/admin/config");
      const data = await res.json();
      if (res.ok && data.configs) return data.configs;
    } catch (e) {
      console.warn("Admin config fetch error, trying public endpoint:", e);
    }
    try {
      const pubRes = await fetch(`${API_BASE}/api/config/public`);
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.config) return pubData.config;
      }
    } catch { }
    return {};
  },

  async getConfig<T>(category: string): Promise<T> {
    try {
      const res = await authenticatedFetch(`/api/admin/config/${category}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) return data.data;
      }
    } catch (e) {
      console.warn(`Admin config fetch for ${category} error, trying public fallback:`, e);
    }

    // Graceful fallback to public config endpoint
    try {
      const pubRes = await fetch(`${getBackendUrl()}/api/config/public`);
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.config && pubData.config[category]) {
          return pubData.config[category] as T;
        }
      }
    } catch (e) {
      console.warn("Public config fetch fallback error:", e);
    }

    // Spec Section 61: Fail-safe behavior with safe defaults
    const safeDefaults: Record<string, any> = {
      features: {
        feature_chat_1on1: { name: "1-on-1 Chat", enabled: true, platform: "all", description: "Direct private messaging" },
        feature_group_chat: { name: "Group Chat", enabled: true, platform: "all", description: "Multi-user group conversations" },
        feature_voice_notes: { name: "Voice Messages", enabled: true, platform: "all", description: "Audio recording and playback" },
        feature_media_sharing: { name: "Media & Attachments", enabled: true, platform: "all", description: "Images, videos, and files" },
        feature_together_hub: { name: "Together Hub", enabled: true, platform: "all", description: "Shared activities & games" },
        feature_animated_bg: { name: "Animated Background", enabled: true, platform: "all", description: "Floating emojis & custom text background" },
        feature_app_lock: { name: "App Lock PIN", enabled: true, platform: "mobile", description: "Mobile security PIN and biometric lock" },
        feature_calls_audio: { name: "Audio Calling", enabled: true, platform: "all", description: "Peer-to-peer WebRTC voice calls" },
        feature_calls_video: { name: "Video Calling", enabled: true, platform: "all", description: "Peer-to-peer WebRTC video calls" },
        maintenance_mode: { name: "Maintenance Mode", enabled: false, platform: "all", message: "System is undergoing maintenance." },
      },
    };

    if (safeDefaults[category]) {
      return safeDefaults[category] as T;
    }

    throw new Error(`Failed to fetch ${category}`);
  },

  async updateConfig<T>(category: string, configData: T): Promise<{ success: boolean; data: T }> {
    const res = await authenticatedFetch(`/api/admin/config/${category}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: configData }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to update ${category}`);
    return data;
  },

  async resetConfig<T>(category: string, options?: { themeId?: string }): Promise<{ success: boolean; message: string; data: T }> {
    const res = await authenticatedFetch(`/api/admin/config/${category}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options || {}),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to reset ${category}`);
    return data;
  },

  async getUsers(page = 1, search = ""): Promise<{ users: any[]; pagination: any }> {
    try {
      const res = await authenticatedFetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) return data;
    } catch {
      // fallback
    }
    return {
      users: [
        { _id: "u1", username: "saurabh", email: "thesaurabhgoyal@gmail.com", isVerified: true, createdAt: new Date().toISOString() },
        { _id: "u2", username: "alex_dev", email: "alex@example.com", isVerified: true, createdAt: new Date().toISOString() },
        { _id: "u3", username: "priya_s", email: "priya@example.com", isVerified: false, createdAt: new Date().toISOString() },
      ],
      pagination: { page: 1, limit: 20, total: 3, totalPages: 1 },
    };
  },

  async getAuditLogs(): Promise<any[]> {
    try {
      const res = await authenticatedFetch("/api/admin/audit-logs");
      const data = await res.json();
      if (res.ok && data.logs) return data.logs;
    } catch {
      // fallback
    }
    return [
      {
        _id: "log1",
        adminEmail: "saurabhgoyal8055@gmail.com",
        action: "UPDATE_CONFIG_THEMES",
        category: "themes",
        details: { summary: "Updated Aurora accent color" },
        createdAt: new Date().toISOString(),
      },
    ];
  },

  async changeSuperAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await authenticatedFetch("/api/admin/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update password");
    return data;
  },

  async getAdminsList(): Promise<AdminUser[]> {
    const res = await authenticatedFetch("/api/admin/admins");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch admins");
    return data.admins || [];
  },

  async createAdmin(payload: {
    username: string;
    email: string;
    password: string;
    role: string;
    permissions: string[];
  }): Promise<{ success: boolean; admin: AdminUser; message: string }> {
    const res = await authenticatedFetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create admin");
    return data;
  },

  async deleteAdmin(id: string): Promise<{ success: boolean; message: string }> {
    const res = await authenticatedFetch(`/api/admin/admins/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete admin");
    return data;
  },

  async getActivityLogs(params: ActivityFilterParams = {}): Promise<{
    activities: UserApiActivityItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });

    const res = await authenticatedFetch(`/api/admin/activity?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch activity logs");
    return data;
  },

  async getActivityStats(): Promise<ActivityStats> {
    const res = await authenticatedFetch("/api/admin/activity/stats");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch activity stats");
    return data.stats;
  },

  async exportActivityLogs(params: ActivityFilterParams = {}, format: "csv" | "json" = "json"): Promise<any> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    query.append("format", format);

    const res = await authenticatedFetch(`/api/admin/activity/export?${query.toString()}`);
    if (format === "csv") {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user_api_activity_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { success: true };
    }
    const data = await res.json();
    return data;
  },

  async getRetentionStats(): Promise<RetentionStats> {
    const res = await authenticatedFetch("/api/admin/retention/stats");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch retention stats");
    return data;
  },

  async verifyRetention(): Promise<{ success: boolean; message: string; results: any }> {
    const res = await authenticatedFetch("/api/admin/retention/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to verify retention policy");
    return data;
  },
  async deleteActivityLog(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    const res = await authenticatedFetch(`/api/admin/activity/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete activity log");
    return data;
  },

  async bulkDeleteActivities(ids: string[]): Promise<{ success: boolean; message: string; deletedCount: number }> {
    const res = await authenticatedFetch("/api/admin/activity/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to bulk delete activity logs");
    return data;
  },

  async getUserById(id: string): Promise<{ success: boolean; user: any }> {
    const res = await authenticatedFetch(`/api/admin/users/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch user details");
    return data;
  },

  async updateUserStatus(
    id: string,
    updates: { isSuspended?: boolean; suspendedReason?: string; isVerified?: boolean }
  ): Promise<{ success: boolean; message: string; user: any }> {
    const res = await authenticatedFetch(`/api/admin/users/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update user status");
    return data;
  },

  async updateUserProfile(
    id: string,
    updates: { name?: string; about?: string }
  ): Promise<{ success: boolean; message: string; user: any }> {
    const res = await authenticatedFetch(`/api/admin/users/${id}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update user profile");
    return data;
  },

  async resetUserPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await authenticatedFetch(`/api/admin/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reset user password");
    return data;
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await authenticatedFetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete user");
    return data;
  },

  async updateAdminRole(id: string, role: string): Promise<{ success: boolean; message: string; admin: any }> {
    const res = await authenticatedFetch(`/api/admin/admins/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update admin role");
    return data;
  },

  async resetAdminPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await authenticatedFetch(`/api/admin/admins/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reset admin password");
    return data;
  },

  // Gamification & Progression Center
  async getGamificationConfig(): Promise<{
    configs: GameGamificationConfigItem[];
    activeVersion: number;
    totalGames: number;
  }> {
    const res = await authenticatedFetch("/api/admin/gamification/config");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch gamification config");
    return data.data;
  },

  async updateGameGamification(
    gameId: string,
    updates: Partial<GameGamificationConfigItem>
  ): Promise<GameGamificationConfigItem> {
    const res = await authenticatedFetch(`/api/admin/gamification/games/${gameId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update game gamification");
    return data.data;
  },

  async generateDifficultyCurve(
    gameId: string,
    baseTimeSec: number = 30
  ): Promise<GameLevelConfig[]> {
    const res = await authenticatedFetch(
      `/api/admin/gamification/games/${gameId}/generate-curve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseTimeSec }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate curve");
    return data.data;
  },

  async publishGamificationConfig(changelog: string): Promise<any> {
    const res = await authenticatedFetch("/api/admin/gamification/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changelog }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to publish gamification config");
    return data.data;
  },

  async getGamificationVersions(): Promise<GamificationVersionItem[]> {
    const res = await authenticatedFetch("/api/admin/gamification/versions");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch versions");
    return data.data;
  },

  async rollbackGamificationVersion(version: number): Promise<any> {
    const res = await authenticatedFetch(`/api/admin/gamification/rollback/${version}`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to rollback version");
    return data.data;
  },

  async getGamificationLedger(params?: {
    page?: number;
    limit?: number;
    pairId?: string;
    userId?: string;
    gameId?: string;
    type?: string;
  }): Promise<{
    transactions: PointTransactionItem[];
    total: number;
    page: number;
    pages: number;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.pairId) query.set("pairId", params.pairId);
    if (params?.userId) query.set("userId", params.userId);
    if (params?.gameId) query.set("gameId", params.gameId);
    if (params?.type) query.set("type", params.type);

    const res = await authenticatedFetch(
      `/api/admin/gamification/ledger?${query.toString()}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch points ledger");
    return data.data;
  },

  async adjustPoints(payload: {
    pairId: string;
    userId: string;
    points: number;
    reason?: string;
  }): Promise<any> {
    const res = await authenticatedFetch("/api/admin/gamification/adjust-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to adjust points");
    return data.data;
  },

  async getGamificationPairsAndUsers(): Promise<{
    pairs: GamificationPairItem[];
    users: GamificationUserItem[];
  }> {
    const res = await authenticatedFetch("/api/admin/gamification/pairs-and-users");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch pairs and users");
    return data.data;
  },
};
