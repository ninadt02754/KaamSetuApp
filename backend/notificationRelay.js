import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();
app.use(express.json());

app.post("/send-notification", async (req, res) => {
  const { pushToken, title, body, data } = req.body;
  if (!pushToken) return res.status(400).json({ message: "pushToken required" });

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data: data || {},
        sound: "default",
        priority: "high",
      }),
    });

    const result = await response.json();
    if (result?.data?.status === "error") {
      console.log("⚠️ Notification failed:", result.data.message);
      res.status(500).json({ message: result.data.message });
    } else {
      console.log("📲 Notification sent to:", pushToken.slice(0, 30) + "...");
      res.json({ message: "Notification sent" });
    }
  } catch (err) {
    console.error("Notification relay error:", err.message);
    res.status(500).json({ message: "Failed to send notification" });
  }
});

app.listen(3001, () => console.log("📲 Notification relay running on port 3001"));
