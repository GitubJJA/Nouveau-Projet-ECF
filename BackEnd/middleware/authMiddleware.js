import jwt from "jsonwebtoken";

const SECRET_KEY = "TonSecretTrèsSecret123!"; // ou process.env.SECRET_KEY

export function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "user_not_authenticated" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "user_not_authenticated" });

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = { id_utilisateur: payload.id_utilisateur, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "user_not_authenticated" });
  }
}
