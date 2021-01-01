const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");

//@route POST api/users
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter a valid Email").isEmail(),
    check("password", "Password should be more than 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try{
      //Check duplication of email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(500).json({ errors: [{ message: "User already exist" }] });
    }

    //gravatar setting
    const avatar = gravatar.url(email, {
      s:'200',
      r: 'pg',
      d: 'mm'
    })
    //creating User model instance 
     user = new User({
      name, email, password, avatar
    })

    //Encrypting password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt) 

    await user.save()

    res.send("User Created Successfully!");
    } catch(err){
      console.error({Error: err.message})
      res.status(500).send("Server error!")
    }
    
  }
);

module.exports = router;
