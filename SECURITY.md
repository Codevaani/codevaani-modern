# 🛡️ Security Implementation Guide

## Overview
The admin panel has been hardened with multiple layers of security to prevent unauthorized access, data scraping, and hacker attacks.

---

## Backend Security (server.js)

### 1. **Security Headers (Helmet.js)**
- **Content Security Policy (CSP)**: Restricts resource loading to authorized sources only
- **HSTS**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks (set to DENY)
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS filters
- **Permissions-Policy**: Disables camera, microphone, and geolocation access

### 2. **Rate Limiting**
- **General Limit**: 100 requests per 15 minutes per IP
- **Admin Panel**: 30 requests per 5 minutes (stricter)
- **IPv6 Compatible**: Properly handles both IPv4 and IPv6 addresses
- **Prevents**: Brute force attacks, DDoS, and automated scraping

### 3. **CORS Protection**
- **Whitelist Only**: Only allows requests from:
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `http://127.0.0.1:3000`
- **Credentials**: CORS credentials required for sensitive operations
- **Prevents**: Cross-origin attacks

### 4. **Activity Logging**
- Logs all requests with:
  - Timestamp
  - IP Address
  - HTTP Method
  - Request Path
  - User Agent
- **Suspicious Activity Detection**: Available via `/api/logs` (auth required)

### 5. **Environment Variables**
- All sensitive keys stored in `.env` file
- `.env` file in `.gitignore` (never committed)
- Keys are NOT exposed in frontend code

---

## Frontend Security (admin.html)

### 1. **DevTools & Console Prevention**
- ✅ Blocks F12 (DevTools)
- ✅ Blocks Ctrl+Shift+I (Inspector)
- ✅ Blocks Ctrl+J (Console)
- ✅ Detects window resize (indicates DevTools open)
- ✅ Disables console.log() in production
- **Note**: These can be bypassed in localhost for development

### 2. **Right-Click Protection**
- Context menu disabled
- Prevents users from inspecting element
- Prevents access to DevTools through right-click menu

### 3. **Keyboard Shortcuts Disabled**
- F12 disabled
- Ctrl+Shift+I disabled (Inspector)
- Ctrl+J disabled (Console)

### 4. **Session Management**
- **Session Timeout**: 30 minutes of inactivity
- **CSRF Token**: Auto-generated per session
- **Session Validation**: Checked every 60 seconds
- **Automatic Logout**: Expires and redirects to login

### 5. **Input Sanitization**
- `SecurityManager.sanitizeInput()` - Escapes HTML special characters
- Prevents XSS attacks
- Safe text content rendering

### 6. **Clerk Authentication**
- Role-based access control (requires `role: 'admin'` in Clerk metadata)
- Only admins can access the admin panel
- Non-admins see "Access Denied" message

---

## Clerk Configuration

### Admin Role Setup
1. Go to https://dashboard.clerk.com
2. Select a user
3. Click "User Details"
4. Add to "Custom Attributes" (public metadata):
```json
{
  "role": "admin"
}
```
5. User now has admin access

---

## Environment Setup

### 1. Create `.env` file
```
CLERK_PUBLISHABLE_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here
NODE_ENV=production
PORT=3000
```

### 2. Never commit `.env`
Already added to `.gitignore`

### 3. Start Server
```bash
npm start
```

---

## Protection Against Attacks

### ✅ SQL Injection
- Using Supabase with parameterized queries
- No raw SQL execution
- Input sanitization

### ✅ XSS (Cross-Site Scripting)
- CSP headers prevent inline script injection
- Input sanitization via SecurityManager
- Template escaping

### ✅ CSRF (Cross-Site Request Forgery)
- CSRF token generation
- Session-based validation
- SameSite cookie attributes

### ✅ Brute Force
- Rate limiting (30 requests/5 min for admin)
- IP-based blocking
- Account lockout via Clerk

### ✅ DDoS
- Rate limiting on all endpoints
- Request throttling
- IP blocking capability

### ✅ Data Scraping
- Rate limiting
- User-Agent validation available
- Session requirements
- CORS restrictions

### ✅ Clickjacking
- X-Frame-Options: DENY
- Cannot be embedded in iframes

### ✅ Man-in-the-Middle
- HSTS headers force HTTPS
- Secure cookie flags
- Content validation

### ✅ DevTools Access
- Console disabled in production
- Inspector prevention
- Window resize detection

---

## Testing Security

### Check Headers
```bash
curl -i http://localhost:3000/admin
```
Look for security headers in response

### Test Rate Limiting
Make 35 requests in 5 minutes to `/admin`
Should receive: "Admin access too frequent"

### Test CORS
```bash
curl -H "Origin: http://evil.com" http://localhost:3000
```
Should NOT include CORS headers

### Test XSS Protection
Try submitting HTML in forms - should be escaped

### Test DevTools (Desktop)
Visit http://localhost:3000/admin in browser
Try pressing F12, Ctrl+Shift+I, Ctrl+J
Works in localhost (for development only)

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in .env
- [ ] Use HTTPS (not HTTP)
- [ ] Update `allowedOrigins` with your domain
- [ ] Set strong Clerk publishable key
- [ ] Rotate Supabase keys regularly
- [ ] Enable HSTS in your domain
- [ ] Set up DDoS protection (Cloudflare, AWS Shield)
- [ ] Monitor activity logs regularly
- [ ] Set up security alerts for suspicious activity
- [ ] Keep dependencies updated: `npm audit fix`

---

## Monitoring & Logging

### View Activity Logs
```bash
GET /api/logs (requires authorization header)
```

Returns last 50 requests with:
- Timestamp
- IP Address
- Method
- Path
- User Agent

### Recommended Monitoring
- Set up alerts for:
  - Multiple failed login attempts
  - Unusual access patterns
  - IP addresses outside your region
  - User agents that don't match expected browsers

---

## Additional Security Tips

1. **Regular Updates**: Keep all dependencies updated
   ```bash
   npm audit
   npm update
   ```

2. **Two-Factor Authentication**: Enable in Clerk dashboard for extra security

3. **IP Whitelisting**: Consider restricting admin panel to known IPs

4. **Session Logs**: Monitor who logs in and when

5. **Backup Data**: Regularly backup Supabase data

6. **Test Security**: Use OWASP ZAP or similar tools to test

---

## Security Headers Summary

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | Enable XSS filter |
| Strict-Transport-Security | max-age=31536000 | Force HTTPS |
| Content-Security-Policy | See server.js | Restrict resources |
| Permissions-Policy | Disable camera/mic/geo | Limit device access |

---

## Questions?
For more information on specific security topics:
- Helmet.js: https://helmetjs.github.io/
- Express Rate Limit: https://github.com/nfriedly/express-rate-limit
- Clerk Security: https://clerk.com/docs/security
- OWASP: https://owasp.org/
