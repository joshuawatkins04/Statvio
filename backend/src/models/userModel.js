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
          return this.isNew || this.isModified("username") ? /^[a-zA-Z0-9_]{4,}$/.test(username) : true;
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
          return this.isNew || this.isModified("email") ? /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) : true;
        },
        message: "Please provide a valid email address.",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (password) {
          if (!this.isNew && !this.isModified("password")) return true;
          if (password.startsWith("$2")) return true;
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
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
