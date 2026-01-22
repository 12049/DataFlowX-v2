import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

/**
 * Blackwave API Traffic Control
 */

const trafficControl = [
  rateLimit({
    windowMs: 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false
  }),

  slowDown({
    windowMs: 1000,
    delayAfter: 20,
    delayMs: 100
  })
];

export { trafficControl };
