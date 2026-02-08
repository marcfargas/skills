# Skills

Reusable skills for AI coding agents. Works with [pi](https://github.com/mariozechner/pi-coding-agent), [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.sh), and any agent that supports the [Agent Skills standard](https://agentskills.io/specification).

## Available Skills

| Category | Skill | Description |
|----------|-------|-------------|
| ☁️ Google Cloud | [gcloud](google-cloud/gcloud/) | GCP CLI with agent safety model — hub + 7 reference files |
| 🚀 Release | [pre-release](release/pre-release/) | Pre-release checklist + AI-written changesets via @changesets/cli |
| 🎬 Terminal | [vhs](terminal/vhs/) | Record terminal sessions as GIF/MP4 with [VHS](https://github.com/charmbracelet/vhs) |

## Install

### One command (39+ agents)

```bash
npx skills add marcfargas/skills
```

Installs to Claude Code, Cursor, Copilot, Amp, Cline, Windsurf, Gemini CLI, and [30+ more agents](https://skills.sh) automatically.

### pi

```bash
pi install npm:@marcfargas/skills
```

Or add to `~/.pi/agent/settings.json`:

```json
{
  "packages": ["npm:@marcfargas/skills"]
}
```

### Manual (any agent)

Copy the skill directory into your agent's skill folder:

```bash
cp -r google-cloud/gcloud ~/.claude/skills/gcloud
```

## How We Build Skills

Every skill goes through a rigorous process before publishing:

### Multi-Model Review (4 axes)

Each skill is reviewed by **3+ models** (Claude, Gemini, GPT) across 4 dimensions:

1. **Structure** — frontmatter, hub+spoke architecture, file organization
2. **Agent usability** — can an agent follow the instructions without ambiguity?
3. **Safety model** — every operation classified (READ / WRITE / DESTRUCTIVE / EXPENSIVE / FORBIDDEN) with appropriate gating
4. **Real-world scenarios** — tested with actual agent tasks: deploy, delete, handle errors, refuse forbidden operations

### Design Principles

- **Safety first** — destructive operations classified and gated, costs flagged before execution
- **Hub + spoke** — thin SKILL.md hub (~140 lines) + per-topic reference files loaded on demand, keeping context windows lean
- **Agent-native** — `--format=json` everywhere, idempotent patterns, structured error handling
- **Portable** — no hardcoded paths, no personal config, works on any machine
- **Spec-compliant** — validated against the [Agent Skills specification](https://agentskills.io/specification) using [skills-ref](https://github.com/agentskills/agentskills) in CI

### Continuous Validation

- `agentskills validate` runs on **every push and PR** ([validate.yml](.github/workflows/validate.yml))
- Automated [pre-release checklist](release/pre-release/) with AI-written changesets
- Published via [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) with provenance attestations

## Structure

```
skills/
├── google-cloud/
│   └── gcloud/          # 8 files, ~1100 lines total
├── release/
│   └── pre-release/     # 1 file
├── terminal/
│   └── vhs/             # 1 file
└── README.md
```

## External Skills

Some skills live in their own repositories — install them directly or via their npm packages:

| Skill | Description | Install |
|-------|-------------|---------|
| [go-easy](https://github.com/marcfargas/go-easy) | Gmail, Drive, Calendar for AI agents — `npx go-gmail`, `npx go-drive`, `npx go-calendar` | `npx skills add marcfargas/go-easy` |
| [odoo](https://github.com/marcfargas/odoo-toolbox) | Odoo ERP integration — connect, introspect, automate | Planned |

## Contributing

Skills follow the [Agent Skills specification](https://agentskills.io/specification). Requirements:

- `SKILL.md` with YAML frontmatter (`name`, `description`)
- `name` matches parent directory (kebab-case, max 64 chars)
- `description` present (max 1024 chars)
- No hardcoded paths or credentials
- Destructive operations clearly marked

### Validation

Use [skills-ref](https://github.com/agentskills/agentskills) (Python — the official reference implementation from the spec authors) to validate skills locally:

```bash
pip install skills-ref

# Validate a skill directory
agentskills validate path/to/skill

# Read parsed properties as JSON
agentskills read-properties path/to/skill

# Generate <available_skills> XML prompt block
agentskills to-prompt path/to/skill-a path/to/skill-b
```

CI runs `agentskills validate` on every push — see [`.github/workflows/validate.yml`](.github/workflows/validate.yml).

## Sponsor

Building high-quality, multi-model-reviewed agent skills takes serious token budget. If these skills save you time, consider sponsoring:

[![GitHub Sponsors](https://img.shields.io/github/sponsors/marcfargas?style=for-the-badge&logo=github&label=Sponsor)](https://github.com/sponsors/marcfargas)

## License

MIT
