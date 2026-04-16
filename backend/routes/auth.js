import bcrypt from "bcrypt";
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

// ─── Disk Storage Setup ──────────────────────────────────────────────────────

const uploadDir = "uploads/profile_images";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

// ─────────────────────────────────────────────────────────────────────────────

const router = express.Router();

let otpStore = {};
let phoneOtpStore = {};

// ================= SEND PHONE OTP =================
router.post("/send-phone-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Enter a valid 10-digit Indian mobile number" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    phoneOtpStore[phone] = otp;

    console.log("Phone OTP:", otp); // debug — remove in production

    const apiKey = process.env.TWO_FACTOR_API_KEY;
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/OTP1`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.Status !== "Success") {
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Try again." });
    }

    res.json({ message: "OTP sent to phone" });
  } catch (err) {
    console.error("Phone OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ================= SEND OTP =================
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // 🔐 generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 🧠 store OTP in backend (IMPORTANT for verification)
    otpStore[email] = otp;

    console.log("OTP:", otp); // debug

    // 🚀 SEND TO RELAY SERVER
    const relayUrl =
      process.env.OTP_RELAY_URL || "http://172.17.61.86:3000/send-otp";
    const relayRes = await fetch(relayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // optional:
        // "Authorization": "Bearer mysecretkey"
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!relayRes.ok) {
      throw new Error("Relay failed");
    }

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});
// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      skills,
      role,
      otp,
      phoneOtp,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (otpStore[email] !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (phoneOtpStore[phone] !== phoneOtp) {
      return res.status(400).json({ message: "Invalid Phone OTP" });
    }

    // Bug 9: Strong password validation
    const strongPwdRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;
    if (!strongPwdRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number and special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Normalize skills
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills;
    } else if (typeof skills === "string") {
      parsedSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      role: role === "worker" ? "worker" : "user",
      skills: role === "worker" ? parsedSkills : [],
      profileImage: `${process.env.BASE_URL}/uploads/profile_images/default.png`,
    });

    await newUser.save();

    delete otpStore[email];
    delete phoneOtpStore[phone];
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _, ...userData } = user._doc;

    res.json({
      message: "Login success",
      token,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (otpStore[email] !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    delete otpStore[email];

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/rate-worker", async (req, res) => {
  try {
    const { workerId, rating, review } = req.body;
    const worker = await User.findById(workerId);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const newTotal = (worker.totalRatings || 0) + 1;
    const newAvg =
      ((worker.averageRating || 0) * (worker.totalRatings || 0) + rating) /
      newTotal;

    worker.totalRatings = newTotal;
    worker.averageRating = parseFloat(newAvg.toFixed(2));
    await worker.save();

    res.json({
      message: "Rating submitted",
      averageRating: worker.averageRating,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/rate-employer", async (req, res) => {
  try {
    const { employerId, rating, review } = req.body;

    if (!employerId || !rating) {
      return res
        .status(400)
        .json({ message: "employerId and rating are required" });
    }

    const employer = await User.findById(employerId);
    if (!employer)
      return res.status(404).json({ message: "Employer not found" });

    const newTotal = (employer.totalEmployerRatings || 0) + 1;
    const newAvg =
      ((employer.averageEmployerRating || 0) *
        (employer.totalEmployerRatings || 0) +
        rating) /
      newTotal;

    employer.totalEmployerRatings = newTotal;
    employer.averageEmployerRating = parseFloat(newAvg.toFixed(2));
    employer.employerRatings.push({
      rating,
      review: review || "",
      givenBy: null, // no auth middleware here; optionally pass workerId from frontend
    });

    await employer.save();

    res.json({
      message: "Employer rated successfully",
      averageEmployerRating: employer.averageEmployerRating,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ================= UPDATE PROFILE =================
router.put(
  "/update-profile",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      console.log("ROUTE HIT");
      console.log("BODY:", req.body || "No body");
      console.log("FILE:", req.file || "No file");

      const { id, name, address, skills } = req.body || {};

      if (!id) {
        return res.status(400).json({ message: "Missing user ID" });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (name) user.name = name;
      if (address) user.address = address;

      // FIX: FormData sends skills as a comma string — convert to array
      if (skills) {
        user.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (req.file) {
        if (user.profileImage) {
          const oldFilename = user.profileImage.split(
            "/uploads/profile_images/",
          )[1];
          if (oldFilename && oldFilename !== "default.png") {
            const oldPath = path.join(uploadDir, oldFilename);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
        }

        user.profileImage = `/uploads/profile_images/${req.file.filename}`;
      }

      await user.save();

      return res.json({
        message: "Profile updated",
        user,
      });
    } catch (err) {
      console.log("FULL ERROR:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  },
);

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SAVE PUSH TOKEN
router.post("/save-token", auth, async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken)
      return res.status(400).json({ message: "pushToken is required" });
    await User.findByIdAndUpdate(req.user.id, { pushToken });
    res.json({ message: "Push token saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CLEAR PUSH TOKEN ON LOGOUT
router.post("/clear-token", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { pushToken: null });
    res.json({ message: "Push token cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PASSWORD
router.post("/update-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });

    const strongPwdRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;
    if (!strongPwdRegex.test(newPassword))
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number and special character",
      });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// export default router;
export default router;
