# Skills

Reusable skills for AI coding agents. Works with [pi](https://github.com/mariozechner/pi-coding-agent), [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.sh), and any agent that supports the [Agent Skills standard](https://agentskills.io/specification).

## Available Skills

| Category | Skill | Description |
|----------|-------|-------------|
| ☁️ Azure | [azcli](azure/azcli/) | Azure CLI with agent safety model — hub + reference files |
| ☁️ Google Cloud | [gcloud](google-cloud/gcloud/) | GCP CLI with agent safety model — hub + 7 reference files |
| 🔧 Maintenance | [repo-hygiene](maintenance/repo-hygiene/) | Periodic repo health check — deps, git, CI, code quality, docs, security |
| ⚙️ Process | [pm2](process/pm2/) | Process management — keep services alive, auto-restart, monitoring, ecosystem configs |
| 🚀 Release | [pre-release](release/pre-release/) | Pre-release checklist + AI-written changesets via @changesets/cli |
| 🔍 Search | [web-search](search/web-search/) | Web search + content extraction via [ddgs](https://github.com/deedy5/ddgs) — no API keys |
| 📊 Modeling | [sheet-model](sheet-model/) | Headless spreadsheet engine for financial modeling, scenario analysis, .xlsx with live formulas |
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

### Multi-Model Review

Every skill is reviewed by **3+ models** (Claude, Gemini, GPT) before publishing — structure, agent usability, safety, and real-world scenario testing. If an agent can misinterpret an instruction, we find out before you do.

### Safety Classification

Every operation is classified: **READ** / **WRITE** / **DESTRUCTIVE** / **EXPENSIVE** / **FORBIDDEN**. Destructive and expensive operations are gated — the agent must confirm before executing, and costs are flagged upfront.

### Progressive Discovery

Skills use a **hub + spoke** architecture. The SKILL.md hub is ~140 lines — just enough to match the right skill and know what's available. Detailed per-topic reference files are loaded on demand, keeping your context window lean.

### Also

- **Agent-native** — `--format=json` everywhere, idempotent patterns, structured error handling
- **Portable** — no hardcoded paths, no personal config, works on any machine
- **Spec-compliant** — validated against the [Agent Skills specification](https://agentskills.io/specification) using [skills-ref](https://github.com/agentskills/agentskills) in CI
- **Continuous validation** — `agentskills validate` on every push ([validate.yml](.github/workflows/validate.yml)), [pre-release checklist](release/pre-release/) with AI-written changesets, [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) with provenance

## Structure

```text
skills/
├── azure/
│   └── azcli/           # Azure CLI skill
├── google-cloud/
│   └── gcloud/          # 8 files, ~1100 lines total
├── maintenance/
│   └── repo-hygiene/    # 1 file — periodic health check
├── process/
│   └── pm2/             # 1 file
├── release/
│   └── pre-release/     # 1 file
├── search/
│   └── web-search/      # SKILL.md + search.js + content.js
├── sheet-model/         # Headless spreadsheet engine
├── terminal/
│   └── vhs/             # 1 file
└── README.md
```

## External Skills

Some skills live in their own repositories — install them directly or via their npm packages:

| Skill | Description | Install |
|-------|-------------|---------|
| [go-easy](https://github.com/marcfargas/go-easy) | Gmail, Drive, Calendar for AI agents — `npx go-gmail`, `npx go-drive`, `npx go-calendar` | `npx skills add marcfargas/go-easy` |
| [holdpty](https://github.com/marcfargas/holdpty) | Detached PTY sessions — launch, attach, view, record terminal processes | `npx skills add marcfargas/holdpty` |
| [odoo](https://github.com/marcfargas/odoo-toolbox) | Odoo ERP integration — connect, introspect, automate | `npx skills add marcfargas/odoo-toolbox` |

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

**Code** (scripts, tooling): [MIT](./LICENSE)

**Skill content** (`**/SKILL.md` and reference docs): [CC0 1.0 Universal](./LICENSE-CC0) — public domain, no attribution required.

Why CC0 for skills: Skill docs are consumed by AI agents and freely incorporated into any workflow. Attribution requirements create friction in agent contexts where provenance tracking is impractical.
