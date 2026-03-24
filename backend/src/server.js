const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const healthRoutes = require('./routes/health.routes');
const teamRoutes = require('./routes/team.routes'); 

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ──────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Puerto de Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ── Rutas ────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/teams', teamRoutes);

// Ruta fallback para endpoints no encontrados
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.originalUrl} no encontrada` });
});

// ── Error handler global ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Iniciar servidor ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});