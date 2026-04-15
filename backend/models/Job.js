import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    posterId: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },

    minBudget: { type: Number },
    maxBudget: { type: Number },
    noBudget: { type: Boolean, default: false },

    startDate: { type: Date, required: true },
    endDate: { type: Date },

    // 🔥 ADD THESE
    startTime: { type: Date },
    endTime: { type: Date },

    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Referral" }],

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },

    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
