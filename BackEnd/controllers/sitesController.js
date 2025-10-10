import pool from '../config/dataBase.js';

// GET /api/sites -> tous les sites
export async function getAllSites(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT s.id, s.nom, s.url,s.description, s.date_ajout, s.image, s.valide, c.nom AS categorie,  s.id_utilisateur_1 FROM sites s LEFT JOIN categories c ON s.id_categorie = c.id_categorie ORDER BY s.id ASC;');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/sites/:id -> site par ID
export async function getSiteById(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
  try {
    const [rows] = await pool.query('SELECT * FROM sites WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/sites -> créer un site
export async function createSite(req, res, next) {
  try {
    const body = req.body || {};

    // Vérifie que l'utilisateur est connecté via le middleware authenticate
    if (!req.user || !req.user.id_utilisateur) {
      return res.status(401).json({ error: "user_not_authenticated" });
    }

    // Auto-remplit la date si elle n'est pas fournie
    if (!body.date_ajout) {
      body.date_ajout = new Date(); // date actuelle
    }

    // On prend l'id de l'utilisateur connecté
    body.id_utilisateur_1 = req.user.id_utilisateur;
    

    // Champs autorisés
    const allowed = ['nom', 'description', 'image', 'url', 'date_ajout', 'valide', 'id_categorie', 'id_utilisateur_1'];
    const fields = [];
    const placeholders = [];
    const values = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        fields.push(key);
        placeholders.push('?');
        values.push(body[key]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'no_fields' });
    }

    // Vérification FK id_utilisateur_1 (doit exister dans la table utilisateurs)
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM utilisateurs WHERE id_utilisateur = ?',
      [body.id_utilisateur_1]
    );
    if (rows[0].count === 0) {
      return res.status(400).json({ error: 'invalid_user' });
    }

    // Insertion dans la table sites
    const sql = `INSERT INTO sites (${fields.join(',')}) VALUES (${placeholders.join(',')})`;
    const [result] = await pool.query(sql, values);

    // Récupère le site inséré pour le renvoyer
    const insertId = result.insertId;
    const [siteRows] = await pool.query('SELECT * FROM sites WHERE id = ?', [insertId]);

    res.status(201).json(siteRows[0]);
  } catch (err) {
    next(err);
  }
}



// PATCH /api/sites/:id
export async function patchSite(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });

  try {
    const body = req.body || {};
    const allowed = ['nom', 'description', 'image', 'url', 'date_ajout', 'valide', 'id_categorie', 'id_utilisateur_1'];
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (fields.length === 0) return res.status(400).json({ error: 'no_fields' });

    // Vérification FK id_utilisateur_1 si présent dans le body
    if (body.id_utilisateur_1) {
      const [rows] = await pool.query(
        'SELECT COUNT(*) AS count FROM utilisateurs WHERE id_utilisateur = ?',
        [body.id_utilisateur_1]
      );
      if (rows[0].count === 0) return res.status(400).json({ error: 'invalid_user' });
    }

    const sql = `UPDATE sites SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id); // ajout de l'id **une seule fois** pour le WHERE
    await pool.query(sql, values);

    const [updatedRows] = await pool.query('SELECT * FROM sites WHERE id = ?', [id]);
    if (updatedRows.length === 0) return res.status(404).json({ error: 'not_found' });

    res.json(updatedRows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/sites/:id
export async function updateSite(req, res) {
  const siteId = Number(req.params.id);
  const { nom, url, description, date_ajout, image, valide, id_categorie, id_utilisateur_1 } = req.body;

  // Construction dynamique des champs à mettre à jour
  let fields = [];
  let values = [];

  if (nom !== undefined) { fields.push('nom = ?'); values.push(nom); }
  if (url !== undefined) { fields.push('url = ?'); values.push(url); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (date_ajout !== undefined) { fields.push('date_ajout = ?'); values.push(date_ajout); }
  if (image !== undefined) { fields.push('image = ?'); values.push(image); }
  if (valide !== undefined) { fields.push('valide = ?'); values.push(valide); }
  if (id_categorie !== undefined) { fields.push('id_categorie = ?'); values.push(id_categorie); }
  if (id_utilisateur_1 !== undefined) { fields.push('id_utilisateur_1 = ?'); values.push(id_utilisateur_1); }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
  }

  values.push(siteId); // pour WHERE

  try {
    // Authorization: only admin or owner can update
    if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
    // get existing site to check owner
    const [existing] = await pool.query('SELECT id_utilisateur_1 FROM sites WHERE id = ?', [siteId]);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Site non trouvé' });
    const ownerId = existing[0].id_utilisateur_1;
    const isAdmin = req.user.Id_Role === 1;
    if (!isAdmin && req.user.id_utilisateur !== ownerId) return res.status(403).json({ error: 'forbidden' });
    const [result] = await pool.query(
      `UPDATE sites SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Site non trouvé' });
    }

    // Retourner le site mis à jour
    const [updatedSite] = await pool.query(
      'SELECT * FROM sites WHERE id = ?',
      [siteId]
    );

    res.status(200).json(updatedSite[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
}


// DELETE /api/sites/:id -> supprimer un site
export async function deleteSite(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });

  try {
    // Authorization: only admin or owner can delete
    if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
    const [existing] = await pool.query('SELECT id_utilisateur_1 FROM sites WHERE id = ?', [id]);
    if (!existing || existing.length === 0) return res.status(404).json({ error: 'not_found' });
    const ownerId = existing[0].id_utilisateur_1;
    const isAdmin = req.user.Id_Role === 1;
    if (!isAdmin && req.user.id_utilisateur !== ownerId) return res.status(403).json({ error: 'forbidden' });
    const [result] = await pool.query('DELETE FROM sites WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}



export default { getAllSites, getSiteById, createSite, updateSite, patchSite, deleteSite };
