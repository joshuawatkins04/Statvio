const User = require("../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

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
  logger.info("[userController - createUser] Creating a new user.", { username, email });
  return await User.create({ username, email, password });
};

// Login user business logic
const authenticateUser = async ({ usernameOrEmail, password }) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
  const query = isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail };
  logger.debug("[userController - authenticateUser] Authenticating user.", { usernameOrEmail });

  const user = await User.findOne(query);
  if (!user) {
    logger.warn("[userController - authenticateUser] User not found.", { usernameOrEmail });
    throw new Error("Invalid username, email or password.");
  }
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    logger.warn("[userController - authenticateUser] Password mismatch.", { usernameOrEmail });
    throw new Error("Invalid email or password.");
  }

  logger.info("[userController - authenticateUser] User authenticated successfully.", { userId: user._id });
  return user;
};

// User dashboard business logic
const getDashboardData = async ({ res, userId, requestId }) => {
  logger.debug("[userController - getDashboardData] Fetching user dashboard data.", { userId, requestId });

  const user = await User.findById(userId).select("-password");

  if (!user) {
    logger.warn("[userController - getDashboardData] User not found.", { userId });
    return res.status(404).json({ message: "User not found" });
  }

  logger.debug("[userController - getDashboardData] Dashboard data retrieved successfully.", { userId });

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
  logger.debug("[userController - registerUser] Fetching email to check if user already exists...");
  const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (existingUser) {
    if (existingUser.username === username) {
      logger.warn("[userController - registerUser] FAILED: username already exists!");
      return true;
    }
    if (existingUser.email === email) {
      logger.warn("[userController - registerUser] FAILED: email already exists!");
      return true;
    }
  }
  return false;
};

/* Controller functions */

