const express = require("express");
const router = express.Router();
const config = require("config");
const request = require("request");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator");
const nodemon = require("nodemon");

// @route GET api/profiles/me
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["avatar", "name"]);
    if (!profile) {
      res.status(400).json({ message: "There is no profile for this user" });
    }
    res.json({ profile });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong, please try again!");
  }
});

// @route POST api/profiles
//Creating a user profile

router.post("/", [
  auth,
  [check("status").not().isEmpty(), check("skills").not().isEmpty()],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(500).json({ errors: error.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      facebook,
      instagram,
      twitter,
    } = req.body;

    //Building profile section

    const profileSection = {};
    profileSection.user = req.user.id;
    if (company) profileSection.company = company;
    if (website) profileSection.website = website;
    if (location) profileSection.location = location;
    if (bio) profileSection.bio = bio;
    if (githubusername) profileSection.githubusername = githubusername;
    if (status) profileSection.status = status;
    if (skills) {
      profileSection.skills = skills.split(",").map((skill) => skill.trim());
    }

    //Building experience section
    // profileSection.experience = {}
    // if (title) profileSection.experience.title = title
    // if (company) profileSection.experience.company = company
    // if (locataion) profileSection.experience.locataion = locataion
    // if (from) profileSection.experience.from = from
    // if (to) profileSection.experience.to = to

    profileSection.social = {};
    if (youtube) profileSection.social.youtube = youtube;
    if (twitter) profileSection.social.twitter = twitter;
    if (facebook) profileSection.social.facebook = facebook;
    if (instagram) profileSection.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileSection },
          { new: true }
        );
        return res.send(profile);
      }

      profile = new Profile(profileSection);
      profile.save();
      res.json(profile);
    } catch (err) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
]);

// Get All Profiles
// @route api/profiles

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["avatar", "name"]);
    if (profiles.length == 0) {
      return res
        .status(400)
        .json({ message: "There is no profiles available" });
    }
    res.status(400).json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error!");
  }
});

//get profile using profile id
//@route api/profiles/user/?profile_id

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile)
      return res
        .status(400)
        .json({ message: "There is no profile for this user" });
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

// Delete user and profile

router.delete("/", auth, async (req, res) => {
  try {
    //delete profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //delete user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ message: "User removed!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
});

//Adding experience section

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "from is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExperience);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error!");
    }
  }
);

//delete experience

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const indexRemove = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(indexRemove, 1);
    await profile.save();
    res.json({ message: "Experience removed!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error!");
  }
});

//adding Education section
router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required").not().isEmpty(),
      check("degree", "degree is required").not().isEmpty(),
      check("fieldofstudy", "field of study is required").not().isEmpty(),
      check("from", "from is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error!");
    }
  }
);

//delete education section
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const indexRemove = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(indexRemove, 1);
    await profile.save();
    res.status(500).json({ message: "Education removed" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error!");
  }
});

// Get github profile
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `http://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecretKey")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (errors, response, body) => {
      if (errors) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ message: "No github profile found" });
      }
      res.status(400).json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error!");
  }
});
module.exports = router;
