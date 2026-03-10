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

module.exports = async (req, res) => {
  try {
    await ensureReady();
  } catch (err) {
    return res.status(503).json({
      error: "Service temporarily unavailable",
      message: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
  return app(req, res);
};
