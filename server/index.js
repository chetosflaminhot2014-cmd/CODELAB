"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { rateLimit } = require("express-rate-limit");

const required = ["DATABASE_URL", "SESSION_SECRET", "FRONTEND_URL"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters.");
}

const FRONTEND_URL = new URL(process.env.FRONTEND_URL).origin;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const mailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);

async function sendMail(to, subject, text, eventKey) {
  if (!mailConfigured) throw new Error("Transactional email is not configured.");
  const payload = {
    from: process.env.RESEND_FROM,
    to: [to],
    subject,
    text
  };
  if (process.env.RESEND_REPLY_TO) payload.reply_to = process.env.RESEND_REPLY_TO;
  const idempotencyKey = `oknew-${eventKey}-${hashToken(to).slice(0, 16)}`;
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });
      if (response.ok) return await response.json();
      const detail = await response.text();
      const error = new Error(`Resend returned HTTP ${response.status}: ${detail.slice(0, 300)}`);
      error.status = response.status;
      if (response.status < 500 && response.status !== 429) throw error;
      lastError = error;
    } catch (error) {
      lastError = error;
      if (error.status && error.status < 500 && error.status !== 429) throw error;
    }
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (2 ** attempt)));
  }
  throw lastError || new Error("Email delivery failed.");
}
async function sendVerification(email, token) {
  const link = frontendLink("verify", token);
  await sendMail(email, "Verifica tu correo de OKNEW",
    `Confirma tu dirección de correo para activar tu cuenta de OKNEW.\\n\\nAbre este enlace: ${link}\\n\\nEl enlace vence en 30 minutos. Si no solicitaste esta cuenta, ignora este mensaje.`,
    `verify-${hashToken(token)}`);
}
async function sendPasswordReset(email, token) {
  const link = frontendLink("reset", token);
  await sendMail(email, "Restablece tu contraseña de OKNEW",
    `Se solicitó restablecer la contraseña de tu cuenta OKNEW.\\n\\nAbre este enlace: ${link}\\n\\nEl enlace vence en una hora. Si no lo solicitaste, ignora este mensaje.`,
    `reset-${hashToken(token)}`);
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === FRONTEND_URL) return callback(null, true);
    return callback(new Error("Origin not allowed."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "32kb" }));
app.use(session({
  name: "oknew.sid",
  store: new PgSession({ pool, tableName: "user_sessions", createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 14
  }
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo." }
});
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false
});
app.use("/api", generalLimiter);

app.use("/api", (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const origin = req.get("origin");
    if (origin !== FRONTEND_URL) return res.status(403).json({ error: "Origen no permitido." });
  }
  next();
});

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}
function validEmail(email) {
  return typeof email === "string" && email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validPassword(password) {
  return typeof password === "string" && password.length >= 10 &&
    password.length <= 128;
}
function cleanText(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Inicia sesión para continuar." });
  next();
}
function frontendLink(key, token) {
  const url = new URL("/", FRONTEND_URL);
  url.searchParams.set(key, token);
  return url.toString();
}
async function sendMail(to, subject, text) {
  if (!mailer) throw new Error("Email delivery is not configured.");
  await mailer.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
}
async function sendVerification(email, token) {
  const link = frontendLink("verify", token);
  await sendMail(email, "Verifica tu correo de OKNEW",
    `Confirma tu dirección de correo para activar tu cuenta de OKNEW.\n\nAbre este enlace: ${link}\n\nEl enlace vence en 30 minutos. Si no solicitaste esta cuenta, ignora este mensaje.`);
}
async function sendPasswordReset(email, token) {
  const link = frontendLink("reset", token);
  await sendMail(email, "Restablece tu contraseña de OKNEW",
    `Se solicitó restablecer la contraseña de tu cuenta OKNEW.\n\nAbre este enlace: ${link}\n\nEl enlace vence en una hora. Si no lo solicitaste, ignora este mensaje.`);
}

app.get("/api/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch (error) { next(error); }
});

