# Security and Release

Use this checklist before publishing or installing `ppt-image-first` as a plugin.

## Never Commit

- `.env`, `.env.local`, `.env.*`
- API keys, OAuth tokens, refresh tokens, cookies, session files
- private keys or certificates
- user/customer source documents
- screenshots containing private data
- generated deck workspaces containing confidential assets
- local caches from image-generation tools
- machine-specific absolute paths in reusable documentation

## Allowed in Examples

Use placeholders only:

```text
OPENAI_API_KEY=<API_KEY>
GEMINI_API_KEY=<API_KEY>
path/to/user/reference.png
path/to/output/deck.pptx
```

## Release Checklist

1. Run the security scan.
2. Validate `.codex-plugin/plugin.json`.
3. Confirm `SKILL.md` frontmatter exists.
4. Confirm demo assets are intentionally public.
5. Confirm all private workspaces are ignored by Git.
6. Tag a release only after the working tree diff is reviewed.

## If a Secret Is Found

1. Treat it as compromised.
2. Rotate or revoke it.
3. Remove it from the working tree.
4. Rewrite Git history before public push.
5. Force-push only if you control the repository and understand the impact.
