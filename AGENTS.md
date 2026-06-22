# Project coordination

This repository is the source of truth across Codex sessions and devices.

## Before changing code

1. Read the current working tree and latest commits with `git status` and `git log`.
2. Treat the current `HEAD` as newer than conversation history.
3. Preserve changes and commits created by other Codex sessions. Never restore an older UI only because the current thread remembers it.
4. If the working tree changed during the task, re-read the affected files before editing.
5. Instructions may come from separate phone and PC Codex sessions. Merge all compatible work through the repository instead of treating either device's conversation as authoritative.
6. Before publishing, include any newer compatible commits already present in the repository and verify that the combined result preserves both sessions' requested behavior.

## After changing code

1. Run the relevant syntax and browser checks.
2. Commit only the files that belong to the task.
3. Push the combined `main` branch to GitHub. Vercel publishes the pushed version automatically for preview.
4. Netlify is manual-only to conserve credits. Run `scripts/publish-netlify.sh` only when the user explicitly requests a Netlify production release.

Codex conversation threads are independent. Repository state, not thread memory, decides which implementation is current.
