# 🚀 Production Deployment Checklist

## Pre-Deployment (Must Complete)

### Security Verification
- [ ] Run: `npm audit` (0 vulnerabilities found)
- [ ] Check: No hardcoded secrets in code
- [ ] Verify: All files properly secured
- [ ] Test: XSS protection working
- [ ] Test: Input validation working
- [ ] Test: Rate limiting working

### Supabase Configuration
- [ ] **CRITICAL**: Verify RLS (Row Level Security) is ENABLED
- [ ] Check: Database has all required tables
- [ ] Verify: Policies restrict access properly
- [ ] Test: Can fetch data without auth (should fail if RLS on)

### Environment Setup
- [ ] Create `.env` file with production values
- [ ] Set: `NODE_ENV=production`
- [ ] Set: `CLERK_PUBLISHABLE_KEY=pk_live_...`
- [ ] Set: `SUPABASE_URL=https://...`
- [ ] Set: `SUPABASE_KEY=<production-key>`
- [ ] Verify: `.env` is in `.gitignore`

### HTTPS Setup
- [ ] Obtain SSL certificate
- [ ] Configure HTTPS on server
- [ ] Update PORT to 443 (or 80 with reverse proxy)
- [ ] Test: Can reach via https://yourdomain.com

### Domain Configuration
- [ ] Update: `allowedOrigins` in server.js
  ```javascript
  const allowedOrigins = ['https://yourdomain.com'];
  ```
- [ ] Test: CORS works from your domain
- [ ] Update: Clerk redirect URLs
- [ ] Update: Supabase allowed URLs

---

## Deployment Steps

### Step 1: Prepare Server
```bash
# Install dependencies
npm install

# Build/compile (if needed)
npm run build:css

# Verify no errors
npm audit
```

### Step 2: Environment & Secrets
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with production values
nano .env

# Verify file exists
ls -la .env

# Verify not in git
git status | grep .env  # Should show nothing
```

### Step 3: Start Service
```bash
# Start application
npm start

# Output should show:
# 🔒 Secure server running at https://yourdomain.com
# 🛡️ Admin panel: https://yourdomain.com/admin
# 📋 Environment: production
```

### Step 4: Verify Deployment
```bash
# Test homepage
curl https://yourdomain.com

# Test config endpoint
curl https://yourdomain.com/api/config

# Test admin panel (should see Clerk login)
curl https://yourdomain.com/admin

# Test file access protection
curl https://yourdomain.com/.env  # Should return 403
curl https://yourdomain.com/script.js  # Should return 403

# Test rate limiting (run 35 times quickly)
for i in {1..35}; do curl https://yourdomain.com/admin; done
# After ~30, should get rate limit response
```

### Step 5: Monitor
```bash
# Watch logs
tail -f /path/to/logs

# Monitor errors
watch -n 1 'curl https://yourdomain.com/api/config'
```

---

## Quick Fixes If Issues

### Issue: "Supabase not initialized"
**Fix**: Ensure `/api/config` endpoint returns valid JSON
```bash
curl http://localhost:3000/api/config
```

### Issue: "Clerk not loaded"
**Fix**: Check that `.env` has valid `CLERK_PUBLISHABLE_KEY`
```bash
grep CLERK_PUBLISHABLE_KEY .env
```

### Issue: "Cannot read property 'createClient'"
**Fix**: Ensure Supabase CDN is loaded
```bash
# Check browser console
# Should see fetch to /api/config
```

### Issue: "Rate limited"
**Fix**: Expected behavior. Wait 5 minutes or change IP.

### Issue: "403 Forbidden" on file access
**Fix**: Expected behavior. This is the security protection working!

---

## Rollback Plan

If deployment fails:

```bash
# 1. Stop the application
pkill -f "npm start"
pkill -f "node server.js"

# 2. Check logs for errors
tail -100 /path/to/logs

# 3. Revert .env to previous state
git checkout .env

# 4. Restart
npm start

# 5. Verify working
curl https://yourdomain.com
```

---

## Post-Deployment

### Monitor First 24 Hours
- [ ] Check error logs hourly
- [ ] Monitor for rate limit abuses
- [ ] Verify database queries working
- [ ] Test form submissions
- [ ] Check admin panel access
- [ ] Monitor server resources (CPU, RAM, disk)

### Setup Alerts
- [ ] Create alert for error rates > 5%
- [ ] Alert on database connection failures
- [ ] Alert on rate limit violations (>10 per minute)
- [ ] Alert on HTTPS certificate expiration (60 days before)

### Maintenance
- [ ] Set up automated backups (daily)
- [ ] Monitor disk space
- [ ] Keep dependencies updated
- [ ] Review security logs weekly

---

## Success Criteria

✅ Deployment is successful when:
- [x] No console errors in browser
- [x] Admin panel loads with Clerk login
- [x] Contact form submits successfully
- [x] File access returns 403
- [x] Rate limiting active
- [x] HTTPS redirects working
- [x] No sensitive data in logs
- [x] Database queries working

---

## Emergency Contact

If critical issues:
1. Check logs: `tail -f /path/to/logs`
2. Stop server: `pkill -f "npm start"`
3. Revert: `git checkout .`
4. Restart: `npm start`

---

## Security Reminder

🔒 **Before Every Deployment**:
```bash
# Verify secrets not exposed
grep -r "SUPABASE_KEY\|CLERK_PUBLISHABLE_KEY\|password\|secret" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude=.env

# Should only show .env file (which is gitignored)
```

---

**Last Updated**: 2025-10-17
**Status**: 🟢 READY TO DEPLOY
