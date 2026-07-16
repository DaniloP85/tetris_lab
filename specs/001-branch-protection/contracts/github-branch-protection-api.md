# Contract: GitHub Branch Protection API (main)

This feature's only external interface is the GitHub REST API for branch protection on `DaniloP85/tetris_lab`, branch `main`. There is no application code, so this "contract" documents the API request/response shape this feature depends on, rather than a service the project exposes.

## Endpoint

`PUT /repos/DaniloP85/tetris_lab/branches/main/protection`

Auth: requires admin permission on the repository (satisfied by the authenticated `gh` session — see `research.md` R5).

### Request body

See [`branch-protection-payload.json`](./branch-protection-payload.json) for the exact literal payload (also embedded below for reference):

```json
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": true,
    "require_last_push_approval": false,
    "required_approving_review_count": 1
  },
  "restrictions": null
}
```

Required headers: `Accept: application/vnd.github+json`.

Must be sent via `--input <file>` (not `-f`/`-F`) — see `research.md` R3 for why.

### Expected response

`200 OK` with a JSON body echoing the applied configuration. The fields this feature cares about (see `data-model.md`):

```json
{
  "enforce_admins": { "enabled": false },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": true,
    "require_last_push_approval": false,
    "required_approving_review_count": 1
  }
}
```

## Verification query

`GET /repos/DaniloP85/tetris_lab/branches/main/protection`

Expected (filtered with `--jq '{enforce_admins: .enforce_admins.enabled, required_pull_request_reviews}'`, matching FR-010 / SC-003):

```json
{
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": true,
    "require_last_push_approval": false,
    "required_approving_review_count": 1
  }
}
```

## Preconditions

- `.github/CODEOWNERS` must exist on `main` with `* @DaniloP85` before (or at the moment of) this call taking effect — already satisfied (`research.md` R1).
- The authenticated actor must have admin rights on the repository — already satisfied (`research.md` R5).

## Postconditions

- `GET` on the same endpoint returns a `200` (not `404 Branch not protected`) with the values above.
- Opening a pull request against `main` requests review from `@DaniloP85` and shows the review requirement as unmet until approved.
- The repository owner, when merging a PR without a code owner approval, sees a "Merge without waiting for requirements to be met (bypass rules)" option instead of being blocked outright.
