const express = require("express");
const userRoutes = require("./userRoutes");
const spotifyRoutes = require("./spotifyRoutes");
const paypalRoutes = require("./paypalRoutes");
const aiRoutes = require("./aiRoutes");
const awsRoutes = require("./awsRoutes");

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/music/spotify", spotifyRoutes);
router.use("/paypal", paypalRoutes);
router.use("/ai", aiRoutes);
router.use("/aws", awsRoutes);

module.exports = router;