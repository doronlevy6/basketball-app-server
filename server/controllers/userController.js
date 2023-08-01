const express = require("express");
const router = express.Router();
const userService = require("../services/userService");

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    console.log("\n  req.body", req.body, "\n");

    const user = await userService.createUser(username, password, email);
    res.status(201).json({ success: true, user: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userService.loginUser(username, password);
    if (user) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
