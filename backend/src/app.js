require("dotenv").config();
// const dotenv = require("dotenv");
const express = require("express");
// const session = require("express-session");
const { connectDatabase } = require("./config/database");
const { configureMiddleware } = require("./middleware/index");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes/index");
// const envFile = `.env.${process.env.NODE_ENV || "development"}`;
// dotenv.config({ path: envFile });

const app = express();

connectDatabase();
configureMiddleware(app);

// Run migration script
// migrateSpotifyFields();

// app.use(session({ secret: "some-secret", resave: false, saveUninitialized: true }));
app.use("/api", routes);
app.use(errorHandler);

module.exports = app;
