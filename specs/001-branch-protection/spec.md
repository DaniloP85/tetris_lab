# Feature Specification: Branch Protection with CODEOWNERS Review

**Feature Branch**: `001-branch-protection`

**Created**: 2026-07-16

**Status**: Implemented

**Input**: User description: "Aplicar no repositório DaniloP85/tetris_lab a mesma proteção de branch que já existe em DaniloP85/cli-loterias-caixa: exigir revisão de code owner nos PRs para a main, mas sem travar o dono do repositório (admin) de mergear os próprios PRs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Code owner review required on pull requests (Priority: P1)

As the repository owner and sole maintainer of `tetris_lab`, I want every pull request targeting `main` to require a code owner review, so that the repository has the same governance baseline as my other project (`cli-loterias-caixa`) and is ready for a future second contributor without any extra setup.

**Why this priority**: This is the core governance control being requested. Without it, there is no enforced review gate on `main` at all, and the feature has no effect.

**Independent Test**: Open a pull request from a branch into `main` and confirm the PR page shows a code owner review requirement that is unmet until `@DaniloP85` (or a future designated owner) approves.

**Acceptance Scenarios**:

1. **Given** a `CODEOWNERS` file exists at the repository root assigning `@DaniloP85` as owner of all paths (`*`), **When** a pull request is opened against `main`, **Then** GitHub requests a review from `@DaniloP85` and marks the code owner review requirement as unmet until an approval is recorded.
2. **Given** branch protection is configured on `main` with `require_code_owner_reviews: true` and `required_approving_review_count: 1`, **When** the protection settings are queried, **Then** they report those exact values along with `dismiss_stale_reviews: false` and `require_last_push_approval: false`.

---

### User Story 2 - Repository owner can still merge their own pull requests (Priority: P1)

As the repository owner, I want to be able to merge my own pull requests even though I cannot approve my own review (a GitHub platform restriction), so that enabling branch protection does not block my normal workflow.

**Why this priority**: This is the specific failure mode the user is trying to avoid — it already happened on `cli-loterias-caixa` and had to be corrected. Getting this wrong makes the repository unusable for a single-maintainer workflow.

**Independent Test**: As the repository owner, open a pull request against `main`, do not obtain any third-party approval, and confirm the merge UI offers a way to merge anyway (bypassing the unmet review requirement) rather than blocking the merge entirely.

**Acceptance Scenarios**:

1. **Given** branch protection on `main` has `enforce_admins: false`, **When** the repository owner (an admin) attempts to merge a pull request that has not been approved by a code owner, **Then** GitHub presents an option to merge without waiting for the requirement to be met, and the merge succeeds when the owner chooses it.
2. **Given** the same branch protection configuration, **When** protection settings are queried, **Then** `enforce_admins.enabled` reports `false`.

---

### User Story 3 - Configuration is verifiable after setup (Priority: P2)

As the repository owner, I want to be able to confirm the branch protection settings actually took effect, so that I know the repository matches the intended policy before relying on it.

**Why this priority**: Verification is not the protection itself, but without it there's no confirmation the configuration was applied correctly; it's a supporting step rather than the primary goal.

**Independent Test**: Query the branch protection settings for `main` after setup and compare the result against the expected values.

**Acceptance Scenarios**:

1. **Given** branch protection has been configured on `main`, **When** the owner inspects the current protection settings, **Then** the reported settings match exactly: `enforce_admins` disabled, `require_code_owner_reviews` true, `required_approving_review_count` 1, `dismiss_stale_reviews` false, `require_last_push_approval` false, no required status checks, and no push restrictions.

---

### Edge Cases

