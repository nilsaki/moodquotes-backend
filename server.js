const express = require("express");
const sql = require("mssql");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ FRONTEND SERVE
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ ROOT LOGIN SAYFASI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ SQL SERVER CONFIG
const dbConfig = {
  user: "sa",
  password: "password1234",
  server: "DESKTOP-FPQL6PA\\SQLEXPRESS",
  database: "MoodQuotesDB",
  options: {
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(dbConfig);

// ✅ CONNECT
pool.connect()
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database connection error:", err));


// =========================
// ✅ REGISTER ROUTE (YENİ)
// =========================
app.post("/register", async (req, res) => {
  try {
    let { username, password } = req.body;

    username = username.trim();
    password = password.trim();

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // ✅ Aynı kullanıcı var mı kontrol et
    const existing = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // ✅ Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ DB'ye ekle
    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Users (Username, PasswordHash)
        VALUES (@username, @password)
      `);

    console.log("✅ REGISTER OK:", username);

    res.json({ message: "REGISTER OK" });

  } catch (err) {
    console.error("🔥 Register error:", err);
    res.status(500).json({ message: "Register server error" });
  }
});


// =========================
// ✅ LOGIN ROUTE (MEVCUT)
// =========================
app.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;

    username = username.trim();
    password = password.trim();

    console.log("📥 LOGIN REQUEST:", username);

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.recordset[0];

    const match = await bcrypt.compare(password, user.PasswordHash);

    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    console.log("✅ LOGIN OK:", username);

    res.json({
      message: "LOGIN OK",
      userID: user.UserID,
      username: user.Username
    });

  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ message: "Login server error" });
  }
});


// ✅ SERVER START
app.listen(3000, () => {
  console.log("🔥 Server running on port 3000");
});
