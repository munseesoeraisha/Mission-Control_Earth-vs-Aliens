const mysql2 = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql2.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mission_control'
});

let useFallback = false;
const fallbackFile = path.join(__dirname, '../db_fallback.json');

function readFallbackDB() {
    try {
        if (!fs.existsSync(fallbackFile)) {
            fs.writeFileSync(fallbackFile, JSON.stringify({ users: [], scores: [] }, null, 2));
        }
        return JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
    } catch (e) {
        console.error("Error reading fallback DB:", e);
        return { users: [], scores: [] };
    }
}

function writeFallbackDB(data) {
    try {
        fs.writeFileSync(fallbackFile, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error writing fallback DB:", e);
    }
}

function mockQuery(sql, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }
    
    const sqlClean = sql.trim().replace(/\s+/g, ' ');
    const dbData = readFallbackDB();
    
    if (sqlClean.match(/SELECT .* FROM users WHERE username = \?/i)) {
        const username = params[0];
        const matched = dbData.users.filter(u => u.username === username);
        return callback(null, matched);
    }
    
    if (sqlClean.match(/INSERT INTO users/i)) {
        const [username, password] = params;
        const newId = dbData.users.length + 1;
        dbData.users.push({
            id: newId,
            username,
            password,
            created_at: new Date().toISOString()
        });
        writeFallbackDB(dbData);
        return callback(null, { insertId: newId });
    }
    
    if (sqlClean.match(/SELECT .* FROM scores/i)) {
        const sorted = [...dbData.scores]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        return callback(null, sorted);
    }
    
    if (sqlClean.match(/INSERT INTO scores/i)) {
        const [username, score] = params;
        const newId = dbData.scores.length + 1;
        dbData.scores.push({
            id: newId,
            username,
            score: parseInt(score, 10),
            created_at: new Date().toISOString()
        });
        writeFallbackDB(dbData);
        return callback(null, { insertId: newId });
    }
    
    console.warn("Unmatched fallback query:", sqlClean);
    return callback(new Error("Query pattern not matched in fallback DB"));
}

// Connection check
connection.connect((err) => {
    if (err) {
        console.log('❌ Connection failed. Falling back to local JSON database.');
        console.log(err.message);
        useFallback = true;
        return;
    }

    console.log(`✅ Connected to ${process.env.DB_NAME || 'mission_control'} database`);
});

// Wrap query method
const originalQuery = connection.query.bind(connection);
connection.query = function(sql, params, callback) {
    if (useFallback) {
        return mockQuery(sql, params, callback);
    }
    return originalQuery(sql, params, callback);
};

// Export connection
module.exports = connection;