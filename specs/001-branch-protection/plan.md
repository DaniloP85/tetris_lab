# Implementation Plan: Branch Protection with CODEOWNERS Review

**Branch**: `001-branch-protection` | **Date**: 2026-07-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-branch-protection/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Configure GitHub branch protection on `DaniloP85/tetris_lab`'s `main` branch to require a code-owner-approved pull request review (1 approval, no stale-review dismissal, no last-push re-approval) while keeping `enforce_admins: false` so the repo owner can bypass the unmet-review requirement and merge their own PRs — replicating the working configuration already live on `DaniloP85/cli-loterias-caixa`. Research confirmed the prerequisite CODEOWNERS file (`.github/CODEOWNERS`, `* @DaniloP85`) is already merged to `main`, so the only remaining work is the branch protection API call itself, plus verification and a live PR test.

## Technical Context

**Language/Version**: N/A — no application code changes. This feature is a GitHub repository/API configuration change (branch protection settings), executed via `gh` CLI.

**Primary Dependencies**: GitHub REST API (`branches/{branch}/protection` endpoint), `gh` CLI v2.83.0 (already installed and authenticated as `DaniloP85` with `repo` scope).

**Storage**: N/A — configuration is stored by GitHub, not the repository.

**Testing**: Manual/scripted verification via `gh api` GET requests and a live end-to-end pull-request test (see `quickstart.md`); no automated test suite applies to this feature (jest tests in `tests/` are unrelated to repository governance settings).

**Target Platform**: GitHub.com repository `DaniloP85/tetris_lab`.

**Project Type**: Repository governance / infrastructure configuration (not an application feature — no `src/` changes).

**Performance Goals**: N/A.

**Constraints**: Must not set `enforce_admins: true` (would lock the sole admin out of merging their own PRs — the exact regression already hit and fixed on `cli-loterias-caixa`). Must use `--input <file>` for the `gh api PUT` call, not `-f`/`-F` flags, due to nested/typed JSON fields (see `research.md` R3).

**Scale/Scope**: Single repository, single branch (`main`), single code owner (`@DaniloP85`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` contains only unfilled template placeholders (no ratified project principles exist yet). There are no concrete gates to evaluate against. This gate passes vacuously — re-checked post-design below with the same result.

**Post-design re-check**: No change — no application code, architecture, or complexity was introduced by Phase 1 design artifacts, so no constitution principle is at risk.

## Project Structure

### Documentation (this feature)

```text
specs/001-branch-protection/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── branch-protection-payload.json
│   └── github-branch-protection-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

No source code changes are part of this feature. The only repository file touched is `.github/CODEOWNERS`, which already exists and already satisfies the requirement (see `research.md` R1) — no edit needed.

```text
.github/
└── CODEOWNERS            # already exists: "* @DaniloP85" — no change required
```

All remaining work (branch protection PUT/GET calls) happens against the GitHub API and does not correspond to any file in the repository tree.

**Structure Decision**: No new source/test directories. This is a configuration-only feature scoped to `.github/CODEOWNERS` (already satisfied) and GitHub's branch protection API for `main`. Standard `src/`/`tests/` layout options do not apply.

## Complexity Tracking

*No constitution violations — this section is not applicable.*
