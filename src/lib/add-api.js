import express from "express";
import { githubDB } from "../lib/database.js";

const router = express.Router();
const APIS_PATH = "database/apis.json";

// ===== Rate Limit =====
const ipRequests = {};
setInterval(() => {
  for (const ip in ipRequests) ipRequests[ip] = 0;
}, 1000);

// ===== Add API =====
router.post("/", async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;

  ipRequests[ip] = (ipRequests[ip] || 0) + 1;
  if (ipRequests[ip] > 10) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const { section, name, endpoint, full, query, status } = req.body;

  if (!section || !name || !endpoint || !full) {
    return res.status(400).json({ error: "Missing data" });
  }

  let data;
  try {
    data = await githubDB.readFile(APIS_PATH);
  } catch (err) {
    console.warn("apis.json corrupted or empty → reinitializing");
    data = {};
    await githubDB.updateFile(APIS_PATH, JSON.stringify(data, null, 2), "reinitialize APIs database", false);
  }

  if (!data || typeof data !== "object") data = {};

  // ===== Initialize section if missing =====
  if (!data[section]) data[section] = [];

  // ===== Check duplicate endpoint in this section =====
  if (data[section].find(a => a.endpoint === endpoint)) {
    return res.status(409).json({ error: "API endpoint already exists in this section" });
  }

  const newAPI = {
    name,
    endpoint,
    full,
    query: query || "-",
    status: status || "active"
  };

  data[section].push(newAPI);

  await githubDB.updateFile(APIS_PATH, JSON.stringify(data, null, 2));

  res.json({
    success: true,
    api: newAPI
  });
});

// ===== Get All APIs =====
router.get("/get-api", async (req, res) => {
  let data;
  try { data = await githubDB.readFile(APIS_PATH); } 
  catch(e){ data = {}; }
  res.json(data || {});
});

// ===== Get APIs by Section =====
router.get("/get-api/:section", async (req,res)=>{
  const section = req.params.section;
  let data;
  try { data = await githubDB.readFile(APIS_PATH); } 
  catch(e){ data = {}; }

  res.json(data[section] || []);
});

export default router;
