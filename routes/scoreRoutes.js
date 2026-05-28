const express = require("express");

const router = express.Router();

const db = require("../config/db");

/* Get leaderboard */

router.get("/", (req, res) => {

    const sql =
    "SELECT * FROM scores ORDER BY score DESC";

    db.query(sql, (err, result) => {

        if(err){

            res.status(500).json(err);

        }else{

            res.json(result);

        }

    });

});

module.exports = router;