import express from "express";
import auth from "../middleware/auth.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import User from "../models/User.js";

const router = express.Router();

// Helper: send notification via local relay
const sendNotificationRelay = async (pushToken, title, body, data = {}) => {
  try {
    const relayUrl = process.env.NOTIFICATION_RELAY_URL || "http://localhost:3001/send-notification";
    await fetch(relayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pushToken, title, body, data }),
    });
  } catch (err) {
    console.log("Notification relay error:", err.message);
  }
};

// ─── CREATE A JOB ─────────────────────────────────────────────────────────────
router.post("/create", async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();

    // Notify matching workers via relay
    const matchingWorkers = await User.find({
      role: "worker",
      skills: { $in: [savedJob.category] },
      pushToken: { $nin: [null, ""] },
      _id: { $ne: savedJob.posterId },
    }).select("pushToken");

    await Promise.all(
      matchingWorkers.map((worker) =>
        sendNotificationRelay(
          worker.pushToken,
          "New Job Posted 🔔",
          `A new ${savedJob.category} job is available near you!`,
          { jobId: savedJob._id.toString() },
        )
      )
    );

    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET ALL JOBS (auto-expire once endTime on the end/start date has passed) ──
router.get("/", async (req, res) => {
  try {
    const now = new Date();

    // Auto-cancel jobs whose endTime has passed (and not yet completed/cancelled)
    // endTime is stored as a full Date; for single-day jobs endDate is null so we
    // use startDate's calendar date combined with the time portion of endTime.
    const pendingJobs = await Job.find({
      status: { $nin: ["completed", "cancelled"] },
      endTime: { $exists: true, $ne: null },
    });

    const expiredJobIds = pendingJobs
      .filter((job) => {
        const endTime = new Date(job.endTime);
        // Determine the calendar date of the job's last day
        const baseDate = job.endDate ? new Date(job.endDate) : new Date(job.startDate);
        // Build the actual expiry datetime: date from baseDate, time from endTime
        const expiry = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          endTime.getHours(),
          endTime.getMinutes(),
          endTime.getSeconds(),
        );
        return now > expiry;
      })
      .map((j) => j._id);

    if (expiredJobIds.length > 0) {
      await Job.updateMany(
        { _id: { $in: expiredJobIds } },
        { status: "cancelled", cancelledAt: now }
      );
      await Application.updateMany(
        { jobId: { $in: expiredJobIds }, status: "pending" },
        { status: "rejected" }
      );
    }

    const jobs = await Job.find({
      status: { $nin: ["completed", "cancelled"] },
    });

    const formatted = await Promise.all(
      jobs.map(async (job) => {
        let posterName = "User";
        let posterRating = 0;
        try {
          if (job.posterId && job.posterId.length === 24) {
            const user = await User.findById(job.posterId).select("name averageEmployerRating");
            if (user?.name) posterName = user.name;
            if (user?.averageEmployerRating) posterRating = user.averageEmployerRating;
          }
        } catch (_) {}
        return {
          ...job.toObject(),
          postedBy: { name: posterName, rating: posterRating },
        };
      })
    );

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── MY ACTIVE REQUESTS ────────────────────────────────────────────────────────
router.get("/my-requests/:userId", async (req, res) => {
  try {
    const now = new Date();
    const jobs = await Job.find({
      posterId: req.params.userId,
      status: { $nin: ["completed", "cancelled"] },
    }).sort({ createdAt: -1 });

    // Filter out jobs whose endTime has already passed
    const activeJobs = jobs.filter((job) => {
      if (!job.endTime) return true;
      const endTime = new Date(job.endTime);
      const baseDate = job.endDate ? new Date(job.endDate) : new Date(job.startDate);
      const expiry = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        endTime.getHours(),
        endTime.getMinutes(),
        endTime.getSeconds(),
      );
      return now <= expiry;
    });

    res.json(activeJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── MY PAST REQUESTS ─────────────────────────────────────────────────────────
router.get("/my-past-requests/:userId", async (req, res) => {
  try {
    const jobs = await Job.find({
      posterId: req.params.userId,
      status: { $in: ["completed", "cancelled"] },
    }).sort({ createdAt: -1 });

    // For each completed job, find the accepted/completed application to get worker info
    const jobsWithWorker = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject();
        if (job.status === "completed") {
          const acceptedApp = await Application.findOne({
            jobId: job._id,
            status: { $in: ["accepted", "completed"] },
          }).populate("workerId", "name phone");

          if (acceptedApp) {
            if (acceptedApp.source === "referral") {
              jobObj.completedByReferral = true;
              jobObj.workerName = acceptedApp.workerName || "Referred Worker";
              jobObj.workerPhone = acceptedApp.workerPhone || "";
            } else if (acceptedApp.workerId) {
              jobObj.completedByReferral = false;
              jobObj.workerName = acceptedApp.workerId.name || acceptedApp.workerName || "";
              jobObj.workerPhone = acceptedApp.workerId.phone || acceptedApp.workerPhone || "";
            }
          }
        }
        return jobObj;
      })
    );

    res.json(jobsWithWorker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE JOB STATUS ────────────────────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" },
    );
    if (!updatedJob) return res.status(404).json({ error: "Job not found" });
    res.status(200).json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ─── CANCEL JOB ───────────────────────────────────────────────────────────────
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.posterId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const s = (job.status || "").toLowerCase();
    if (!["pending", "in-progress"].includes(s)) {
      return res.status(400).json({ error: "Cannot cancel a completed job." });
    }

    job.status = "cancelled";
    job.cancelledAt = new Date();
    await job.save();

    // Reject all pending applications for this job
    await Application.updateMany(
      { jobId: job._id, status: "pending" },
      { status: "rejected" }
    );

    res.status(200).json({ message: "Job cancelled", job });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─── MARK JOB AS COMPLETED ────────────────────────────────────────────────────
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.posterId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const currentStatus = (job.status || "").trim().toLowerCase();
    if (!["in_progress", "in-progress"].includes(currentStatus)) {
      return res.status(400).json({
        error: "Only in-progress jobs can be marked complete.",
        current_status: job.status,
      });
    }

    job.status = "completed";
    job.completedAt = new Date();
    await job.save();

    const acceptedApp = await Application.findOneAndUpdate(
      { jobId: job._id, status: "accepted" },
      { status: "completed", completedAt: new Date() },
      { returnDocument: "after" }
    ).populate("workerId", "_id name");

    const workerId = acceptedApp?.workerId?._id || acceptedApp?.workerId || null;
    res.status(200).json({ message: "Job marked as completed", job, workerId });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─── DELETE JOB (only pending) ────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found." });

    const cleanStatus = (job.status || "").trim().toLowerCase();
    if (cleanStatus !== "pending") {
      return res.status(400).json({ error: "Could not delete. Job may be in progress." });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
