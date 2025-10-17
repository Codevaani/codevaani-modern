require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// Request size limiting - prevent large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// HTTP for local dev (no browser warnings) - Vercel handles HTTPS in production

// Security: Helmet middleware for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://cgulmefhkvwuckdeqljk.supabase.co", "https://cdn.clerk.com", "https://cdn.jsdelivr.net"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Prevent clickjacking
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// No CORS restrictions - removed as per user request

// Rate limiting - different limits for different routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator
});

const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: 'Admin access too frequent',
  standardHeaders: true,
  keyGenerator: ipKeyGenerator,
  skip: (req) => req.path !== '/admin'
});

app.use(generalLimiter);
app.use(adminLimiter);

// Request logging for suspicious activity
const activityLog = [];
app.use((req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent']
  };
  
  activityLog.push(logEntry);
  if (activityLog.length > 1000) activityLog.shift();
  
  next();
});

// Whitelist: Only allow safe static files (CSS, images, fonts)
app.use((req, res, next) => {
  const allowedExtensions = ['.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot'];
  const allowedPaths = ['/output.css', '/styles.css'];
  
  const ext = path.extname(req.path).toLowerCase();
  
  // Block directory traversal attempts
  if (req.path.includes('..') || req.path.includes('//')) {
    res.status(403).json({ error: 'Access Denied' });
    return;
  }
  
  // Block dangerous file types
  const blockedExtensions = ['.js', '.json', '.env', '.env.local', '.md', '.yml', '.yaml', '.sql', '.db', '.txt', '.xml', '.conf', '.config'];
  const blockedPaths = ['node_modules', '.git', '.env', '.well-known', 'package', 'server', 'admin.html', 'index1.html', 'script', 'admin'];
  
  if (blockedExtensions.includes(ext) || blockedPaths.some(p => req.path.includes(p))) {
    res.status(403).json({ error: 'Access Denied' });
    return;
  }
  
  // Only serve whitelisted static files
  if (allowedExtensions.includes(ext) || allowedPaths.includes(req.path)) {
    const filePath = path.join(__dirname, req.path);
    
    // Prevent directory traversal attacks
    if (!filePath.startsWith(__dirname)) {
      return res.status(403).json({ error: 'Access Denied' });
    }
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        res.sendFile(filePath);
      } else {
        next();
      }
    });
    return;
  }
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index1.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Public Config API - provides configuration to frontend
app.get('/api/config', (req, res) => {
  res.json({
    clerk: {
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY
    },
    social: {
      instagram: process.env.INSTAGRAM_URL,
      whatsapp: process.env.WHATSAPP_NUMBER
    }
  });
});

// Activity logs API (admin only)
app.get('/api/logs', (req, res) => {
  const clerkToken = req.headers['authorization'];
  if (!clerkToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(activityLog.slice(-50));
});

// Ignore system requests
app.get(/^\/.well-known/, (req, res) => {
  res.sendStatus(404);
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index1.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

// Start HTTP Server (no browser warnings)
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
  console.log(`✅ Admin Panel:    http://localhost:${PORT}/admin`);
  console.log(`📋 Environment:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Deploy to Vercel for automatic HTTPS (no warnings)`);
});
