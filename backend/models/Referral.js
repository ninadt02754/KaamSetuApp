import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    workerName: { type: String, required: true },
    workerPhone: { type: String, required: true },

    // ✅ Using skills instead of message
    skills: { type: [String], default: [] },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate referrals
referralSchema.index(
  { referrerId: 1, workerPhone: 1, jobId: 1 },
  { unique: true }
);

export default mongoose.model("Referral", referralSchema);