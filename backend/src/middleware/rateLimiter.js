const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many login/register attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== "production",
});

// More lenient rate limiter for GPS location updates
const locationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: "Too many location updates. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    // gunakan deviceId jika ada
    if (req.body.deviceId) {
      return req.body.deviceId;
    }

    // fallback aman untuk IPv6
    return ipKeyGenerator(req.ip);
  },

  skip: (req) => process.env.NODE_ENV !== "production",
});

// General API rate limiter (moderate restrictions)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== "production",
});

module.exports = {
  authLimiter,
  locationLimiter,
  apiLimiter,
};
