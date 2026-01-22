import express from "express";
import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";

const router = express.Router();

// ================= CONFIG =================
const DB_DIR = path.join(process.cwd(), "db");
const DB_FILE = path.join(DB_DIR, "bots.json");

const REPO_OWNER = process.env.GITHUB_OWNER || "your-username";
const REPO_NAME = process.env.GITHUB_REPO || "bot-database";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "your-token";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// ================= HELPERS =================

// ====== Local DB ======
function ensureDB() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ bots: [] }, null, 2));
}

function loadDB() {
  ensureDB();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try { return JSON.parse(raw); } catch { return { bots: [] }; }
}

function saveDBLocal(data) {
  ensureDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ====== GitHub ======
async function saveDBGitHub(data) {
  try {
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
    let sha;
    try {
      const file = await octokit.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path: "db/bots.json" });
      sha = file.data.sha;
    } catch {
      sha = undefined;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: "db/bots.json",
      message: sha ? "Update bot database" : "Create bot database",
      content,
      sha
    });

    console.log("✅ Saved bot DB to GitHub");
  } catch (err) {
    console.error("❌ Failed to save DB to GitHub", err.message);
  }
}

// ====== Bot Helpers ======
function generateBotID() {
  return "bot_" + Math.random().toString(36).substring(2, 10);
}

// ================= ROUTES =================

// ---- Register Bot ----
router.post("/register", async (req, res) => {
  try {
    const { botname, owner, number, device, status } = req.body;
    if (!botname || !owner || !number || !device)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const db = loadDB();
    const botID = generateBotID();

    db.bots.push({
      id: botID,
      botname,
      owner,
      number,
      device,
      status: status || "active",
      createdAt: new Date().toISOString(),
    });

    // حفظ محلي
    saveDBLocal(db);
    // رفع على GitHub
    await saveDBGitHub(db);

    return res.json({ success: true, botID });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---- Check Status ----
router.post("/status", async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ success: false, message: "Number required" });

    const db = loadDB();
    const bot = db.bots.find(b => b.number === number);
    return res.json({ status: bot?.status || "active" });
  } catch (err) {
    console.error(err);
    return res.json({ status: "active" });
  }
});

// ---- Kill Bot ----
router.post("/kill", async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ success: false, message: "Number required" });

    const db = loadDB();
    const bot = db.bots.find(b => b.number === number);
    if (!bot) return res.status(404).json({ success: false, message: "Bot not found" });

    bot.status = "dead";

    // حفظ محلي و على GitHub
    saveDBLocal(db);
    await saveDBGitHub(db);

    console.log(`☠️ Bot ${bot.number} was killed.`);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
});

export default router;