# @marcfargas/skills

## 0.4.0

### Minor Changes

- Add `sheet-model` skill — headless spreadsheet engine for AI agent financial modeling.

  - Declarative API: `addRow`, `addSection`, `addScenarioSheet` with auto-tracked A1 references
  - HyperFormula compute engine (395 built-in functions including PMT, NPV, IF, SUM)
  - Export to `.xlsx` with live formulas, named ranges, conditional formatting, and frozen panes
  - Scenario comparison sheets with threshold-based green/amber/red formatting
  - Name validation against Excel column/cell reference collisions
  - Reviewed by 4 AI agents (prompt engineering + practical perspectives)

### Patch Changes

- [`6a5d50f`](https://github.com/marcfargas/skills/commit/6a5d50f69e467ab357104b188d6eb9a1c33c2250) Thanks [@marcfargas](https://github.com/marcfargas)! - Add `pm2` process management skill for keeping services alive with auto-restart, ecosystem configs, and log management.

- Documentation and CI improvements.

  - Add `web-search` skill to package discovery
  - Add `holdpty` pattern and Windows shell gotcha to `vhs` skill
  - Add CC0 license for skill content, CI validation tests
  - Improve README with multi-model review patterns and safety guidance

## 0.3.0

### Minor Changes

- [`6a5d50f`](https://github.com/marcfargas/skills/commit/6a5d50f69e467ab357104b188d6eb9a1c33c2250) Thanks [@marcfargas](https://github.com/marcfargas)! - Add pm2 skill for process lifecycle management — start, stop, restart, monitor long-running processes with auto-restart, ecosystem configs, log management, and Windows `.cmd` wrapper gotchas.

### Patch Changes

- [`4cd0638`](https://github.com/marcfargas/skills/commit/4cd063829f12e103b67000f8b0da62508f2244ea) Thanks [@marcfargas](https://github.com/marcfargas)! - Add CC0-1.0 license for skill content (dual-license: MIT code, CC0 skills). Add CI quality gates: tarball verification, `pi install` test, skills.sh compatibility check. Add skills.sh registration to release workflow.

- [`4cd0638`](https://github.com/marcfargas/skills/commit/4cd063829f12e103b67000f8b0da62508f2244ea) Thanks [@marcfargas](https://github.com/marcfargas)! - Update VHS skill with holdpty integration pattern for recording TUI apps with colors, Windows `Set Shell "cmd"` gotcha, and monitoring snapshot use cases.

## 0.2.1

### Patch Changes

- [#3](https://github.com/marcfargas/skills/pull/3) [`afecd57`](https://github.com/marcfargas/skills/commit/afecd57245f6e9c73a2f462325bb58902a45e3b8) Thanks [@marcfargas](https://github.com/marcfargas)! - Add web-search skill, fix npm provenance, update external skills references

  - Add web-search skill (ddgs-based search + content extraction, no API keys)
  - Include search/ in npm package and pi.skills config
  - Enable npm provenance via trusted publishing in release workflow
  - Add holdpty to external skills, fix odoo-toolbox install command
  - Fix LICENSE copyright

## 0.2.0

### Minor Changes

- [`b96eea3`](https://github.com/marcfargas/skills/commit/b96eea3ab7a6e9b1ba04ae45fd0dd2304a90b2ce) Thanks [@marcfargas](https://github.com/marcfargas)! - Initial release.

  - **gcloud**: Google Cloud Platform CLI skill with agent safety model — hub file + 7 per-service reference docs (auth, IAM, compute, serverless, storage, data, automation)
  - **vhs**: Terminal session recording as GIF/MP4/WebM via Charm VHS
  - **pre-release**: Pre-release checklist and AI-written changeset generation via @changesets/cli
  - Pi package manifest for `pi install npm:@marcfargas/skills`
