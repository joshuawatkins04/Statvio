const express = require("express");
const userRoutes = require("./userRoutes");
const spotifyRoutes = require("./spotifyRoutes");
const paypalRoutes = require("./paypalRoutes");

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/music/spotify", spotifyRoutes);
router.use("/paypal", paypalRoutes);

module.exports = router;