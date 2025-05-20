# Production Deployment Checklist

This document outlines the steps to securely deploy the Socratic Backend to production.

## Pre-Deployment Security Checklist

### Environment Variables

- [ ] Generate a strong, random `SECRET_KEY` (min. 32 bytes)
  ```python
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- [ ] Set valid `DATABASE_URL` for production database (use SSL enabled connection if possible)
- [ ] Set valid `OPENAI_API_KEY` 
- [ ] Configure `ALLOWED_ORIGINS` with explicit frontend domains (comma-separated, no wildcards in production)
- [ ] Set `FLASK_ENV=production`
- [ ] Set `FLASK_DEBUG=False`
- [ ] Set `FORCE_HTTPS=True`
- [ ] Set `SESSION_COOKIE_SECURE=True`

### Secret Management

- [ ] Ensure all secrets are properly set in your hosting environment's secret management (not in files)
- [ ] For Render.com: Use Environment Groups or Environment Variables 
- [ ] For other platforms: Use their appropriate secrets management system

### Database Security

- [ ] Use a managed database service with automated backups
- [ ] Enable SSL/TLS for database connections
- [ ] Restrict database network access to only the application servers
- [ ] Use a strong, unique database password
- [ ] Create a dedicated database user with limited permissions

### API Security

- [ ] Verify rate limiting is working properly
- [ ] Confirm CORS is properly configured for production domains
- [ ] Ensure all sensitive API endpoints require authentication
- [ ] Verify input validation is working properly

## Deployment Process

1. **Database Setup:**
   - [ ] Run migrations on the production database
   ```bash
   FLASK_APP=run.py flask db upgrade
   ```

2. **Testing Before Going Live:**
   - [ ] Test authentication flow with Firebase
   - [ ] Test conversation storage and retrieval
   - [ ] Verify rate limiting is working as expected
   - [ ] Test CORS with actual frontend domain

3. **Monitoring & Logging:**
   - [ ] Set up logging to a centralized service
   - [ ] Configure alerts for API errors and failed authentication attempts
   - [ ] Set up performance monitoring

## Post-Deployment Checklist

- [ ] Verify HTTPS is enforced for all connections
- [ ] Run a security scan for common vulnerabilities
- [ ] Test authentication flow in production
- [ ] Verify rate limiting is working in production
- [ ] Check logs for any unexpected errors or warnings
- [ ] Perform basic load testing

## Security Best Practices to Maintain

1. **Regular Updates:**
   - Keep dependencies updated (especially security patches)
   - Schedule regular security reviews

2. **Monitoring:**
   - Monitor for unusual activity patterns
   - Track API usage and error rates

3. **Backup Strategy:**
   - Maintain regular database backups
   - Test restoration process periodically

4. **Incident Response:**
   - Have a plan for security incidents
   - Document how to rotate compromised secrets/API keys if needed

---

## Certificate Management (If Self-Hosting)

If you're not using a managed service that handles HTTPS certificates:

- [ ] Set up Let's Encrypt certificates
- [ ] Configure auto-renewal
- [ ] Set up proper redirect from HTTP to HTTPS

## Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Flask Security Considerations](https://flask.palletsprojects.com/en/2.0.x/security/)
- [Firebase Security Rules Best Practices](https://firebase.google.com/docs/rules/security-rules-behavior) 