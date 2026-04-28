import OAuth from "oauth-1.0a";
import { createHmac } from "node:crypto";

export interface InstapaperBookmark {
  type: "bookmark";
  bookmark_id: number;
  url: string;
  title: string;
  description?: string;
  time: number;
  starred: string;
  hash?: string;
}

export interface InstapaperListEntry {
  type: string;
  bookmark_id?: number;
  url?: string;
  title?: string;
  description?: string;
  time?: number;
  starred?: string;
  hash?: string;
}

const BASE = "https://www.instapaper.com/api/1.1";

export interface InstapaperCredentials {
  consumerKey: string;
  consumerSecret: string;
  oauthToken: string;
  oauthSecret: string;
}

export class InstapaperClient {
  private readonly oauth: OAuth;
  private readonly token: { key: string; secret: string };

  constructor(
    creds: InstapaperCredentials,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {
    this.oauth = new OAuth({
      consumer: { key: creds.consumerKey, secret: creds.consumerSecret },
      signature_method: "HMAC-SHA1",
      hash_function(base, key) {
        return createHmac("sha1", key).update(base).digest("base64");
      },
    });
    this.token = { key: creds.oauthToken, secret: creds.oauthSecret };
  }

  async listBookmarks(opts: {
    folderId?: string;
    limit?: number;
    have?: string[];
  }): Promise<InstapaperBookmark[]> {
    const url = `${BASE}/bookmarks/list`;
    const params: Record<string, string> = {
      folder_id: opts.folderId ?? "unread",
      limit: String(opts.limit ?? 25),
    };
    if (opts.have && opts.have.length > 0) {
      // Instapaper rejects (or silently truncates) requests whose form body
      // exceeds ~8KB. Once the user has thousands of synced bookmarks, the
      // comma-joined `have` list grows unbounded and quietly stops deduping
      // — every run then re-fetches the full archive. Cap to the most
      // recent 500 ids; older items aren't going to reappear in the API's
      // response anyway since we sort by recency.
      const HAVE_CAP = 500;
      const recent =
        opts.have.length > HAVE_CAP
          ? opts.have.slice(opts.have.length - HAVE_CAP)
          : opts.have;
      params.have = recent.join(",");
    }
    const body = new URLSearchParams(params).toString();
    const requestData = { url, method: "POST", data: params };
    const auth = this.oauth.toHeader(
      this.oauth.authorize(requestData, this.token),
    );
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        ...auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) {
      throw new Error(
        `Instapaper API ${res.status}: ${res.statusText} — ${await res.text()}`,
      );
    }
    const json = (await res.json()) as InstapaperListEntry[];
    return json.filter(
      (entry): entry is InstapaperBookmark =>
        entry.type === "bookmark" && typeof entry.bookmark_id === "number",
    );
  }
}
