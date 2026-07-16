# Data Model: Branch Protection with CODEOWNERS Review

This feature configures GitHub repository governance state rather than application data. The "entities" below are GitHub-managed configuration objects, not database records.

## Entity: CODEOWNERS entry

Represents ownership of paths in the repository, read by GitHub from `.github/CODEOWNERS`.

| Field | Type | Value in this feature | Notes |
|---|---|---|---|
| pattern | string (gitignore-style glob) | `*` | Matches all paths in the repo |
| owners | list of GitHub usernames/teams | `@DaniloP85` | Single owner; must be a collaborator with write access |

**State**: Already exists on `main` (see `research.md` R1). No transitions needed — this entity is read-only for this feature.

## Entity: Branch protection rule (main)

Represents GitHub's branch protection configuration object for the `main` branch, as returned/accepted by `GET|PUT /repos/{owner}/{repo}/branches/{branch}/protection`.

| Field | Type | Target value | Notes |
|---|---|---|---|
| `required_status_checks` | object \| null | `null` | No CI gating in scope |
| `enforce_admins` | boolean | `false` | Lets the repo owner (admin) bypass an unmet review requirement when merging |
| `required_pull_request_reviews.dismiss_stale_reviews` | boolean | `false` | New commits on an already-approved PR do not clear the approval |
| `required_pull_request_reviews.require_code_owner_reviews` | boolean | `true` | Core requirement — PRs need a CODEOWNERS-matched approval |
| `required_pull_request_reviews.require_last_push_approval` | boolean | `false` | The most recent push does not need a separate re-approval |
| `required_pull_request_reviews.required_approving_review_count` | integer | `1` | One approval satisfies the gate |
| `restrictions` | object \| null | `null` | No push-access restriction beyond normal collaborator permissions |

**State transitions**:

1. **Unprotected** (current state — confirmed via `GET`, returns `404 Branch not protected`) →
2. **Protected** (after `PUT` with the target payload above) — verified via a subsequent `GET` returning the same values.

There is no intermediate or partial state contemplated by this feature: the `PUT` call is idempotent and replaces the full configuration in one request.

## Relationships

- The **branch protection rule** with `require_code_owner_reviews: true` depends on the **CODEOWNERS entry** existing on `main` at apply time — without it, GitHub has no owner to request review from, even though the flag is set. (See `research.md` R1 — this dependency is already satisfied.)
- A **pull request** targeting `main` is evaluated against the branch protection rule at merge time: its approval state (from code owners) is compared to `required_approving_review_count`, and `enforce_admins: false` determines whether an admin can override an unmet requirement.
