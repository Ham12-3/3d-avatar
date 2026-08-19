# Nova Operations

Nova Operations is a production-oriented business dashboard with a voice-enabled assistant. Nova can use the free procedural Three.js avatar in the browser or an optional real-time Runway human character.

## What is included

- Responsive operations dashboard for revenue, refunds, support, knowledge, sessions, and settings
- Procedural WebGL avatar with listening, thinking, speaking, idle, and blink animation states
- Browser speech recognition and speech synthesis where the browser supports them
- Always-available typed command fallback
- Explicit dashboard actions for navigation, revenue periods, ticket filters, knowledge, and themes
- OpenAI responses with local Qwen 3 4B fallback through Bionic/LM Studio's OpenAI-compatible API
- Optional Runway real-time human character with microphone-only user participation
- Clerk authentication and PostgreSQL/Prisma persistence when configured
- A usable local demo experience when Clerk or PostgreSQL is not configured
- Unit and browser test suites

## Storage and cost

The procedural avatar itself is source code plus the Three.js package. The optional Qwen model is stored locally by Bionic/LM Studio and has no per-message API fee. The current Q4 model download is about 2.5 GB. OpenAI requests and Runway human-character sessions are optional paid services billed by their respective providers.

Speech recognition support depends on the browser. Chrome and Edge provide the best current Web Speech API support. Depending on the browser and operating system, speech may be processed by the platform’s speech service; typed commands work without microphone access.

## Local setup

Requirements: Node.js 20.9 or later. For AI responses, configure OpenAI or run Bionic/LM Studio with the local `qwen/qwen3-4b-2507` model.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no external services configured, the app uses clearly labelled demo business data.

To use the free local model, open Bionic/LM Studio and start its Local Model API on port `1234`. The default connection is `http://127.0.0.1:1234/v1`. If OpenAI is not configured or cannot respond, Nova falls back to this local endpoint. Existing dashboard commands retain their safe built-in responses when neither model is available.

Optional environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for authentication
- `DATABASE_URL` for PostgreSQL persistence
- `NEXT_PUBLIC_APP_URL` for the public application URL
- `NOVA_AI_PROVIDER`, `OPENAI_API_KEY`, and `OPENAI_MODEL` for OpenAI
- `LM_STUDIO_BASE_URL` and `LM_STUDIO_MODEL` to override the local AI defaults
- `RUNWAYML_API_SECRET`, `RUNWAY_AVATAR_TYPE`, and `RUNWAY_AVATAR_ID` for the optional human character

If PostgreSQL is enabled:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## How Nova works

```text
Speech or typed request
        │
        ├── bounded browser interpreter ──► navigate, filter, or change theme
        │
        └── Next.js server route ──► OpenAI ──► response
                                      │
                                      └── failure/unavailable ──► local Qwen fallback

Three.js scene ◄── conversation state ──► browser speech output
```

Important files:

- `components/avatar/browser-avatar-stage.tsx`: procedural WebGL character and animation
- `components/avatar/avatar-provider.tsx`: conversation state and browser speech lifecycle
- `lib/avatar/browser-agent.ts`: bounded command interpretation
- `lib/avatar/server-tools.ts`: authenticated data-query tools
- `app/api/avatar/chat/route.ts`: validated and rate-limited local model connection
- `app/api/avatar/tools/route.ts`: validated tool API

## Privacy

- The 3D geometry and animation run in the browser.
- The app never requests or publishes the user's camera or screen video.
- Microphone access is optional and controlled by the browser.
- No cloud AI key is required when the local Qwen fallback is used.
- OpenAI prompts and Runway voice sessions leave the local machine only when those optional modes are enabled.
- Tool requests are schema-validated and rate-limited.
- Database-backed conversation endpoints enforce user ownership.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Future upgrades

The next useful upgrade is an optional offline speech-to-text engine so microphone transcription can also remain fully local.
