require("dotenv").config();
const express = require("express");
const { connectDatabase } = require("./config/database");
const { configureMiddleware } = require("./middleware/index");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes/index");

const app = express();

connectDatabase();
configureMiddleware(app);

// Run migration script
// migrateSpotifyFields();

app.use("/api", routes);
app.use(errorHandler);

module.exports = app;
