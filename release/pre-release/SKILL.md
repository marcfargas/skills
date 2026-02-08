---
name: pre-release
description: >-
  Pre-release review and changeset generation for npm packages using @changesets/cli.
  Use when: preparing a release, generating changelogs, pre-release checklist, version bump,
  writing release notes, reviewing README before publish. Triggers: "prepare release",
  "pre-release", "generate changelog", "write changesets", "release checklist".
---

# pre-release — Release Readiness & Changeset Generation

A structured pre-release workflow that runs automated checks, generates user-facing
changesets from git history, and optionally spawns fresh-eyes README reviewers.

## When to Use

- Before any `npm publish` or version bump
- When you need to generate CHANGELOG entries from recent work
- Before merging a release PR
- Any time you want a release-readiness report

## Prerequisites

The target project must have `@changesets/cli` initialized:

```bash
npm install --save-dev @changesets/cli @changesets/changelog-github
npx changeset init
```

See [Changesets Setup](#changesets-setup) for first-time configuration.

## The Workflow

### Step 1: Pre-Flight Checks

Run these checks against the project root. Report each as ✅ / ❌ / ⚠️:

| # | Check | How |
|---|-------|-----|
| 1 | README.md exists with: purpose, install, usage, prerequisites, license | Read and verify sections |
| 2 | LICENSE file present and matches `package.json` license field | Compare files |
| 3 | No hardcoded credentials, API keys, or personal paths in tracked files | `git grep -iE '(api.key\|secret\|password\|token\|/Users/\|/home/\|C:\\\\Users)' -- ':!*.lock' ':!node_modules'` |
| 4 | No TODO/FIXME/HACK in shipped code | `git grep -iE '(TODO\|FIXME\|HACK)' -- '*.ts' '*.js' '*.mjs' ':!node_modules' ':!*.test.*' ':!*.spec.*'` |
| 5 | Tests pass | `npm test` (or project's test command) |
| 6 | Lint passes | `npm run lint` (if script exists) |
| 7 | Build succeeds | `npm run build` (if script exists) |
| 8 | Git working tree clean | `git status --porcelain` |
| 9 | On correct branch | `git branch --show-current` (should be `main` or release branch) |
| 10 | .gitignore covers: `node_modules`, `dist`, `.env`, editor config | Read `.gitignore` |
| 11 | `package.json` has required fields: name, version, description, license, repository | Read and verify |
| 12 | `.changeset/config.json` exists and is configured | Read and verify |

**Blockers** (must fix before release): checks 1-5, 8, 11-12.
**Warnings** (should fix): checks 6-7, 9-10.
**Info**: anything else notable.

### Step 2: Generate Changesets

This is the core value — AI-written, user-facing release notes instead of mechanical commit scraping.

#### 2a. Find the range

```bash
# Last release tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# If no tags, use first commit
if [ -z "$LAST_TAG" ]; then
  RANGE="$(git rev-list --max-parents=0 HEAD)..HEAD"
  echo "No previous tags found — covering entire history"
else
  RANGE="${LAST_TAG}..HEAD"
  echo "Changes since $LAST_TAG"
fi
```

#### 2b. Gather the raw material

```bash
# Commits with files changed
git log $RANGE --pretty=format:'%h %s' --no-merges

# For more context on what changed
git log $RANGE --pretty=format:'### %h %s%n%b' --no-merges

# Files changed (to understand scope)
git diff --stat $LAST_TAG..HEAD 2>/dev/null || git diff --stat $(git rev-list --max-parents=0 HEAD)..HEAD
```

Also check for **existing pending changesets** — don't duplicate:

```bash
ls .changeset/*.md 2>/dev/null | grep -v README.md
```

If there are already changeset files, read them and account for what's already covered.

#### 2c. Classify and write changesets

Group commits by impact and write changeset files. Each changeset is a markdown file in `.changeset/`:

**File format** (`.changeset/<descriptive-name>.md`):

```markdown
---
"package-name": patch
---

Brief, user-facing description of what changed.
```

**Semver classification:**

| Type | Bump | Examples |
|------|------|---------|
| Breaking API changes | `major` | Removed function, changed signature, dropped Node version |
| New features, capabilities | `minor` | New command, new option, new API |
| Bug fixes, docs, internal | `patch` | Fix crash, update README, refactor internals |

**Writing guidelines:**

- Write for **users**, not developers. "Added `--verbose` flag" not "refactored logger module"
- Group related commits into a single changeset when they're part of one logical change
- Use present tense: "Add", "Fix", "Remove", not "Added", "Fixed", "Removed"
- If a commit is purely internal (CI, refactor with no behavior change), it can be omitted or grouped under a generic "Internal improvements" patch
- One changeset per logical change, not per commit

**Name the files descriptively** using kebab-case: `add-verbose-flag.md`, `fix-auth-crash.md`, `initial-release.md`.

#### 2d. For initial releases (no previous tags)

Write a single changeset covering the initial release:

```markdown
---
"package-name": minor
---

Initial release.

- Feature 1: brief description
- Feature 2: brief description
- Feature 3: brief description
```

Use `minor` (0.1.0) for initial releases unless the project is already at 1.x.

### Step 3: Fresh-Eyes README Review (Optional)

Load the `run-agents` skill. Spawn 2 agents on different models to review the README as first-time users:

```bash
PROJECT_PATH="<absolute-path-to-project>"

PROMPT='Read the README.md in '"$PROJECT_PATH"'. You are a developer who has NEVER seen this project.

Can you answer these questions from the README alone?
1. What does this project do? (one sentence)
2. How do I install it?
3. How do I use it? (basic example)
4. What are the prerequisites?
5. Where do I report bugs or get help?

For each: quote the relevant text you found, or say MISSING.
Then: list anything confusing, outdated, or that assumes prior knowledge.
Be specific — quote the text that confused you.'

REVIEWS="$PROJECT_PATH/reviews"
mkdir -p "$REVIEWS"

pi -p --no-session --tools read --model google/gemini-3-pro "$PROMPT" > "$REVIEWS/readme-gemini.md" 2>/dev/null &
pi -p --no-session --tools read --model github-copilot/gpt-5.3 "$PROMPT" > "$REVIEWS/readme-gpt.md" 2>/dev/null &
wait
```

Read both outputs and note any gaps.

### Step 4: Report

Present the final report in this structure:

```markdown
# Pre-Release Report: <package-name>

## Version: <current> → <proposed>
## Date: <today>

### Checklist
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | README | ✅/❌ | ... |
| ... |

### Changesets Generated
| File | Bump | Summary |
|------|------|---------|
| `add-feature-x.md` | minor | Add feature X |
| ... |

### README Review
(If Step 3 was run)
- **Gaps**: ...
- **Confusing**: ...

### Blockers (must fix)
1. ...

### Suggestions (can wait)
1. ...

### Ready to Release?
**YES** / **NO — N blockers remain**
```

### Step 5: Commit (if approved)

If the user approves, commit the changeset files:

```bash
git add .changeset/*.md
git commit -m "chore: add changesets for next release" -m "Co-Authored-By: Pi <noreply@pi.dev>"
```

---

## Changesets Setup

For projects that don't have changesets yet. Run once:

### 1. Install

```bash
npm install --save-dev @changesets/cli @changesets/changelog-github
npx changeset init
```

### 2. Configure `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.2/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

Set `"access": "public"` for scoped packages (`@scope/name`).
Set `"baseBranch"` to your default branch.

### 3. Add npm scripts to `package.json`

```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "changeset publish"
  }
}
```

### 4. GitHub Actions workflow (`.github/workflows/release.yml`)

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

permissions:
  contents: write
  pull-requests: write
  id-token: write  # Required for npm Trusted Publishing (OIDC)

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24  # npm >= 11.5.1 required for Trusted Publishing
          cache: npm
          registry-url: https://registry.npmjs.org

      - run: npm ci
      - run: npm run build
      - run: npm test

      - name: Create Release PR or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: npx changeset publish
          title: "chore: version packages"
          commit: "chore: version packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 5. Configure Trusted Publishing (recommended — no tokens needed)

npm's [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) uses OIDC to authenticate
GitHub Actions with the npm registry. No `NPM_TOKEN` secret required.

1. Go to your package on **npmjs.com** → Settings → Trusted Publisher
2. Select **GitHub Actions** and configure:
   - **Organization or user**: your GitHub username
   - **Repository**: your repo name
   - **Workflow filename**: `release.yml`
3. That's it. The `id-token: write` permission in the workflow enables OIDC.
   Provenance attestations are generated automatically.

After verifying Trusted Publishing works, go to package Settings → Publishing access →
**"Require two-factor authentication and disallow tokens"** for maximum security.

**Fallback (token-based)**: If Trusted Publishing isn't available for your setup, add an
`NPM_TOKEN` secret (Settings → Secrets → Actions) with a [granular access token](https://docs.npmjs.com/creating-and-viewing-access-tokens)
scoped to publish. Add to the workflow env: `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.

---

## Tips

- **Run this skill early and often**, not just before release. The checklist catches issues faster when run during development.
- **Edit generated changesets freely.** They're just markdown files — tweak wording, merge entries, split large ones.
- **One changeset per PR** is a good rhythm. The pre-release skill can also be run to generate changesets for a single PR's worth of work.
- **For monorepos**, changesets handles multi-package versioning natively. List multiple packages in the frontmatter.
