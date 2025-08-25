const express = require("express");
const { exec } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const fetch = require("node-fetch"); // SSRF üçün
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --- DB INIT (SQLite) ---
const DB_NAME = path.join(__dirname, "vuln.db");
const db = new sqlite3.Database(DB_NAME);
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("DELETE FROM users");
  db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
});

// Sadə home
app.get("/", (_req, res) => {
  res.send(`
    <h1>Vulnerable Node App</h1>
    <ul>
      <li><a href="/xss?name=Javid">Reflected XSS</a></li>
      <li><a href="/sql?user=admin">SQL Injection</a></li>
      <li><a href="/rce?cmd=ls">Command Injection (RCE)</a></li>
      <li><a href="/ssrf?url=http://127.0.0.1:3000/">SSRF</a></li>
      <li><a href="/leak">Sensitive Info Leak</a></li>
    </ul>
  `);
});

// Reflected XSS
app.get("/xss", (req, res) => {
  const name = req.query.name || "";
  // qəsdən escape etmirik
  res.send(`<h2>Welcome ${name}</h2>`);
});

// SQL Injection
app.get("/sql", (req, res) => {
  const user = req.query.user || "";
  const query = `SELECT * FROM users WHERE username = '${user}'`; // qəsdən zəif
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send(String(err));
    res.json(rows);
  });
});

// Command Injection (RCE)
app.get("/rce", (req, res) => {
  const cmd = req.query.cmd || "echo Hello";
  exec(cmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`<pre>${String(error)}</pre>`);
    res.send(`<pre>${stdout || stderr}</pre>`);
  });
});

// SSRF — daxili resurslara sorğu ötürə bilər
app.get("/ssrf", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Provide ?url=");
  try {
    const r = await fetch(target);
    const text = await r.text();
    res.send(text);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

// Sensitive info leak (qəsdən)
app.get("/leak", (_req, res) => {
  res.json({
    debug: true,
    secrets: {
      jwt_secret: "hardcoded-secret",
      db_password_plaintext: "admin123"
    },
    env: process.env
  });
});

app.listen(PORT, () => {
  console.log(`Vulnerable app running on http://0.0.0.0:${PORT}`);
});
