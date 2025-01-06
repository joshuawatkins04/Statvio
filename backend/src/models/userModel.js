const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (username) {
          const regex = /^[a-zA-Z0-9_]{4,}$/;
          return regex.test(username);
        },
        message: "Please provide a valid username.",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (email) {
          const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return regex.test(email);
        },
        message: "Please provide a valid email address.",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (password) {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return regex.test(password);
        },
        message:
          "Please provide a valid password.",
      },
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
