const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { validateRegister, validateLogin } = require("../middlewares/validationMiddleware");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* POST /api/auth/register */
router.post("/register", validateRegister, (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT id FROM users WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length > 0) return res.status(400).json({ message: "Username already taken" });

        const hashedPassword = bcrypt.hashSync(password, 10);

        db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: "Could not register user" });

            const token = jwt.sign(
                { id: result.insertId, username },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({ token, username });
        });
    });
});

/* POST /api/auth/login */
router.post("/login", validateLogin, (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(401).json({ message: "Invalid username or password" });

        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) return res.status(401).json({ message: "Invalid username or password" });

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, username: user.username });
    });
});

/* POST /api/auth/google */
router.post("/google", async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: "Google credential is required" });
    }

    try {
        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const displayName = payload.name || email.split("@")[0];

        // Check if user already exists (using email as username)
        db.query("SELECT * FROM users WHERE username = ?", [email], (err, results) => {
            if (err) return res.status(500).json({ message: "Database error" });

            if (results.length > 0) {
                // Existing Google user — issue token
                const user = results[0];
                const token = jwt.sign(
                    { id: user.id, username: displayName },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" }
                );
                return res.json({ token, username: displayName });
            }

            // New Google user — create account with a random placeholder password
            const randomPassword = bcrypt.hashSync(Math.random().toString(36) + Date.now(), 10);

            db.query("INSERT INTO users (username, password) VALUES (?, ?)", [email, randomPassword], (err, result) => {
                if (err) return res.status(500).json({ message: "Could not create Google user" });

                const token = jwt.sign(
                    { id: result.insertId, username: displayName },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" }
                );

                res.json({ token, username: displayName });
            });
        });
    } catch (error) {
        console.error("Google auth error:", error.message);
        res.status(401).json({ message: "Invalid Google token" });
    }
});

module.exports = router;
