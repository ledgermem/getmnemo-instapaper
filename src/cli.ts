#!/usr/bin/env node
import "dotenv/config";
import { Mnemo } from "@mnemo/memory";
import { loadConfig } from "./config.js";
import { InstapaperClient } from "./instapaper-client.js";
import { syncOnce } from "./sync.js";

async function main(): Promise<void> {
  const cfg = loadConfig();
  const memory = new Mnemo({
    apiKey: cfg.getmnemoApiKey,
    workspaceId: cfg.getmnemoWorkspaceId,
  });
  const client = new InstapaperClient({
    consumerKey: cfg.consumerKey,
    consumerSecret: cfg.consumerSecret,
    oauthToken: cfg.oauthToken,
    oauthSecret: cfg.oauthSecret,
  });
  const result = await syncOnce({
    client,
    memory,
    statePath: cfg.statePath,
    pageSize: cfg.pageSize,
    folder: cfg.folder,
  });
  process.stdout.write(
    `Instapaper sync complete: ${result.itemsSynced} new bookmark(s). totalKnown=${result.totalKnown}\n`,
  );
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`instapaper-sync failed: ${message}\n`);
  process.exit(1);
});