app.post("/api/auth/register", authLimiter, async (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const displayName = cleanText(req.body.displayName, 60);
  const password = req.body.password;
  if (!validEmail(email)) return res.status(400).json({ error: "Escribe un correo válido." });
  if (!validPassword(password)) return res.status(400).json({ error: "La contraseña debe tener entre 10 y 128 caracteres." });
  if (!mailConfigured) return res.status(503).json({ error: "El envío de correo todavía no está configurado. La cuenta no se creó." });

  const token = makeToken();
  const passwordHash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const created = await client.query(
      `INSERT INTO users(email, password_hash, verification_token_hash, verification_expires_at)
       VALUES($1, $2, $3, NOW() + INTERVAL '30 minutes')
       RETURNING id, email`,
      [email, passwordHash, hashToken(token)]
    );
    await client.query(
      "INSERT INTO profiles(user_id, display_name) VALUES($1, $2)",
      [created.rows[0].id, displayName]
    );
    await client.query("COMMIT");
    try {
      await sendVerification(email, token);
    } catch (mailError) {
      console.error("Verification email delivery failed:", mailError.message);
      return res.status(503).json({ error: "La cuenta se creó, pero no se pudo enviar el correo. Contacta al administrador para reenviar la verificación." });
    }
    res.status(201).json({ message: "Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión." });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") return res.status(409).json({ error: "No se pudo crear la cuenta con esos datos. Comprueba si el correo ya está registrado." });
    next(error);
  } finally { client.release(); }
});

app.get("/api/auth/verify", async (req, res, next) => {
  const token = String(req.query.token || "");
  if (!/^[a-f0-9]{64}$/.test(token)) return res.status(400).json({ error: "Enlace de verificación inválido." });
  try {
    const result = await pool.query(
      `UPDATE users SET email_verified_at = NOW(), verification_token_hash = NULL,
       verification_expires_at = NULL, updated_at = NOW()
       WHERE verification_token_hash = $1 AND verification_expires_at > NOW()
       RETURNING id`,
      [hashToken(token)]
    );
    if (!result.rowCount) return res.status(400).json({ error: "El enlace venció o ya fue utilizado. Solicita uno nuevo." });
    res.json({ message: "Correo verificado. Ya puedes iniciar sesión." });
  } catch (error) { next(error); }
});

app.post("/api/auth/resend-verification", authLimiter, async (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!validEmail(email)) return res.status(200).json({ message: "Si la cuenta necesita verificación, enviaremos un correo." });
  if (!mailConfigured) return res.status(503).json({ error: "El envío de correo no está configurado." });
  try {
    const token = makeToken();
    const result = await pool.query(
      `UPDATE users SET verification_token_hash = $2,
       verification_expires_at = NOW() + INTERVAL '30 minutes', updated_at = NOW()
       WHERE email = $1 AND email_verified_at IS NULL RETURNING email`,
      [email, hashToken(token)]
    );
    if (result.rowCount) await sendVerification(email, token);
    res.json({ message: "Si la cuenta necesita verificación, enviaremos un correo." });
  } catch (error) { next(error); }
});

