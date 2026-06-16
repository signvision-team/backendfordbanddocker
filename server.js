import express from "express";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ THE CORS FIX IS LIVE
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204); 
  }
  next();
});

/* ... rest of your routes (/signup, /login, etc.) ... */

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ... rest of your code (/signup, /login)

// ... rest of your code paths (/signup, /login)

// ... rest of your code (/signup, /login)

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

    let generatedOrgID = null;

    if (userType === "INDIVIDUAL") {

      await db.query(
        `INSERT INTO Individuals
        (firstName, lastName, phoneNumber, dob, address, email, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
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

      // ✅ ALWAYS GENERATE SERVER SIDE
      generatedOrgID = `SV-${Date.now().toString().slice(-6)}`;

      await db.query(
        `INSERT INTO Organizations
        (orgName, contactPerson, contactNumber, address, email, password, orgID)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.orgName,
          req.body.contactPerson,
          req.body.contactNumber,
          req.body.address,
          email,
          password,
          generatedOrgID
        ]
      );
    }

    return res.json({
      success: true,
      orgID: generatedOrgID,
      message: "Signup successful"
    });

  } catch (err) {

    console.error("SIGNUP ERROR:", err.message);

    // ✅ HANDLE DUPLICATE EMAIL PROPERLY
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* ========================================================
   LOGIN ROUTE (FIXED DATABASE SCHEMAS & ORG ID VALIDATION)
   ======================================================== */
app.post("/login", async (req, res) => {
  console.log("LOGIN DATA RECEIVED:", req.body);

  const { email, password, userType, orgID } = req.body;

  try {
    let query, params;

    if (userType === "INDIVIDUAL") {
      query = "SELECT * FROM Individuals WHERE email = ? AND password = ?";
      params = [email, password];
    } else {
      // ✅ FIX: Match the actual table columns ('orgID' instead of 'regNumber')
      // ✅ REQUIREMENT ENFORCEMENT: Authenticate using the custom corporate code entered into the UI form
      query = "SELECT * FROM Organizations WHERE email = ? AND password = ? AND orgID = ?";
      params = [
        email, 
        password, 
        orgID ? orgID.trim() : null // Read the exact organization code sent from the frontend
      ];
    }

    const [rows] = await db.query(query, params);

    if (rows.length > 0) {
      const matchedUser = rows[0];

      // Clean up sensitive data properties before returning them to client storage
      delete matchedUser.password;

      // Ensure the structural user wrapper explicitly contains the userType property
      // so your Frontend React conditional filters don't break down!
      matchedUser.userType = userType; 

      return res.json({
        success: true,
        token: `mock-jwt-token-for-${matchedUser.id || matchedUser.orgID}`, // Mock token payload string matching front-end layouts
        user: matchedUser,
        orgID: userType === "ORGANIZATION" ? matchedUser.orgID : null
      });
    }

    // Explicit fallback rejection path for wrong password or wrong Org ID
    return res.status(401).json({
      success: false,
      message: userType === "ORGANIZATION" 
        ? "Invalid email, password, or Organization ID." 
        : "Invalid email or password."
    });

  } catch (err) {
    console.error("CRITICAL DATABASE LOGIN CRASH:", err.message);
    return res.status(500).json({
      success: false,
      message: `Database error: ${err.message}`
    });
  }
});
/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});