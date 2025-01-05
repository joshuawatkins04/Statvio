const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImageUrl: {
      type: String,
      default: "https://www.gravatar.com/avatar/?d=mp",
    },
    profileImageKey: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLogout: {
      type: Date,
      default: null,
    },
    spotify: {
      linked: { type: Boolean, default: false },
      spotifyId: { type: String },
      displayName: { type: String },
      email: { type: String },
      profileImageUrl: { type: String },

      accessToken: { type: String },
      refreshToken: { type: String },
      tokenExpiresAt: { type: Date },
      lastSyncedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    console.log("[userModel] Hasing password...");
    this.password = await bcrypt.hash(this.password, 10);
    console.log("[userModel] Successfully hashed password!");
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
