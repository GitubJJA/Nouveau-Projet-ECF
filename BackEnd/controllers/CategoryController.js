// Contrôleur des catégories
import pool from '../config/dataBase.js';

// GET /api/categories : liste toutes les catégories (lecture publique)
export async function getAllCategories(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id_categorie, nom, description FROM categories ORDER BY id_categorie ASC'
    );
    res.json(rows);
  } catch (error) {
    next(error); // transmet l'erreur au gestionnaire global
  }
}

// POST /api/categories : crée une nouvelle catégorie (admin uniquement)
// Vérifie les champs requis puis insère en base
export async function createCategory(req, res, next) {
  try {
    const { nom, description } = req.body || {};
    if (!nom) return res.status(400).json({ error: 'missing_fields' });

    const [result] = await pool.query(
      'INSERT INTO categories (nom, description) VALUES (?, ?)',
      [nom, description || null]
    );

    const insertId = result.insertId;
    const [rows] = await pool.query('SELECT id_categorie, nom, description FROM categories WHERE id_categorie = ?', [insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/categories/:id : met à jour une catégorie (admin uniquement)
// Met à jour seulement les champs fournis
export async function updateCategory(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
  try {
    const { nom, description } = req.body || {};
    const sets = [];
    const values = [];
    if (nom !== undefined) { sets.push('nom = ?'); values.push(nom); }
    if (description !== undefined) { sets.push('description = ?'); values.push(description); }
    if (sets.length === 0) return res.status(400).json({ error: 'no_fields' });

    values.push(id);
    const sql = `UPDATE categories SET ${sets.join(', ')} WHERE id_categorie = ?`;
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });

    const [rows] = await pool.query('SELECT id_categorie, nom, description FROM categories WHERE id_categorie = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/categories/:id : supprime une catégorie (admin uniquement)
// Retourne 204 si suppression OK
export async function deleteCategory(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id_categorie = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export default { getAllCategories, createCategory, updateCategory, deleteCategory };
