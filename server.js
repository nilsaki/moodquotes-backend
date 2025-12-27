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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.options("*", cors());

app.use(express.json());

/* ======================
   HEALTH
====================== */
app.get("/health", (_, res) => res.json({ ok: true }));

/* ======================
   REGISTER
====================== */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Missing fields" });

  const exists = await pool.query(
    "SELECT 1 FROM users WHERE username=$1",
    [username]
  );
  if (exists.rows.length)
    return res.status(409).json({ message: "Username exists" });

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (username, passwordhash) VALUES ($1,$2)",
    [username, hash]
  );

  res.json({ message: "User registered successfully" });
});

/* ======================
   LOGIN
====================== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const q = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );
  if (!q.rows.length)
    return res.status(401).json({ message: "User not found" });

  const ok = await bcrypt.compare(password, q.rows[0].passwordhash);
  if (!ok)
    return res.status(401).json({ message: "Wrong password" });

  res.json({ message: "LOGIN OK", username });
});

/* ======================
   COMMENTS – ADD
====================== */
app.post("/comments", async (req, res) => {
  const { quote_text, username, comment } = req.body;
  await pool.query(
    "INSERT INTO comments (quote_text, username, comment) VALUES ($1,$2,$3)",
    [quote_text, username, comment]
  );
  res.json({ message: "Comment added" });
});

/* ======================
   COMMENTS – GET
====================== */
app.get("/comments", async (req, res) => {
  const { quote } = req.query;
  const r = await pool.query(
    "SELECT id, username, comment FROM comments WHERE quote_text=$1 ORDER BY id",
    [quote]
  );
  res.json(r.rows);
});

/* ======================
   COMMENTS – UPDATE
====================== */
app.put("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, comment } = req.body;

    const result = await pool.query(
      "UPDATE comments SET comment = $1 WHERE id = $2 AND username = $3",
      [comment, id, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ message: "Comment updated" });
  } catch (err) {
    console.error("EDIT COMMENT ERROR:", err);
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

    const result = await pool.query(
      "DELETE FROM comments WHERE id = $1 AND username = $2",
      [id, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ======================
   START
====================== */
app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
