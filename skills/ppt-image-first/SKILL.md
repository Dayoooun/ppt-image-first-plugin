---
name: ppt-image-first
description: "Universal image-first PPT/deck creation harness. Use for proposals, reports, lectures, pitch decks, briefings, and presentation redesigns where consistent visual quality, reference discipline, asset handling, and PPTX export are required."
---

# PPT Image First

This plugin skill is the installable entrypoint for the `ppt-image-first` harness.

For the full workflow, use the repository root `SKILL.md` as the canonical operating guide. The rules
below are the minimum behavior contract for plugin installations.

## Generation Engine

Default slide generation uses **Codex `$imagegen` with GPT-Image 2.0**.

For each slide, send one integrated generation packet containing:
- exact slide content
- deck purpose and audience
- style reference images
- product/photo references
- evidence references when relevant
- image fidelity rules
- forbidden elements
- composition task

Do not generate a generic slide first and apply references afterward. Content and references must be
passed together for the first high-quality generation pass.

## Mandatory Harness

For non-trivial decks, create and use these artifacts:
- `deck_brief.md`: purpose, audience, scope, constraints, output target
- `content_report.md`: narrative basis with claim status
- `style_card.md`: reference-derived visual system
- `asset_manifest.json`: every supplied image/file mapped to a role and fidelity level
- `slide_blueprint.md`: slide-by-slide role, content, assets, and review focus
- `prompt_pack.json`: final generation prompts
- `review_report.md`: defects, fixes, and verification notes

## Reference Rules

Reference images override generic defaults.

Separate reference roles:
- style reference: layout, typography, palette, mood
- product reference: exact object/space/packaging/person appearance
- evidence reference: screenshots, certificates, tables, charts, documents

Use AI generation for visual slides. Use deterministic composition for exact logos, screenshots,
tables, certificates, and small evidence text.

## Prompt Rules

Every final image prompt must contain:
- deck purpose
- audience
- style system
- exact text lock
- reference file list
- image fidelity rules
- composition task
- forbidden elements
- output size

The expected execution path is Codex `$imagegen`, directly or through `scripts/parallel_imagegen.mjs`.

Never include page numbers in image-generation prompts. Add them later in a deterministic assembly step.

## Security Rules

Do not commit or package:
- `.env` files
- API keys
- OAuth tokens
- private keys
- client documents
- private user source files
- generated auth caches
- local user-specific absolute paths

Use placeholder values such as `<API_KEY>` in docs. Run the repository security scan before release.

## Output Rules

Default output is image-first PPTX:
- one full-slide PNG per page
- exported PNG folder
- optional deterministic page numbering

Editable PPTX is a secondary output. Warn the user that fonts and layout may shift in PowerPoint.
