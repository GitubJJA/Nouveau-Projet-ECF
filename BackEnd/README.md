# BackEnd — Web Cyclopedia (Documentation complète)

Ce fichier décrit le serveur, les routes API, la sécurité, le schéma de la base de données et les instructions d'exécution pour développement et production.

## 1) Arborescence principale

```
BackEnd/
├── config/
│   └── dataBase.js           # pool MySQL et configuration
├── controllers/
│   ├── CategoryController.js
│   ├── sitesController.js
│   └── usersController.js
├── middleware/
│   ├── authMiddleware.js     # authenticate, ensureAdmin
│   └── errorHandler.js
├── routes/
│   ├── apiCategory.js
│   ├── apiSites.js
│   └── apiUser.js
├── utils/
│   └── asyncHandler.js
└── index.js                  # point d'entrée du serveur
```

## 2) Installation & variables d'environnement

Variables recommandées (dans `.env`):

```
DB_HOST=localhost
DB_USER=root
DB_PASS=ChangeMe
DB_NAME=web_cyclopedia
PORT=3000
SECRET_KEY=une_cle_tres_secrete
```

Installation et lancement (développement):

```powershell
cd BackEnd
npm install
# lancer en dev (nodemon) si configuré :
npm run dev
# ou
node index.js
```

## 3) Schéma de base de données (extrait)

Tables principales (extrait simplifié) :

```sql
CREATE TABLE utilisateurs (
  id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  nom VARCHAR(255),
  Id_Role INT
);

CREATE TABLE categories (
  id_categorie INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL
);

CREATE TABLE sites (
  id_site INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255),
  url TEXT,
  description TEXT,
  id_categorie INT,
  id_utilisateur_1 INT,
  FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie)
);
```

Le dépôt contient `web-cyclopedia FINAL.sql` avec le schéma complet et des données d'exemple.

## 4) API — Endpoints principaux (exemples)

### Auth
`POST /api/login` — renvoie `{ token, user }` (200)

### Catégories
- `GET /api/categories` — liste (public)
- `POST /api/categories` — crée (admin)
- `PUT /api/categories/:id` — met à jour (admin)
- `DELETE /api/categories/:id` — supprime (admin)

Exemple création :

```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{ "nom": "Voyage" }

// Response 201 { id_categorie: 10, nom: 'Voyage' }
```

### Sites
- `GET /api/sites`
- `POST /api/sites` (auth) — associe le créateur (req.user)
- `PUT /api/sites/:id` (propriétaire ou admin)
- `DELETE /api/sites/:id` (propriétaire ou admin)

### Utilisateurs
- `GET /api/users` (admin)
- `PUT /api/users/:id` (propriétaire ou admin)
- `DELETE /api/users/:id` (admin)

## 5) Middleware & sécurité

### authenticate (extrait)

1. Récupère l'en-tête `Authorization: Bearer <token>`.
2. Vérifie le token via `jwt.verify(token, SECRET_KEY)`.
3. Attache `req.user = { id_utilisateur, email, Id_Role }`.
4. En cas d'erreur renvoie 401.

### ensureAdmin
Vérifie `req.user && req.user.Id_Role === 1` sinon 403.

### Bonnes pratiques
- Protéger `SECRET_KEY` et les variables d'environnement.
- En production : activer HTTPS, cookies `Secure`, et CORS strict.

## 6) Logging et Debug

- Utiliser `console` pour debug rapide lors du développement (ex: logs du middleware).
- Recommandé : ajouter `morgan` pour logs HTTP et `winston` pour logs applicatifs.

## 7) Tests manuels utiles

1. Tester login :

```powershell
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email":"admin@ex","password":"pass"}'
```

2. Tester création catégorie (avec token) :

```powershell
curl -X POST http://localhost:3000/api/categories -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"nom":"Test"}'
```

## 8) Déploiement & checklist production

- Configurer variables d'environnement sécurisées
- HTTPS obligatoire (certificats)
- Activer `helmet()` et rate-limiting
- Logging externe et rotation
- Backup périodique MySQL

## 9) Problèmes courants et solutions

- JWT non valide / Expiré → vérifier le token dans les headers
- Cookie `jwt` absent (front) → vérifier que le cookie est écrit sans `Secure` sur HTTP local
- Permissions 403 → vérifier `Id_Role` et la logique d'ownership

---

Si tu veux, j'ajoute un `README_BACKEND_QUICKSTART.md` plus court ou un `.env.example` prêt à l'emploi.
