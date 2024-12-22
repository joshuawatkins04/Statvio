require("dotenv").config();
const express = require("express");
const session = require("express-session");
const connectDatabase = require("./config/database");
const { configureMiddleware } = require("./middleware/middleware");
const errorHandler = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");
const spotifyRoutes = require("./routes/spotifyRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

connectDatabase();
configureMiddleware(app);

app.use(session({ secret: "some-secret", resave: false, saveUninitialized: true }));

app.use("/api/auth", userRoutes);
app.use("/music/spotify", spotifyRoutes);
app.use("/paypal", paymentRoutes);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
