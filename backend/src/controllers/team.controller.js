const { getDB } = require('../db/connection');

// GET /api/teams
const getAllTeams = (req, res) => {
  try {
    const db = getDB();
    const teams = db.prepare(`
      SELECT 
        t.*,
        COUNT(p.id) as total_players
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      GROUP BY t.id
      ORDER BY t.name ASC
    `).all();

    res.json({ data: teams, total: teams.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/teams/:id
const getTeamById = (req, res) => {
  try {
    const db = getDB();
    const team = db.prepare(`
      SELECT 
        t.*,
        COUNT(p.id) as total_players
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      WHERE t.id = ?
      GROUP BY t.id
    `).get(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json({ data: team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/teams
const createTeam = (req, res) => {
  try {
    const { name, city, stadium } = req.body;

    // Validaciones
    if (!name || !city || !stadium) {
      return res.status(400).json({
        error: 'Los campos name, city y stadium son obligatorios'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        error: 'El nombre del equipo debe tener al menos 2 caracteres'
      });
    }

    const db = getDB();

    const result = db.prepare(`
      INSERT INTO teams (name, city, stadium)
      VALUES (?, ?, ?)
    `).run(name.trim(), city.trim(), stadium.trim());

    const newTeam = db.prepare('SELECT * FROM teams WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Equipo creado exitosamente',
      data: newTeam
    });
  } catch (error) {
    // Error de nombre duplicado
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        error: `Ya existe un equipo con el nombre "${req.body.name}"`
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/teams/:id
const updateTeam = (req, res) => {
  try {
    const { name, city, stadium } = req.body;
    const { id } = req.params;

    if (!name || !city || !stadium) {
      return res.status(400).json({
        error: 'Los campos name, city y stadium son obligatorios'
      });
    }

    const db = getDB();

    // Verificar que existe
    const existing = db.prepare('SELECT id FROM teams WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    db.prepare(`
      UPDATE teams SET name = ?, city = ?, stadium = ?
      WHERE id = ?
    `).run(name.trim(), city.trim(), stadium.trim(), id);

    const updated = db.prepare('SELECT * FROM teams WHERE id = ?').get(id);

    res.json({
      message: 'Equipo actualizado exitosamente',
      data: updated
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        error: `Ya existe un equipo con el nombre "${req.body.name}"`
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/teams/:id
const deleteTeam = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // Verificar que existe
    const existing = db.prepare('SELECT id FROM teams WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Regla de negocio: no eliminar si tiene jugadores
    const players = db.prepare(
      'SELECT COUNT(*) as total FROM players WHERE team_id = ?'
    ).get(id);

    if (players.total > 0) {
      return res.status(409).json({
        error: `No se puede eliminar. El equipo tiene ${players.total} jugador(es) activo(s)`
      });
    }

    db.prepare('DELETE FROM teams WHERE id = ?').run(id);

    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};