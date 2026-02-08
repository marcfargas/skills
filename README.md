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

## Skill Design Principles

1. **Safety first** — destructive operations classified and gated, costs flagged
2. **Hub + spoke** — thin SKILL.md hub (~140 lines) + per-topic reference files loaded on demand
3. **Agent-native** — `--format=json` everywhere, idempotent patterns, error handling
4. **Portable** — no hardcoded paths or personal config
5. **Tested** — validated with Gemini, GPT, and Claude before publishing

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

## External Skills (planned)

Some skills are developed in their own repositories and synced here:

| Skill | Source Repo | Status |
|-------|-------------|--------|
| odoo | `odoo-toolbox` | Planned |
| go-easy | `go-easy` | Planned |

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

## License

MIT
