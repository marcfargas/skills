# Skills

Reusable skills for AI coding agents. Works with [pi](https://github.com/mariozechner/pi-coding-agent), [Claude Code](https://docs.anthropic.com/en/docs/claude-code), and any agent that supports the [Agent Skills standard](https://agentskills.io/specification).

## Available Skills

| Category | Skill | Description |
|----------|-------|-------------|
| ☁️ Google Cloud | [gcloud](google-cloud/gcloud/) | GCP CLI with agent safety model (READ/WRITE/DESTRUCTIVE/EXPENSIVE/SECURITY/FORBIDDEN) |
| 🎬 Terminal | [vhs](terminal/vhs/) | Record terminal sessions as GIF/MP4 with [VHS](https://github.com/charmbracelet/vhs) |

## What's a Skill?

A skill is a directory with a `SKILL.md` file containing instructions an AI agent loads on demand. Think of it as a specialized manual: the agent reads the description to decide if it's relevant, then loads the full instructions only when needed.

```
google-cloud/gcloud/
├── SKILL.md          ← Hub: safety model, triggers, quick reference
├── auth.md           ← Loaded only when dealing with authentication
├── serverless.md     ← Loaded only when deploying Cloud Run, Functions, etc.
└── ...
```

**Progressive disclosure** — the agent pays context-window cost only for what it actually needs.

## Install

### pi

Add this repo to your `~/.pi/agent/settings.json`:

```json
{
  "skills": [
    "path/to/skills"
  ]
}
```

Or clone and point to the clone:

```bash
git clone https://github.com/user/skills.git ~/skills
```

```json
{
  "skills": ["~/skills"]
}
```

Pi recursively discovers all `SKILL.md` files under the path.

### Claude Code

```bash
# Copy individual skills to Claude's skill directory
cp -r google-cloud/gcloud ~/.claude/skills/gcloud
```

### Other agents

Any agent supporting the [Agent Skills standard](https://agentskills.io) can use these. Point your agent's skill discovery at this directory.

## Using a Skill

Skills load automatically when your task matches the skill description. You can also force-load:

```
/skill:gcloud
/skill:vhs
```

## Skill Design Principles

1. **Safety first** — destructive operations are classified and gated. Agents must confirm before deleting, must flag costs before creating expensive resources
2. **Hub + spoke** — a thin `SKILL.md` hub (~100-150 lines) with per-topic reference files. Agents load the hub, then only the sub-file they need
3. **Agent-native** — examples use `--format=json` for machine parsing, include error handling patterns, show idempotent operations
4. **Portable** — no hardcoded paths or personal config. Works on any machine
5. **Tested** — skills are tested with multiple models (Gemini, GPT, Claude) before publishing

## Structure

```
skills/
├── google-cloud/           # Google Cloud Platform
│   └── gcloud/             # gcloud CLI
├── terminal/               # Terminal tools
│   └── vhs/                # Terminal recording
├── (coming soon)
│   ├── odoo/               # Odoo ERP (synced from odoo-toolbox)
│   └── ...
└── README.md
```

## External Skills

Some skills are developed in their own repositories and synced here via GitHub Actions:

| Skill | Source Repo | Sync |
|-------|-------------|------|
| *(planned)* odoo | `odoo-toolbox` | On release |
| *(planned)* go-easy | `go-easy` | On release |

## Contributing

Skills follow the [Agent Skills specification](https://agentskills.io/specification).

Requirements:
- `SKILL.md` with valid YAML frontmatter (`name`, `description`)
- `name` matches parent directory (lowercase, hyphens, no spaces)
- `description` is specific enough for an agent to decide when to load it
- No hardcoded paths, credentials, or personal config
- Destructive operations must be clearly marked

## License

MIT
