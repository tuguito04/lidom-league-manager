const express = require('express');
const router = express.Router();
const { getDB } = require('../db/connection');

// GET /api/health
router.get('/', (req, res) => {
  try {
    const db = getDB();

    // Consulta real a la DB para confirmar que todo funciona
    const result = db.prepare("SELECT datetime('now') as server_time").get();

    res.json({
      status: 'ok',
      message: '⚾ LIDOM API funcionando correctamente',
      server_time: result.server_time,
      database: 'conectada'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error conectando a la base de datos',
      detail: error.message
    });
  }
});

module.exports = router;