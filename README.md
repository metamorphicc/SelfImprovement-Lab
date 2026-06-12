# Self Improvement Labs

A personal RPG system for real-life progression: player profile, entry interview, wallet inventory, quests, skills, and a second-brain style inventory.

## Stack

- Monorepo: npm workspaces
- Web: Next.js 16 + React 19 + TypeScript
- Desktop: Tauri 2 + Rust
- Shared domain logic: `packages/core`

## Project Layout

```text
apps/web          Next.js web app
apps/desktop      Tauri desktop shell
packages/core     Shared player, wallet, inventory, and formatting logic
app/              Legacy PowerShell/WPF prototype
web/              Legacy static web prototype
src/              Legacy C# prototype
dist/             Built desktop executable
```

## Install

PowerShell's `npm.ps1` may be broken on this machine, so use `cmd /c`:

```text
cmd /c npm install
```

## Development

Run the web app:

```text
cmd /c npm run dev:web
```

Run the Tauri desktop app:

```text
cmd /c npm run dev:desktop
```

## Build

Build and copy the portable desktop executable:

```text
Build-Desktop.bat
```

Open:

```text
dist\SelfImprovementLabs.exe
```

Build only the web app:

```text
cmd /c npm run build:web
```

Try to build a Windows installer:

```text
Build-Installer.bat
```

Installer packaging may need NSIS/WiX downloads and can fail in restricted Windows sandbox environments. The portable Tauri executable does build successfully.

## Current Prototype Scope

- English UI shell.
- Profile, interview, wallets, inventory, quests, skills, knowledge, and settings sections.
- EVM/Solana wallet input validation.
- Demo token balances and USD threshold filtering.
- Shared TypeScript domain model in `packages/core`.

## Not Implemented Yet

- Real EVM/Solana balance providers.
- Persistent local storage for desktop.
- Encrypted local database.
- Interview-driven class/stat generation.
- Signed installer and auto-update.

## Verified

- `cmd /c npm run typecheck`
- `cmd /c npm run build:web`
- `Build-Desktop.bat`

## Known Dependency Note

`npm audit --audit-level=moderate` currently reports a moderate `postcss < 8.5.10` advisory through `next@16.2.9`. npm's suggested fix is a breaking downgrade to Next 9.x, so it is intentionally not applied. Recheck after the next stable Next.js release.
