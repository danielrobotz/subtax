# Subtax — Product Requirements

## Problem statement
> ⚠️ Draft based on reading the codebase, not on a spec from you — correct anything below that's wrong.

Subtax generates dynamic, animated subtitles for video, driven by AI transcription (Whisper),
so creators don't have to hand-caption clips.

## Current state (as of 2026-08-24)
Built so far, inferred from `src/`:
- **Upload** (`components/upload/MediaUpload.tsx`) — media ingestion into the app.
- **Transcription** (`components/transcribe/TranscriptionPanel.tsx`, `lib/whisper.ts`,
  `app/api/transcribe/route.ts`) — audio → text via OpenAI Whisper, called through a
  server-side API route so the OpenAI key is never shipped to the browser. A "Try with sample
  transcription" fallback lets the app be evaluated without an API key configured.
- **Style editing** (`components/editor/StyleEditor.tsx`) — configuring how captions look.
- **Preview** (`components/preview/CanvasPreview.tsx`) — canvas-based render preview, sharing
  its drawing logic with export via `lib/subtitleRenderer.ts`.
- **Export** (`components/export/ExportPanel.tsx`, `lib/videoExport.ts`) — real MP4 export:
  frame-by-frame canvas rendering of burned-in animated subtitles, muxed with the original
  audio via `@ffmpeg/ffmpeg` (in-browser ffmpeg, core self-hosted from `public/ffmpeg/`).
  WebM was attempted and dropped (see `ROADMAP.md` T-005) — VP9 crashes the wasm core.
- App-wide state in `store/projectStore.ts` (Zustand).
- Stack: Next.js 16 / React 19 / TypeScript / Tailwind, server-rendered (not static export,
  since transcription needs a server route), single-page app under `src/app`.

CI (`.github/workflows/ci.yml`) runs lint, `npm test` (Vitest), and build on every PR.

## Goals
- ⚠️ Fill in: what does "done" look like for v1 — public beta, personal tool, paid product?
- ⚠️ Fill in: target user (solo creator, agency, etc.) and the caption *style* differentiator
  (this repo's description mentions "animated subtitles" — what makes them distinct from
  standard burned-in captions?)

## Non-goals / out of scope
- ⚠️ Fill in — e.g. multi-user accounts, team collaboration, server-side rendering of video
  (currently client-side via `@ffmpeg/ffmpeg`), languages beyond what Whisper covers, etc.

## Notes for contributing agents
See `ROADMAP.md` for the current task breakdown and `CONTRIBUTING.md` for how to pick up a task
and submit it.
