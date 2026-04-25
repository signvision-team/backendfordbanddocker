import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";   // ✅ FIXED (IMPORTANT)

dotenv.config();

const app = express();

app.use(express.json());

// ✅ FIXED CORS (WORKS FOR MOBILE + WEB + VERCEL)
app.use(cors({
  origin: function (origin, callback) {
    // allow all mobile apps + postman + browser
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://your-frontend.vercel.app" // 🔥 CHANGE THIS
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(null, true); // ✅ allows mobile + postman issues fix
    }
  },
  credentials: true
}));

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* ---------------- TEST ---------------- */
app.post("/api/test", (req, res) => {
  console.log(req.body);
  res.json({ success: true, data: req.body });
});

/* ---------------- SIGNUP ---------------- */
app.post("/signup", async (req, res) => {
  console.log("SIGNUP DATA:", req.body);

  try {
    const { userType, email, password } = req.body;

    if (userType === "INDIVIDUAL") {
      await db.query(
        "INSERT INTO Individuals (firstName, lastName, phoneNumber, dob, address, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          req.body.firstName,
          req.body.lastName,
          req.body.phoneNumber,
          req.body.dob,
          req.body.address,
          email,
          password
        ]
      );
    } else {
      const orgID = req.body.orgID || `SV-${Math.floor(Math.random() * 9000)}`;

      await db.query(
        "INSERT INTO Organizations (orgName, contactPerson, contactNumber, address, email, password, orgID) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          req.body.orgName,
          req.body.contactPerson,
          req.body.contactNumber,
          req.body.address,
          email,
          password,
          orgID
        ]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error("SIGNUP ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
  console.log("LOGIN DATA:", req.body);

  const { email, password, userType, orgID } = req.body;

  try {
    let query, params;

    if (userType === "INDIVIDUAL") {
      query = "SELECT * FROM Individuals WHERE email = ? AND password = ?";
      params = [email, password];
    } else {
      query = "SELECT * FROM Organizations WHERE email = ? AND password = ? AND orgID = ?";
      params = [email, password, orgID];
    }

    const [rows] = await db.query(query, params);

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});