# Fonsi Scheduler

Fonsi Scheduler is an Expo and React Native task planner. This repository contains the client; its task service is deployed separately.

## Local development

Requirements: Node.js 20 or newer and npm.

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

Open the project with Expo Go or a simulator. Use `npm run web` for the browser build. Expo's development server uses port 8081 by default; do not start another server on that port if a preview is already running.

The demo adapter is enabled by default. Task edits in demo mode are in memory and reset when the app process restarts. To use a task service, set `EXPO_PUBLIC_USE_MOCK=false` and configure `EXPO_PUBLIC_API_URL`, then restart Expo. The HTTP adapter's expected task routes and payloads are documented in `src/api/client.ts` and `src/api/types.ts`; configuring this client does not change the separately deployed service.

## Validation

```powershell
npm run typecheck
npm test
npm run lint
npm run format:check
```

## App identity and release

`app.config.ts` is the source of truth for the app's Expo, Android, and iOS identifiers and its launcher/splash assets. It carries forward the existing identifiers (`com.fonsiflow.scheduler` on both stores, Expo slug `fonsi-scheduler`, URL scheme `fonsi`). Treat the bundle ID and Android package as provisional until the publisher verifies ownership and checks for existing store listings; do not create a store record or production build before that check.

The current account and identity setup steps, verified store-account fee notes, and manual enrollment steps are in [Phase 1 — accounts and app identity](docs/release/phase-1-accounts-and-identity.md). Store requirements and fees can change; the linked official pages and live enrollment forms take precedence.

## Project structure

- `app/`: Expo Router tabs and task/search routes
- `src/api/`: task types, HTTP and in-memory adapters, repository, and error handling
- `src/components/`: shared controls, task cards, and validated task form
- `src/features/tasks/`: task validation, query hooks, reminders, and tests
- `src/store/`: preferences and transient toast state
- `src/theme/`: colors, spacing, typography, motion, and theme helpers
- `assets/images/`: launcher, adaptive launcher, and splash assets
- `docs/release/`: store release planning and account setup

## Scope

This repository contains no backend implementation. The app uses its demo adapter unless configured with a separately deployed compatible task service. Release configuration is being prepared in phases; the account guide does not imply that the app is ready for store submission.
