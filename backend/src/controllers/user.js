const User = require("../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

/* Utility functions */

// Utility function for JWT token generation
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Function for generating cookie
const generateCookie = ({ res, token }) => {
  const ONE_HOUR = 60 * 60 * 1000;
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ONE_HOUR,
  });
};

/* Business logic functions */

// Create user business logic
const createUser = async ({ username, email, password }) => {
  console.log("[userController - registerUser] Attempting to create user...");
  return await User.create({ username, email, password });
};

// Login user business logic
const authenticateUser = async ({ usernameOrEmail, password }) => {
  console.log("[userController - loginUser] Fetching users email from database...");

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
  const query = isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail };
  const user = await User.findOne(query);

  if (!user) {
    console.warn("[userController - authenticateUser] No user found with this email or username.");
    throw new Error("Invalid username, email or password.");
  }
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    console.warn("[userController - authenticateUser] Password mismatch.");
    throw new Error("Invalid email or password.");
  }

  console.info("[userController - loginUser] User authenticated successfully!");
  return user;
};

// User dashboard business logic
const getDashboardData = async ({ res, userId, requestId }) => {
  // console.log("[userController - getUserDashboard] Fetching user info...");
  console.log(`[${requestId}] [userController - getDashboardData] Fetching user info...`);

  const user = await User.findById(userId).select("-password");

  if (!user) {
    console.warn("[userController - getDashboardData] FAILED: user not found.");
    return res.status(404).json({ message: "User not found" });
  }

  console.info("[userController - getUserDashboard] SUCCESS: sending JSON with dashboard data to frontend.");

  res.json({
    message: "Welcome to your dashboard",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

// Check if user exists in database
const isExistingUser = async ({ username, email }) => {
  console.log("[userController - registerUser] Fetching email to check if user already exists...");
  const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (existingUser) {
    if (existingUser.username === username) {
      console.warn("[userController - registerUser] FAILED: username already exists!");
      return true;
    }
    if (existingUser.email === email) {
      console.warn("[userController - registerUser] FAILED: email already exists!");
      return true;
    }
  }
  return false;
};

/* Controller functions */

// Register user controller function
const registerUser = async (req, res, next) => {
  console.log("[userController - registerUser] Function called");

  const { username, email, password } = req.body;

  console.log("[userController - registerUser] Checking if all fields are entered");
  if (!username || !email || !password) {
    console.warn("[userController - registerUser] FAILED: not all fields were entered.");
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const userExists = await isExistingUser({ username, email });

    if (userExists) return res.status(400).json({ message: "Username or email already in use." });

    if (username.length < 4 || username.length > 20) {
      return res.status(400).json({ error: "Username must be between 4 and 20 characters long." });
    }
    if (email.length < 5 || email.length > 45) {
      return res.status(400).json({ error: "Email must be between 5 and 45 characters long." });
    }
    if (password.length < 8 || password.length > 40) {
      return res.status(400).json({ error: "Password must be between 8 and 40 characters long." });
    }

    const newUser = await createUser({ username, email, password });
    console.info("[userController - registerUser] SUCCESS: user created successfully!");
    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("[userController - registerUser] ERROR: register user failed with error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// Login user controller function
const loginUser = async (req, res, next) => {
  console.log("[userController - loginUser] Function called");

  const { usernameOrEmail, password } = req.body;

  console.log("[userController - loginUser] usernameOrEmail value: ", usernameOrEmail);
  console.log("[userController - loginUser] Checking if all fields are entered");
  if (!usernameOrEmail || !password) {
    console.warn("[userController - loginUser] FAILED: not all fields were entered.");
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await authenticateUser({ usernameOrEmail, password });

    console.log("[userController - loginUser] Creating token for user...");
    const token = generateToken(user._id);

    generateCookie({ res, token });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.info("[userController - loginUser] SUCCESS: Login was successful!");
    res.json({ message: "Login successful", token, userId: user._id });
  } catch (error) {
    console.error("[userController - loginUser] ERROR:", error);
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  console.log("[userController - logoutUser] Function called");
  try {
    const { userId } = req.body;
    if (!userId) {
      console.warn("[userController - logoutUser] No userId provided.");
      return res.status(400).json({ message: "User ID is required for logout." });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    console.info("[userController - logoutUser] SUCCESS: Token cookie cleared!");

    const user = await User.findByIdAndUpdate(userId, { lastLogout: new Date() }, { new: true });
    if (!user) {
      console.warn("[userController - logoutUser] User not found.");
      return res.status(404).json({ message: "User not found. " });
    }

    console.info("[userController - logoutUser] SUCCESS: lastLogout timestamp updated.");
    res.status(200).json({ message: "Successfully logged out." });
  } catch (error) {
    console.error("[userController - logoutUser] ERROR:", error);
    next(error);
  }
};

const verifyAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.warn("[userController - verifyAuth] FAILED: user not found.");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.info("[userController - verifyAuth] SUCCESS: user is authenticated.");
    res.json({
      isValid: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("[userController - verifyAuth] ERROR:", error);
    next(error);
  }
};

// User dashboard controller function
const getUserDashboard = async (req, res, next) => {
  console.log("[userController - getUserDashboard] Function called");

  const userId = req.user.id;

  try {
    await getDashboardData({ res, userId, requestId });
  } catch (error) {
    console.error("[userController - getUserDashboard] ERROR: fetching dashboard failed:", error);
    next(error);
  }
};

// Get user info controller function
const getUser = async (req, res, next) => {
  console.log("[userController - getUser] Function called");
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    console.log("Got info: ", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("[userController - getUser] ERROR:", error.message);
    next(error);
  }
};

const updateUsername = async (req, res, next) => {
  console.log("[userController - updateUsername] Function called.");
  try {
    const userId = req.user.id;
    console.log("[userController - updateUsername] userId: ", userId);
    const { newUsername } = req.body;
    console.log("[userController - updateUsername] newUsername: ", newUsername);

    if (!newUsername) {
      console.error("[userController - updateUsername] ERROR: newUsername is required.", newUsername);
      return res.status(400).json({ message: "New username is required." });
    }

    console.log("[userController - updateUsername] Checking user exists.");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("[userController - updateUsername] Comparing usernames. current: ", user.username, " new: ", newUsername);
    if (user.username === newUsername) {
      return res.status(400).json({ message: "New username must be different from the current one." });
    }

    console.log("[userController - updateUsername] Checking if username already exists on another account.");
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(409).json({ message: "Username already in use." });
    }

    console.log("[userController - updateUsername] Saving new username to account.");
    user.username = newUsername;
    await user.save();

    return res.status(200).json({ message: "Username updated successfully.", username: user.username });
  } catch (error) {
    console.error("[userController - updateUser] ERROR:", error.message);
    next(error);
  }
};

const updateEmail = async (req, res, next) => {
  console.log("[userController - updateEmail] Function called.");
  try {
    const userId = req.user.id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.email === newEmail) {
      return res.status(400).json({ message: "New email must be different from the current one." });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    user.email = newEmail;
    await user.save();

    return res.status(200).json({ message: "Email updated successfully.", email: user.email });
  } catch (error) {
    console.error("[userController - updateUser] ERROR:", error.message);
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  console.log("[userController - updatePassword] Function called.");
  try {
    const { newPassword, confirmNewPassword } = req.body;
    console.log("[userController - updatePassword] Request Body:", req.body);

    if (!newPassword || !confirmNewPassword) {
      console.warn("[userController - updatePassword] Missing password fields.");
      return res.status(400).json({ message: "All password fields are required." });
    }
    if (newPassword !== confirmNewPassword) {
      console.warn("[userController - updatePassword] New passwords do not match.");
      return res.status(400).json({ message: "New passwords do not match." });
    }
    if (newPassword.length < 8 || newPassword.length > 40) {
      console.warn(
        `[userController - updatePassword] Invalid new password length: ${newPassword.length}`
      );
      return res.status(400).json({ error: "Password must be between 8 and 40 characters long." });
    }
    if (confirmNewPassword.length < 8 || confirmNewPassword.length > 40) {
      console.warn(
        `[userController - updatePassword] Invalid confirm password length: ${confirmNewPassword.length}`
      );
      return res.status(400).json({ error: "Password must be between 8 and 40 characters long." });
    }

    const userId = req.user.id;
    console.log("[userController - updatePassword] User ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("[userController - updatePassword] Checking if new password matches current password.");
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      console.warn("[userController - updatePassword] New password is the same as the current password.");
      return res.status(400).json({ message: "New password must be different from the current password." });
    }

    console.log("[userController - updatePassword] Updating password.");
    user.password = newPassword;
    await user.save();
    console.log("[userController - updatePassword] Password updated successfully.");

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("[userController - updateUser] ERROR:", error.message);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyAuth,
  getUserDashboard,
  getUser,
  updateUsername,
  updateEmail,
  updatePassword,
};
