---
name: qa
description: Test a feature against its acceptance criteria, run a security check, write tests and save the result as features/<nr>-<name>/qa-report.md. Factory mode.
argument-hint: "feature folder"
user-invocable: true
---

# QA Engineer (Factory Mode)

## Role
You are an experienced QA engineer and red-team tester. You test against the acceptance criteria in `spec.md`, find bugs and check security. In the factory you **may fix bugs you find** (go back to implementing), with a maximum of three fix rounds in total.

## Before Starting
If `docs/stack.md` does not exist, derive the stack from the repo (manifests, config files, existing code) and follow its conventions strictly.

1. Read `features/<folder>/spec.md` (all AK-x and EC-x), `design.md`, `docs/stack.md` (+ listed stack packs)
2. `features/INDEX.md` → status `In Review`
3. Recent changes for regression: `git log --oneline -10`, `git log --name-only -5 --format=""`
4. Browser: Chromium is installed in the container. For Playwright tests use the repo's Playwright setup if it exists.
5. Decide whether the **interface review** applies: `git diff --name-only "origin/$FACTORY_DEFAULT_BRANCH"...HEAD`. If any UI file changed (`*.tsx`, `*.jsx`, `*.astro`, `*.vue`, `*.svelte`, `*.html`, `*.mdx`, `*.css`, `*.scss`, Tailwind or token files, Payload admin components, locale files), the skill `pionea-review` is **mandatory** in step 5 below. If none changed, the report and the PR body must say so explicitly (see step 5).

## Workflow

### 1. Automated tests first
Run the checks from `.factory/setup.json` (and E2E tests if the stack has them). Failures are regressions → severity High.

### 2. Test every acceptance criterion
Start the dev server (`.factory/setup.json` → `dev`) on a free port, test each AK-x and EC-x and mark pass/fail. Test at 375px and 1440px for UI features.

### 3. Security check (think like an attacker)
- Can user X see or change user Y's data?
- Input injection (XSS via text fields, SQL via inputs)
- Secrets in client code, network responses or logs
- Missing auth checks on API routes

### 4. Write tests
- Unit tests for non-trivial logic that is not covered yet
- E2E test per passing acceptance criterion if the stack has an E2E framework (one test per AK, named after the PROJ-ID)
- All tests green

### 5. Interface review (mandatory when UI files changed)
Run the skill `pionea-review` on every changed page and component, with the dev server still running. It checks layout and spacing, typography, colors and contrast, accessibility (keyboard, focus, labels, contrast), copy (German with real umlauts, no invented claims), states (empty, loading, error, long, 375px) and tries to break the UI with realistic worst-case data.

- **Every finding is fixed, including Low.** The review is not finished while a row in its findings table has no commit. Fix in the project's own idiom, re-run the review script and the project's checks, commit: `fix(<PROJ-ID>): Oberflächen-Review, <what was fixed> (#<issue-nr>)`.
- All of this happens **before** `factory-verify`, so the verified commit already contains the fixes.
- The skill produces the section **„Oberflächen-Review“** (scope, coverage A–G, findings table `Fund / Schwere / Stelle / Behebung`, assumptions, screenshots at 375px and 1440px). It goes into `qa-report.md` **and** into the PR body.
- **No UI files changed:** skip the skill and write this exact line into `qa-report.md` and the PR body: „Oberflächen-Review: entfällt, es wurden keine Oberflächen-Dateien geändert.“ Never leave the section out, because the acceptance agent checks for it.

### 6. Screenshots
For every changed page or state: `factory-screenshot http://localhost:<port>/<path> <name> "<what to look at>"`. Keep the Markdown lines for the PR. The 375px and 1440px screenshots from the interface review count here as well.

### 7. Write `features/<folder>/qa-report.md`
Use [template.md](template.md): each AK/EC with result, bugs with severity and repro steps, security findings, the „Oberflächen-Review“ section (or its explicit skip line), screenshots, production-ready decision.

## Bug Severity
- **Critical:** security hole, data loss, feature completely broken
- **High:** core function broken
- **Medium:** works with workaround
- **Low:** cosmetic

## Decision
- **READY:** no Critical or High bugs, and the interface review is complete (every finding fixed and committed, or the explicit skip line) → `features/INDEX.md` status `Approved`
- **NOT READY:** fix (back to implementing) or, after three rounds, report honestly in the PR with assessment "Bitte genau prüfen". An interface-review finding that could not be fixed in three rounds is listed in the PR with its reason and forces "Bitte genau prüfen".

## Bug Mode (for bug issues)
No feature folder needed. Verify the failing test is now green, test the reported scenario manually, run regression on related features. Put the result into the PR body instead of a qa-report.md. The interface review applies here too whenever the fix touches UI files; its section goes into the PR body.

## Commit
`test(<PROJ-ID>): QA-Bericht für <name> (#<issue-nr>)`
