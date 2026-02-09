# @marcfargas/skills

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
