# KeyQuest Security Checklist

Use this checklist before publishing to GitHub or deploying to production.

KeyQuest is a static, client-side app: no backend, no database, no environment variables, no third-party calls. Items about secrets below exist to keep it that way.

## Pre-Publication Checklist

### Secrets
- [ ] No API keys, tokens, or passwords in source code
- [ ] `.env*` files stay in `.gitignore` and are never committed
- [ ] Git history has been scanned for accidentally committed secrets

### Input Validation & XSS Protection
- [ ] All user inputs are validated using `validatePlayerName()`
- [ ] User-generated content is sanitized with `sanitizeText()` before being rendered as markup
- [ ] No use of `dangerouslySetInnerHTML` without sanitization
- [ ] Values read back from `localStorage` are type-checked before use

### Security Headers
- [ ] `public/_headers` is configured and deployed
- [ ] Content Security Policy is properly configured
- [ ] X-Frame-Options prevents clickjacking
- [ ] X-Content-Type-Options prevents MIME sniffing
- [ ] HTTPS is enforced in production

### Dependencies & Code Quality
- [ ] `npm audit` output has been reviewed (the current advisories come from react-scripts' build-time tree and are not shipped to the browser)
- [ ] ESLint passes without warnings
- [ ] No unused dependencies in package.json
- [ ] Dependabot is configured for automatic updates

### CI/CD
- [ ] GitHub Actions security workflow is configured
- [ ] CodeQL analysis is enabled
- [ ] Secret scanning is active
- [ ] Dependency review is configured for PRs

## Emergency Response

If a secret is ever committed:

### Immediate Actions
1. **Rotate the credential** at its source - this comes first, always
2. **Run the cleanup script**: `npm run security:cleanup`
3. **Force push cleaned history**: `git push --force-with-lease`

### Follow-up
1. **Notify collaborators** to re-clone the repository
2. **Monitor for unauthorized use** of the old credential
3. **Document the incident** for future prevention

## Security Testing Commands

```bash
npm run security:check
```

```bash
npx @trufflesecurity/trufflehog filesystem .
```

```bash
npm run build
```

## Production Deployment Checklist

### Hosting Configuration
- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Security headers from `public/_headers` are active on the host
- [ ] Error pages don't leak sensitive information
- [ ] Source maps are either intentional or excluded from the deploy

### Monitoring
- [ ] Error monitoring is configured (e.g., Sentry) if you want crash reports
- [ ] Security alerts are enabled on the repository

## Security Resources

### Documentation
- [SECURITY.md](./SECURITY.md) - Complete security documentation
- [GitHub Security Features](https://docs.github.com/en/code-security)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency vulnerability scanning
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - Secret scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Web application security testing

## Final Verification

Before pushing to GitHub:

```bash
npm run security:check
```

```bash
npm run build
```

```bash
git status --ignored | grep .env
```

## Success Criteria

Your repository is ready for publication when:

- All checklist items are completed
- Security tests pass in CI
- No secrets detected in git history
- Runtime dependencies are secure and up to date
- Security headers are properly configured
- Input validation is comprehensive
