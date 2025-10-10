import pool from '../config/dataBase.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

// GET tous les utilisateurs
export async function listUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id_utilisateur, nom, prénom, email, date_inscription, Id_Role FROM utilisateurs ORDER BY id_utilisateur ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET un utilisateur par id
export async function getUser(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
  try {
    const [rows] = await pool.query(
      'SELECT id_utilisateur, nom, prénom, email, date_inscription, Id_Role FROM utilisateurs WHERE id_utilisateur = ?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST créer un utilisateur
export async function createUser(req, res, next) {
  try {
    const { nom, prénom, email, mot_de_passe, Id_Role } = req.body || {};
    if (!nom || !prénom || !email || !mot_de_passe) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
    const [result] = await pool.query(
      'INSERT INTO utilisateurs (nom, prénom, email, mot_de_passe, Id_Role) VALUES (?, ?, ?, ?, ?)',
      [nom, prénom, email, hash, Id_Role || null]
    );

    const insertId = result.insertId;
    const [rows] = await pool.query(
      'SELECT id_utilisateur, nom, prénom, email, date_inscription, Id_Role FROM utilisateurs WHERE id_utilisateur = ?',
      [insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH/PUT mettre à jour un utilisateur
export async function updateUser(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });

  try {
    // Authorization: allow if admin or the user themselves
    if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
    const isAdmin = req.user.Id_Role === 1;
    if (!isAdmin && req.user.id_utilisateur !== id) return res.status(403).json({ error: 'forbidden' });
    const { nom, prénom, email, mot_de_passe, Id_Role } = req.body || {};
    const sets = [];
    const values = [];

    if (nom) { sets.push('nom = ?'); values.push(nom); }
    if (prénom) { sets.push('prénom = ?'); values.push(prénom); }
    if (email) { sets.push('email = ?'); values.push(email); }
    if (Id_Role) { sets.push('Id_Role = ?'); values.push(Id_Role); }
    if (mot_de_passe) {
      const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
      sets.push('mot_de_passe = ?');
      values.push(hash);
    }

    if (sets.length === 0) return res.status(400).json({ error: 'no_fields' });

    values.push(id);
    const sql = `UPDATE utilisateurs SET ${sets.join(', ')} WHERE id_utilisateur = ?`;
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });

    const [rows] = await pool.query(
      'SELECT id_utilisateur, nom, prénom, email, date_inscription, Id_Role FROM utilisateurs WHERE id_utilisateur = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE supprimer un utilisateur
export async function deleteUser(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });

  try {
    // Authorization: allow if admin or the user themselves
    if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
    const isAdmin = req.user.Id_Role === 1;
    if (!isAdmin && req.user.id_utilisateur !== id) return res.status(403).json({ error: 'forbidden' });
    const [result] = await pool.query('DELETE FROM utilisateurs WHERE id_utilisateur = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


const SECRET_KEY = "TonSecretTrèsSecret123!"; // ⚠️ à mettre dans un .env

export async function loginUser(req, res, next) {
  try {
    const { email, mot_de_passe } = req.body;
    console.log('Tentative de connexion avec:', { email });
    
    if (!email || !mot_de_passe) {
      console.log('Champs manquants');
      return res.status(400).json({ error: "missing_fields" });
    }

    // Vérifie l'utilisateur
    const [rows] = await pool.query("SELECT * FROM utilisateurs WHERE email = ?", [email]);
    console.log('Utilisateur trouvé:', rows.length > 0);
    
    if (rows.length === 0) return res.status(401).json({ error: "invalid_credentials" });

    const user = rows[0];
    console.log('Role de l\'utilisateur:', user.Id_Role);

    // Vérifie le mot de passe
    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) return res.status(401).json({ error: "invalid_credentials" });

    // Crée un token
    const token = jwt.sign(
      { id_utilisateur: user.id_utilisateur, email: user.email, Id_Role: user.Id_Role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    // 🔥 Ici on ajoute Id_Role à la réponse pour le frontend
    res.json({
      message: "Connexion réussie",
      token,
      user: { 
        id_utilisateur: user.id_utilisateur, 
        email: user.email,
        Id_Role: user.Id_Role 
      }
    });
  } catch (err) {
    next(err);
  }
}


export async function signupUser(req, res, next) {
  try {
    const { nom, prenom, email, mot_de_passe } = req.body;
    if (!nom || !prenom || !email || !mot_de_passe) return res.status(400).json({ error: "missing_fields" });

    // 1) vérifier qu'email n'existe pas
    const [existing] = await pool.query("SELECT id_utilisateur FROM utilisateurs WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ error: "email_exists" });

    // 2) hash password
    const hashed = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

    // 3) insert (attention colonne prénom avec accent)
    const sql = "INSERT INTO utilisateurs (`nom`, `prénom`, `email`, `mot_de_passe`, `Id_Role`) VALUES (?, ?, ?, ?, ?)";
    const roleDefault = 3; // utilisateur standard
    const [result] = await pool.query(sql, [nom, prenom, email, hashed, roleDefault]);

    // 4) renvoyer user sans mot_de_passe
    const userId = result.insertId;
    const [rows] = await pool.query("SELECT id_utilisateur, nom, `prénom`, email FROM utilisateurs WHERE id_utilisateur = ?", [userId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}



export default { listUsers, getUser, createUser, updateUser, deleteUser, signupUser, loginUser };

