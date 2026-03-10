const cors = require("cors");

const isDev = process.env.NODE_ENV !== "production";

const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const defaultProductionOrigins = [
  "https://asyad-real-estate.vercel.app",
  "https://www.asyad-real-estate.vercel.app"
];

const localhostOrigins = [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:5000"
];

const allowedOrigins = isDev
  ? [...new Set([...envOrigins, ...defaultProductionOrigins, ...localhostOrigins])]
  : [...new Set([...defaultProductionOrigins, ...envOrigins])];

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin(origin, callback) {
    try {
      if (!origin) {
        return callback(null, true);
      }
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      if (isDev) {
        console.warn("[CORS] Rejected origin:", origin);
      }
      callback(new Error("CORS policy: origin not allowed"), false);
    } catch (err) {
      callback(err, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  optionsSuccessStatus: 204,
  preflightContinue: false
};

module.exports = cors(corsOptions);
