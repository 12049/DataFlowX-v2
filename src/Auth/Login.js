import express from "express";
import { githubDB } from "../lib/database.js";
import crypto from "crypto";

const router = express.Router();

const USERS_PATH = "database/users.json";

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    // اقرأ ملف المستخدمين
    let data = await githubDB.readFile(USERS_PATH);

    // لو الملف مش موجود أو فاضي
    if (!data || !Array.isArray(data.users)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // تشفير الباسورد
    const hashed = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // البحث عن المستخدم
    const user = data.users.find(
      u => u.email === email && u.password === hashed
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // نجاح تسجيل الدخول
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
