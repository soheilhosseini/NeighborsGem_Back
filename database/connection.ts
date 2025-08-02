import mongoose from "mongoose";
import { config } from "@config/environment";
import logger from "@utils/logger";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;
  private connectionPromise: Promise<typeof mongoose> | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<typeof mongoose> {
    if (this.isConnected) {
      logger.debug("Database already connected");
      return mongoose;
    }

    if (this.connectionPromise) {
      logger.debug("Database connection already in progress");
      return this.connectionPromise;
    }

    this.connectionPromise = this.createConnection();
    return this.connectionPromise;
  }

  private async createConnection(): Promise<typeof mongoose> {
    try {
      // Configure mongoose
      mongoose.set("strictQuery", false);

      // Connection options
      const options: mongoose.ConnectOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      logger.info("Connecting to MongoDB...", { uri: config.database.uri });

      // Connect to MongoDB
      await mongoose.connect(config.database.uri, options);

      this.isConnected = true;
      logger.info("Successfully connected to MongoDB");

      // Set up connection event listeners
      this.setupEventListeners();

      return mongoose;
    } catch (error) {
      this.isConnected = false;
      this.connectionPromise = null;
      logger.error("Failed to connect to MongoDB", { error });
      throw error;
    }
  }

  private setupEventListeners(): void {
    const db = mongoose.connection;

    db.on("connected", () => {
      logger.info("Mongoose connected to MongoDB");
    });

    db.on("error", (error) => {
      logger.error("Mongoose connection error", { error });
    });

    db.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB");
      this.isConnected = false;
    });

    db.on("reconnected", () => {
      logger.info("Mongoose reconnected to MongoDB");
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.debug("Database not connected");
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.connectionPromise = null;
      logger.info("Successfully disconnected from MongoDB");
    } catch (error) {
      logger.error("Error disconnecting from MongoDB", { error });
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getConnectionInfo(): {
    isConnected: boolean;
    readyState: number;
    host: string;
    name: string;
  } {
    const db = mongoose.connection;
    return {
      isConnected: this.isConnected,
      readyState: db.readyState,
      host: db.host || "unknown",
      name: db.name || "unknown",
    };
  }

  // Health check method
  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    details: any;
  }> {
    try {
      if (!this.isConnected) {
        return {
          status: "unhealthy",
          details: { error: "Database not connected" },
        };
      }

      const db = mongoose.connection.db;
      if (!db) {
        return {
          status: "unhealthy",
          details: { error: "Database connection not established" },
        };
      }

      // Ping the database
      await db.admin().ping();

      return {
        status: "healthy",
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        },
      };
    } catch (error) {
      logger.error("Database health check failed", { error });
      return {
        status: "unhealthy",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }
}

// Export singleton instance
const databaseConnection = DatabaseConnection.getInstance();

export default databaseConnection;
