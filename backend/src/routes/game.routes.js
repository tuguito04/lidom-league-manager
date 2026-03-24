const express = require('express');
const router = express.Router();
const {
  getAllGames,
  getGameById,
  createGame,
  updateGameStatus,
  updateGameScore,
  deleteGame
} = require('../controllers/game.controller');

router.get('/',            getAllGames);
router.get('/:id',         getGameById);
router.post('/',           createGame);
router.put('/:id/status',  updateGameStatus);
router.put('/:id/score',   updateGameScore);
router.delete('/:id',      deleteGame);

module.exports = router;