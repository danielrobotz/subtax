# Subtax — Roadmap

Task list for the multi-agent workflow. One task = one branch = one PR = one harness at a time.
See `CONTRIBUTING.md` for the process and `PRD.md` for product context.

Status values: `todo` / `in-progress:<harness>` / `in-review` / `done`.

| ID | Status | Scope (files/dirs) | Task | Acceptance criteria |
|----|--------|---------------------|------|----------------------|
| T-001 | todo | `.github/workflows/`, `package.json` (scripts only) | Add CI: run `npm run build` and `npm run lint` on every PR | CI workflow runs on PR open/sync; both scripts must pass; no other files touched |
| T-002 | todo | `src/**/__tests__/`, `package.json` (devDependencies + test script) | Add a test runner and a first unit test for `src/lib/whisper.ts` | `npm test` exists and passes in CI from T-001; at least one real assertion, not a placeholder |
| T-003 | todo | *(unscoped — needs a PRD goal first)* | ⚠️ Next product task | Waiting on you to fill in `PRD.md` goals — once there's a real goal, break it into scoped tasks here |

## Adding a new task
1. Give it the next `T-NNN` ID.
2. Declare its file/dir scope narrowly enough that it can't overlap an already-open task.
3. Write acceptance criteria that trace back to a goal in `PRD.md`.
