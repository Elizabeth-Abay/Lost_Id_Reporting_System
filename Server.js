const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= HEALTH ================= */
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

/* ================= OTP ENDPOINTS ================= */

/* SEND OTP */
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES ($1,$2,$3)",
      [email, otp, expiresAt]
    );

    await transporter.sendMail({
      from: `"AAU Lost ID System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It expires in 5 minutes.`
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/* VERIFY OTP */
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      `SELECT * FROM email_otps
       WHERE email=$1 AND otp=$2
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid OTP" });

    if (new Date(result.rows[0].expires_at) < new Date())
      return res.status(400).json({ error: "OTP expired" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= LOST IDs ================= */

app.get("/lostIDs", async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, student_id AS "studentID", phone, email, created_at
     FROM lost_ids ORDER BY created_at DESC`
  );
  res.json(result.rows);
});

app.post("/lostIDs", async (req, res) => {
  const { name, studentID, phone, email } = req.body;
  if (!name || !studentID || !phone || !email)
    return res.status(400).json({ error: "Missing fields" });

  const result = await pool.query(
    `INSERT INTO lost_ids (name, student_id, phone, email)
     VALUES ($1,$2,$3,$4)
     RETURNING id, name, student_id AS "studentID", phone, email`,
    [name, studentID, phone, email]
  );

  res.status(201).json(result.rows[0]);
});

/* ================= FOUND IDs ================= */

app.get("/foundIDs", async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, found_id AS "foundID", phone, email, created_at
     FROM found_ids ORDER BY created_at DESC`
  );
  res.json(result.rows);
});

app.post("/foundIDs", async (req, res) => {
  const { name, foundID, phone, email } = req.body;
  if (!name || !foundID || !phone || !email)
    return res.status(400).json({ error: "Missing fields" });

  const result = await pool.query(
    `INSERT INTO found_ids (name, found_id, phone, email)
     VALUES ($1,$2,$3,$4)
     RETURNING id, name, found_id AS "foundID", phone, email`,
    [name, foundID, phone, email]
  );

  res.status(201).json(result.rows[0]);
});

/* ================= REQUESTS ================= */

app.get("/requests", async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, lost_id AS "lostID", email, date, status,
            police_report AS "policeReport"
     FROM requests ORDER BY date DESC`
  );
  res.json(result.rows);
});

app.post("/requests", async (req, res) => {
  const { name, lostID, email, policeReport } = req.body;
  if (!name || !lostID || !email || !policeReport)
    return res.status(400).json({ error: "Missing fields" });

  const result = await pool.query(
    `INSERT INTO requests (name, lost_id, email, police_report)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [name, lostID, email, policeReport]
  );

  res.status(201).json(result.rows[0]);
});

app.patch("/requests/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const result = await pool.query(
    "UPDATE requests SET status=$1 WHERE id=$2 RETURNING *",
    [status, id]
  );

  res.json(result.rows[0]);
});

/* ================= SUSPENDED STUDENTS ================= */

app.get("/suspendedStudents", async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, student_id AS "studentID",
            email, phone, status
     FROM suspended_students`
  );
  res.json(result.rows);
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
