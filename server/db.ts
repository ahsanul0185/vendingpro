// db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

// LOAD ENVIRONMENT VARIABLES FIRST
dotenv.config();

// Validate environment variables
function validateEnv() {
  const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing database environment variables: ${missing.join(", ")}`
    );
  }
}

validateEnv();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Enhanced connection monitoring
pool.on("connect", () => {
  console.log("✅ Database connection established");
});

pool.on("error", (err) => {
  console.error("❌ Database pool error:", err);
});

export const db = drizzle(pool, { schema });

// Initialize database connection
export async function initializeDatabase(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log("✅ Database initialized successfully");
    client.release();
    return true;
  } catch (error: any) {
    console.error("❌ Database initialization failed:", error.message);
    return false;
  }
}
