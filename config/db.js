const mysql = require('mysql2');

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // vul je mysql password in
    database: 'mission_controle'
});

// Connection check
connection.connect((err) => {
    if (err) {
        console.log('❌ Connection failed');
        console.log(err.message);
        return;
    }

    console.log('✅ Connected to mission_controle database');
});

// Export connection
module.exports = connection;