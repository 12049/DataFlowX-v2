
import express from "express";
import { githubDB } from "../lib/database.js";
import crypto from "crypto";

const router = express.Router();
const USERS_PATH = "database/users.json";

// ===== Utils =====
function generateUserId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateDeviceId() {
  return crypto.randomBytes(16).toString("hex");
}

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// ===== Read Users =====
async function readUsers() {
  let data;
  try {
    data = await githubDB.readFile(USERS_PATH);
    if (!data || !Array.isArray(data.users)) data = { users: [] };
  } catch {
    data = { users: [] };
    await githubDB.updateFile(USERS_PATH, JSON.stringify(data, null, 2), "reinitialize users", false);
  }
  return data;
}

// ===== Save Users =====
async function saveUsers(data) {
  await githubDB.updateFile(USERS_PATH, JSON.stringify(data, null, 2), "update users", false);
}

/* =====================
   GET ALL USERS
===================== */
router.get("/", async (req, res) => {
  const data = await readUsers();
  res.json({ success: true, users: data.users });
});

/* =====================
   ADD NEW USER
===================== */
router.post("/", async (req, res) => {
  const { username, email, phone, password } = req.body;
  if (!username || !email || !phone || !password) {
    return res.status(400).json({ error: "Missing data" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "Weak password" });
  }

  const data = await readUsers();

  // ===== منع أكثر من مستخدم واحد =====
  if (data.users.length >= 1) {
    return res.status(403).json({ error: "ممنوع تسجيل مستخدم جديد، يوجد مستخدم بالفعل" });
  }

  if (data.users.find(u => u.email === email)) {
    return res.status(409).json({ error: "Email already exists" });
  }
  if (data.users.find(u => u.phone === phone)) {
    return res.status(409).json({ error: "Phone already exists" });
  }

  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

  const newUser = {
    id: generateUserId(),
    username,
    email,
    phone,
    password: hashedPassword,
    role: "user",
    subscription: "free",
    deviceId: generateDeviceId(),
    createdAt: Date.now()
  };

  data.users.push(newUser);
  await saveUsers(data);

  res.json({ success: true, user: newUser });
});

/* =====================
   UPDATE USER
===================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, phone, password, role, subscription } = req.body;

  const data = await readUsers();
  const user = data.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (username) user.username = username;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (subscription) user.subscription = subscription;
  if (password) user.password = crypto.createHash("sha256").update(password).digest("hex");

  await saveUsers(data);
  res.json({ success: true, user });
});

/* =====================
   DELETE USER
===================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const data = await readUsers();
  const index = data.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "User not found" });

  const deletedUser = data.users.splice(index, 1)[0];
  await saveUsers(data);

  res.json({ success: true, deletedUser });
});

export default router;
