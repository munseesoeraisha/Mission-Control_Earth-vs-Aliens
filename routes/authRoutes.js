const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken");

const validateRegister =
require("../middlewares/validationMiddleware");

router.post("/register",
validateRegister,
(req, res) => {

    const token = jwt.sign(
        { username: req.body.username },
        process.env.JWT_SECRET
    );

    res.json({
        token
    });

});

module.exports = router;