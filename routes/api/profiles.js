const express = require("express");
const router = express.Router();

// @route GET api/profiles
router.get("/", (req, res) => {
  res.send("Profiles Route");
});

module.exports = router;
