const express = require("express");
const route = express.Router();

// @route GET api/posts
route.get("/", (req, res) => {
  res.send("Posts Route");
});

module.exports = route;
