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

module.exports = {
  createUser,
  loginUser,
};
