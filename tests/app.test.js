const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS equipos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      puntos INT DEFAULT 0,
      diferencia_goles INT DEFAULT 0
    );
  `);
  await pool.query("INSERT INTO equipos (nombre, puntos, diferencia_goles) VALUES ('ITP F.C.', 9, 5) ON CONFLICT DO NOTHING;");
});

afterAll(async () => {
  await pool.query('DROP TABLE IF EXISTS equipos;');
  await pool.end();
});

describe('GET /api/posiciones', () => {
  it('Debería retornar la lista de equipos ordenada por puntos', async () => {
    
    // ❌ ERROR 2 (DEVOPS/VARIABLES): La prueba va a fallar en la terminal de GitHub Actions 
    // porque espera que el entorno sea estrictamente de test ('test'). Si el archivo
    // del workflow no inyecta "NODE_ENV: test", esta validación fallará rompiendo el pipeline.
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Seguridad: No se pueden correr pruebas en un entorno que no sea de TEST.');
    }

    const res = await request(app).get('/api/posiciones');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].nombre).toBe('ITP F.C.');
  });
});