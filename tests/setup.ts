import { config } from "dotenv";

// Load environment variables for testing
config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";

// Global test timeout
(global as any).jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: (global as any).jest.fn(),
  debug: (global as any).jest.fn(),
  info: (global as any).jest.fn(),
  warn: (global as any).jest.fn(),
  error: (global as any).jest.fn(),
};

// Clean up after each test
(global as any).afterEach(() => {
  (global as any).jest.clearAllMocks();
});

// Global test utilities
export const testUtils = {
  // Generate random string
  randomString: (length: number = 10): string => {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  },

  // Generate random email
  randomEmail: (): string => {
    return `test.${Date.now()}@example.com`;
  },

  // Generate random ObjectId
  randomObjectId: (): string => {
    return "507f1f77bcf86cd799439011";
  },

  // Wait for a specified time
  wait: (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};
