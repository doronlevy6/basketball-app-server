CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS player_rankings (
    rater_username VARCHAR(255) NOT NULL,
    rated_username VARCHAR(255) NOT NULL,
    skill_level INTEGER,
    scoring_ability INTEGER,
    defensive_skills INTEGER,
    speed_and_agility INTEGER,
    shooting_range INTEGER,
    rebound_skills INTEGER,
    FOREIGN KEY (rater_username) REFERENCES users (username),
    FOREIGN KEY (rated_username) REFERENCES users (username),
    PRIMARY KEY (rater_username, rated_username)
);

CREATE TABLE IF NOT EXISTS next_game_enlistment (
    username VARCHAR(255) PRIMARY KEY,
    enlistment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users (username)
);

CREATE TABLE IF NOT EXISTS game_teams (
    game_id SERIAL PRIMARY KEY,
    teams JSON NOT NULL
);
