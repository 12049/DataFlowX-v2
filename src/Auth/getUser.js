
import express from "express";
import { githubDB } from "../lib/database.js";

const router = express.Router();
const USERS_PATH = "database/users.json";

// ===== Get User By ID (FULL DATA) =====
router.get("/", async (req, res) => {
const { id } = req.query;

if (!id) {
return res.status(400).json({
success: false,
error: "id is required"
});
}

let data;
try {
data = await githubDB.readFile(USERS_PATH);
} catch (err) {
return res.status(500).json({
success: false,
error: "Cannot read users database"
});
}

if (!data || !Array.isArray(data.users)) {
return res.status(500).json({
success: false,
error: "Invalid users data"
});
}

const user = data.users.find(u => u.id === id);

if (!user) {
return res.status(404).json({
success: false,
error: "User not found"
});
}

// ✅ إرجاع كل البيانات بدون إخفاء أي شيء
res.json({
success: true,
user
});
});

export default router;
