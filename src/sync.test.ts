import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InstapaperClient } from "./instapaper-client.js";
import { syncOnce } from "./sync.js";

describe("syncOnce (instapaper)", () => {
  let tmpStatePath: string;

  beforeEach(() => {
    const dir = mkdtempSync(join(tmpdir(), "instapaper-test-"));
    tmpStatePath = join(dir, "instapaper.json");
  });

  it("ingests new bookmarks and skips known ones", async () => {
    const fakeFetch = vi.fn(async () =>
      new Response(
        JSON.stringify([
          { type: "meta" },
          { type: "user" },
          {
            type: "bookmark",
            bookmark_id: 42,
            url: "https://x.example/article",
            title: "Article 42",
            description: "A great read",
            time: 1700000000,
            starred: "0",
          },
        ]),
        { status: 200 },
      ),
    );
    const client = new InstapaperClient(
      {
        consumerKey: "ck",
        consumerSecret: "cs",
        oauthToken: "t",
        oauthSecret: "ts",
      },
      fakeFetch as unknown as typeof fetch,
    );
    const memoryAdd = vi.fn(async () => undefined);
    const memory = { add: memoryAdd } as unknown as Parameters<typeof syncOnce>[0]["memory"];

    const result = await syncOnce({
      client,
      memory,
      statePath: tmpStatePath,
      pageSize: 25,
      folder: "unread",
    });

    expect(result.itemsSynced).toBe(1);
    expect(memoryAdd).toHaveBeenCalledOnce();
    const [, opts] = memoryAdd.mock.calls[0];
    expect(opts).toMatchObject({
      metadata: { source: "instapaper", bookmarkId: "42" },
    });

    // Second run with same response should skip everything.
    const result2 = await syncOnce({
      client,
      memory,
      statePath: tmpStatePath,
      pageSize: 25,
      folder: "unread",
    });
    expect(result2.itemsSynced).toBe(0);
  });
});
