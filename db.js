// db.js
const sql = require("mssql");

// Database configuration
const config = {
    user: "sa",
    password: "password1234",                  // your SA password
    server: "DESKTOP-FPQL6PA\\SQLEXPRESS",     // your REAL SQL Server instance name
    database: "MoodQuotesDB",
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    port: 1433
};

// Create and return a connection pool
async function getPool() {
    try {
        const pool = await sql.connect(config);
        console.log("🎉 Connected to MSSQL successfully!");
        return pool;
    } catch (err) {
        console.error("❌ Database connection error:", err);
        throw err;
    }
}

module.exports = { getPool };
