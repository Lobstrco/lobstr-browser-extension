---

description: Brings code comments in line with the project policy — only important, relevant, single-line comments
argument-hint: "[paths | git-range] (defaults to the uncommitted diff)"
-----------------------------------------------------------------------

Bring comments in line with the project policy (AGENTS.md § Hard rules, item 2).
Read the repository's AGENTS.md before making any changes.

## Scope

* If arguments (`$ARGUMENTS`) are provided:

  * file/directory paths (repository-relative, for example `src/...`) — process them;
  * a `<git-range>` (for example `HEAD~3..`) — process files changed within that range.
* With no arguments: process the uncommitted diff
  (`git diff --name-only HEAD`) plus untracked code.
* Process code only. Do not touch documentation (`docs/`, `*.md`).

## Policy

A comment is justified only if it captures something the code itself cannot express:
an invariant (“never resets”), a non-obvious “why”, or an external constraint (API behavior,
backend requirement, network behavior). One line. Everything else is noise.

**Delete:**

* comments that merely restate the next line (“increment counter”, “load the balance”);
* change-log/PR comments (“added X”, “now handles Y”, “fixed the bug with…”, “this now does…”);
* commented-out code;
* empty section banners with no meaningful content;
* stale comments that contradict the code (verify against the code before deleting — if the comment
  is correct and the code is not, DO NOT delete it: flag it in the report as a possible bug).

**Shorten to one line:** multi-line explanations that have a clear one-line essence.

**Do not touch:**

* license headers;
* tool directives: `eslint-disable*`, `@ts-nocheck`, `@ts-expect-error`, `webpackChunkName`,
  `prettier-ignore`, `noqa`, `type: ignore`, `pylint: disable` (and an adjacent one-line rationale);
* `TODO`/`FIXME` comments with meaningful content (they may be shortened, but not deleted);
* docstrings/JSDoc on exported public APIs if they contain type or contract information.

## Procedure

1. Collect the list of files within scope.
2. Review the comments and apply the policy. Do not change code — comments only.
3. When finished, run the repository checks specified in AGENTS.md. They must remain green.
4. Report how many comments were deleted/shortened per file, and provide a separate list of comments
   that contradict the code (potential bugs) and were therefore preserved.