app.post("/api/auth/login", authLimiter, async (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = req.body.password;
  if (!validEmail(email) || typeof password !== "string") return res.status(400).json({ error: "Correo o contraseña incorrectos." });
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.email_verified_at, p.display_name
       FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.email = $1`,
      [email]
    );
    const user = result.rows[0];
    const ok = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!ok) return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    if (!user.email_verified_at) return res.status(403).json({ error: "Primero verifica tu correo. Revisa tu bandeja de entrada." });
    req.session.regenerate(error => {
      if (error) return next(error);
      req.session.userId = user.id;
      req.session.save(saveError => {
        if (saveError) return next(saveError);
        res.json({ user: { id: user.id, email: user.email, displayName: user.display_name || "" } });
      });
    });
  } catch (error) { next(error); }
});

app.post("/api/auth/logout", requireAuth, (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error);
    res.clearCookie("oknew.sid", { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ message: "Sesión cerrada." });
  });
});

app.post("/api/auth/forgot-password", authLimiter, async (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!validEmail(email)) return res.json({ message: "Si existe una cuenta con ese correo, recibirás instrucciones." });
  if (!mailConfigured) return res.status(503).json({ error: "El envío de correo no está configurado." });
  try {
    const token = makeToken();
    const result = await pool.query(
      `UPDATE users SET reset_token_hash = $2,
       reset_expires_at = NOW() + INTERVAL '1 hour', updated_at = NOW()
       WHERE email = $1 AND email_verified_at IS NOT NULL RETURNING email`,
      [email, hashToken(token)]
    );
    if (result.rowCount) await sendPasswordReset(email, token);
    res.json({ message: "Si existe una cuenta con ese correo, recibirás instrucciones." });
  } catch (error) { next(error); }
});

app.post("/api/auth/reset-password", authLimiter, async (req, res, next) => {
  const token = String(req.body.token || "");
  const password = req.body.password;
  if (!/^[a-f0-9]{64}$/.test(token) || !validPassword(password)) {
    return res.status(400).json({ error: "Enlace inválido o contraseña fuera del rango permitido." });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `UPDATE users SET password_hash = $2, reset_token_hash = NULL,
       reset_expires_at = NULL, updated_at = NOW()
       WHERE reset_token_hash = $1 AND reset_expires_at > NOW() RETURNING id`,
      [hashToken(token), passwordHash]
    );
    if (!result.rowCount) return res.status(400).json({ error: "El enlace venció o ya fue utilizado. Solicita otro." });
    await pool.query("DELETE FROM user_sessions WHERE sess->>'userId' = $1", [result.rows[0].id]).catch(() => {});
    res.json({ message: "Contraseña actualizada. Inicia sesión con la nueva contraseña." });
  } catch (error) { next(error); }
});

app.get("/api/me", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.email_verified_at, p.display_name, p.bio
       FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
      [req.session.userId]
    );
    if (!result.rowCount) return res.status(401).json({ error: "La sesión ya no es válida." });
    const user = result.rows[0];
    res.json({ user: { id: user.id, email: user.email, emailVerified: Boolean(user.email_verified_at), displayName: user.display_name || "", bio: user.bio || "" } });
  } catch (error) { next(error); }
});

app.patch("/api/profile", requireAuth, async (req, res, next) => {
  const displayName = cleanText(req.body.displayName, 60);
  const bio = cleanText(req.body.bio, 280);
  try {
    const result = await pool.query(
      `INSERT INTO profiles(user_id, display_name, bio) VALUES($1, $2, $3)
       ON CONFLICT(user_id) DO UPDATE SET display_name = EXCLUDED.display_name,
       bio = EXCLUDED.bio, updated_at = NOW()
       RETURNING display_name, bio`,
      [req.session.userId, displayName, bio]
    );
    res.json({ profile: result.rows[0] });
  } catch (error) { next(error); }
});

app.get("/api/sync", requireAuth, async (req, res, next) => {
  try {
    const [progressRows, projectRows] = await Promise.all([
      pool.query("SELECT course, lesson_index FROM learning_progress WHERE user_id = $1 ORDER BY course, lesson_index", [req.session.userId]),
      pool.query("SELECT id, title, description, legacy_date, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC", [req.session.userId])
    ]);
    const progress = {};
    for (const row of progressRows.rows) {
      if (!progress[row.course]) progress[row.course] = [];
      progress[row.course].push(row.lesson_index);
    }
    const projects = projectRows.rows.map(row => ({
      id: row.id, title: row.title, description: row.description,
      date: row.legacy_date || new Date(row.created_at).toLocaleDateString("es-MX")
    }));
    res.json({ progress, projects });
  } catch (error) { next(error); }
});

app.put("/api/sync", requireAuth, async (req, res, next) => {
  const progress = req.body.progress && typeof req.body.progress === "object" && !Array.isArray(req.body.progress) ? req.body.progress : {};
  const projects = Array.isArray(req.body.projects) ? req.body.projects.slice(0, 100) : [];
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const [course, indices] of Object.entries(progress).slice(0, 40)) {
      if (!Array.isArray(indices)) continue;
      const safeCourse = cleanText(course, 80);
      if (!safeCourse) continue;
      for (const index of [...new Set(indices)].slice(0, 500)) {
        if (!Number.isInteger(index) || index < 0 || index > 500) continue;
        await client.query(
          `INSERT INTO learning_progress(user_id, course, lesson_index)
           VALUES($1, $2, $3) ON CONFLICT(user_id, course, lesson_index) DO NOTHING`,
          [req.session.userId, safeCourse, index]
        );
      }
    }
    for (const project of projects) {
      if (!project || typeof project !== "object") continue;
      const id = String(project.id || "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) continue;
      const title = cleanText(project.title, 100) || "Proyecto sin título";
      const description = cleanText(project.description, 500);
      const legacyDate = cleanText(project.date, 40);
      await client.query(
        `INSERT INTO projects(id, user_id, title, description, legacy_date)
         VALUES($1, $2, $3, $4, $5) ON CONFLICT(user_id, id) DO NOTHING`,
        [id, req.session.userId, title, description, legacyDate]
      );
    }
    await client.query("COMMIT");
    res.json({ message: "Progreso sincronizado." });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally { client.release(); }
});

app.use((error, req, res, next) => {
  console.error("API error:", error.message);
  if (res.headersSent) return next(error);
  if (error.message === "Origin not allowed.") return res.status(403).json({ error: "Origen no permitido." });
  res.status(500).json({ error: "Ocurrió un error interno. Inténtalo más tarde." });
});

async function start() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  const port = Number(process.env.PORT || 10000);
  app.listen(port, "0.0.0.0", () => console.log(`OKNEW API listening on ${port}`));
}
start().catch(error => {
  console.error("Startup failed:", error);
  process.exit(1);
});
