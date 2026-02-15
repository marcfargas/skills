---
"@marcfargas/skills": patch
---

Restructure for skills CLI compatibility and cleaner organization.

All skills moved to `skills/` subdirectory with flat structure. Progressive discovery reference files in `ref/` subdirectories.

**Before:** Nested category folders, 1/8 skills found by default  
**After:** Flat `skills/` directory, 8/8 skills found by default ✅

**Structure:**
```
/
├── README.md
├── LICENSE
└── skills/
    ├── azcli/
    │   ├── SKILL.md    ← hub (~150 lines)
    │   └── ref/        ← loaded on demand
    │       ├── auth.md
    │       └── ...
    ├── gcloud/
    └── ...
```

**Key improvements:**
- `npx skills add marcfargas/skills` discovers all 8 skills (no `--full-depth` needed)
- Pi only detects `SKILL.md` files (not reference docs)
- Cleaner repo root (README, LICENSE separate from skills)
