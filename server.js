import express from "express";
import cors from "cors";
import db from "./db.js"; // make sure file has .js extension

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://frontend1-f92g4o0nd-wahabullahs-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

/* ---------------- SIGNUP ---------------- */
app.post("/signup", async (req, res) => {
    console.log("SIGNUP DATA RECEIVED:", req.body);

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
        console.error("DB INSERT ERROR:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
    console.log("LOGIN DATA RECEIVED:", req.body);

    const { email, password, userType, orgID } = req.body;

    try {
        let query;
        let params;

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

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});