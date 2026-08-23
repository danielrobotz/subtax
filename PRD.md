# Subtax — Product Requirements

## Problem statement
> ⚠️ Draft based on reading the codebase, not on a spec from you — correct anything below that's wrong.

Subtax generates dynamic, animated subtitles for video, driven by AI transcription (Whisper),
so creators don't have to hand-caption clips.

## Current state (as of this bootstrap, 2026-08-23)
Built so far, inferred from `src/`:
- **Upload** (`components/upload/MediaUpload.tsx`) — media ingestion into the app.
- **Transcription** (`components/transcribe/TranscriptionPanel.tsx`, `lib/whisper.ts`) — audio →
  text via OpenAI Whisper.
- **Style editing** (`components/editor/StyleEditor.tsx`) — configuring how captions look.
- **Preview** (`components/preview/CanvasPreview.tsx`) — canvas-based render preview.
- **Export** (`components/export/ExportPanel.tsx`) — producing final output, using
  `@ffmpeg/ffmpeg` (in-browser ffmpeg).
- App-wide state in `store/projectStore.ts` (Zustand).
- Stack: Next.js 16 / React 19 / TypeScript / Tailwind, single-page app under `src/app`.

There is one commit on `master` ("Initial commit: Subtax MVP") and no tests, CI, or deployment
config yet.

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
