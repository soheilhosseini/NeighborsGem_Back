import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { config } from "@config/environment";
import logger from "@utils/logger";

// Rate limiting configuration
export const createRateLimiter = (
  windowMs: number = config.rateLimit.windowMs,
  max: number = config.rateLimit.max,
  message: string = "Too many requests from this IP, please try again later."
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message,
        code: "RATE_LIMIT_EXCEEDED",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.originalUrl,
      });
      res.status(429).json({
        success: false,
        error: {
          message,
          code: "RATE_LIMIT_EXCEEDED",
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    },
  });
};

// General rate limiter
export const generalLimiter = createRateLimiter();

// Stricter rate limiter for authentication endpoints
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  "Too many authentication attempts, please try again later."
);

// API rate limiter
export const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  "Too many API requests, please try again later."
);

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  next();
};

// Request size limiter
export const requestSizeLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  const maxSize = config.upload.maxSize;

  if (contentLength > maxSize) {
    logger.warn("Request too large", {
      contentLength,
      maxSize,
      ip: req.ip,
      url: req.originalUrl,
    });

    return res.status(413).json({
      success: false,
      error: {
        message: "Request entity too large",
        code: "REQUEST_TOO_LARGE",
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  next();
};

// IP filtering middleware (optional)
export const ipFilter = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (allowedIPs.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      logger.warn("Access denied from IP", {
        ip: clientIP,
        allowedIPs,
        url: req.originalUrl,
      });

      return res.status(403).json({
        success: false,
        error: {
          message: "Access denied",
          code: "IP_NOT_ALLOWED",
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    next();
  };
};

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validationResult = schema.validate(req.body);

      if (validationResult.error) {
        logger.warn("Request validation failed", {
          error: validationResult.error.details,
          body: req.body,
          url: req.originalUrl,
        });

        return res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: validationResult.error.details,
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Replace request body with validated data
      req.body = validationResult.value;
      next();
    } catch (error) {
      logger.error("Request validation error", { error });
      next(error);
    }
  };
};

// CORS preflight handler
export const corsPreflight = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
    );
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
    res.sendStatus(200);
  } else {
    next();
  }
};
