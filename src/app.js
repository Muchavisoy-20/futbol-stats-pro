const express = require('express');
const pool = require('./config/db');

const app = express();
app.use(express.json());

// Crear tabla si no existe en la nube
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        puntos INT DEFAULT 0,
        diferencia_goles INT DEFAULT 0
      );
    `);
    // Insertar datos de prueba si está vacía
    const result = await pool.query('SELECT COUNT(*) FROM equipos');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query("INSERT INTO equipos (nombre, puntos, diferencia_goles) VALUES ('ITP F.C.', 9, 5), ('Sistemas FC', 7, 3);");
    }
    console.log('✅ Tabla equipos verificada en PostgreSQL');
  } catch (error) {
    console.error('❌ Error creando tabla', error);
  }
};
initDB();

// Endpoint de Salud para Render (Health Check)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'UP', database: 'CONNECTED' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
});

// Obtener tabla de posiciones
app.get('/api/posiciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipos ORDER BY puntos DESC, diferencia_goles DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tabla de posiciones' });
  }
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  });
}

module.exports = app;