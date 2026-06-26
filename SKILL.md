---
name: ppt-image-first
description: "Universal image-first PPT/deck creation harness. Use for proposals, reports, lectures, pitch decks, briefings, and presentation redesigns where consistent visual quality, reference discipline, asset handling, and PPTX export are required."
---

# PPT Image First

This skill turns a loose PPT request into a consistent, image-first deck workflow that anyone can run.
It is optimized for high-quality full-slide visuals, reliable reference handling, asset-aware prompts,
review loops, and PPTX assembly.

Use it when the user asks for:
- PPT, deck, presentation, briefing, proposal, report slides, lecture slides, pitch deck, redesign
- image-based slide generation
- reference-image-driven design
- converting supplied documents/images into a polished deck

## Core Principle

The deck must be built from explicit artifacts, not improvised slide-by-slide:

1. `deck_brief.md` defines the purpose, audience, scope, constraints, and output format.
2. `content_report.md` grounds the narrative and marks claim status.
3. `style_card.md` converts references into reusable visual rules.
4. `asset_manifest.json` maps every supplied image to an intended role.
5. `slide_blueprint.md` defines page-by-page intent and content.
6. `prompt_pack.json` contains final image-generation prompts.
7. `review_report.md` records visual defects and fixes.
8. Final output is a PPTX plus exported slide images.

Do not skip these artifacts for decks with more than three slides unless the user explicitly asks for a quick draft.

## Workflow

### 1. Intake

Collect the minimum needed inputs:
- purpose: what the PPT must achieve
- audience: who will judge or use it
- delivery context: meeting, class, pitch, screening, sales, internal report, etc.
- page count or duration
- output preference: image-based PPTX, editable PPTX, PNG only, or both
- source material: files, text, links, screenshots, brand assets, references
- constraints: must-include text, forbidden content, brand colors, accessibility needs

If the user gives enough material, proceed without a long questionnaire. Mark assumptions in `deck_brief.md`.

### 2. Content Basis

Create `content_report.md` before design work.

Rules:
- Preserve user-provided facts and wording.
- Label every claim as `user_provided`, `source_supported`, `inferred`, or `needs_confirmation`.
- Do not invent statistics, citations, certifications, client names, awards, sales, or institutional endorsements.
- Convert scattered notes into a coherent narrative spine.
- Identify visualizable moments: charts, maps, product cuts, process flows, quotes, evidence screenshots, timelines.

### 3. Reference Discipline

When the user provides reference images, they outrank default style preferences.

Create `style_card.md` with:
- palette: exact dominant colors and allowed accent use
- typography: serif/sans, weight, size tendency, spacing, Korean/Latin handling
- composition: grid, collage, editorial, cinematic, dense report, dashboard, etc.
- visual texture: photography, diagram, illustration, paper, luxury, institutional, technical
- forbidden elements: anything absent from the reference that the model may otherwise add
- page rhythm: how slides vary while staying in one system

Always separate:
- `style_reference`: governs layout, typography, palette, surface, mood
- `product_reference`: governs what objects, spaces, people, packaging, screenshots, and logos look like
- `evidence_reference`: original screenshots/documents that should be preserved or rebuilt as structured charts/tables

If exact fidelity is required for a screenshot, certificate, table, chart, or logo, prefer code/PPT composition over AI redraw.

### 4. Asset Manifest

Create `asset_manifest.json` for all images and source files.

Each asset should include:
- `id`
- `path`
- `type`: `style_reference`, `product_photo`, `logo`, `screenshot`, `document`, `chart`, `background`, `icon`, `other`
- `role`: `hero`, `supporting_grid`, `evidence`, `texture`, `logo_mark`, `do_not_use`, etc.
- `slide_targets`
- `fidelity`: `exact`, `faithful`, `inspired_by`
- `notes`

Use sanitized workspace paths for generation prompts. Avoid embedding private local user paths in final docs.

### 5. Slide Blueprint

Create `slide_blueprint.md` after content and style are known.

