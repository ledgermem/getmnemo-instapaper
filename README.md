# @ledgermem/instapaper

LedgerMem connector for [Instapaper](https://www.instapaper.com). Pulls bookmarks via the Instapaper Full API (OAuth1) and ingests them into your LedgerMem workspace.

## Install

```bash
npm install -g @ledgermem/instapaper
```

## Setup

1. Request Instapaper Full API access at https://www.instapaper.com/main/request_oauth_consumer_token
2. Run the OAuth1 xAuth flow to get an OAuth token + secret for your account.
3. Get your LedgerMem API key + workspace ID.
4. Copy `.env.example` to `.env` and fill in.

## Run

```bash
instapaper-sync
```

State is persisted to `~/.ledgermem/instapaper.json` (list of `bookmark_id`s already synced) so re-runs are incremental.

## Env vars

| Variable | Required | Description |
| --- | --- | --- |
| `INSTAPAPER_CONSUMER_KEY` | yes | OAuth1 consumer key |
| `INSTAPAPER_CONSUMER_SECRET` | yes | OAuth1 consumer secret |
| `INSTAPAPER_OAUTH_TOKEN` | yes | Per-user OAuth1 token |
| `INSTAPAPER_OAUTH_SECRET` | yes | Per-user OAuth1 token secret |
| `LEDGERMEM_API_KEY` | yes | LedgerMem API key |
| `LEDGERMEM_WORKSPACE_ID` | yes | LedgerMem workspace ID |
| `INSTAPAPER_STATE_PATH` | no | State file path (default `~/.ledgermem/instapaper.json`) |
| `INSTAPAPER_PAGE_SIZE` | no | Bookmarks per request (default 25) |
| `INSTAPAPER_FOLDER` | no | Folder id (`unread`, `archive`, `starred`, or numeric) |

## Memory metadata

- `source: "instapaper"`
- `bookmarkId`
- `url`
- `title`
- `description`

## License

MIT
