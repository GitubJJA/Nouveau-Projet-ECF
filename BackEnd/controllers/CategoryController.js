// BackEnd/controllers/categoryController.js
import pool from '../config/dataBase.js';

// GET /api/categories -> liste toutes les catégories
export async function getAllCategories(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id_categorie, nom, description FROM categories ORDER BY id_categorie ASC'
    );
    res.json(rows);
  } catch (error) {
    next(error); // passe l’erreur au middleware global
  }
}
