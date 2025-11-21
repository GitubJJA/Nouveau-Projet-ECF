# FrontEnd — Web Cyclopedia (Documentation complète)

Ce fichier décrit en détail la structure, les composants, les règles de style et les instructions de développement pour la partie cliente du projet.

## 1) Arborescence complète du `FrontEnd/`

```
FrontEnd/
├── admin/
│   ├── index.html                # Dashboard administrateur (tables, actions CRUD)
│   ├── css/
│   │   └── admin.css             # Styles admin (modales, tableaux)
│   └── js/
│       └── admin.js              # Logique admin: fetchWithAuth, CRUD, modales
├── data/
│   └── sites.js                  # Données de démonstration / fixtures
├── "Dossier Scripts"/
│   ├── FiltreTriage.js           # Fonctions de tri/filtre pour l'affichage public
│   └── rgpd.js                   # Gestion et affichage RGPD
├── DossierCss/
│   ├── Formulaire.css            # Composants formulaire réutilisables
│   ├── Login.css                 # Styles de la page Login
│   ├── MonSiteAccueil2.css       # Thème principal (palette, typographie)
│   ├── rgpd.css                  # Styles RGPD
│   ├── Signup.css                # Styles page d'inscription
│   └── Users.css                 # Styles page utilisateurs
├── DossierHtml/
│   ├── Login.html                # Page connexion
│   ├── MonSiteAccueil.html       # Page publique d'accueil (listing sites)
│   ├── politique-confidentialite.html # Politique de confidentialité
│   ├── Signup.html               # Page d'inscription
│   └── Users.html                # Page profils / gestion utilisateur
├── DossierJs/
│   ├── Formulaire.js             # Validation côté client (champs obligatoires, regex)
│   ├── login.js                  # Logique de connexion et stockage token
│   ├── MonSiteAccueil.js         # Scripts d'affichage public et interactions
│   ├── notifications.js          # Système de notifications UI
│   ├── signup.js                 # Logique d'inscription
│   └── Users.js                  # Gestion profils / actions user
└── DossierImages/
    ├── logoSite/
    ├── LogoSitecard/
    └── Wallpapers/
```

> Note : certains dossiers dans le dépôt contiennent des espaces (ex: `"Dossier Scripts"`). Si vous réorganisez le projet, préférez des noms sans espaces (filtre-tri, scripts, etc.).

## 2) Composants et responsabilités

- `admin.js` :
  - Fournit `fetchWithAuth(url, options)` : lit le cookie `jwt`, injecte `Authorization: Bearer <token>`, merge les headers et gère 401/403.
  - Fonctions CRUD pour : utilisateurs, sites, catégories.
  - Gestion des modales d'ajout/édition/suppression et affichage conditionnel des boutons (selon `user.Id_Role`).

- `login.js` :
  - POST `/api/login` et traitement de la réponse.
  - Stocke `jwt` dans un cookie `jwt` (path=/) et le profil `user` dans `sessionStorage`.

- `Formulaire.css` / `admin.css` :
  - Styles partagés pour inputs, selects, boutons, modales.
  - Animation d'entrée pour modales (fade + scale).

## 3) Démarrage local (développeur)

### Prérequis
- Navigateur moderne
- (optionnel) Node.js pour serveur statique

### Lancer le front
```powershell
# Option A : ouvrir le fichier HTML localement
start FrontEnd\DossierHtml\MonSiteAccueil.html

# Option B : lancer un serveur statique (recommandé)
cd FrontEnd
npx http-server -p 8080
# Ouvrir http://localhost:8080/DossierHtml/MonSiteAccueil.html
```

### Vérifications utiles après login
- DevTools → Application : cookie `jwt` présent
- DevTools → Network : header `Authorization` présent sur les requêtes protégées
- DevTools → Console : erreurs/console.debug ajoutés dans `fetchWithAuth`

## 4) Pattern fetchWithAuth (concis)

```javascript
function getAuthToken() {
  // lit document.cookie et renvoie la valeur du cookie 'jwt'
}

async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    // handling: clear sessionStorage + redirect to login
  }
  return res;
}
```

## 5) Bonnes pratiques et recommandations

- Stocker uniquement les informations non sensibles côté client (sessionStorage pour le profil). Le token est en cookie (pour faciliter l'envoi automatique) — en prod utilisez `Secure` + `SameSite`.
- Valider/assainir toutes les entrées côté serveur.
- Standardiser les chemins et retirer les espaces dans les noms de dossier.

## 6) Diagnostic rapide (bugs fréquents)

- Problème : "redirection vers login lorsqu'on ajoute une catégorie" → Vérifier :
  - Présence du cookie `jwt` (Application > Cookies)
  - Header `Authorization` dans Network
  - Cookie `Secure` non présent sur http local

- Problème : modales non stylées → Vérifier les imports CSS et conflits de sélecteurs.

## 7) Checklist pour la présentation (slides / démo)

- Page d'accueil (MonSiteAccueil.html) — affichez filtres et cartes
- Console DevTools → montrer POST /api/login (token reçu)
- Admin Dashboard → ouvrir modal d'ajout catégorie
- Network → montrer POST /api/categories avec Authorization header

---

Si tu veux, je peux maintenant appliquer les mêmes améliorations (structure détaillée, exemples et checklist) au `BackEnd/README.md` et à `README_INTEGRATION.md`. Dis-moi si tu veux que je les écrive en français formel (pour le jury) ou en anglais.
