import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export interface SyncState {
  syncedIds: string[];
  lastRunAt: string;
}

export function loadState(path: string): SyncState {
  if (!existsSync(path)) return { syncedIds: [], lastRunAt: "" };
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (
    typeof raw === "object" &&
    raw !== null &&
    "syncedIds" in raw &&
    Array.isArray((raw as SyncState).syncedIds)
  ) {
    return raw as SyncState;
  }
  return { syncedIds: [], lastRunAt: "" };
}

export function saveState(path: string, state: SyncState): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2), "utf8");
}
