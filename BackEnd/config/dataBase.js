import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// charge les variables d'environnement du dossier BackEnd/config
dotenv.config();

const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || undefined,
	waitForConnections: true,
	connectionLimit: 10,
	namedPlaceholders: true,
});

/**
 * Test connection to DB by acquiring a connection and running a simple query
 */
// Test de la connexion (dans une fonction asynchrone)
(async () => {
    try {
      const connection = await pool.getConnection();
      console.log(' Connexion MySQL réussie');
      connection.release();
    } catch (err) {
      console.error(' Erreur de connexion MySQL :', err);
    }
  })();

export default pool;