Each slide must define:
- `slide_id`
- `page_role`: cover, agenda, problem, evidence, solution, process, budget, roadmap, impact, closing, etc.
- `title`
- `core_message`
- `must_include_text`
- `visual_strategy`
- `asset_bindings`
- `claim_status`
- `continuity_rule`
- `review_focus`

Do not include page numbers in image-generation prompts. Add page numbers later with deterministic code or PPT assembly.

### 6. Prompt Pack

Create `prompt_pack.json`.

Every prompt must have these sections in this order:

```text
ROLE
You are designing one finished 16:9 presentation slide.

DECK PURPOSE
...

AUDIENCE
...

STYLE SYSTEM
...

CONTENT LOCK
Render these text items exactly:
...

REFERENCE INPUTS
Open and study these local files:
...

IMAGE FIDELITY RULES
...

COMPOSITION TASK
...

FORBIDDEN
...

OUTPUT
1920x1080 or 16:9, presentation-ready, no crop marks, no watermarks.
```

Prompt rules:
- Preserve all required Korean text exactly.
- Keep text short enough to render reliably.
- Use one clear art direction per slide.
- Let composition vary by slide role while preserving the style system.
- Do not ask the image model to draw tiny evidence text if exact readability matters; compose those items later.

### 7. Generation and Review

Generate slide images in small batches.

Review each slide for:
- required text missing or altered
- unreadable Korean
- image cutoffs
- overlapped elements
- inconsistent palette or typography
- asset mismatch
- hallucinated claims/logos/certificates
- awkward chart/table reconstruction

Write findings to `review_report.md` and iterate only the failed slides.

### 8. PPTX Assembly

For image-first output:
- use one full-slide image per slide
- add deterministic page numbers only if requested
- export final PPTX and individual PNGs

For editable output:
- warn that typography and exact visual fidelity may shift across PowerPoint environments
- keep complex visual pages as images
- make only text-heavy charts/tables editable when practical

## Frontmatter and Metadata

Every deck workspace should include `metadata.json`:

```json
{
  "deck_id": "short-kebab-name",
  "title": "Deck title",
  "purpose": "proposal|report|lecture|pitch|briefing|redesign|other",
  "audience": "target audience",
  "language": "ko|en|mixed",
  "slide_count": 10,
  "output": {
    "format": "image-pptx",
    "size": "16:9",
    "width": 1920,
    "height": 1080
  },
  "style": {
    "reference_locked": true,
    "palette": [],
    "typeface_direction": "",
    "forbidden": []
  },
  "security": {
    "contains_private_material": true,
    "redaction_required": false,
    "secrets_scan_passed": false
  }
}
```

## Security Rules

Before sharing, committing, or packaging:
- Never include `.env`, API keys, OAuth tokens, cookies, credentials, private keys, or generated auth caches.
- Never hard-code `OPENAI_API_KEY`, `GEMINI_API_KEY`, or similar secrets in examples.
- Use placeholder names such as `<API_KEY>` only.
- Do not commit user documents, client data, source PDFs, screenshots, or private brand assets unless they are explicit demo fixtures.
- Keep real client/project paths out of reusable skill docs.
- Add generated workspaces, caches, and temporary exports to `.gitignore`.
- Run the bundled security scan before release.

If a secret is found in Git history, do not merely delete it from the current file. Rotate the secret and rewrite history before publishing.

## Required References

For detailed operating rules, read these files when relevant:
- `references/workflow.md`
- `references/style-system.md`
- `references/conversation_framework.md`
- `references/layout-flow.md`
- `references/security-and-release.md`
- `templates/deck_brief_reference.md`
- `templates/slide_blueprint_reference.md`

## Completion Checklist

Before claiming completion:
- `deck_brief.md`, `style_card.md`, `asset_manifest.json`, and `slide_blueprint.md` exist for non-trivial decks.
- Required content and images are represented.
- No exact-evidence item was AI-redrawn when readability matters.
- All slides were reviewed at presentation size.
- Final PPTX opens.
- Individual PNG exports are available.
- Security scan passes for the plugin/repo before publishing.
