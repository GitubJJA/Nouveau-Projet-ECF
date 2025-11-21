# Intéraction FrontEnd ↔ BackEnd — Web Cyclopedia (Guide détaillé)

Ce document explique précisément comment le FrontEnd et le BackEnd communiquent, le format des requêtes, l'authentification, les erreurs courantes et des exemples prêts à l'emploi pour la démonstration.

## 1) Vue d'ensemble

Architecture simplifiée :

```
[Browser] <--HTTP/REST--> [FrontEnd static files (JS)] <--HTTP/REST--> [BackEnd Express API] <--SQL--> [MySQL]
```

- Le FrontEnd exécute des requêtes Fetch vers des endpoints `GET/POST/PUT/DELETE` exposés par le BackEnd (prefix `/api`).
- Le BackEnd retourne des objets JSON et protège les endpoints privés via JWT.

## 2) Flux d'authentification (détail étape par étape)

1) L'utilisateur saisit identifiants sur `Login.html`.
2) FrontEnd : `POST /api/login` (Content-Type: application/json).
3) BackEnd : vérifie les credentials, génère un JWT incluant `id_utilisateur` et `Id_Role` et renvoie `{ token, user }`.
4) FrontEnd :
   - écrit le cookie `jwt` (nom : `jwt`, path=/). En dev local le cookie est écrit sans `Secure` ; en production, Activez `Secure` et `SameSite`.
   - stocke l'objet `user` (profil public) en `sessionStorage`.
   - redirige vers l'interface (admin dashboard si `Id_Role === 1`).

5) Pour chaque requête protégée, FrontEnd utilise `fetchWithAuth` :
   - lit le cookie `jwt`, ajoute `Authorization: Bearer <token>` dans les headers,
   - merge proprement les headers (important pour ne pas écraser `Content-Type`),
   - gère les statuts 401/403 (nettoyage du stockage et redirection vers login).

6) BackEnd middleware `authenticate` décode le token, attache `req.user` et autorise l'accès aux contrôleurs.

## 3) Exemple concret : création d'une catégorie (admin)

FrontEnd (pseudo) :

```javascript
const data = { nom: 'Voyage' };
const res = await fetchWithAuth('/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
if (res.ok) console.log('Catégorie créée');
else console.error(await res.json());
```

BackEnd (contrôleur simplifié) :

```javascript
const createCategory = async (req, res) => {
  const { nom } = req.body;
  // insertion en BDD
  const result = await db.query('INSERT INTO categories (nom) VALUES (?)', [nom]);
  res.status(201).json({ id_categorie: result.insertId, nom });
};
```

## 4) Format attendu des réponses et codes HTTP

- 200 OK : requête GET, PUT réussie
- 201 Created : ressource créée (POST)
- 204 No Content : suppression réussie
- 400 Bad Request : validation échouée
- 401 Unauthorized : token manquant ou invalide
- 403 Forbidden : permissions insuffisantes
- 500 Internal Server Error : erreur serveur (log serveur à consulter)

## 5) Debug pas-à-pas (si la création de catégorie renvoie 401)

1. Ouvrir DevTools → Application → Cookies : vérifier cookie `jwt` présent et non vide.
2. DevTools → Network → sélectionner la requête POST `/api/categories` :
   - vérifier `Authorization` dans Request Headers
   - vérifier le corps (body) envoyé
3. Si `Authorization` absent : vérifier `fetchWithAuth` (merge headers) et `getAuthToken()` (lecture cookie).
4. Si token présent mais 401 renvoyé : copier la réponse et regarder le log du serveur (console du BackEnd) pour l'erreur JWT (expiration, signature invalide).

## 6) Exemple de `fetchWithAuth` robuste (à copier dans `admin.js`)

```javascript
function getAuthToken() {
  // parse document.cookie pour lire 'jwt'
}

async function fetchWithAuth(url, opts = {}) {
  const token = getAuthToken();
  const baseHeaders = opts.headers || {};
  const headers = { ...baseHeaders, Authorization: `Bearer ${token}` };
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    sessionStorage.removeItem('user');
    // optionnel: supprimer cookie
    window.location.href = '/DossierHtml/Login.html';
  }
  return res;
}
```

## 7) Scénario de démonstration (script rapide pour le jury)

1. Démarrer BackEnd + servir FrontEnd.
2. Ouvrir `MonSiteAccueil.html` → montrer listing (GET /api/sites).
3. Ouvrir DevTools Network et Console.
4. Aller sur `Login.html` → se connecter (POST /api/login) → montrer token reçu.
5. Aller sur `admin/index.html` → ouvrir modal "Ajouter catégorie" → remplir et valider.
6. Montrer la requête POST /api/categories avec header `Authorization`.
7. Montrer la réponse 201 et la nouvelle catégorie affichée.

## 8) Fiches pratiques / Points d'attention

- Environnement local : ne pas ajouter `Secure` au cookie sinon il ne sera pas défini sur HTTP.
- Toujours merger les headers dans `fetch` pour éviter d'écraser `Authorization`.
- Vérifier la cohérence `Id_Role` côté front pour masquer/montrer les contrôles admin.

---

Si tu veux, je peux :
- générer un Markdown prêt pour un diaporama avec captures d'écran indiquées à quel endroit les insérer,
- ajouter des exemples curl/Postman pour chaque endpoint.