// Register user controller function
const registerUser = async (req, res, next) => {
  logger.debug("[userController - registerUser] Function called");

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    logger.warn("[userController - registerUser] Missing required fields.");
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const userExists = await isExistingUser({ username, email });

    if (userExists) {
      logger.warn("[userController - registerUser] Username or email already in use.", { username, email });
      return res.status(400).json({ message: "Username or email already in use." });
    }

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
    logger.info("[userController - registerUser] User created successfully.", { userId: newUser._id });
    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    logger.error("[userController - registerUser] Error occurred during user registration.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

// Login user controller function
const loginUser = async (req, res, next) => {
  logger.debug("[userController - loginUser] Function called");

  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    logger.warn("[userController - loginUser] Missing username or password.");
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await authenticateUser({ usernameOrEmail, password });

    const token = generateToken(user._id);
    generateCookie({ res, token });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info("[userController - loginUser] User logged in successfully.", { userId: user.id });
    res.json({ message: "Login successful", token, userId: user._id });
  } catch (error) {
    logger.error("[userController - loginUser] Login failed.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  logger.debug("[userController - logoutUser] Function called");
  try {
    const { userId } = req.body;
    if (!userId) {
      logger.warn("[userController - logoutUser] No userId provided.");
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
    logger.debug("[userController - logoutUser] Token cookie cleared successfully.");

    const user = await User.findByIdAndUpdate(userId, { lastLogout: new Date() }, { new: true });
    if (!user) {
      logger.warn("[userController - logoutUser] User not found during logout.", { userId });
      return res.status(404).json({ message: "User not found. " });
    }

    logger.info("[userController - logoutUser] User logged out successfully.", { userId: user.id });
    res.status(200).json({ message: "Successfully logged out." });
  } catch (error) {
    logger.error("[userController - logoutUser] Logout failed.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

const verifyAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      logger.warn("[userController - verifyAuth] FAILED: user not found.");
      return res.status(401).json({ message: "Unauthorized" });
    }

    logger.info("[userController - verifyAuth] User authenticated successfully.", { userId: user.id });
    res.json({
      isValid: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error("[userController - verifyAuth] Verify auth failed.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

// User dashboard controller function
const getUserDashboard = async (req, res, next) => {
  logger.debug("[userController - getUserDashboard] Function called");

  const userId = req.user.id;

  try {
    await getDashboardData({ res, userId, requestId });
  } catch (error) {
    logger.error("[userController - getUserDashboard] ERROR: fetching dashboard failed:", error);
    next(error);
  }
};

// Get user info controller function
const getUser = async (req, res, next) => {
  logger.debug("[userController - getUser] Function called");
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    logger.debug("Got info: ", user);
    res.status(200).json(user);
  } catch (error) {
    logger.error("[userController - getUser] Get user error.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

const getApiInfo = async (req, res, next) => {
  logger.debug("[userController - getApiInfo] Function called");
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId, "apiCount apisLinked");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      apiCount: user.apiCount,
      apisLinked: user.apisLinked,
    });
  } catch (error) {
    logger.error("[userController - getApiInfo] Error.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

const updateUsername = async (req, res, next) => {
  logger.debug("[userController - updateUsername] Function called");
  try {
    const userId = req.user.id;
    logger.debug("[userController - updateUsername] userId: ", userId);
    const { newUsername } = req.body;
    logger.debug("[userController - updateUsername] newUsername: ", newUsername);

    if (!newUsername) {
      logger.warn("[userController - updateUsername] Validation failed: newUsername is required.", {
        userId: req.user?.id,
        body: req.body,
      });
      return res.status(400).json({ message: "New username is required." });
    }

    logger.debug("[userController - updateUsername] Checking user exists.");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    logger.debug(
      "[userController - updateUsername] Comparing usernames. current: ",
      user.username,
      " new: ",
      newUsername
    );
    if (user.username === newUsername) {
      return res.status(400).json({ message: "New username must be different from the current one." });
    }

    logger.debug("[userController - updateUsername] Checking if username already exists on another account.");
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(409).json({ message: "Username already in use." });
    }

    logger.info("[userController - updateUsername] Saving new username to account.", { userId: user.id });
    user.username = newUsername;
    await user.save();

    return res.status(200).json({ message: "Username updated successfully.", username: user.username });
  } catch (error) {
    logger.error("[userController - updateUsername] Error.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

const updateEmail = async (req, res, next) => {
  logger.debug("[userController - updateEmail] Function called");
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

    logger.info("[userController - updateEmail] Saving new email to account.", { userId: user.id });
    user.email = newEmail;
    await user.save();

    return res.status(200).json({ message: "Email updated successfully.", email: user.email });
  } catch (error) {
    logger.error("[userController - updateEmail] Error.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  logger.debug("[userController - updatePassword] Function called");
  try {
    const { newPassword, confirmNewPassword } = req.body;
    logger.debug("[userController - updatePassword] Request Body:", req.body);

    if (!newPassword || !confirmNewPassword) {
      logger.warn("[userController - updatePassword] Missing password fields.");
      return res.status(400).json({ message: "All password fields are required." });
    }
    if (newPassword !== confirmNewPassword) {
      logger.warn("[userController - updatePassword] New passwords do not match.");
      return res.status(400).json({ message: "New passwords do not match." });
    }
    if (newPassword.length < 8 || newPassword.length > 40) {
      logger.warn("[userController - updatePassword] Validation failed: invalid new password length.", {
        length: newPassword.length,
        userId: req.user?.id,
      });
      return res.status(400).json({ error: "Password must be between 8 and 40 characters long." });
    }
    if (confirmNewPassword.length < 8 || confirmNewPassword.length > 40) {
      logger.warn("[userController - updatePassword] Validation failed: invalid confirm password length.", {
        length: confirmNewPassword.length,
        userId: req.user?.id,
      });
      return res.status(400).json({ error: "Password must be between 8 and 40 characters long." });
    }

    const userId = req.user.id;
    logger.debug("[userController - updatePassword] User ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    logger.debug("[userController - updatePassword] Checking if new password matches current password.");
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      logger.warn("[userController - updatePassword] New password is the same as the current password.");
      return res.status(400).json({ message: "New password must be different from the current password." });
    }

    logger.info("[userController - updatePassword] Saving new password to account.", { userId: user.id });
    user.password = newPassword;
    await user.save();
    logger.debug("[userController - updatePassword] Password updated successfully.");

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    logger.error("[userController - updatePassword] Error.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

const updateTutorialStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tutorialComplete } = req.body;

    if (typeof tutorialComplete !== "boolean") {
      return res.status(400).json({ message: "Invalid value" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.tutorialComplete === tutorialComplete) {
      return res.status(400).json({ message: "Value already the same." });
    } else {
      user.tutorialComplete = tutorialComplete;
      await user.save();
    }

    return res.status(200).json({ message: "Tutorial status updated successfully." });
  } catch (error) {
    logger.error("[userController - updateTutorialStatus] Error.", {
      error: error.message,
      stack: error.stack,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyAuth,
  getUserDashboard,
  getUser,
  getApiInfo,
  updateUsername,
  updateEmail,
  updatePassword,
  updateTutorialStatus,
};
