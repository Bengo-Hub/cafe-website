# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take the security of the Urban Loft Cafe website seriously. If you discover a security vulnerability, please follow these steps:

### DO NOT

- **Do not** open a public issue
- **Do not** share the vulnerability publicly
- **Do not** attempt to exploit the vulnerability

### DO

1. **Email** the security team at [security@bengobox.com] (or appropriate contact)
2. **Include** as much information as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Wait** for acknowledgment (within 48 hours)
4. **Allow** reasonable time for fix (typically 7-30 days depending on severity)

## Security Best Practices

### For Contributors

- Never commit secrets, API keys, or passwords
- Use environment variables for sensitive data
- Review code for security issues before committing
- Keep dependencies updated
- Follow secure coding practices

### Authentication & Authorization

- All protected routes require valid JWT
- Tokens stored in httpOnly cookies
- CSRF protection enabled
- Session expiration enforced
- OAuth2/OIDC best practices followed

### Data Protection

- No sensitive data in logs
- User input sanitized
- XSS protection enabled
- SQL injection prevention (parameterized queries)
- HTTPS enforced in production

### Dependencies

- Regular dependency audits (`pnpm audit`)
- Automated security updates (Dependabot)
- Review security advisories
- Update vulnerable packages promptly

## Security Features

- JWT token validation
- httpOnly cookies
- CSRF tokens
- Rate limiting (API routes)
- Content Security Policy headers
- HTTPS/TLS enforcement
- Input validation (Zod schemas)
- Error handling (no sensitive info leakage)

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment sent
3. **Day 3-7**: Investigation and assessment
4. **Day 7-30**: Fix developed and tested
5. **Day 30+**: Fix deployed
6. **Day 30-60**: Public disclosure (if applicable)

## Contact

For security concerns:
- Email: [security@bengobox.com]
- Encrypted: [PGP key available on request]

## Recognition

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors will be recognized (with permission) in our security acknowledgments.

## Updates

This security policy may be updated periodically. Check back for the latest version.

---

Last updated: December 2025
