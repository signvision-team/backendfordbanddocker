import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();

app.use(express.json());

/* ---------------- CORS ---------------- */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

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

/* Login */

app.post("/login", async (req, res) => {

  console.log("LOGIN DATA:", req.body);

  const { email, password, userType } = req.body;

  try {

    let query, params;

    if (userType === "INDIVIDUAL") {

      query =
        "SELECT * FROM Individuals WHERE email = ? AND password = ?";

      params = [email, password];

    } else {

      query =
        "SELECT * FROM Organizations WHERE email = ? AND password = ? AND regNumber = ?";

      params = [
        email,
        password,
        req.body.regNumber
      ];
    }

    const [rows] = await db.query(query, params);

    if (rows.length > 0) {

      return res.json({
        success: true,
        user: rows[0]
      });

    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});