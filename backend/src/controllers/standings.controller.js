const { getDB } = require('../db/connection');

// GET /api/standings
const getStandings = (req, res) => {
  try {
    const db = getDB();

    const standings = db.prepare(`
      SELECT
        t.id,
        t.name,
        t.city,

        -- Juegos jugados
        COUNT(g.id) as games_played,

        -- Juegos ganados
        SUM(CASE
          WHEN g.home_team_id = t.id AND g.home_score > g.away_score THEN 1
          WHEN g.away_team_id = t.id AND g.away_score > g.home_score THEN 1
          ELSE 0
        END) as wins,

        -- Juegos perdidos
        SUM(CASE
          WHEN g.home_team_id = t.id AND g.home_score < g.away_score THEN 1
          WHEN g.away_team_id = t.id AND g.away_score < g.home_score THEN 1
          ELSE 0
        END) as losses,

        -- Carreras anotadas
        SUM(CASE
          WHEN g.home_team_id = t.id THEN g.home_score
          WHEN g.away_team_id = t.id THEN g.away_score
          ELSE 0
        END) as runs_scored,

        -- Carreras permitidas
        SUM(CASE
          WHEN g.home_team_id = t.id THEN g.away_score
          WHEN g.away_team_id = t.id THEN g.home_score
          ELSE 0
        END) as runs_allowed,

        -- Diferencia de carreras
        SUM(CASE
          WHEN g.home_team_id = t.id THEN g.home_score - g.away_score
          WHEN g.away_team_id = t.id THEN g.away_score - g.home_score
          ELSE 0
        END) as run_diff,

        -- Porcentaje de victorias (PCT)
        CASE
          WHEN COUNT(g.id) = 0 THEN 0.000
          ELSE ROUND(
            CAST(SUM(CASE
              WHEN g.home_team_id = t.id AND g.home_score > g.away_score THEN 1
              WHEN g.away_team_id = t.id AND g.away_score > g.home_score THEN 1
              ELSE 0
            END) AS FLOAT) / COUNT(g.id), 3
          )
        END as pct

      FROM teams t
      LEFT JOIN games g ON (g.home_team_id = t.id OR g.away_team_id = t.id)
                        AND g.status = 'finalizado'
      GROUP BY t.id, t.name, t.city
      ORDER BY pct DESC, wins DESC, run_diff DESC
    `).all();

    res.json({ data: standings, total: standings.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getStandings };