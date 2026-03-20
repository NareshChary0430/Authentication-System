import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User is required" ],
    },

    refreshToken: {
      type: String,
      required: [true , "Refresh token hash is required"],
    },

    ip: {
      type: String,
      required :[true, "IP address is required"]
    },

    userAgent: {
      type: String,
      required :[true , "User agent is required"]
    },

    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;