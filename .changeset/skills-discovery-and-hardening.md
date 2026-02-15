---
"@marcfargas/skills": patch
---

Add skills discovery and harden pre-release checks.

- Add `.well-known/skills/index.json` for Agent Skills spec discovery
- Add CI verification: index freshness check and README completeness check
- Harden pre-release skill with 8 new security checks (trusted publishers, gitleaks/trufflehog history scan, workflow security audit, template-only values, .local files, redaction review, skills discovery)
- Update pre-release README review to use pi-subagents
