import { Request, Response, NextFunction } from "express";

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let code: string | undefined;
  let details: any = undefined;

  // Handle custom AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle Mongoose validation errors
  else if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    details = error.message;
  }
  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }
  // Handle JWT errors
  else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  // Handle duplicate key errors
  else if (error.name === "MongoError" && (error as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
  }
  // Handle CORS errors
  else if (error.message === "Not allowed by CORS") {
    statusCode = 403;
    message = "CORS policy violation";
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) => {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  res.status(404).json({
    success: false,
    error: {
      message: error.message,
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
