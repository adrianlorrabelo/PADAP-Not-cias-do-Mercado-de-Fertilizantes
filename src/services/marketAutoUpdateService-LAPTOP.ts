import type { MarketAutoUpdateSettings } from "../types";

export const marketAutoUpdateSettingsStorageKey = "padap_market_auto_update_settings";

export const defaultMarketAutoUpdateTimes = ["08:30", "13:30", "17:30"];

function nowIso() {
  return new Date().toISOString();
}

function timeKey(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function minuteKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}T${timeKey(date)}`;
}

function slotDate(day: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(day);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function isValidMarketAutoUpdateTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function normalizeMarketAutoUpdateTimes(times: string[]) {
  return [...new Set(times.filter(isValidMarketAutoUpdateTime))].sort((a, b) => a.localeCompare(b));
}

export function calculateNextMarketAutoUpdateAt(settings: Pick<MarketAutoUpdateSettings, "enabled" | "times">, now = new Date()) {
  const times = normalizeMarketAutoUpdateTimes(settings.times);
  if (!settings.enabled || !times.length) return undefined;

  const today = times.map((time) => slotDate(now, time)).find((date) => date.getTime() > now.getTime());
  if (today) return today.toISOString();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return slotDate(tomorrow, times[0]).toISOString();
}

export function getDefaultMarketAutoUpdateSettings(): MarketAutoUpdateSettings {
  const updatedAt = nowIso();
  const settings: MarketAutoUpdateSettings = {
    enabled: false,
    times: defaultMarketAutoUpdateTimes,
    runOnlyWhenPageOpen: true,
    updatedAt
  };

  return {
    ...settings,
    nextAutoUpdateAt: calculateNextMarketAutoUpdateAt(settings)
  };
}

function mergeSettings(value: Partial<MarketAutoUpdateSettings> | null): MarketAutoUpdateSettings {
  const fallback = getDefaultMarketAutoUpdateSettings();
  const settings: MarketAutoUpdateSettings = {
    ...fallback,
    ...value,
    times: normalizeMarketAutoUpdateTimes(value?.times?.length ? value.times : fallback.times),
    runOnlyWhenPageOpen: value?.runOnlyWhenPageOpen ?? true,
    updatedAt: value?.updatedAt || fallback.updatedAt
  };

  return {
    ...settings,
    nextAutoUpdateAt: calculateNextMarketAutoUpdateAt(settings)
  };
}

export function getMarketAutoUpdateSettings() {
  if (typeof window === "undefined") return getDefaultMarketAutoUpdateSettings();

  try {
    const stored = localStorage.getItem(marketAutoUpdateSettingsStorageKey);
    if (!stored) return getDefaultMarketAutoUpdateSettings();
    return mergeSettings(JSON.parse(stored) as Partial<MarketAutoUpdateSettings>);
  } catch {
    return getDefaultMarketAutoUpdateSettings();
  }
}

export function saveMarketAutoUpdateSettings(settings: MarketAutoUpdateSettings) {
  const next = mergeSettings({
    ...settings,
    updatedAt: nowIso()
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(marketAutoUpdateSettingsStorageKey, JSON.stringify(next));
  }

  return next;
}

export function shouldRunMarketAutoUpdate(settings: MarketAutoUpdateSettings, now = new Date()) {
  if (!settings.enabled) return null;
  if (!normalizeMarketAutoUpdateTimes(settings.times).includes(timeKey(now))) return null;
  if (settings.runOnlyWhenPageOpen && typeof document !== "undefined" && document.visibilityState === "hidden") return null;
  if (settings.lastAutoUpdateAt && minuteKey(settings.lastAutoUpdateAt) === minuteKey(now)) return null;
  return timeKey(now);
}

export function markMarketAutoUpdateAttempt(settings: MarketAutoUpdateSettings, date = new Date()) {
  const next: MarketAutoUpdateSettings = {
    ...settings,
    lastAutoUpdateAt: date.toISOString(),
    updatedAt: date.toISOString()
  };

  return saveMarketAutoUpdateSettings({
    ...next,
    nextAutoUpdateAt: calculateNextMarketAutoUpdateAt(next, date)
  });
}
