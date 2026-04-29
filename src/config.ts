export interface InstapaperConfig {
  consumerKey: string;
  consumerSecret: string;
  oauthToken: string;
  oauthSecret: string;
  getmnemoApiKey: string;
  getmnemoWorkspaceId: string;
  statePath: string;
  pageSize: number;
  folder: string;
}

const REQUIRED = [
  "INSTAPAPER_CONSUMER_KEY",
  "INSTAPAPER_CONSUMER_SECRET",
  "INSTAPAPER_OAUTH_TOKEN",
  "INSTAPAPER_OAUTH_SECRET",
  "GETMNEMO_API_KEY",
  "GETMNEMO_WORKSPACE_ID",
] as const;

export function loadConfig(): InstapaperConfig {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
  return {
    consumerKey: process.env.INSTAPAPER_CONSUMER_KEY as string,
    consumerSecret: process.env.INSTAPAPER_CONSUMER_SECRET as string,
    oauthToken: process.env.INSTAPAPER_OAUTH_TOKEN as string,
    oauthSecret: process.env.INSTAPAPER_OAUTH_SECRET as string,
    getmnemoApiKey: process.env.GETMNEMO_API_KEY as string,
    getmnemoWorkspaceId: process.env.GETMNEMO_WORKSPACE_ID as string,
    statePath:
      process.env.INSTAPAPER_STATE_PATH ??
      `${home}/.getmnemo/instapaper.json`,
    pageSize: Number(process.env.INSTAPAPER_PAGE_SIZE ?? 25),
    folder: process.env.INSTAPAPER_FOLDER ?? "unread",
  };
}
