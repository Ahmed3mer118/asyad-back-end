require("dotenv").config();

const app = require("../expressApp");
const connectDB = require("../config/db.config");
const { ensureRoles } = require("../services/ensureRoles.service");

let isReady = false;
let initPromise = null;

async function ensureReady() {
  if (isReady) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await connectDB();
      await ensureRoles();
      isReady = true;
    } catch (err) {
      console.error("Vercel serverless init error:", err.message);
      initPromise = null;
      throw err;
    }
  })();
  return initPromise;
}

const CORS_ORIGIN = "https://asyad-real-estate.vercel.app";

function setCorsHeaders(res, origin) {
  const allowOrigin = origin && (origin === CORS_ORIGIN || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1"))
    ? origin
    : CORS_ORIGIN;
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || req.headers.Origin;
  if (req.method === "OPTIONS") {
    setCorsHeaders(res, origin);
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }
  try {
    await ensureReady();
  } catch (err) {
    setCorsHeaders(res, origin);
    return res.status(503).json({
      error: "Service temporarily unavailable",
      message: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
  return app(req, res);
};
