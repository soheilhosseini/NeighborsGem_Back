import { Response } from "express";

// Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
  path: string;
  requestId?: string;
}

// Response utility class
export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      requestId: res.getHeader("X-Request-ID") as string,
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message?: string
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: PaginatedResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      requestId: res.getHeader("X-Request-ID") as string,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };

    return res.status(200).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      requestId: res.getHeader("X-Request-ID") as string,
    };

    return res.status(statusCode).json(response);
  }

  static badRequest(
    res: Response,
    message: string = "Bad Request",
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, message, 400, code, details);
  }

  static unauthorized(
    res: Response,
    message: string = "Unauthorized",
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, message, 401, code, details);
  }

  static forbidden(
    res: Response,
    message: string = "Forbidden",
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, message, 403, code, details);
  }

  static notFound(
    res: Response,
    message: string = "Not Found",
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, message, 404, code, details);
  }

  static conflict(
    res: Response,
    message: string = "Conflict",
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, message, 409, code, details);
  }

  static tooManyRequests(
    res: Response,
    message: string = "Too Many Requests",
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, message, 429, code, details);
  }

  static internalServerError(
    res: Response,
    message: string = "Internal Server Error",
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, message, 500, code, details);
  }

  static serviceUnavailable(
    res: Response,
    message: string = "Service Unavailable",
    code?: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, message, 503, code, details);
  }

  // Validation error response
  static validationError(
    res: Response,
    errors: any[],
    message: string = "Validation Error"
  ): Response<ErrorResponse> {
    return this.badRequest(res, message, "VALIDATION_ERROR", errors);
  }

  // Database error response
  static databaseError(
    res: Response,
    message: string = "Database Error",
    details?: any
  ): Response<ErrorResponse> {
    return this.internalServerError(res, message, "DATABASE_ERROR", details);
  }

  // Authentication error response
  static authenticationError(
    res: Response,
    message: string = "Authentication Failed",
    details?: any
  ): Response<ErrorResponse> {
    return this.unauthorized(res, message, "AUTHENTICATION_ERROR", details);
  }

  // Authorization error response
  static authorizationError(
    res: Response,
    message: string = "Access Denied",
    details?: any
  ): Response<ErrorResponse> {
    return this.forbidden(res, message, "AUTHORIZATION_ERROR", details);
  }

  // File upload error response
  static fileUploadError(
    res: Response,
    message: string = "File Upload Error",
    details?: any
  ): Response<ErrorResponse> {
    return this.badRequest(res, message, "FILE_UPLOAD_ERROR", details);
  }

  // Rate limit error response
  static rateLimitError(
    res: Response,
    message: string = "Too Many Requests",
    details?: any
  ): Response<ErrorResponse> {
    return this.tooManyRequests(res, message, "RATE_LIMIT_EXCEEDED", details);
  }
}

// Export default instance
export default ResponseUtil;
