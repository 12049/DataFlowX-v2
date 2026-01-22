import express from "express";

const router = express.Router();

// ===== Clients Store =====
const clients = new Set();

// ===== Helper: broadcast =====
function broadcast(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}

// ===== Real-Time Endpoint =====
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // إضافة العميل
  clients.add(res);

  // إرسال حالة الاتصال
  res.write(`data: ${JSON.stringify({
    type: "CONNECTED",
    online: clients.size
  })}\n\n`);

  // تحديث الجميع بعدد المتصلين
  broadcast({
    type: "ONLINE_UPDATE",
    online: clients.size
  });

  // عند فصل الاتصال
  req.on("close", () => {
    clients.delete(res);

    broadcast({
      type: "ONLINE_UPDATE",
      online: clients.size
    });
  });
});

// ===== Export broadcast to use in other APIs =====
export function sendRealtime(type, data = {}) {
  broadcast({
    type,
    online: clients.size,
    ...data,
    time: Date.now()
  });
}

export default router;
