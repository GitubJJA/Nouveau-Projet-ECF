import jwt from "jsonwebtoken";

const SECRET_KEY = "TonSecretTrèsSecret123!"; // ou process.env.SECRET_KEY

export function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "user_not_authenticated" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "user_not_authenticated" });

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    // include role if present in token
    req.user = { id_utilisateur: payload.id_utilisateur, email: payload.email, Id_Role: payload.Id_Role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "user_not_authenticated" });
  }
}

export function ensureAdmin(req, res, next) {
  // authenticate must have run before and set req.user
  if (!req.user) return res.status(401).json({ error: 'user_not_authenticated' });
  if (req.user.Id_Role !== 1) return res.status(403).json({ error: 'forbidden' });
  next();
}
