// middleware/rateLimiter.js
let rateLimit;
try {
  // express-rate-limit v6+ (CJS)
  ({ rateLimit } = require('express-rate-limit'));
} catch {
  // fallback v5 (CJS export par défaut)
  rateLimit = require('express-rate-limit');
}

const limiterTentatives = (max = 5, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
  });

module.exports = limiterTentatives;