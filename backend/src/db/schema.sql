CREATE TABLE IF NOT EXISTS teams (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT    NOT NULL UNIQUE,
  city      TEXT    NOT NULL,
  stadium   TEXT    NOT NULL,
  created_at TEXT   DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS players (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  position     TEXT    NOT NULL,
  team_id      INTEGER NOT NULL,
  games_played INTEGER DEFAULT 0,
  at_bats      INTEGER DEFAULT 0,
  hits         INTEGER DEFAULT 0,
  runs         INTEGER DEFAULT 0,
  created_at   TEXT    DEFAULT (datetime('now')),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS games (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  home_score   INTEGER DEFAULT 0,
  away_score   INTEGER DEFAULT 0,
  game_date    TEXT    NOT NULL,
  status       TEXT    DEFAULT 'pendiente',
  created_at   TEXT    DEFAULT (datetime('now')),
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id),
  CHECK (home_team_id != away_team_id),
  CHECK (status IN ('pendiente', 'en_curso', 'finalizado'))
);