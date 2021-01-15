const express = require("express");
const route = express.Router();
const {
  check,
  validationReport,
  validationResult,
} = require("express-validator");

//middleware
const auth = require("../../middleware/auth");

//models
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Posts = require("../../models/Posts");
const router = require("./auth");

// @route GET api/posts
route.post(
  "/",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Posts({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      });

      await newPost.save();
      res.json(newPost);
    } catch (error) {
      console.error(error.message);
      res.status(500).json("Server error");
    }
  }
);

route.get("/", auth, async (req, res) => {
  try {
    const posts = await Posts.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

route.get("/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post){
      res.status(404).json({message: "Post not found"})
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      res.status(500).json({ message: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

route.delete('/:id',auth, async(req,res)=>{
  try {
    const post = await Posts.findById(req.params.id)
    if (!post){
      return res.status(404).json({message: "No such post exist!"})
    }
    if (post.user.toString()!==req.user.id){
      res.status(500).json({message: "No authorization to perform this action"})
    }
    await post.delete()
    res.json("Post deleted successfully!")
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(500).json({ message: "Post not found" });
    }
    res.status(500).send("Server error");
  }
})
module.exports = route;
