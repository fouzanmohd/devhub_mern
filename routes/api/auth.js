const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

// @route GET api/auth
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user: user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// @route POST api/auth login jwt setup

router.post(
  "/",
  [
    check("email", "Please enter a valid Email").isEmail(),
    check("password", "password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      //Check duplication of email
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(500)
          .json({ errors: [{ message: "invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(500)
          .json({ errors: [{ message: "invalid credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error({ Error: err.message });
      res.status(500).send("Server error!");
    }
  }
);

module.exports = router;
