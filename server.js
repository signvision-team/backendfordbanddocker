import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();

/* =========================
   CORS (PRODUCTION SAFE)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://signvision-5mwgcpa5b-wahabullahs-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // mobile/postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // keep open for debugging (later lock it)
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// IMPORTANT: DO NOT use "*"
app.options("*", cors()); // <-- SAFE ONLY if cors() is defined like above

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());

/* =========================
   LOGGING
========================= */
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* =========================
   SIGNUP
========================= */
app.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP:", req.body);

    return res.json({
      success: true,
      message: "Signup endpoint working"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =========================
   LOGIN
========================= */
app.post("/login", async (req, res) => {
  try {
    console.log("LOGIN:", req.body);

    return res.json({
      success: true,
      message: "Login endpoint working"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});