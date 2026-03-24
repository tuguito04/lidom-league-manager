const { getDB } = require('../db/connection');

// Posiciones válidas en béisbol
const VALID_POSITIONS = [
  'P',   // Pitcher
  'C',   // Catcher
  '1B',  // Primera base
  '2B',  // Segunda base
  '3B',  // Tercera base
  'SS',  // Shortstop
  'LF',  // Left field
  'CF',  // Center field
  'RF',  // Right field
  'DH'   // Designated hitter
];

// GET /api/players
const getAllPlayers = (req, res) => {
  try {
    const db = getDB();
    const { team_id } = req.query; // filtro opcional ?team_id=1

    let query = `
      SELECT 
        p.*,
        t.name as team_name,
        t.city as team_city,
        CASE 
          WHEN p.at_bats = 0 THEN 0.000
          ELSE ROUND(CAST(p.hits AS FLOAT) / p.at_bats, 3)
        END as batting_average
      FROM players p
      INNER JOIN teams t ON t.id = p.team_id
    `;

    const params = [];

    if (team_id) {
      query += ' WHERE p.team_id = ?';
      params.push(team_id);
    }

    query += ' ORDER BY t.name ASC, p.name ASC';

    const players = db.prepare(query).all(...params);

    res.json({ data: players, total: players.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/players/:id
const getPlayerById = (req, res) => {
  try {
    const db = getDB();

    const player = db.prepare(`
      SELECT 
        p.*,
        t.name as team_name,
        t.city as team_city,
        CASE 
          WHEN p.at_bats = 0 THEN 0.000
          ELSE ROUND(CAST(p.hits AS FLOAT) / p.at_bats, 3)
        END as batting_average
      FROM players p
      INNER JOIN teams t ON t.id = p.team_id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    res.json({ data: player });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/players
const createPlayer = (req, res) => {
  try {
    const { name, position, team_id, games_played, at_bats, hits, runs } = req.body;
    const db = getDB();

    // Validaciones obligatorias
    if (!name || !position || !team_id) {
      return res.status(400).json({
        error: 'Los campos name, position y team_id son obligatorios'
      });
    }

    if (!VALID_POSITIONS.includes(position.toUpperCase())) {
      return res.status(400).json({
        error: `Posición inválida. Posiciones válidas: ${VALID_POSITIONS.join(', ')}`
      });
    }

    // Validar que el equipo existe
    const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(team_id);
    if (!team) {
      return res.status(404).json({ error: 'El equipo especificado no existe' });
    }

    // Validar estadísticas — no pueden ser negativas
    const stats = { games_played, at_bats, hits, runs };
    for (const [key, value] of Object.entries(stats)) {
      if (value !== undefined && value !== null && value < 0) {
        return res.status(400).json({
          error: `El campo ${key} no puede ser negativo`
        });
      }
    }

    // Hits no pueden ser mayor que at_bats
    if (at_bats && hits > at_bats) {
      return res.status(400).json({
        error: 'Los hits no pueden ser mayor que los turnos al bate (at_bats)'
      });
    }

    const result = db.prepare(`
      INSERT INTO players (name, position, team_id, games_played, at_bats, hits, runs)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      position.toUpperCase(),
      team_id,
      games_played || 0,
      at_bats      || 0,
      hits         || 0,
      runs         || 0
    );

    const newPlayer = db.prepare(`
      SELECT 
        p.*,
        t.name as team_name,
        CASE 
          WHEN p.at_bats = 0 THEN 0.000
          ELSE ROUND(CAST(p.hits AS FLOAT) / p.at_bats, 3)
        END as batting_average
      FROM players p
      INNER JOIN teams t ON t.id = p.team_id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Jugador creado exitosamente',
      data: newPlayer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/players/:id
const updatePlayer = (req, res) => {
  try {
    const { name, position, team_id, games_played, at_bats, hits, runs } = req.body;
    const { id } = req.params;
    const db = getDB();

    // Verificar que existe
    const existing = db.prepare('SELECT id FROM players WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    if (!name || !position || !team_id) {
      return res.status(400).json({
        error: 'Los campos name, position y team_id son obligatorios'
      });
    }

    if (!VALID_POSITIONS.includes(position.toUpperCase())) {
      return res.status(400).json({
        error: `Posición inválida. Posiciones válidas: ${VALID_POSITIONS.join(', ')}`
      });
    }

    const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(team_id);
    if (!team) {
      return res.status(404).json({ error: 'El equipo especificado no existe' });
    }

    if (hits > at_bats) {
      return res.status(400).json({
        error: 'Los hits no pueden ser mayor que los turnos al bate (at_bats)'
      });
    }

    db.prepare(`
      UPDATE players 
      SET name = ?, position = ?, team_id = ?,
          games_played = ?, at_bats = ?, hits = ?, runs = ?
      WHERE id = ?
    `).run(
      name.trim(),
      position.toUpperCase(),
      team_id,
      games_played || 0,
      at_bats      || 0,
      hits         || 0,
      runs         || 0,
      id
    );

    const updated = db.prepare(`
      SELECT 
        p.*,
        t.name as team_name,
        CASE 
          WHEN p.at_bats = 0 THEN 0.000
          ELSE ROUND(CAST(p.hits AS FLOAT) / p.at_bats, 3)
        END as batting_average
      FROM players p
      INNER JOIN teams t ON t.id = p.team_id
      WHERE p.id = ?
    `).get(id);

    res.json({
      message: 'Jugador actualizado exitosamente',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/players/:id
const deletePlayer = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM players WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    db.prepare('DELETE FROM players WHERE id = ?').run(id);

    res.json({ message: 'Jugador eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
};