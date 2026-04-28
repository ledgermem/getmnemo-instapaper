import type { LedgerMem } from "@ledgermem/memory";
import {
  InstapaperClient,
  type InstapaperBookmark,
} from "./instapaper-client.js";
import { loadState, saveState } from "./state.js";

export interface MemoryClient {
  add: LedgerMem["add"];
}

export interface SyncOptions {
  client: InstapaperClient;
  memory: MemoryClient;
  statePath: string;
  pageSize: number;
  folder: string;
}

export interface SyncResult {
  itemsSynced: number;
  totalKnown: number;
}

function buildContent(b: InstapaperBookmark): string {
  return [b.title, b.url, b.description ?? ""].filter(Boolean).join("\n\n");
}

function hasIngestableContent(b: InstapaperBookmark): boolean {
  // Bookmarks with neither a title nor a URL are useless to ingest.
  return Boolean((b.title && b.title.trim()) || (b.url && b.url.trim()));
}

export async function syncOnce(opts: SyncOptions): Promise<SyncResult> {
  const state = loadState(opts.statePath);
  const known = new Set(state.syncedIds);
  const bookmarks = await opts.client.listBookmarks({
    folderId: opts.folder,
    limit: opts.pageSize,
    have: state.syncedIds,
  });

  let itemsSynced = 0;
  for (const b of bookmarks) {
    const id = String(b.bookmark_id);
    if (known.has(id)) continue;
    if (!hasIngestableContent(b)) {
      // Mark as known so we don't re-evaluate every run, but skip the add.
      known.add(id);
      continue;
    }
    await opts.memory.add(buildContent(b), {
      metadata: {
        source: "instapaper",
        bookmarkId: id,
        url: b.url,
        title: b.title,
        description: b.description ?? "",
      },
    });
    known.add(id);
    itemsSynced += 1;
    // Persist after every successful add so a mid-run failure doesn't re-ingest.
    saveState(opts.statePath, {
      syncedIds: [...known],
      lastRunAt: state.lastRunAt,
    });
  }

  saveState(opts.statePath, {
    syncedIds: [...known],
    lastRunAt: new Date().toISOString(),
  });

  return { itemsSynced, totalKnown: known.size };
}
