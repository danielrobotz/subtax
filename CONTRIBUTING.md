# Contributing (multi-agent workflow)

This repo is worked on by several independent coding-agent harnesses at once. To avoid stepping
on each other and to keep a single quality gate before anything reaches `master`:

1. Read `PRD.md` and `ROADMAP.md` before starting anything.
2. Pick a `todo` task in `ROADMAP.md`. In your PR, change its status to `in-progress:<your-harness-name>`
   (e.g. `in-progress:cursor`, `in-progress:devin`).
3. Only touch files inside that task's declared scope. If you need to touch something outside
   it, stop and flag it instead of expanding scope silently — that's the #1 cause of merge
   conflicts between harnesses.
4. Branch name: `agent/<harness>/<task-id>-<slug>`, e.g. `agent/cursor/t-001-ci-workflow`.
5. Never push to `master` directly — open a PR.
6. Never merge your own PR. Claude Code is the only merger, and runs a full test + audit pass
   (build, lint, tests, diff review against the roadmap task's acceptance criteria) before
   merging.
