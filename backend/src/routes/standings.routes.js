const express = require('express');
const router = express.Router();
const { getStandings } = require('../controllers/standings.controller');

router.get('/', getStandings);

module.exports = router;