- What happens if the `CODEOWNERS` file is missing or not yet merged into `main` when branch protection with `require_code_owner_reviews: true` is applied? The code owner review requirement has nothing to match against, so the intended reviewer may not be requested automatically; the `CODEOWNERS` file must be present on `main` before (or as part of) enabling the requirement.
- What happens if a future second contributor opens a pull request? They are subject to the same requirement — a code owner (`@DaniloP85`) must approve, and only an admin can bypass an unmet requirement; a non-admin contributor cannot self-bypass.
- What happens if the repository owner pushes additional commits to their own pull request after it was already approved by someone else? `dismiss_stale_reviews` is set to `false`, so the existing approval remains valid and is not automatically dismissed.
- What happens if someone tries to push directly to `main` instead of via pull request? Branch protection with required pull request reviews prevents direct pushes from bypassing the review requirement for non-admins; the admin bypass path is limited to the merge-without-waiting option on pull requests, not to arbitrary direct pushes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST contain a `CODEOWNERS` file at its root that designates `@DaniloP85` as the owner of all paths.
- **FR-002**: The `CODEOWNERS` file MUST be introduced via a pull request into `main` (not a direct commit to `main`), consistent with the repository's existing contribution flow.
- **FR-003**: The `main` branch MUST have branch protection enabled with a required pull request review before merging.
- **FR-004**: The `main` branch protection MUST require code owner review specifically (`require_code_owner_reviews: true`).
- **FR-005**: The `main` branch protection MUST require at least 1 approving review (`required_approving_review_count: 1`).
- **FR-006**: The `main` branch protection MUST NOT dismiss stale reviews on new commits (`dismiss_stale_reviews: false`).
- **FR-007**: The `main` branch protection MUST NOT require the last pushed commit to be separately re-approved (`require_last_push_approval: false`).
- **FR-008**: The `main` branch protection MUST NOT enforce restrictions on administrators (`enforce_admins: false`), so the repository owner can merge their own pull requests without third-party approval by using GitHub's bypass option.
- **FR-009**: The `main` branch protection MUST NOT require any status checks and MUST NOT restrict which users/teams can push (both left unset/null), matching the reference configuration.
- **FR-010**: The applied configuration MUST be verifiable by querying the branch protection settings for `main` and confirming they match the intended values.
- **FR-011**: The configuration MUST allow the repository owner to complete a merge on a pull request that lacks a code owner approval, via an explicit "merge without waiting for requirements to be met" action, without disabling the review requirement itself.

### Key Entities

- **CODEOWNERS file**: A repository-root file mapping path patterns to responsible GitHub users; here, a single entry (`*`) assigning all paths to `@DaniloP85`.
- **Branch protection rule (main)**: The set of GitHub-enforced constraints on the `main` branch, including review requirements, admin enforcement, status checks, and push restrictions.
- **Pull request**: The unit of change review; carries its own review-approval state that the branch protection rule evaluates against.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After setup, 100% of new pull requests opened against `main` automatically request review from the designated code owner.
- **SC-002**: The repository owner can merge a self-authored pull request into `main` with zero third-party approvals, using the bypass option, on the first attempt after setup — matching the working behavior already achieved on `cli-loterias-caixa`.
- **SC-003**: Querying branch protection settings for `main` after setup returns a result matching the intended configuration on every field (`enforce_admins`, `require_code_owner_reviews`, `required_approving_review_count`, `dismiss_stale_reviews`, `require_last_push_approval`) with no manual correction needed.
- **SC-004**: A non-admin collaborator (if one exists in the future) cannot merge a pull request into `main` without a code owner approval.

## Assumptions

- The repository `DaniloP85/tetris_lab` already exists on GitHub and the acting user has admin access to it, mirroring the setup already in place for `cli-loterias-caixa`.
- `@DaniloP85` is and will remain the sole code owner for now; the `*` catch-all pattern is intentional and sufficient (no path-specific ownership is required).
- "Admin" in this context refers to the repository owner (`DaniloP85`), who is expected to be the only account with bypass privileges; no other admins are assumed.
- The default branch of the repository is `main` (confirmed by the current git status showing `main` as the base/default branch).
- No required status checks (CI) are part of this protection policy — this feature covers review requirements only, not build/test gating.
- Push restrictions (limiting who can push to `main` at all) are intentionally left unset, consistent with the reference repository's configuration.
