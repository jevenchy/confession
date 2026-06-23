# Confession

A simple Discord bot for confessions. Supports anonymous messages via DM.

## How it Works

- **Submit**: a member DMs the bot `confession <message>` (normal) or `confession anon <message>` (anonymous).
- **Validate**: empty or over `CONFESSION_SETTINGS.maxLength` characters is rejected with a DM error. A cooldown (`CONFESSION_SETTINGS.cooldownMs`) prevents spam between submissions.
- **Post**: the confession is posted as an embed in `CONFESSION_CHANNEL_ID`, the member gets a confirmation DM, and a copy goes to `CONFESSION_LOG_CHANNEL_ID`.
- **Guide**: one usage guide stays at the bottom of the confession channel, replaced on each post so old ones never pile up.

## Permissions

Invite with the `bot` scope only (no slash commands). Grant **View Channel**, **Send Messages**, **Embed Links** and **Read Message History**.

Use this invite link directly, replacing `<client-id>` with your application's client ID:

```
https://discord.com/api/oauth2/authorize?client_id=<client-id>&permissions=84992&scope=bot
```

## Setup

Requires Node.js 22 or newer.

```bash
npm install
cp .env.example .env
```

Edit `.env` with your bot credentials:

```env
DISCORD_TOKEN=...
CONFESSION_CHANNEL_ID=...
CONFESSION_LOG_CHANNEL_ID=...
```

Edit `src/config/confessionConfig.ts` to tweak:

- `cooldownMs` - minimum time between confessions per user
- `maxLength` - max confession length
- `confirmationMessage` - DM sent after a confession is received
- `guideMessage` - the channel guide message displayed at the bottom

Start the bot:

```bash
npm start
```

## File Structure

```
confession/
├── .env.example
└── src/
    ├── core/          # Discord client setup and login
    ├── events/        # Discord event listeners
    ├── services/      # Confession flow and guide message logic
    ├── embeds/        # Embed builders
    ├── utils/         # Logger and channel fetch
    ├── constants/     # Shared constant maps (colors)
    ├── config/        # Env vars and confession settings
    └── index.ts       # Entry point (process lifecycle)
```
