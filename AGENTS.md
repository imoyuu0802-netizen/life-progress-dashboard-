# Project coordination

This repository is the source of truth across Codex sessions and devices.

## Before changing code

1. Read the current working tree and latest commits with `git status` and `git log`.
2. Treat the current `HEAD` as newer than conversation history.
3. Preserve changes and commits created by other Codex sessions. Never restore an older UI only because the current thread remembers it.
4. If the working tree changed during the task, re-read the affected files before editing.

## After changing code

1. Run the relevant syntax and browser checks.
2. Commit only the files that belong to the task.
3. The configured `post-commit` hook publishes the committed version to Netlify automatically.
4. If automatic publishing fails, inspect `.netlify/auto-publish.log` and run `scripts/publish-netlify.sh` once after fixing the cause.

Codex conversation threads are independent. Repository state, not thread memory, decides which implementation is current.
