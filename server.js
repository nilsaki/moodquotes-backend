require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const pool = require("./db");

const app = express();

/* ======================
   CORS 
====================== */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// Preflight fix
app.options("*", cors());

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json());

/* ======================
   HEALTH CHECK
====================== */
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

/* ======================
   REGISTER
====================== */
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required"
      });
    }

    const existingUser = await pool.query(
      "SELECT userid FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, passwordhash) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Register server error"
    });
  }
});

/* ======================
   LOGIN
====================== */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required"
      });
    }

    const result = await pool.query(
      "SELECT userid, username, passwordhash FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.passwordhash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    res.status(200).json({
      message: "LOGIN OK",
      username: user.username
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      message: "Login server error"
    });
  }
});

/* ======================
   COMMENTS – ADD
====================== */
app.post("/comments", async (req, res) => {
  try {
    const { quote_text, username, comment } = req.body;

    if (!quote_text || !username || !comment) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await pool.query(
      "INSERT INTO comments (quote_text, username, comment) VALUES ($1, $2, $3)",
      [quote_text, username, comment]
    );

    res.status(201).json({ message: "Comment added" });
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   COMMENTS – GET
====================== */
app.get("/comments", async (req, res) => {
  try {
    const { quote } = req.query;

    if (!quote) {
      return res.status(400).json({ message: "Quote required" });
    }

    const result = await pool.query(
     "SELECT id, username, comment FROM comments WHERE quote_text = $1 ORDER BY created_at ASC",
      [quote]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   COMMENTS – UPDATE
====================== */
app.put("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, comment } = req.body;

    if (!username || !comment) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await pool.query(
      `UPDATE comments
       SET comment = $1, updated_at = NOW()
       WHERE id = $2 AND username = $3`,
      [comment, id, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ message: "Comment updated" });

  } catch (err) {
    console.error("UPDATE COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   COMMENTS – DELETE
====================== */
app.delete("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    const result = await pool.query(
      "DELETE FROM comments WHERE id = $1 AND username = $2",
      [id, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ message: "Comment deleted" });

  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
