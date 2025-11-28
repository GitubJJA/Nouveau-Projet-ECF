import jwt from "jsonwebtoken";

// Clé secrète pour JWT (déplacer en .env en production)
const SECRET_KEY = "TonSecretTrèsSecret123!"; // ou process.env.SECRET_KEY

// Vérifie le header Authorization Bearer, valide le token et ajoute `req.user`.
// `req.user` contient : id_utilisateur, email, Id_Role (si présent dans le token).
export function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "user_not_authenticated" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "user_not_authenticated" });

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    // Ajoute les informations essentielles de l'utilisateur à la requête
    req.user = { id_utilisateur: payload.id_utilisateur, email: payload.email, Id_Role: payload.Id_Role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "user_not_authenticated" });
  }
}

// Vérifie que l'utilisateur authentifié est administrateur (Id_Role === 1)
export function ensureAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
  if (req.user.Id_Role !== 1) return res.status(403).json({ error: 'forbidden' });
  next();
}
