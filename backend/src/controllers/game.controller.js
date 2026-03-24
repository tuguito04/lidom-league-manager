const { getDB } = require('../db/connection');

const VALID_STATUSES = ['pendiente', 'en_curso', 'finalizado'];

// GET /api/games
const getAllGames = (req, res) => {
  try {
    const db = getDB();
    const { status, team_id } = req.query;

    let query = `
      SELECT 
        g.*,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM games g
      INNER JOIN teams ht ON ht.id = g.home_team_id
      INNER JOIN teams at ON at.id = g.away_team_id
    `;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('g.status = ?');
      params.push(status);
    }

    if (team_id) {
      conditions.push('(g.home_team_id = ? OR g.away_team_id = ?)');
      params.push(team_id, team_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY g.game_date DESC';

    const games = db.prepare(query).all(...params);

    res.json({ data: games, total: games.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/games/:id
const getGameById = (req, res) => {
  try {
    const db = getDB();

    const game = db.prepare(`
      SELECT 
        g.*,
        ht.name as home_team_name,
        ht.city as home_team_city,
        at.name as away_team_name,
        at.city as away_team_city
      FROM games g
      INNER JOIN teams ht ON ht.id = g.home_team_id
      INNER JOIN teams at ON at.id = g.away_team_id
      WHERE g.id = ?
    `).get(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json({ data: game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/games
const createGame = (req, res) => {
  try {
    const { home_team_id, away_team_id, game_date } = req.body;
    const db = getDB();

    // Validaciones
    if (!home_team_id || !away_team_id || !game_date) {
      return res.status(400).json({
        error: 'Los campos home_team_id, away_team_id y game_date son obligatorios'
      });
    }

    if (home_team_id === away_team_id) {
      return res.status(400).json({
        error: 'El equipo local y visitante no pueden ser el mismo'
      });
    }

    // Verificar que ambos equipos existen
    const homeTeam = db.prepare('SELECT id FROM teams WHERE id = ?').get(home_team_id);
    const awayTeam = db.prepare('SELECT id FROM teams WHERE id = ?').get(away_team_id);

    if (!homeTeam) {
      return res.status(404).json({ error: 'El equipo local no existe' });
    }
    if (!awayTeam) {
      return res.status(404).json({ error: 'El equipo visitante no existe' });
    }

    const result = db.prepare(`
      INSERT INTO games (home_team_id, away_team_id, game_date, status)
      VALUES (?, ?, ?, 'pendiente')
    `).run(home_team_id, away_team_id, game_date);

    const newGame = db.prepare(`
      SELECT 
        g.*,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM games g
      INNER JOIN teams ht ON ht.id = g.home_team_id
      INNER JOIN teams at ON at.id = g.away_team_id
      WHERE g.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Juego creado exitosamente',
      data: newGame
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/games/:id/status
const updateGameStatus = (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const db = getDB();

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Estado inválido. Estados válidos: ${VALID_STATUSES.join(', ')}`
      });
    }

    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    // No se puede retroceder un juego finalizado
    if (game.status === 'finalizado' && status !== 'finalizado') {
      return res.status(409).json({
        error: 'No se puede cambiar el estado de un juego ya finalizado'
      });
    }

    db.prepare('UPDATE games SET status = ? WHERE id = ?').run(status, id);

    const updated = db.prepare(`
      SELECT g.*, ht.name as home_team_name, at.name as away_team_name
      FROM games g
      INNER JOIN teams ht ON ht.id = g.home_team_id
      INNER JOIN teams at ON at.id = g.away_team_id
      WHERE g.id = ?
    `).get(id);

    res.json({
      message: 'Estado actualizado exitosamente',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/games/:id/score
const updateGameScore = (req, res) => {
  try {
    const { home_score, away_score } = req.body;
    const { id } = req.params;
    const db = getDB();

    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({
        error: 'Los campos home_score y away_score son obligatorios'
      });
    }

    if (home_score < 0 || away_score < 0) {
      return res.status(400).json({
        error: 'Los marcadores no pueden ser negativos'
      });
    }

    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    if (game.status === 'pendiente') {
      return res.status(409).json({
        error: 'No se puede registrar marcador de un juego pendiente. Cambia el estado a en_curso primero'
      });
    }

    db.prepare(`
      UPDATE games SET home_score = ?, away_score = ?, status = 'finalizado'
      WHERE id = ?
    `).run(home_score, away_score, id);

    const updated = db.prepare(`
      SELECT g.*, ht.name as home_team_name, at.name as away_team_name
      FROM games g
      INNER JOIN teams ht ON ht.id = g.home_team_id
      INNER JOIN teams at ON at.id = g.away_team_id
      WHERE g.id = ?
    `).get(id);

    res.json({
      message: 'Marcador registrado exitosamente',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/games/:id
const deleteGame = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    // No se puede eliminar un juego finalizado
    if (game.status === 'finalizado') {
      return res.status(409).json({
        error: 'No se puede eliminar un juego finalizado. Los resultados afectan los standings'
      });
    }

    db.prepare('DELETE FROM games WHERE id = ?').run(id);

    res.json({ message: 'Juego eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllGames,
  getGameById,
  createGame,
  updateGameStatus,
  updateGameScore,
  deleteGame
};