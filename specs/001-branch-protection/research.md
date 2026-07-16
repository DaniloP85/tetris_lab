# Research: Branch Protection with CODEOWNERS Review

## R1: Does a CODEOWNERS file already exist in this repository?

- **Decision**: No new CODEOWNERS file needs to be created or merged. `.github/CODEOWNERS` already exists on `main` (commit `aabad4e`, "add codeowner", merged via PR #2 / merge commit `d67c226`) with the exact content `* @DaniloP85`.
- **Rationale**: Verified via `git log --oneline main` and by reading `.github/CODEOWNERS` directly — content matches FR-001 exactly. GitHub recognizes CODEOWNERS files in three locations: repo root, `.github/`, and `docs/`; `.github/CODEOWNERS` is a fully valid and idiomatic location (GitHub itself recommends `.github/` to keep the root uncluttered).
- **Alternatives considered**: Creating a duplicate root-level `CODEOWNERS` as the original request literally described — rejected because GitHub would treat the root file as authoritative over `.github/CODEOWNERS` if both existed, and maintaining two owner files invites drift. Since the existing file already satisfies the intent (single entry, `@DaniloP85`, all paths), no change is needed.
- **Impact on scope**: Step 1 of the original request ("create CODEOWNERS file... open a PR") is already done and requires no action. This plan's remaining scope is Steps 2–4: apply branch protection, verify, and test.

## R2: What is the exact reference configuration on `cli-loterias-caixa`?

- **Decision**: Confirmed live via `gh api repos/DaniloP85/cli-loterias-caixa/branches/main/protection` — the deployed configuration is:
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
- **Rationale**: This matches the target JSON provided in the spec exactly, confirming the request's payload is correct and battle-tested (already working in production on the reference repo).
- **Alternatives considered**: None — the user specified the exact target values and they are independently confirmed to be live and functioning on the reference repo.

## R3: How should the protection payload be applied?

- **Decision**: Use `gh api -X PUT repos/DaniloP85/tetris_lab/branches/main/protection` with `--input <file>.json` (a JSON file on disk), not `-f`/`-F` flags.
- **Rationale**: The GitHub branch-protection PUT endpoint has deeply nested fields (`required_pull_request_reviews.*`) and typed booleans/integers. `gh api -f`/`-F` only support flat key=value pairs and coerce everything to strings, which breaks nested objects and typed fields (e.g., `enforce_admins` must be a JSON boolean, not the string `"false"`). `--input` sends the exact JSON body, avoiding all type-coercion issues. This is a well-known `gh api` limitation for this specific endpoint.
- **Alternatives considered**: `-f`/`-F` flags — rejected due to the nested/typed field problem above. Web UI configuration — rejected because it's not scriptable/repeatable and the user explicitly asked for the `gh api` approach used on the reference repo.

## R4: Current state of `main` branch protection on `tetris_lab`

- **Decision**: Confirmed via `gh api repos/DaniloP85/tetris_lab/branches/main/protection` → currently returns `404 Branch not protected`. No existing protection rule to merge with or worry about conflicting with.
- **Rationale**: A clean PUT with the full desired payload is safe — there's no pre-existing configuration that could be partially overwritten in an unexpected way.
- **Alternatives considered**: N/A — this is a discovery step, not a choice.

## R5: Authentication / access verification

- **Decision**: Confirmed `gh auth status` shows an active, authenticated session as `DaniloP85` with `repo` OAuth scope (plus `gist`, `read:org`, `workflow`), sufficient to read and write branch protection settings and CODEOWNERS on `tetris_lab`.
- **Rationale**: Branch protection write access requires admin rights on the repository; `repo` scope on an account that owns the repo satisfies this.
- **Alternatives considered**: N/A.

## Summary of resolved unknowns

No `[NEEDS CLARIFICATION]` markers existed in the spec, and no technical unknowns remain: this is a GitHub repository configuration task with no application code, no language/framework/storage/testing stack in the traditional sense. The Technical Context section of `plan.md` is filled out to reflect that (Project Type: repository governance / infra config, not an application).
