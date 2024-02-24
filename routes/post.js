const { publicPosts, privatePosts } = require("../db/Post");
const path = require("path");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const checkJWT = require("../middleware/checkJWT");

// Everyone can read
router.get("/public", (req, res) => {
  res.json(publicPosts);
});

// JWT User Only
router.get("/private", checkJWT, (req, res) => {
  res.json(privatePosts);
});

module.exports = router;
