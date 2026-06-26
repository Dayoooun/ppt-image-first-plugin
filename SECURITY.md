# Security Policy

## Reporting

If you find a security issue in this plugin, open a private advisory or contact the maintainer through the GitHub repository.

Do not include live API keys, customer data, private decks, or confidential screenshots in public issues.

## Secret Handling

This plugin should not require users to commit secrets.

Never commit:

- `.env` files
- API keys
- OAuth tokens
- cookies
- private keys
- generated auth caches
- customer materials
- generated confidential deck workspaces

Run:

```bash
python scripts/security_scan.py .
```

before publishing changes.
