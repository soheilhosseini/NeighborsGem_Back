import { Request, Response, NextFunction } from "express";
import { config } from "@config/environment";
import fs from "fs";
import path from "path";

// Log levels
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
  requestId?: string;
  userId?: string;
  ip?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  responseTime?: number;
}

class Logger {
  private logDir: string;
  private logLevel: LogLevel;

  constructor() {
    this.logDir = path.join(process.cwd(), "logs");
    this.logLevel = config.logging.level as LogLevel;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(level: LogLevel): string {
    const date = new Date().toISOString().split("T")[0];
    return path.join(this.logDir, `${level}-${date}.log`);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private writeToFile(entry: LogEntry): void {
    const fileName = this.getLogFileName(entry.level);
    const logLine = JSON.stringify(entry) + "\n";

    fs.appendFileSync(fileName, logLine);
  }

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error: error
        ? ({
            name: error.name,
            message: error.message,
            stack: error.stack,
          } as Error)
        : undefined,
    };

    // Console output
    const consoleMessage = `[${
      entry.timestamp
    }] ${level.toUpperCase()}: ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(consoleMessage, data || "");
        break;
      case LogLevel.WARN:
        console.warn(consoleMessage, data || "");
        break;
      case LogLevel.INFO:
        console.info(consoleMessage, data || "");
        break;
      case LogLevel.DEBUG:
        console.debug(consoleMessage, data || "");
        break;
    }

    // File output
    this.writeToFile(entry);
  }

  error(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  // Request logging
  logRequest(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const requestId =
      (req.headers["x-request-id"] as string) || this.generateRequestId();

    // Add request ID to response headers
    res.setHeader("X-Request-ID", requestId);

    // Log request
    this.info("Incoming request", {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: (req as any).userId,
    });

    // Log response
    res.on("finish", () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;

      this.log(level, "Request completed", {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userId: (req as any).userId,
      });
    });

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Database logging
  logDatabase(
    operation: string,
    collection: string,
    data?: any,
    error?: Error
  ): void {
    const message = `Database ${operation} on ${collection}`;
    if (error) {
      this.error(message, data, error);
    } else {
      this.debug(message, data);
    }
  }

  // Authentication logging
  logAuth(action: string, userId?: string, data?: any, error?: Error): void {
    const message = `Authentication ${action}`;
    const logData = { ...data, userId };

    if (error) {
      this.warn(message, logData, error);
    } else {
      this.info(message, logData);
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
