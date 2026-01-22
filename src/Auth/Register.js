import express from "express";
import { githubDB } from "../lib/database.js";
import crypto from "crypto";

// ✅ استيراد Real-Time
import { sendRealtime } from "../lib/realtime.js";

const router = express.Router();
const USERS_PATH = "database/users.json";

// ===== Rate Limit =====
const ipRequests = {};
setInterval(() => {
  for (const ip in ipRequests) ipRequests[ip] = 0;
}, 1000);

// ===== Utils =====
function generateUserId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateDeviceId() {
  return crypto.randomBytes(16).toString("hex");
}

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// ===== Register =====
router.post("/", async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;

  ipRequests[ip] = (ipRequests[ip] || 0) + 1;
  if (ipRequests[ip] > 10) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const { username, email, phone, password } = req.body;

  if (!username || !email || !password || !phone) {
    return res.status(400).json({ error: "Missing data" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "Weak password" });
  }

  let data;
  try {
    data = await githubDB.readFile(USERS_PATH);
  } catch (err) {
    console.warn("users.json corrupted or empty → reinitializing");
    data = { users: [] };
    await githubDB.updateFile(USERS_PATH, JSON.stringify(data, null, 2), "reinitialize users database", false);
  }

  if (!data || !Array.isArray(data.users)) {
    data = { users: [] };
  }

  const existingUserByEmail = data.users.find(u => u.email === email);
  if (existingUserByEmail) {
    if (existingUserByEmail.deviceId) {
      return res.status(403).json({ error: "هذا الحساب مسجل على جهاز آخر، ممنوع الدخول" });
    } else {
      return res.status(409).json({ error: "Email already exists" });
    }
  }

  if (data.users.find(u => u.phone === phone)) {
    return res.status(409).json({ error: "Phone already exists" });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const newUser = {
    id: generateUserId(),
    username,
    email,
    phone,
    password: hashedPassword,
    role: "user",
    subscription: "free",
    deviceId: generateDeviceId(),
    ip,
    createdAt: Date.now()
  };

  data.users.push(newUser);

  await githubDB.updateFile(USERS_PATH, JSON.stringify(data, null, 2));

  // ===== Real-Time Event هنا =====
  sendRealtime("NEW_REGISTER", {
    user: newUser.username,
    email: newUser.email,
    id: newUser.id
  });

  // ===== Response =====
  res.json({
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      subscription: newUser.subscription,
      deviceId: newUser.deviceId,
      ip: newUser.ip
    }
  });
});

export default router;
