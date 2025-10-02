# 🔒 KeyQuest Security Checklist

Use this checklist before publishing to GitHub or deploying to production.

## 📋 Pre-Publication Checklist

### ✅ Environment & Secrets
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] All secrets use environment variables (no hardcoded values)
- [ ] `.env.example` contains only placeholder values
- [ ] No API keys, tokens, or passwords in source code
- [ ] Git history has been scanned for accidentally committed secrets

### ✅ Input Validation & XSS Protection
- [ ] All user inputs are validated using `validatePlayerName()`
- [ ] User-generated content is sanitized with `sanitizeText()`
- [ ] No use of `dangerouslySetInnerHTML` without sanitization
- [ ] XSS patterns are detected and blocked
- [ ] Rate limiting is implemented for user actions

### ✅ Security Headers
- [ ] `public/_headers` file is configured with security headers
- [ ] Content Security Policy (CSP) is properly configured
- [ ] X-Frame-Options prevents clickjacking
- [ ] X-Content-Type-Options prevents MIME sniffing
- [ ] HTTPS is enforced in production

### ✅ Database Security
- [ ] Supabase Row Level Security (RLS) is enabled
- [ ] Database queries use parameterized statements (Supabase client)
- [ ] No direct SQL string concatenation
- [ ] Input validation before database operations
- [ ] Error messages don't leak sensitive information

### ✅ Dependencies & Code Quality
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] All dependencies are up to date
- [ ] ESLint passes without security-related warnings
- [ ] No unused dependencies in package.json
- [ ] Dependabot is configured for automatic updates

### ✅ CI/CD Security
- [ ] GitHub Actions security workflow is configured
- [ ] CodeQL analysis is enabled
- [ ] Secret scanning is active
- [ ] Dependency review is configured for PRs
- [ ] Build process doesn't expose secrets

## 🚨 Emergency Response

If secrets were accidentally committed:

### Immediate Actions (within 1 hour)
1. **Stop all deployments** using the compromised secrets
2. **Rotate all affected credentials** immediately
3. **Run the cleanup script**: `npm run security:cleanup`
4. **Force push cleaned history**: `git push --force-with-lease`
5. **Update all deployment environments** with new secrets

### Follow-up Actions (within 24 hours)
1. **Monitor access logs** for unauthorized usage
2. **Notify team members** to re-clone the repository
3. **Review and update** security procedures
4. **Document the incident** for future prevention

## 🔍 Security Testing Commands

Run these commands before publishing:

```bash
# 1. Lint and security audit
npm run security:check

# 2. Check for secrets in git history
git log --name-only --pretty=format: | grep -E '\.(env|key|pem)$'

# 3. Scan for hardcoded secrets (if TruffleHog is installed)
npx @trufflesecurity/trufflehog filesystem .

# 4. Test build process
npm run build

# 5. Check bundle size
ls -lh build/static/js/
```

## 🛡️ Production Deployment Checklist

### ✅ Hosting Configuration
- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Security headers are configured in hosting platform
- [ ] CORS is configured for specific origins only
- [ ] CDN security features are enabled
- [ ] Error pages don't leak sensitive information

### ✅ Environment Variables
- [ ] All required environment variables are set in production
- [ ] No development/test credentials in production
- [ ] Environment variables are properly scoped
- [ ] Backup of environment configuration exists

### ✅ Monitoring & Logging
- [ ] Error monitoring is configured (e.g., Sentry)
- [ ] Access logs are monitored
- [ ] Security alerts are configured
- [ ] Incident response procedures are documented

### ✅ Supabase Production Setup
- [ ] Production Supabase project is separate from development
- [ ] RLS policies are tested and working
- [ ] API keys are production-specific
- [ ] Database backups are configured
- [ ] Access monitoring is enabled

## 📚 Security Resources

### Documentation
- [SECURITY.md](./SECURITY.md) - Complete security documentation
- [.env.example](./.env.example) - Environment variable template
- [GitHub Security Features](https://docs.github.com/en/code-security)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency vulnerability scanning
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - Secret scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Web application security testing
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security) - Database security

### Emergency Contacts
- **Security Team**: [security@yourdomain.com]
- **DevOps Team**: [devops@yourdomain.com]
- **On-call Engineer**: [Check internal documentation]

## ✅ Final Verification

Before pushing to GitHub:

```bash
# 1. Run full security check
npm run security:check

# 2. Verify no secrets in git history
./scripts/cleanup-secrets.sh

# 3. Test build with production-like environment
REACT_APP_SUPABASE_URL=https://example.supabase.co \
REACT_APP_SUPABASE_ANON_KEY=example_key \
npm run build

# 4. Check that .env.local is ignored
git status --ignored | grep .env.local

# 5. Verify security headers configuration
cat public/_headers
```

## 🎯 Success Criteria

Your repository is ready for publication when:

- ✅ All checklist items are completed
- ✅ Security tests pass in CI/CD
- ✅ No secrets detected in git history
- ✅ All dependencies are secure and up to date
- ✅ Security headers are properly configured
- ✅ Input validation is comprehensive
- ✅ Error handling doesn't leak sensitive information

---

**Remember**: Security is an ongoing process, not a one-time setup. Regularly review and update your security measures as the project evolves.
