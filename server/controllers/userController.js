const express = require("express");
const router = express.Router();
const userService = require("../services/userService");

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
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
      res.status(200).json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/usernames", async (req, res) => {
  try {
    const usernames = await userService.getAllUsernames();

    res
      .status(200)
      .json({ success: true, usernames: usernames.map((u) => u.username) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/rankings", async (req, res) => {
  const { rater_username, rankings } = req.body;
  try {
    await userService.storePlayerRankings(rater_username, rankings);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/all-rankings/:rater_username", async (req, res) => {
  const { rater_username } = req.params;
  try {
    const rankings = await userService.getPlayerRankingsByRater(rater_username);
    res.status(200).json({ success: true, rankings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/rankings/:username", async (req, res) => {
  const { username } = req.params;
  console.log("\n req.params", req.params, "\n");

  try {
    const rankings = await userService.getPlayerRankings(username);
    console.log("\n rankings1", rankings, "\n");

    res.status(200).json({ success: true, rankings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/get-teams", async (req, res) => {
  try {
    const teams = await userService.getBalancedTeams();
    console.log("\n teams", teams, "\n");

    res.status(200).json({ success: true, teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
