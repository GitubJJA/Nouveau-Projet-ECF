import pool from '../config/dataBase.js';

// Requête de base pour récupérer les sites avec leur catégorie (jointure)
const selectBase = `SELECT s.id, s.nom, s.url, s.description, s.date_ajout, s.image, s.valide, c.nom AS categorie, s.id_utilisateur_1
  FROM sites s
  LEFT JOIN categories c ON s.id_categorie = c.id_categorie`;

// GET public: retourne uniquement les sites validés (visibles aux visiteurs)
export async function getAllSites(req, res, next) {
  try {
    const [rows] = await pool.query(`${selectBase} WHERE s.valide = 1 ORDER BY s.id ASC;`);
    res.json(rows);
  } catch (err) { next(err); }
}

// GET admin: retourne tous les sites (inclut les non validés pour modération)
export async function getAllSitesAdmin(req, res, next) {
  try {
    const [rows] = await pool.query(`${selectBase} ORDER BY s.id ASC;`);
    res.json(rows);
  } catch (err) { next(err); }
}

// GET by id: récupère un site précis ou renvoie 404 si introuvable
export async function getSiteById(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
  try {
    const [rows] = await pool.query('SELECT * FROM sites WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

// POST create: crée un nouveau site, assigne l'auteur et marque comme non validé (valide = 0)
export async function createSite(req, res, next) {
  try {
    const body = req.body || {};
    if (!req.user || !req.user.id_utilisateur) return res.status(401).json({ error: 'user_not_authenticated' });
    if (!body.date_ajout) body.date_ajout = new Date();
    body.id_utilisateur_1 = req.user.id_utilisateur;
    body.valide = 0;

    const allowed = ['nom','description','image','url','date_ajout','valide','id_categorie','id_utilisateur_1'];
    const fields = [];
    const placeholders = [];
    const values = [];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(body,key)) { fields.push(key); placeholders.push('?'); values.push(body[key]); }
    if (fields.length === 0) return res.status(400).json({ error: 'no_fields' });

    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM utilisateurs WHERE id_utilisateur = ?', [body.id_utilisateur_1]);
    if (rows[0].count === 0) return res.status(400).json({ error: 'invalid_user' });

    const sql = `INSERT INTO sites (${fields.join(',')}) VALUES (${placeholders.join(',')})`;
    const [result] = await pool.query(sql, values);
    const insertId = result.insertId;
    const [siteRows] = await pool.query('SELECT * FROM sites WHERE id = ?', [insertId]);
    res.status(201).json(siteRows[0]);
  } catch (err) { next(err); }
}

// PATCH partial update: met à jour uniquement les champs fournis
// Valide l'utilisateur si on tente de changer l'auteur (id_utilisateur_1)
export async function patchSite(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
  try {
    if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
    const [existing] = await pool.query('SELECT id_utilisateur_1 FROM sites WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'not_found' });
    const isAdmin = req.user.Id_Role === 1;
    if (!isAdmin && req.user.id_utilisateur !== existing[0].id_utilisateur_1) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const body = req.body || {};
    const ownerAllowed = ['nom', 'description', 'image', 'url', 'date_ajout', 'id_categorie'];
    const allowed = isAdmin ? [...ownerAllowed, 'valide', 'id_utilisateur_1'] : ownerAllowed;
    const fields = [];
    const values = [];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(body,key)) { fields.push(`${key} = ?`); values.push(body[key]); }
    if (fields.length === 0) return res.status(400).json({ error: 'no_fields' });
    if (body.id_utilisateur_1) {
      const [rows] = await pool.query('SELECT COUNT(*) AS count FROM utilisateurs WHERE id_utilisateur = ?', [body.id_utilisateur_1]);
      if (rows[0].count === 0) return res.status(400).json({ error: 'invalid_user' });
    }
    const sql = `UPDATE sites SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    await pool.query(sql, values);
    const [updatedRows] = await pool.query('SELECT * FROM sites WHERE id = ?', [id]);
    if (updatedRows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(updatedRows[0]);
  } catch (err) { next(err); }
}

// PUT update: met à jour les champs fournis (contrôle propriétaire/admin)
// Seul le propriétaire ou un administrateur peut modifier le site
export async function updateSite(req, res, next) {
  const siteId = Number(req.params.id);
  if (!Number.isFinite(siteId)) return res.status(400).json({ error: 'invalid_id' });
  const { nom, url, description, date_ajout, image, valide, id_categorie, id_utilisateur_1 } = req.body;
  const fields = []; const values = [];
  if (nom !== undefined) { fields.push('nom = ?'); values.push(nom); }
  if (url !== undefined) { fields.push('url = ?'); values.push(url); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (date_ajout !== undefined) { fields.push('date_ajout = ?'); values.push(date_ajout); }
  if (image !== undefined) { fields.push('image = ?'); values.push(image); }
  if (id_categorie !== undefined) { fields.push('id_categorie = ?'); values.push(id_categorie); }
  try {
    if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
    const [existing] = await pool.query('SELECT id_utilisateur_1 FROM sites WHERE id = ?', [siteId]);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Site non trouvé' });
    const ownerId = existing[0].id_utilisateur_1;
    const isAdmin = req.user.Id_Role === 1;
    if (!isAdmin && req.user.id_utilisateur !== ownerId) return res.status(403).json({ error: 'forbidden' });
    if (isAdmin && valide !== undefined) { fields.push('valide = ?'); values.push(valide); }
    if (isAdmin && id_utilisateur_1 !== undefined) { fields.push('id_utilisateur_1 = ?'); values.push(id_utilisateur_1); }
    if (fields.length === 0) return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    values.push(siteId);
    const [result] = await pool.query(`UPDATE sites SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Site non trouvé' });
    const [updatedSite] = await pool.query('SELECT * FROM sites WHERE id = ?', [siteId]);
    res.status(200).json(updatedSite[0]);
  } catch (err) { next(err); }
}

// PUT validate: action admin qui marque un site comme validé (visible publiquement)
export async function validateSite(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
  try {
    // DELETE: seul le propriétaire ou un admin peut supprimer
    if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
    const [result] = await pool.query('UPDATE sites SET valide = 1 WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    const [rows] = await pool.query('SELECT * FROM sites WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
}

export async function deleteSite(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
  try {
    if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
    const [existing] = await pool.query('SELECT id_utilisateur_1 FROM sites WHERE id = ?', [id]);
    if (!existing || existing.length === 0) return res.status(404).json({ error: 'not_found' });
    const ownerId = existing[0].id_utilisateur_1;
    const isAdmin = req.user.Id_Role === 1;
    if (!isAdmin && req.user.id_utilisateur !== ownerId) return res.status(403).json({ error: 'forbidden' });
    const [result] = await pool.query('DELETE FROM sites WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    res.status(204).send();
  } catch (err) { next(err); }
}

export default { getAllSites, getAllSitesAdmin, getSiteById, createSite, patchSite, updateSite, validateSite, deleteSite };
