import request from "supertest";
import express from "express";
import { testUtils } from "./setup";

// Mock the database connection for testing
jest.mock("@database/connection", () => ({
  __esModule: true,
  default: {
    healthCheck: jest.fn().mockResolvedValue({
      status: "healthy",
      details: {
        readyState: 1,
        host: "localhost",
        name: "test-db",
      },
    }),
  },
}));

// Create a minimal app for testing
const app = express();

// Add health check route
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await (
      await import("@database/connection")
    ).default.healthCheck();

    const healthStatus = {
      status: dbHealth.status === "healthy" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: "test",
      database: dbHealth,
      version: "1.0.0",
    };

    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

describe("Health Check Endpoint", () => {
  it("should return healthy status when database is connected", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("environment", "test");
    expect(response.body).toHaveProperty("database");
    expect(response.body).toHaveProperty("version");
  });

  it("should return unhealthy status when database is not connected", async () => {
    // Mock database health check to return unhealthy
    const mockDbConnection = require("@database/connection").default;
    mockDbConnection.healthCheck.mockResolvedValueOnce({
      status: "unhealthy",
      details: { error: "Database not connected" },
    });

    const response = await request(app).get("/health").expect(503);

    expect(response.body).toHaveProperty("status", "unhealthy");
  });

  it("should handle database health check errors", async () => {
    // Mock database health check to throw error
    const mockDbConnection = require("@database/connection").default;
    mockDbConnection.healthCheck.mockRejectedValueOnce(
      new Error("Database error")
    );

    const response = await request(app).get("/health").expect(503);

    expect(response.body).toHaveProperty("status", "unhealthy");
    expect(response.body).toHaveProperty("error", "Health check failed");
  });
});

describe("Test Utils", () => {
  it("should generate random string", () => {
    const result = testUtils.randomString(5);
    expect(result).toHaveLength(5);
    expect(typeof result).toBe("string");
  });

  it("should generate random email", () => {
    const result = testUtils.randomEmail();
    expect(result).toMatch(/^test\.\d+@example\.com$/);
  });

  it("should generate random ObjectId", () => {
    const result = testUtils.randomObjectId();
    expect(result).toHaveLength(24);
    expect(result).toMatch(/^[a-f0-9]{24}$/);
  });

  it("should wait for specified time", async () => {
    const start = Date.now();
    await testUtils.wait(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(100);
  });
});
