---
"@marcfargas/skills": patch
---

Flatten directory structure for skills CLI compatibility.

All skills are now at the top level (e.g., `azcli/`, `gcloud/`) instead of nested in category folders (`azure/azcli/`, `google-cloud/gcloud/`). Progressive discovery reference files moved to `ref/` subdirectories to prevent pi from detecting them as separate skills.

**Before:** 1/8 skills found by default (npx skills add)  
**After:** 8/8 skills found by default ✅

**Structure:**
```
azcli/
├── SKILL.md       ← hub (150 lines)
└── ref/           ← loaded on demand
    ├── auth.md
    ├── storage.md
    └── ...
```
