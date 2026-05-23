const express = require("express");
const userRoutes = require("./user");
const musicRoutes = require("./music");
const paypalRoutes = require("./paypal");
const aiRoutes = require("./ai");
const awsRoutes = require("./aws");

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/music", musicRoutes);
router.use("/paypal", paypalRoutes);
router.use("/ai", aiRoutes);
router.use("/aws", awsRoutes);

module.exports = router;