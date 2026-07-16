---

description: "Task list template for feature implementation"
---

# Tasks: Branch Protection with CODEOWNERS Review

**Input**: Design documents from `/specs/001-branch-protection/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in the spec. This feature has no application code — "tasks" are the actual GitHub configuration action plus its verification steps, which double as acceptance tests for each user story.

**Organization**: Tasks are grouped by user story (from spec.md) so each story's acceptance scenario can be verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (independent checks/branches, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

No `src/`/`tests/` apply — this feature only touches `.github/CODEOWNERS` (already satisfied, no edit needed) and GitHub's branch protection API state for `DaniloP85/tetris_lab`'s `main` branch. Task descriptions reference the exact `gh` commands and the contract files in `specs/001-branch-protection/contracts/` instead of source file paths.

---

## Phase 1: Setup

**Purpose**: Confirm prerequisites are in place before applying protection

- [X] T001 Verify `gh auth status` shows an authenticated session with admin rights on `DaniloP85/tetris_lab` (per research.md R5)
- [X] T002 [P] Verify `.github/CODEOWNERS` on `main` contains exactly `* @DaniloP85` (per research.md R1) — confirms the prerequisite is already merged; no file change needed
- [X] T003 [P] Confirm `specs/001-branch-protection/contracts/branch-protection-payload.json` contains the exact target payload (per contracts/github-branch-protection-api.md)

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Apply the branch protection rule — every user story's verification depends on this being done first

**⚠️ CRITICAL**: No user story task can be verified until this phase is complete

- [X] T004 Apply branch protection to `main` by running:
  ```bash
  gh api -X PUT repos/DaniloP85/tetris_lab/branches/main/protection \
    -H "Accept: application/vnd.github+json" \
    --input specs/001-branch-protection/contracts/branch-protection-payload.json
  ```
  Confirm the response is `200 OK` (not an error).

**Checkpoint**: Branch protection is live on `main` — user story verification can now begin

---

## Phase 3: User Story 1 - Code owner review required on pull requests (Priority: P1) 🎯 MVP

**Goal**: Every PR against `main` automatically requests a code owner review and shows it as unmet until approved.

**Independent Test**: Open a PR against `main` and confirm `@DaniloP85` is requested as reviewer with the requirement shown as unmet.

- [X] T005 [US1] Run `gh api repos/DaniloP85/tetris_lab/branches/main/protection --jq '{require_code_owner_reviews: .required_pull_request_reviews.require_code_owner_reviews, required_approving_review_count: .required_pull_request_reviews.required_approving_review_count}'` and confirm the output is `{"require_code_owner_reviews": true, "required_approving_review_count": 1}`
- [X] T006 [US1] Create a throwaway branch `test/branch-protection-us1`, commit a trivial change (e.g. append a blank line to README.md), push it, and open a PR against `main` via `gh pr create --base main` (per quickstart.md step 3)
- [X] T007 [US1] On the PR from T006, confirm the code owner review requirement is shown as unmet; then close the PR and delete the branch (`gh pr close --delete-branch`). **Note**: since `@DaniloP85` is both PR author and sole code owner, GitHub omits them from `requested_reviewers` (can't self-request), but the gate is still active — confirmed via `reviewDecision: REVIEW_REQUIRED` and `mergeStateStatus: BLOCKED` on PR #2.

**Checkpoint**: User Story 1 is fully verified independently — this alone proves the core review gate works

---

## Phase 4: User Story 2 - Repository owner can still merge their own pull requests (Priority: P1)

**Goal**: The repo owner can merge a self-authored PR into `main` with zero third-party approvals via GitHub's bypass option.

**Independent Test**: Open a PR against `main`, obtain no approval, and confirm the merge UI offers "Merge without waiting for requirements to be met (bypass rules)" rather than blocking.

- [X] T008 [US2] Create a second throwaway branch `test/branch-protection-us2` (independent of US1's), commit a trivial change, push it, and open a PR against `main` via `gh pr create --base main` (opened as PR #3)
- [X] T009 [US2] Without obtaining any approval, attempt to merge the PR from T008 and confirm the bypass path is available — verified via `gh pr view --json reviewDecision,mergeStateStatus` showing `REVIEW_REQUIRED`/`BLOCKED`, and `gh pr merge --help` confirming `--admin` is the CLI equivalent of "Merge without waiting for requirements to be met (bypass rules)"
- [X] T010 [US2] Choose the bypass option (`gh pr merge 3 --squash --admin`) and confirm the merge completes successfully — merged as `b1ce97f`, PR #3 state `MERGED`
- [X] T011 [US2] Clean up: reverted the throwaway README content via a follow-up PR (#4, also admin-bypass-merged since the sole code owner is the PR author) and deleted the remote/local `test/branch-protection-us2` branch. `main` is back to its pre-test content.

**Checkpoint**: User Stories 1 AND 2 both verified independently — the two failure modes the user cares about (no review gate at all vs. owner locked out) are both confirmed handled correctly

---

## Phase 5: User Story 3 - Configuration is verifiable after setup (Priority: P2)

**Goal**: The full applied configuration can be confirmed via a single query, matching the intended values on every field.

**Independent Test**: Query branch protection settings for `main` and diff against the expected values.

- [X] T012 [US3] Run `gh api repos/DaniloP85/tetris_lab/branches/main/protection --jq '{enforce_admins: .enforce_admins.enabled, required_pull_request_reviews}'` and confirm the output matches exactly the expected block in `specs/001-branch-protection/contracts/github-branch-protection-api.md` (`enforce_admins: false`, `dismiss_stale_reviews: false`, `require_code_owner_reviews: true`, `require_last_push_approval: false`, `required_approving_review_count: 1`) — confirmed, exact match
- [X] T013 [US3] Run `gh api repos/DaniloP85/tetris_lab/branches/main/protection --jq '{required_status_checks, restrictions}'` and confirm both are `null` — confirmed

**Checkpoint**: All three user stories independently verified — configuration matches the reference (`cli-loterias-caixa`) exactly

---

## Phase 6: Polish

**Purpose**: Final sanity pass and spec bookkeeping

- [X] T014 [P] Walk through `specs/001-branch-protection/quickstart.md` end-to-end once more as a final sanity check — already covered live by T004–T013 (apply, verify, US1/US2 PR tests, cleanup)
- [X] T015 Update the **Status** field in `specs/001-branch-protection/spec.md` from `Draft` to `Implemented`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001–T003) — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational (T004) completion
  - US1, US2, US3 are independent of each other and can be verified in any order
- **Polish (Phase 6)**: Depends on all three user stories being verified

### User Story Dependencies

- **User Story 1 (P1)**: Can start after T004 — no dependency on US2/US3
- **User Story 2 (P1)**: Can start after T004 — uses its own throwaway branch/PR, no dependency on US1
- **User Story 3 (P2)**: Can start after T004 — read-only query, no dependency on US1/US2

### Parallel Opportunities

- T002 and T003 can run in parallel (independent verification checks)
- Once T004 completes, US1 (T005–T007), US2 (T008–T011), and US3 (T012–T013) can all proceed in parallel — they touch independent throwaway branches/PRs or read-only queries

---

## Parallel Example: After Foundational (T004)

```bash
# Launch all three user story verifications in parallel:
Task: "Verify code owner review is requested on a new PR (US1: T005-T007)"
Task: "Verify owner can bypass-merge an unapproved PR (US2: T008-T011)"
Task: "Verify full config via GET query (US3: T012-T013)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T004 — apply protection)
3. Complete Phase 3: User Story 1 (T005–T007)
4. **STOP and VALIDATE**: Confirm code owner review is requested on new PRs
5. This alone delivers the primary governance control

### Incremental Delivery

1. Setup + Foundational → protection applied
2. US1 → verify review gate works (MVP)
3. US2 → verify owner isn't locked out (the specific regression this whole feature exists to avoid)
4. US3 → verify full config via query (confidence/documentation step)
5. Polish → final quickstart pass + spec status update

---

## Notes

- This feature has no source code, so "parallel tasks on different files" becomes "parallel checks on independent throwaway branches/PRs" — the same independence principle, applied to GitHub state instead of files.
- T004 is the single action that changes state; every other task is verification/read-only against that one applied configuration.
- Commit/PR test artifacts (T006, T008) are throwaway and cleaned up in the same phase (T007, T011) — do not leave stray test branches or PRs open on the real repository.
