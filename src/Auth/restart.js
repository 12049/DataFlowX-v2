import express from "express";
import { getDB, saveDB } from "../lib/database.js";
import crypto from "crypto";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, newPassword } = req.body;
  const { data, sha } = await getDB();

  const user = data.users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.password = crypto
    .createHash("sha256")
    .update(newPassword)
    .digest("hex");

  await saveDB(data, sha);
  res.json({ success: true });
});

export default router;
