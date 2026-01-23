require('dotenv').config();
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

// Generate a token for userId=1 (or whatever your test user is)
const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: "7d" });

let ws;
let reconnectInterval = 2000; // 2 seconds

function connect() {
  ws = new WebSocket("ws://localhost:3001", {
    headers: { Cookie: `token=${token}` }
  });

  ws.on("open", () => console.log("✅ Connected!"));
  ws.on("message", data => console.log("📩", data.toString()));

  ws.on("close", (code, reason) => {
    console.log(`⚠️ Closed: ${code} - ${reason}`);
    setTimeout(connect, reconnectInterval);
  });

  ws.on("error", err => {
    console.error("❌ WS error:", err);
    ws.close();
  });
}

connect();
