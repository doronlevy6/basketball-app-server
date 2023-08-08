const pool = require("../models/userModel");

const createUser = async (username, password, email) => {
  try {
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
const getBalancedTeams = async () => {
  try {
    // Fetch all players and their rankings
    const result = await pool.query(
      `SELECT u.username, AVG(pr.skill_level) as skill_level,
       AVG(pr.scoring_ability) as scoring_ability, AVG(pr.defensive_skills) as defensive_skills,
        AVG(pr.speed_and_agility) as speed_and_agility, AVG(pr.shooting_range) as shooting_range,
         AVG(pr.rebound_skills) as rebound_skills
       FROM users u
       LEFT JOIN player_rankings pr ON u.username = pr.rated_username
       GROUP BY u.username`
    );
    const players = result.rows;

    // Filter out players with null parameters
    const validPlayers = players.filter(
      (player) =>
        player.skill_level != null &&
        player.scoring_ability != null &&
        player.defensive_skills != null &&
        player.speed_and_agility != null &&
        player.shooting_range != null &&
        player.rebound_skills != null
    );

    // Sort the valid players by total ranking
    validPlayers.sort(
      (a, b) => computeTotalRanking(b) - computeTotalRanking(a)
    );

    // Take the first 12 players
    const top12Players = validPlayers.slice(0, 12);
    const distributedTeams = distributePlayers(top12Players);
    // Distribute the valid players to the teams
    return distributePlayers(top12Players);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch teams");
  }
};

function computeTotalRanking(player) {
  return (
    Number(player.skill_level) +
    Number(player.scoring_ability) +
    Number(player.defensive_skills) +
    Number(player.speed_and_agility) +
    Number(player.shooting_range) +
    Number(player.rebound_skills)
  );
}

function distributePlayers(players) {
  const numTeams = players.length === 12 ? 3 : 2; // If there are 12 players, create 3 teams; otherwise, create 2 teams
  const teams = Array.from({ length: numTeams }, () => []);

  // Calculate the average of each attribute across all players
  const averages = {
    skill_level: 0,
    scoring_ability: 0,
    defensive_skills: 0,
    speed_and_agility: 0,
    shooting_range: 0,
    rebound_skills: 0,
  };
  for (const player of players) {
    for (const attr in averages) {
      averages[attr] += Number(player[attr]);
    }
  }
  for (const attr in averages) {
    averages[attr] /= players.length;
  }

  // Function to calculate a team's total score in an attribute
  const teamScore = (team, attr) =>
    team.reduce((score, player) => score + Number(player[attr]), 0);

  // Distribute players to the teams that most need them
  for (const player of players) {
    // Find the attribute that this player is strongest in
    let strongestAttr = "skill_level";
    let strongestVal = player.skill_level;
    for (const attr in averages) {
      if (player[attr] > strongestVal) {
        strongestAttr = attr;
        strongestVal = player[attr];
      }
    }

    // Find the team that is furthest below the average in this attribute and has fewer than 4 players
    let bestTeamIndex = -1;
    let bestTeamScore = Infinity;
    for (let i = 0; i < numTeams; i++) {
      const score = teamScore(teams[i], strongestAttr);
      if (teams[i].length < 4 && score < bestTeamScore) {
        bestTeamIndex = i;
        bestTeamScore = score;
      }
    }

    if (bestTeamIndex >= 0) {
      teams[bestTeamIndex].push(player);
    } else {
      // Handle any remaining players here
      console.log("No suitable team found for player", player.username);
    }
  }
  return teams;
}

module.exports = {
  createUser,
  loginUser,
  getAllUsernames,
  storePlayerRankings,
  getPlayerRankings,
  getPlayerRankingsByRater,
  getBalancedTeams,
};
