---
"@marcfargas/skills": patch
---

Flatten directory structure for skills CLI compatibility.

All skills are now at the top level (e.g., `azcli/`, `gcloud/`) instead of nested in category folders (`azure/azcli/`, `google-cloud/gcloud/`). This allows `npx skills add marcfargas/skills` to discover all 8 skills without the `--full-depth` flag.

**Before:** 1/8 skills found by default  
**After:** 8/8 skills found by default
