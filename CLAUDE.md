# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
npm run setup           # Install deps + generate Prisma client + run migrations

# Development
npm run dev             # Start dev server with Turbopack
npm run dev:daemon      # Start dev server in background (logs to logs.txt)

# Production
npm run build
npm run start

# Testing
npm test                # Run all Vitest tests
npx vitest run <path>   # Run a single test file

# Database
npm run db:reset        # Force reset database (destructive)

# Linting
npm lint
```

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY`. Without it, the app runs in mock mode using `MockLanguageModel`, which generates sample Counter/Form/Card components instead of calling Claude.

## Architecture

UIGen is a Next.js 15 app where users describe React components in natural language and Claude generates them with live preview.

### Core Data Flow

```
User prompt → /api/chat → Claude (with tools) → VirtualFileSystem → JSX Transformer → iframe preview
```

1. User types in `MessageInput` → `ChatInterface` posts to `/api/chat`
2. Claude responds with tool calls (`str_replace_editor`, `file_manager`)
3. Tool calls mutate `VirtualFileSystem` (in-memory, no disk writes)
4. `FileSystemContext` detects changes and re-renders
5. `PreviewFrame` picks up the updated FS, compiles JSX via `@babel/standalone`, and renders in a sandboxed iframe

### Key Modules

| Path | Role |
|------|------|
| `src/lib/file-system.ts` | In-memory virtual file system (create/read/update/delete/rename) |
| `src/lib/contexts/file-system-context.tsx` | React context wrapping the VFS; handles tool call execution and auto-selects entry point (`App.jsx`) |
| `src/lib/contexts/chat-context.tsx` | React context wrapping Vercel AI SDK's `useChat`; tracks file system changes |
| `src/app/api/chat/route.ts` | POST handler — runs Claude with tools, persists project to DB if authenticated |
| `src/lib/provider.ts` | `getLanguageModel()` — returns real Claude model or `MockLanguageModel` |
| `src/lib/tools/str-replace.ts` | `str_replace_editor` tool (view/create/str_replace/insert) |
| `src/lib/tools/file-manager.ts` | `file_manager` tool (rename/delete) |
| `src/lib/transform/jsx-transformer.ts` | Converts virtual FS files to iframe-safe HTML with import map |
| `src/lib/prompts/generation.tsx` | System prompt — instructs Claude to use Tailwind, keep `/App.jsx` as entry point |
| `src/lib/auth.ts` + `src/actions/index.ts` | JWT sessions (jose), bcrypt passwords, server actions for signUp/signIn/signOut |

### Routing

- `/` — Root page; authenticated users redirect to most recent project, anonymous users see `MainContent`
- `/[projectId]` — Project-specific layout that loads project data from DB
- `/api/chat` — Streaming chat endpoint

### Layout Structure

```
ResizablePanelGroup (horizontal)
├── Left (35%) — ChatInterface
└── Right (65%)
    ├── Tabs: Preview | Code
    ├── Preview → PreviewFrame (iframe)
    └── Code → FileTree (30%) + CodeEditor (70%, Monaco)
```

### Database

Prisma + SQLite (`prisma/dev.db`). Two models: `User` (email/password) and `Project` (name, userId, messages JSON, data JSON). Projects only persist for authenticated users; anonymous work lives in client-side state.

### AI Model

Default model is `claude-haiku-4-5` (set in `src/lib/provider.ts`). Uses Anthropic prompt caching (`cache_control: ephemeral`) on the system prompt for cost/latency savings.

### Testing

Tests live alongside source in `__tests__/` subdirectories. Key test areas: VirtualFileSystem operations, chat/file-system context state, JSX transformer compilation.
