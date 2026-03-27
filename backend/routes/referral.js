import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Referral from "../models/Referral.js";

const router = express.Router();

// ================= GET ALL REFERRALS =================
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: "referrals",
                populate: { path: "jobId", select: "category description" },
            })
            .select("referrals");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ referrals: user.referrals });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= ADD REFERRAL =================
router.post("/add", auth, async (req, res) => {
    try {
        const { workerName, workerPhone, message, jobId } = req.body;

        if (!workerName || !workerPhone || !jobId) {
            return res.status(400).json({
                message: "workerName, workerPhone, and jobId are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid jobId" });
        }

        const [user, job] = await Promise.all([
            User.findById(req.user.id),
            Job.findById(jobId),
        ]);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (!job) return res.status(404).json({ message: "Job not found" });

        // prevent duplicate referral
        const alreadyReferred = await Referral.findOne({
            referrerId: req.user.id,
            workerPhone,
            jobId,
        });

        if (alreadyReferred) {
            return res.status(400).json({
                message: "You have already referred this worker for this job",
            });
        }

        // ✅ MINIMAL FIX: map message → skills + set workerId
        const existingWorker = await User.findOne({ phone: workerPhone }).select("_id");

        const referral = await Referral.create({
            referrerId: req.user.id,
            jobId,
            workerId: existingWorker ? existingWorker._id : null,
            workerName,
            workerPhone,
            skills: message ? [message] : [], // ✅ FIX
        });

        // push referral ID into both user and job
        await Promise.all([
            User.findByIdAndUpdate(req.user.id, { $push: { referrals: referral._id } }),
            Job.findByIdAndUpdate(jobId, { $push: { referrals: referral._id } }),
        ]);

        // also create application entry
        await Application.create({
            jobId,
            workerId: existingWorker ? existingWorker._id : null,
            workerName,
            workerPhone,
            status: "pending",
            source: "referral",
            referrerId: req.user.id,
            referralId: referral._id,
        });

        res.json({ message: "Referral added successfully", referral });

    } catch (err) {
        // optional duplicate index safety
        if (err.code === 11000) {
            return res.status(400).json({
                message: "You already referred this worker for this job",
            });
        }

        res.status(500).json({ error: err.message });
    }
});

// ================= REMOVE REFERRAL =================
router.delete("/remove/:referralId", auth, async (req, res) => {
    try {
        const { referralId } = req.params;

        const referral = await Referral.findOne({
            _id: referralId,
            referrerId: req.user.id,
        });

        if (!referral) return res.status(404).json({ message: "Referral not found" });

        await Referral.findByIdAndDelete(referralId);

        await Promise.all([
            User.findByIdAndUpdate(req.user.id, {
                $pull: { referrals: new mongoose.Types.ObjectId(referralId) },
            }),
            Job.findByIdAndUpdate(referral.jobId, {
                $pull: { referrals: new mongoose.Types.ObjectId(referralId) },
            }),
        ]);

        await Application.deleteMany({
            referralId,
            referrerId: req.user.id,
            source: "referral",
        });

        res.json({ message: "Referral removed successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;