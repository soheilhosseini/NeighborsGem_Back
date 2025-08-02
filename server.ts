import express, { Application } from "express";
import { join } from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";

// Import configurations
import { config } from "@config/environment";
import corsOptions from "@config/corsOptions";

// Import middleware
import {
  helmetConfig,
  securityHeaders,
  requestSizeLimiter,
  generalLimiter,
  corsPreflight,
} from "@middleware/security";
import { errorHandler, notFoundHandler } from "@utils/errors";
import logger from "@utils/logger";

// Import database connection
import databaseConnection from "@database/connection";

// Import socket initializer
import socketInitializer from "./socket";

// Import routes
import apiRoutes from "@routes/api/api";

// Import utilities
import createEssentialDirectories from "@utils/createDirectories";

class Server {
  private app: Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Trust proxy for rate limiting
    this.app.set("trust proxy", 1);

    // Security middleware
    this.app.use(helmetConfig);
    this.app.use(securityHeaders);
    this.app.use(generalLimiter);
    this.app.use(requestSizeLimiter);

    // CORS
    this.app.use(corsPreflight);
    this.app.use(cors(corsOptions));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: config.upload.maxSize }));
    this.app.use(
      express.urlencoded({ extended: false, limit: config.upload.maxSize })
    );

    // Cookie parser
    this.app.use(cookieParser());

    // Logging middleware
    this.app.use(logger.logRequest);

    // Static files
    this.app.use(express.static(join(__dirname, "/public")));
    this.app.use("/uploads", express.static("uploads"));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get("/health", async (req, res) => {
      try {
        const dbHealth = await databaseConnection.healthCheck();

        const healthStatus = {
          status: dbHealth.status === "healthy" ? "healthy" : "unhealthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: config.isDevelopment ? "development" : "production",
          database: dbHealth,
          version: process.env.npm_package_version || "1.0.0",
        };

        const statusCode = healthStatus.status === "healthy" ? 200 : 503;
        res.status(statusCode).json(healthStatus);
      } catch (error) {
        logger.error("Health check failed", { error });
        res.status(503).json({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: "Health check failed",
        });
      }
    });

    // API status endpoint
    this.app.get("/api", (req, res) => {
      res.json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // API routes
    this.app.use("/api", apiRoutes);

    // 404 handler for unmatched routes
    this.app.all("*", notFoundHandler);
  }

  private setupErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await databaseConnection.connect();
      logger.info("Database connection established");
    } catch (error) {
      logger.error("Failed to connect to database", { error });
      process.exit(1);
    }
  }

  private async createDirectories(): Promise<void> {
    try {
      await createEssentialDirectories();
      logger.info("Essential directories created");
    } catch (error) {
      logger.error("Failed to create directories", { error });
      // Don't exit here as it's not critical
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      try {
        // Close server
        if (this.server) {
          this.server.close(() => {
            logger.info("HTTP server closed");
          });
        }

        // Close database connection
        await databaseConnection.disconnect();
        logger.info("Database connection closed");

        process.exit(0);
      } catch (error) {
        logger.error("Error during graceful shutdown", { error });
        process.exit(1);
      }
    };

    // Handle different shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception", { error });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection", { reason, promise });
      process.exit(1);
    });
  }

  async start(): Promise<void> {
    try {
      // Initialize database
      await this.initializeDatabase();

      // Create essential directories
      await this.createDirectories();

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Initialize socket.io
      this.server = socketInitializer(this.app);

      // Start server
      this.server.listen(
        {
          port: config.server.port,
          host: config.server.host,
        },
        () => {
          logger.info(`🚀 Server running on port ${config.server.port}`, {
            environment: config.isDevelopment ? "development" : "production",
            port: config.server.port,
            host: config.server.host,
            nodeVersion: process.version,
            platform: process.platform,
          });
        }
      );
    } catch (error) {
      logger.error("Failed to start server", { error });
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start().catch((error) => {
  logger.error("Server startup failed", { error });
  process.exit(1);
});

export default server;
