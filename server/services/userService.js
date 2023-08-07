const pool = require("../models/userModel");

const createUser = async (username, password, email) => {
  try {
    console.log("\n xxx", username, "\n");

    const result = await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *",
      [username, password, email]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create user");
  }
};
const loginUser = async (username, password) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];

    if (user && user.password === password) {
      // NOTE: in real applications, you should hash the password and compare hashed values.
      return user;
    } else {
      return null;
    }
  } catch (err) {
    console.error(err);
    throw new Error("Failed to authenticate user");
  }
};

const getAllUsernames = async () => {
  try {
    const result = await pool.query("SELECT username FROM users");
    return result.rows;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch usernames");
  }
};
const storePlayerRankings = async (rater_username, rankings) => {
  try {
    await pool.query("DELETE FROM player_rankings WHERE rater_username = $1", [
      rater_username,
    ]);

    for (let ranking of rankings) {
      const {
        username,
        skillLevel,
        scoringAbility,
        defensiveSkills,
        speedAndAgility,
        shootingRange,
        reboundSkills,
      } = ranking;
      await pool.query(
        "INSERT INTO player_rankings (rater_username, rated_username, skill_level, scoring_ability, defensive_skills, speed_and_agility, shooting_range, rebound_skills) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          rater_username,
          username,
          skillLevel,
          scoringAbility,
          defensiveSkills,
          speedAndAgility,
          shootingRange,
          reboundSkills,
        ]
      );
    }
  } catch (err) {
    console.error(err);
    throw new Error("Failed to store player rankings");
  }
};

const getPlayerRankings = async (username) => {
  try {
    const result = await pool.query(
      "SELECT * FROM player_rankings WHERE rater_username = $1",
      [username]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch player rankings");
  }
};

const getPlayerRankingsByRater = async (rater_username) => {
  try {
    const result = await pool.query(
      `SELECT u.username, pr.skill_level, pr.scoring_ability, pr.defensive_skills, pr.speed_and_agility, pr.shooting_range, pr.rebound_skills
       FROM users u
       LEFT JOIN player_rankings pr ON u.username = pr.rated_username AND pr.rater_username = $1`,
      [rater_username]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch player rankings");
  }
};

module.exports = {
  createUser,
  loginUser,
  getAllUsernames,
  storePlayerRankings,
  getPlayerRankings,
  getPlayerRankingsByRater,
};
