// =====================
// VALIDATION MIDDLEWARE
// =====================

/**
 * Validates registration input.
 * Rules:
 * - username: required, string, 3-50 characters, alphanumeric (+ underscore)
 * - password: required, string, minimum 6 characters
 */
function validateRegister(req, res, next) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Username and password must be text" });
    }

    if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ message: "Username must be between 3 and 50 characters" });
    }

    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    next();
}

/**
 * Validates login input.
 * Rules:
 * - username: required, string
 * - password: required, string
 */
function validateLogin(req, res, next) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Username and password must be text" });
    }

    next();
}

/**
 * Validates score submission input.
 * Rules:
 * - score: required, number, integer, between 0 and 100000
 */
function validateScore(req, res, next) {
    const { score } = req.body;

    if (score === undefined || score === null) {
        return res.status(400).json({ message: "Score is required" });
    }

    if (typeof score !== "number" || !Number.isInteger(score)) {
        return res.status(400).json({ message: "Score must be a whole number" });
    }

    if (score < 0 || score > 100000) {
        return res.status(400).json({ message: "Score must be between 0 and 100000" });
    }

    next();
}

module.exports = { validateRegister, validateLogin, validateScore };
