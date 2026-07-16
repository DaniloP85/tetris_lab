# Quickstart: Validate Branch Protection with CODEOWNERS Review

## Prerequisites

- `gh` CLI installed and authenticated as an account with admin rights on `DaniloP85/tetris_lab` (verify: `gh auth status`).
- `.github/CODEOWNERS` already present on `main` with `* @DaniloP85` — already true, no action needed (see `research.md` R1).

## 1. Apply branch protection

```bash
gh api -X PUT repos/DaniloP85/tetris_lab/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input specs/001-branch-protection/contracts/branch-protection-payload.json
```

Expected: `200` response with the applied configuration (not an error).

## 2. Verify

```bash
gh api repos/DaniloP85/tetris_lab/branches/main/protection \
  --jq '{enforce_admins: .enforce_admins.enabled, required_pull_request_reviews}'
```

Expected output — matches `contracts/github-branch-protection-api.md` exactly:

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

This validates FR-003 through FR-009 and SC-003.

## 3. Test — code owner review is requested (User Story 1)

```bash
git checkout -b test/branch-protection-check
echo "" >> README.md
git commit -am "test: branch protection check"
git push -u origin test/branch-protection-check
gh pr create --title "test: branch protection check" --body "Validates branch protection" --base main
```

Expected: the PR page shows `@DaniloP85` requested as a reviewer, and the review requirement listed as unmet (this validates FR-001/FR-004 and SC-001).

## 4. Test — owner can still merge without third-party approval (User Story 2)

On the same PR, attempt to merge (`gh pr merge --squash` or via the web UI) without any approval.

Expected: GitHub does not silently block the merge — it offers **"Merge without waiting for requirements to be met (bypass rules)"**. Choosing it completes the merge. This validates FR-008, FR-011, and SC-002.

Clean up the test branch/PR afterward:

```bash
gh pr close test/branch-protection-check --delete-branch
```
(Skip `close` if the PR was already merged in step 4 — instead just `git push origin --delete test/branch-protection-check` and `git branch -D test/branch-protection-check` locally.)

## Rollback (if needed)

```bash
gh api -X DELETE repos/DaniloP85/tetris_lab/branches/main/protection
```
