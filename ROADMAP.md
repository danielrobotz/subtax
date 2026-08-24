# Subtax — Roadmap

Task list for the multi-agent workflow. One task = one branch = one PR = one harness at a time.
See `CONTRIBUTING.md` for the process and `PRD.md` for product context.

Status values: `todo` / `in-progress:<harness>` / `in-review` / `done`.

| ID | Status | Scope (files/dirs) | Task | Acceptance criteria |
|----|--------|---------------------|------|----------------------|
| T-001 | done | `.github/workflows/`, `package.json` (scripts only) | Add CI: run `npm run build` and `npm run lint` on every PR | CI workflow runs on PR open/sync; both scripts must pass; no other files touched. Extended to also run `npm test`. |
| T-002 | done | `src/**/__tests__/`, `package.json` (devDependencies + test script) | Add a test runner and a first unit test for `src/lib/whisper.ts` | `npm test` exists and passes in CI from T-001; at least one real assertion, not a placeholder. Added Vitest with tests for `parseWhisperResponse`/`getMockTranscription` and `getActiveWords`. |
| T-004 | done | `next.config.ts`, `src/lib/whisper.ts`, `src/app/api/`, `src/components/transcribe/` | Stop shipping the OpenAI API key to the browser | Dropped `output: 'export'`; transcription now goes through a server-side `/api/transcribe` route using a private `OPENAI_API_KEY` (see `.env.example`). No `NEXT_PUBLIC_` OpenAI key remains. |
| T-005 | done | `src/lib/videoExport.ts`, `src/lib/subtitleRenderer.ts`, `src/components/export/`, `scripts/copy-ffmpeg-core.mjs`, `public/ffmpeg` (generated) | Make Export actually render video (it was a fake progress bar) | `@ffmpeg/ffmpeg` now renders real MP4s with burned-in animated subtitles, verified end-to-end in a real browser. WebM/VP9 was attempted but dropped — the single-threaded ffmpeg.wasm core crashes on `libvpx-vp9` regardless of encoding flags; only MP4 (`libx264`/`aac`) is offered. |
| T-006 | todo | *(unscoped — needs a PRD goal first)* | ⚠️ Next product task | Waiting on you to fill in `PRD.md` goals — once there's a real goal, break it into scoped tasks here |

## Adding a new task
1. Give it the next `T-NNN` ID.
2. Declare its file/dir scope narrowly enough that it can't overlap an already-open task.
3. Write acceptance criteria that trace back to a goal in `PRD.md`.
