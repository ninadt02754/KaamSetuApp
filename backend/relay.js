import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
dotenv.config();

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    await transporter.sendMail({
      from: `"KaamSetu" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your KaamSetu OTP",
      text: `Your OTP is: ${otp}. Valid for 10 minutes.`,
    });
    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.listen(3000, "0.0.0.0", () => console.log("Relay running on port 3000"));
