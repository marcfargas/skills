# Skills

Reusable skills for AI coding agents. Works with [pi](https://github.com/mariozechner/pi-coding-agent), [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.sh), and any agent that supports the [Agent Skills standard](https://agentskills.io/specification).

## Available Skills

| Category | Skill | Description |
|----------|-------|-------------|
| ☁️ Google Cloud | [gcloud](google-cloud/gcloud/) | GCP CLI with agent safety model — hub + 7 reference files |
| 🎬 Terminal | [vhs](terminal/vhs/) | Record terminal sessions as GIF/MP4 with [VHS](https://github.com/charmbracelet/vhs) |

## Install

### One command (39+ agents)

```bash
npx skills add marcfargas/skills
```

Installs to Claude Code, Cursor, Copilot, Amp, Cline, Windsurf, Gemini CLI, and [30+ more agents](https://skills.sh) automatically.

### pi

Add to `~/.pi/agent/settings.json`:

```json
{
  "skills": ["path/to/skills"]
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
- `name` matches parent directory
- No hardcoded paths or credentials
- Destructive operations clearly marked

## License

MIT
