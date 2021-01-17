const express = require("express");
const route = express.Router();
const { check, validationResult } = require("express-validator");

//middleware
const auth = require("../../middleware/auth");

//models
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Posts = require("../../models/Posts");

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
    if (!post) {
      res.status(404).json({ message: "Post not found" });
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

route.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "No such post exist!" });
    }
    if (post.user.toString() !== req.user.id) {
      res
        .status(500)
        .json({ message: "No authorization to perform this action" });
    }
    await post.delete();
    res.json("Post deleted successfully!");
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(500).json({ message: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

route.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const userLiked =
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0;
    if (userLiked) {
      res.status(400).json({ message: "Post has been liked already." });
    }
    post.likes.unshift({ user: req.user.id });
    res.json("Post liked!");
    await post.save();
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

route.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const userLikes = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    ).length;
    if (userLikes === 0) {
      res.status(400).json({ message: "Post has not yet liked" });
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json("Post unliked");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

route.post(
  "/comment/:id",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(500).json({ message: errors.array() });
      }
      const user = await User.findById(req.user.id);
      const post = await Posts.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      return res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

route.delete("/comment/:id/:commentid", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const comment = post.comments.find(
      (comment) => comment.id === req.params.commentid
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment does not exist" });
    }
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "user not authorized to delete this comment" });
    }
    const removeIndex = post.comments
      .map((comment) => comment.id.toString())
      .indexOf(req.params.commentid);
    console.log(removeIndex);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
module.exports = route;
