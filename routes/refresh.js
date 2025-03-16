const express = require("express");
const router = express.Router();
const controller = require("../controllers/refreshTokenController");

router.get("/", controller.handleRefreshToken);

module.exports = router;
