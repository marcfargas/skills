---
"@marcfargas/skills": patch
---

Add lint, build, skills discovery, and CI hardening.

- Add markdown linting via `markdownlint-cli2` with agent-friendly config
- Add `npm run build` to produce `dist/skills.zip` for easy download and install
- Add `.well-known/skills/index.json` for Agent Skills spec discovery
- Add CI: lint, build, per-skill install verification, post-publish smoke tests
- Harden pre-release skill with 8 new security checks (trusted publishers, history scan, workflow audit, redaction review, skills discovery)
- Pin all GitHub Actions by SHA, add least-privilege permissions
- Exclude nested `node_modules` from npm package via `.npmignore` + negation patterns
