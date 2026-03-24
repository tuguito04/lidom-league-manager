const express = require('express');
const router = express.Router();
const {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
} = require('../controllers/player.controller');

router.get('/',       getAllPlayers);   // GET /api/players?team_id=1
router.get('/:id',    getPlayerById);
router.post('/',      createPlayer);
router.put('/:id',    updatePlayer);
router.delete('/:id', deletePlayer);

module.exports = router;