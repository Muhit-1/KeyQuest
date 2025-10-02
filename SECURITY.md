# Security Policy

## 🔒 Security Overview

KeyQuest implements comprehensive security measures to protect user data and prevent common web vulnerabilities. This document outlines our security practices and how to report security issues.

## 🛡️ Security Features

### Input Validation & XSS Protection
- **Player name validation**: Strict regex patterns and length limits
- **HTML entity escaping**: All user input is sanitized before display
- **XSS pattern detection**: Automatic detection and blocking of malicious scripts
- **Rate limiting**: Client-side rate limiting for API calls

### Environment Security
- **No hardcoded secrets**: All sensitive data uses environment variables
- **Environment validation**: Runtime checks for required configuration
- **Secure defaults**: Safe fallbacks when services are unavailable

### HTTP Security Headers
- **Content Security Policy (CSP)**: Prevents XSS and code injection
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer Policy**: Controls referrer information leakage
- **Permissions Policy**: Restricts browser feature access

### Database Security
- **Parameterized queries**: Uses Supabase client with built-in SQL injection protection
- **Input sanitization**: All database inputs are validated and sanitized
- **Row Level Security (RLS)**: Supabase RLS policies protect data access
- **No direct SQL**: Uses ORM-style queries only

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [your-email@domain.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and provide updates on our investigation.

## 🔧 Security Configuration

### Environment Variables
Required environment variables (see `.env.example`):
```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional security configuration:
```bash
REACT_APP_ENVIRONMENT=production
REACT_APP_ALLOWED_ORIGINS=https://yourdomain.com
REACT_APP_CSP_NONCE=random_nonce_value
```

### Supabase Security Setup
1. Enable Row Level Security (RLS) on the `leaderboard` table
2. Create policies for public read access and authenticated write access
3. Configure CORS settings to allow your domain only
4. Enable real-time subscriptions security

Example RLS policies:
```sql
-- Allow public read access to leaderboard
CREATE POLICY "Public read access" ON leaderboard
FOR SELECT USING (true);

-- Allow public insert for new scores
CREATE POLICY "Public insert access" ON leaderboard
FOR INSERT WITH CHECK (true);
```

## 🔍 Security Testing

### Automated Security Checks
Our CI/CD pipeline includes:
- **npm audit**: Dependency vulnerability scanning
- **CodeQL**: Static code analysis for security issues
- **TruffleHog**: Secret scanning in git history
- **Dependency Review**: License and vulnerability checks for new dependencies

### Manual Security Testing
Recommended tools for local security testing:

1. **Static Analysis**:
   ```bash
   npm audit
   npm run lint
   ```

2. **Dynamic Testing**:
   - [OWASP ZAP](https://www.zaproxy.org/) for web application security testing
   - [Burp Suite Community](https://portswigger.net/burp/communitydownload) for manual testing

3. **Secret Scanning**:
   ```bash
   # Install TruffleHog
   pip install truffleHog
   
   # Scan repository
   trufflehog --regex --entropy=False .
   ```

## 🧹 Git History Cleanup

If secrets were accidentally committed, clean them immediately:

### Remove secrets from git history:
```bash
# Remove specific file from all commits
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# Alternative using git-filter-repo (recommended)
git filter-repo --path .env.local --invert-paths

# Force push to remote (DANGEROUS - coordinate with team)
git push origin --force --all
git push origin --force --tags
```

### Rotate compromised secrets:
1. **Immediately** generate new API keys/tokens
2. Update environment variables in all deployments
3. Revoke old credentials
4. Monitor for unauthorized access

## 📋 Security Checklist

Before deploying to production:

### Code Security
- [ ] No hardcoded secrets in source code
- [ ] All user inputs are validated and sanitized
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date and audited
- [ ] Security headers are configured

### Environment Security
- [ ] `.env.local` is in `.gitignore`
- [ ] Production environment variables are set
- [ ] HTTPS is enforced in production
- [ ] CORS is configured for specific origins only

### Database Security
- [ ] Supabase RLS policies are enabled
- [ ] Database credentials are rotated
- [ ] Backup and recovery procedures are tested
- [ ] Access logs are monitored

### Deployment Security
- [ ] Security headers are configured in hosting platform
- [ ] SSL/TLS certificates are valid
- [ ] CDN security features are enabled
- [ ] Monitoring and alerting are configured

## 🔄 Security Updates

This project follows these security practices:

1. **Dependency Updates**: Automated weekly dependency updates via Dependabot
2. **Security Patches**: Critical security updates are applied immediately
3. **Regular Audits**: Monthly security reviews and testing
4. **Incident Response**: Documented procedures for security incidents

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 📄 License

This security policy is part of the KeyQuest project and is subject to the same license terms.
