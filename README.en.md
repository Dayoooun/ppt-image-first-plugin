# PPT Image First

Reference-driven, image-first PPT creation harness for Codex.

See [README.md](README.md) for the full Korean guide.

## Install

Windows:

```powershell
git clone https://github.com/Dayoooun/ppt-image-first-plugin.git "$env:USERPROFILE\plugins\ppt-image-first"
cd "$env:USERPROFILE\plugins\ppt-image-first"
.\scripts\install.ps1
```

macOS / Linux:

```bash
git clone https://github.com/Dayoooun/ppt-image-first-plugin.git "$HOME/plugins/ppt-image-first"
cd "$HOME/plugins/ppt-image-first"
bash scripts/install.sh
```

Then start a new Codex thread.

## Validate

```bash
python scripts/security_scan.py .
python scripts/validate_release.py .
```

## What It Produces

For non-trivial decks, the harness creates:

- `deck_brief.md`
- `content_report.md`
- `style_card.md`
- `asset_manifest.json`
- `slide_blueprint.md`
- `prompt_pack.json`
- `review_report.md`

Default output is an image-based PPTX plus exported PNG slides.

## Security

Do not commit `.env` files, API keys, OAuth tokens, cookies, private keys, client documents, private screenshots, or generated confidential deck output.

## License

Apache-2.0
