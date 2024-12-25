const User = require("../models/userModel");
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
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });
};

/* Business logic functions */

// Create user business logic
const createUser = async ({ username, email, password }) => {
  console.log("[userController - registerUser] Attempting to create user...");
  return await User.create({ username, email, password });
};

// Login user business logic
const authenticateUser = async ({ email, password }) => {
  console.log("[userController - loginUser] Fetching users email from database...");

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    console.warn("[userController - loginUser] FAILED: invalid entries.");
    throw new Error("Invalid email or password.");
  }

  console.info("[userController - loginUser] User authenticated successfully!");
  return user;
};

// User dashboard business logic
const getDashboardData = async ({ res, userId }) => {
  console.log("[userController - getUserDashboard] Fetching user info...");

  const user = await User.findById(userId).select("-password");
    
  if (!user) {
    console.warn("[userController - getUserDashboard] FAILED: user not found.");
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
}

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
}

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
    const userExists = isExistingUser({ username, email });
    
    if (userExists) return res.status(400).json({ message: "Username and/or email already in use." });
    
    const newUser = await createUser({ username, email, password });
    console.info("[userController - registerUser] SUCCESS: user created successfully!");
    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("[userController - registerUser] ERROR: register user failed with error:", error);
    next(error);
  }
};

// Login user controller function
const loginUser = async (req, res, next) => {
  console.log("[userController - loginUser] Function called");

  const { email, password } = req.body;

  console.log("[userController - loginUser] Checking if all fields are entered");
  if (!email || !password) {
    console.warn("[userController - loginUser] FAILED: not all fields were entered.");
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await authenticateUser({ email, password });

    console.log("[userController - loginUser] Creating token for user...");
    const token = generateToken(user._id);
    
    generateCookie(res, token);

    console.info("[userController - loginUser] SUCCESS: Login was successful!");
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("[userController - loginUser] ERROR:", error);
    next(error);
  }
};

// Need to refactor
const getUserDashboard = async (req, res) => {
  console.log("[userController - getUserDashboard] Function called");
  
  const userId = req.user.id;

  try {
    await getDashboardData(res, userId);
  } catch (error) {
    console.error("[userController - getUserDashboard] ERROR: fetching dashboard failed:", error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserDashboard,
};
