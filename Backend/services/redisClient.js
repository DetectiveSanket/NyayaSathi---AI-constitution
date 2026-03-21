// src/services/redisClient.js - Redis client connection using ioredis
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redisClient = null;

/**
 * Get or create Redis client instance
 * @returns {Redis|null}
 */
export function getRedisClient() {
  if (redisClient && redisClient.status === "ready") {
    return redisClient;
  }

  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 10) {
          console.warn("⚠️ Redis: Max reconnection attempts reached, memory features disabled");
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000);
      },
      enableOfflineQueue: false, // Don't queue commands when offline
      connectTimeout: 5000, // 5 second timeout
    });

    redisClient.on("error", (err) => {
      // Only log if it's not a connection refused (which is expected if Redis is not running)
      if (err.code !== "ECONNREFUSED") {
        console.error("❌ Redis Client Error:", err.message);
      }
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis Client Connected");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis Client Ready");
    });

    redisClient.on("close", () => {
      console.warn("⚠️ Redis Client Closed");
    });

    // Test connection (non-blocking)
    redisClient.ping().catch((err) => {
      if (err.code === "ECONNREFUSED") {
        console.warn("⚠️ Redis not available at " + redisUrl + ", memory features will be disabled");
      } else {
        console.warn("⚠️ Redis connection test failed, memory features will be disabled:", err.message);
      }
    });

    return redisClient;
  } catch (error) {
    console.error("❌ Failed to initialize Redis:", error.message);
    return null;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export default { getRedisClient, closeRedisClient };
