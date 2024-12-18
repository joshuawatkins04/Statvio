require("dotenv").config();
const express = require("express");
const connectDatabase = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const { configureMiddleware } = require("./middleware/middleware");
const errorHandler = require("./middleware/errorHandler");

const app = express();

connectDatabase();
configureMiddleware(app);

app.use("/api/auth", userRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
