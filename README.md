# AIQuickChat 🤖

A multi-agent chat client built with **Expo (SDK 57)**, **React Native**, and **TypeScript**. Chats, messages, and AI agent configurations are stored locally on-device using **SQLite** via **Drizzle ORM**.

Each chat is bound to an **agent** (model + API key + base URL) that you configure inside the app, so you can talk to any OpenAI-compatible endpoint (DeepSeek, OpenAI, etc.).

## Features

- 💬 **Chats list** — home screen listing all conversations, sorted by last activity
- 🧠 **Agents** — configure model name, API key, and base URL (e.g. `https://api.deepseek.com/v1`)
- 🗃️ **Local persistence** — chats and messages are stored in a local SQLite database (`aiquickchat.db`)
- 📱 **Works on iOS, Android, but not on web**

## Prerequisites

Before you start, make sure you have the following installed:

| Tool                             | Why you need it                                                 |
| -------------------------------- | --------------------------------------------------------------- |
| **Node.js** (18+ recommended)    | Runs the Expo dev server and npm scripts                        |
| **npm**                          | Installs dependencies (comes with Node.js)                      |
| **Xcode** (macOS only)           | Required to run the **iOS Simulator**                           |
| **Android Studio + Android SDK** | Required to run the **Android Emulator**                        |
| **Expo Go** (optional)           | Lets you run the app on a **physical device** without emulators |

> ⚠️ **Observation:** You have to have an **iOS Simulator** or **Android Emulator** configured to run the app on those platforms. Alternatively, install the **Expo Go** app on your physical phone and scan the QR code — no emulator needed.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm start
```

The Expo CLI will start the dev server and show a QR code plus a list of keyboard shortcuts.

### 3. Open the app

From the terminal output, press:

- **`i`** → open in the **iOS Simulator** (requires Xcode)
- **`a`** → open in the **Android Emulator** (requires Android Studio)
- **`w`** → open in the **web browser**

Or scan the QR code with the **Expo Go** app on your phone (must be on the same Wi-Fi network).

### Alternative one-shot commands

```bash
npm run ios      # start and open iOS Simulator
npm run android  # start and open Android Emulator
npm run web      # start and open in the browser
```

## Using the app

1. **Create an agent** — tap **"⚙️ Agentes"** in the top-right corner of the home screen, then **"+ Novo"** and fill in:
   - **Name** — e.g. `DeepSeek Assistant`
   - **Model** — e.g. `deepseek-chat`
   - **API key** — your provider key (e.g. `sk-...`)
   - **Base URL** — defaults to `https://api.deepseek.com/v1` (any OpenAI-compatible endpoint works)
2. **Start a chat** — tap **"+ Novo chat"**, pick an agent, and start sending messages.
3. **Talk** — messages are saved locally and reloaded every time you open the chat.

## Database & migrations

The app uses **Drizzle ORM** with **expo-sqlite**. The schema lives in `db/schema.ts` and SQL migrations in `drizzle/`.

Migrations run automatically on app startup (via `useMigrations`), so there's nothing you need to do. If you change the schema, regenerate the migration with:

```bash
npm run db:generate
```

## Environment variables

The `.env.example` file declares `DEEPSEEK_API_KEY`, which is exposed to `app.config.js` only. **The app no longer reads it at runtime** — API keys are configured per agent inside the app and stored in the local database. You can safely ignore `.env` unless you plan to reference the key somewhere else.

## Project structure

```
├── app.config.js           # Expo app config (env vars, splash, icons)
├── db/
│   ├── schema.ts           # Drizzle schema: agents, chats, messages
│   └── index.ts            # SQLite client + Drizzle instance
├── drizzle/                # Generated SQL migrations
├── src/
│   ├── app/                # Routes (expo-router)
│   │   ├── _layout.tsx     # Root Stack + DB migrations
│   │   ├── chats-list.tsx  # Home: list of chats
│   │   ├── chat/[id].tsx   # Chat screen (persisted messages)
│   │   └── agents.tsx      # Agent CRUD
│   ├── components/         # Reusable UI (chat list item, agent form modal)
│   ├── services/           # chatService.ts (OpenAI-compatible API calls)
│   └── utils/              # formatters.ts (relative time, masking)
```

## Troubleshooting & notes

- **"You have to have iOS or Android emulator configured"** — on macOS, install Xcode for the iOS Simulator; on any OS, install Android Studio + an AVD (Android Virtual Device) for the Android Emulator. Or skip emulators entirely and use **Expo Go** on your phone.
- **API keys are stored in plain text** in the local SQLite database — fine for development, but don't ship this without encryption (e.g. SQLCipher or the OS keychain).
- If you change `db/schema.ts`, run `npm run db:generate` and restart the app so the new migration runs.
- Useful commands: `npx tsc --noEmit` (type check), `npx expo lint` (linter).

## License

See the [LICENSE](./LICENSE) file.
