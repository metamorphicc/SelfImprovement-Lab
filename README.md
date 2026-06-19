# Self Improvement Labs

Self Improvement Labs is an offline-first Windows desktop app that turns personal development into a private RPG-style command center.

## Features

- First-run interview that generates a character profile.
- Dashboard with level, XP, streak, quests, assets, inventory, and knowledge.
- Quest groups with difficulty, deadlines, XP rewards, and skill rewards.
- Daily check-ins, history, streaks, achievements, and progress events.
- Local knowledge base and structured inventory.
- EVM and Solana wallet monitoring through Alchemy and Helius.
- English and Russian interface.
- Milk and cocoa themes.
- Local JSON backup and restore.

All profile data is stored locally in the Tauri WebView IndexedDB. Alchemy and Helius API keys are entered inside Settings and are not stored in the repository or included in exported backups.

## Stack

- Monorepo: npm workspaces
- Interface: Next.js 16, React 19, TypeScript
- Desktop shell: Tauri 2 and Rust
- Shared domain logic: `packages/core`
- Windows installer: NSIS

The Next.js application is the interface embedded in the desktop app. The current product focus is Windows desktop, not a separately distributed web or mobile app.

## Project Layout

```text
apps/web          Desktop interface rendered by Tauri
apps/desktop      Tauri shell and Windows packaging
packages/core     Shared models, wallet providers, and domain logic
dist              Generated release artifacts
```

The root `app`, `web`, and `src` directories contain older prototypes and are not part of the production desktop build.

## Install Dependencies

PowerShell execution policy can interfere with `npm.ps1` on Windows, so the documented commands use `cmd`:

```text
cmd /c npm install
```

## Development

Start the Tauri desktop app:

```text
cmd /c npm run dev:desktop
```

The standalone Next development server exists for interface debugging:

```text
cmd /c npm run dev:web
```

## Build

Portable executable:

```text
Build-Desktop.bat
```

NSIS installer:

```text
Build-Installer.bat
```

Complete local release:

```text
Build-Release.bat
```

`Build-Release.bat` produces:

```text
dist\SelfImprovementLabs.exe
dist\SelfImprovementLabs-0.1.0-Setup.exe
dist\SelfImprovementLabs-0.1.0-Portable.zip
dist\SHA256SUMS.txt
```

Close the running application before rebuilding because Windows locks an active executable.

## Windows Installation

The NSIS installer uses current-user installation and creates a Start Menu entry under `Self Improvement Labs`. It supports English and Russian installer languages and installs Microsoft WebView2 through the bootstrapper when required.

The installer is currently unsigned. Windows SmartScreen may display an unknown-publisher warning until a code-signing certificate is configured.

## Local Data And Privacy

The following information remains on the current device:

- profile and stats;
- quests and progress history;
- notes and inventory;
- wallet addresses;
- provider API keys;
- language and theme preferences.

JSON backups include personal application data and wallet addresses. They intentionally exclude API keys and fetched wallet balances.

## Repository Safety

Do not commit:

- `.env*`;
- API keys or credentials;
- `node_modules`;
- `.next` and `apps/web/out`;
- Rust `target` output;
- `dist`;
- local databases;
- installers, executables, and archives.

The repository `.gitignore` covers these generated and sensitive file types. A source scan should still be performed before publishing.

## Verification

Release verification commands:

```text
cmd /c npm run typecheck
Build-Release.bat
```

Recommended manual smoke test:

1. Install or launch the portable executable.
2. Complete onboarding on a clean profile.
3. Restart and confirm local state persists.
4. Create and complete a quest.
5. Export and re-import a backup.
6. Add test wallet addresses and refresh balances.
7. Switch language and theme.

## Version

Current release: `0.1.0-alpha`

Online accounts, public profiles, leaderboards, subscriptions, code signing, and automatic updates are planned as later stages.
