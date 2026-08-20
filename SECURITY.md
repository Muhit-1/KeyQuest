# Security Policy

## Security Overview

KeyQuest is a fully client-side game. It has no backend, no database, no accounts, and makes no third-party API calls - every score lives in the player's own browser storage. That removes most of the usual attack surface; this document covers what is left.

## Security Features

### Input Validation & XSS Protection
- **Player name validation**: Strict allow-list regex (letters, digits, spaces, hyphens, underscores) with a 20 character limit
- **HTML entity escaping**: `sanitizeText` helper for any value rendered as markup
- **XSS pattern detection**: Script/iframe/handler patterns are rejected before storage
- **Bounded storage reads**: Leaderboard entries are type-checked and length-capped when read back from `localStorage`

### No Secrets, No Services
- **No environment variables**: The app requires no configuration, so there are no keys to leak
- **No network calls**: Nothing the player types leaves their device
- **Safe defaults**: Storage failures (private mode, quota) degrade gracefully instead of throwing

### HTTP Security Headers
Configured in `public/_headers` (Netlify format - port these to your host if you deploy elsewhere):
- **Content Security Policy (CSP)**: `default-src 'self'` with `connect-src 'self'`; no `unsafe-eval`
- **X-Frame-Options: DENY**: Prevents clickjacking
- **X-Content-Type-Options: nosniff**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer leakage
- **Permissions-Policy**: Denies geolocation, camera, microphone, payment, and sensor access

Note: `Cross-Origin-Embedder-Policy: require-corp` is intentionally **not** set. It would block the Google Fonts stylesheet, which serves no CORP header.

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Report it privately to the repository owner
3. Include a description, reproduction steps, potential impact, and a suggested fix if you have one

## Threat Notes

- **The leaderboard is not authoritative.** Scores are stored in `localStorage`, so a player can edit their own. This is by design - the leaderboard is a personal record, not a competitive ranking. If you ever add a shared leaderboard, score validation must move to a server; client-side checks cannot be trusted.
- **No personal data is collected.** The only stored values are a display name the player types in, their scores, and timestamps.

## Security Testing

### Automated Checks
The CI pipeline (`.github/workflows/security.yml`) runs:
- **npm audit**: Dependency vulnerability scanning (reported, not gated - the current advisories all come from react-scripts' build-time tree and are never bundled into the browser build)
- **CodeQL**: Static analysis
- **TruffleHog**: Secret scanning across git history
- **Dependency Review**: License and vulnerability checks on pull requests

### Manual Testing
```bash
npm audit
```

```bash
npm run lint
```

Useful tools: [OWASP ZAP](https://www.zaproxy.org/), [Burp Suite Community](https://portswigger.net/burp/communitydownload).

## Git History Cleanup

If a secret is ever committed, remove it from history immediately:

```bash
git filter-repo --path .env.local --invert-paths
```

Then rotate the exposed credential at its source - rewriting history does not un-leak a key that was already pushed.

## Pre-Deployment Checklist

### Code
- [ ] No hardcoded secrets in source code
- [ ] All user inputs are validated and sanitized
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date and audited

### Deployment
- [ ] Security headers from `public/_headers` are active on the host
- [ ] HTTPS is enforced and SSL/TLS certificates are valid
- [ ] `build/` output contains no source maps you did not intend to publish

## Security Updates

1. **Dependency Updates**: Automated weekly updates via Dependabot
2. **Security Patches**: Critical updates applied immediately
3. **Regular Audits**: Periodic review of dependencies and headers

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## License

This security policy is part of the KeyQuest project and is subject to the same license terms.
