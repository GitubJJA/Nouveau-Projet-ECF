// ----------------------------
// Imports
// ----------------------------
import { sites, loadSites } from "../data/sites.js";
import { injecterFormulaire, popupMovements } from "./Formulaire.js";
import { filtrerSitesParRecherche, filtrerParCategorie} from "../Dossier Scripts/FiltreTriage.js";
import { showNotification } from "./notifications.js";

// ----------------------------
// Confirmation de suppression
// ----------------------------
function showConfirm(callbackYes) {
    const confirmContainer = document.getElementById("confirm-container");
    const btnYes = document.getElementById("confirm-yes");
    const btnNo = document.getElementById("confirm-no");

    confirmContainer.style.display = "flex";
    setTimeout(() => confirmContainer.classList.add("show"), 10);

    const cleanup = () => {
        confirmContainer.classList.remove("show");
        setTimeout(() => { confirmContainer.style.display = "none"; }, 300);
        btnYes.removeEventListener("click", yesHandler);
        btnNo.removeEventListener("click", noHandler);
    };

    const yesHandler = () => { cleanup(); callbackYes(); };
    const noHandler = () => cleanup();

    btnYes.addEventListener("click", yesHandler);
    btnNo.addEventListener("click", noHandler);
}

// ----------------------------
// Affichage de l'accueil
// ----------------------------
function afficherAccueil() {
    document.querySelector(".main-content").innerHTML = `
        <section class="accueil-bg">
            <h2>Ne perdez plus de temps à chercher un site au hasard !</h2>
            <p>Voici un annuaire bien pratique qui vous fera gagner du temps pour vos navigations web.
            Sélectionnez une catégorie dans le menu pour découvrir des sites pertinents et utiles dans les domaines les plus consultés.
            </p>
        </section>
    `;
}

// ----------------------------
// Boutons header
// ----------------------------
function afficherBoutonsHeader() {
    const buttonsContainer = document.querySelector(".buttons");
    const user = JSON.parse(sessionStorage.getItem("user"));
    // read token from cookie
    const cookie = document.cookie.split('; ').find(c => c.startsWith('jwt='));
    const token = cookie ? cookie.split('=')[1] : null;

    if (token && user) {
        buttonsContainer.innerHTML = `
            <div class="user">
            <span id="userEmail"><a href="Users.html">${user.email}</a></span>
            <div class="buttons">
                <button class="btn" id="openPopup">Référencer mon site</button>
                <button class="btn" id="logoutBtn">Déconnexion</button>
            </div>
            </div>   
        `;
        document.getElementById("logoutBtn").addEventListener("click", () => {
            // clear session storage and cookie
            sessionStorage.removeItem('user');
            document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            showNotification("Vous êtes déconnecté !", "success");
            location.reload();
        });
        showNotification("Connexion réussie !", "success");
    } else {
        buttonsContainer.innerHTML = `
            <a class="btn" href="login.html" rel="noopener noreferrer">Connexion</a>
            <a class="btn" href="signup.html" rel="noopener noreferrer">Inscription</a>
        `;
    }
}

// ----------------------------
// Variable globale mode édition
// ----------------------------
let editingSiteId = null;

// ----------------------------
// Affichage des sites
// ----------------------------
function afficherSites(sitesToShow = sites) {
    const user = JSON.parse(sessionStorage.getItem("user"));
    let mainPage = "";

    sitesToShow.forEach((site) => {
        mainPage += `
        <div class="site-card">
            <h2>${site.name}</h2>
            <p class="paragraphSite">${site.description}</p>
            <a class="transformText" href="${site.url}" target="_blank">Visiter le site</a>
            <img src="https://www.google.com/s2/favicons?sz=64&domain=${new URL(site.url).hostname}" 
            alt="favicon" width="65" height="65">
            ${user && user.id_utilisateur === site.id_utilisateur_1 ? `
            <div class="actions">
                <button class="btns update-btn" data-id="${site.id}">Modifier</button>
                <button class="btns delete-btn" data-id="${site.id}">Supprimer</button>
            </div>` : ''}
        </div>`;
    });

    document.querySelector(".main-content").innerHTML = mainPage;

    setTimeout(() => {
        document.querySelectorAll('.site-card').forEach(card => card.classList.add('visible'));
    }, 10);

    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const siteId = Number(e.target.dataset.id);
            const site = sites.find(s => s.id === siteId);
            if (site) ouvrirFormulaireUpdate(site);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const siteId = Number(e.target.dataset.id);
            // read token from cookie
            const cookie = document.cookie.split('; ').find(c => c.startsWith('jwt='));
            const token = cookie ? cookie.split('=')[1] : null;
            if (!token) return showNotification("Non autorisé", "error");

            showConfirm(async () => {
                try {
                    const res = await fetch(`http://localhost:3001/api/sites/${siteId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error("Erreur lors de la suppression");
                    showNotification("Site supprimé !", "success");
                    await loadSites();
                    afficherAccueil();
                } catch (err) {
                    showNotification("Erreur : " + err.message, "error");
                }
            });
        });
    });
}

// ----------------------------
// Formulaire modification
// ----------------------------
function ouvrirFormulaireUpdate(site) {
    editingSiteId = site.id;
    const form = document.getElementById("popupForm");
    form.style.display = "block";
    document.getElementById("siteName").value = site.name;
    document.getElementById("description").value = site.description;
    document.getElementById("url").value = site.url;
    document.getElementById("category").value = site.category;
    document.getElementById("submitBtn").textContent = "Modifier le site";
}

// ----------------------------
// Formulaire ajout / modification
// ----------------------------
function activerFormulaireAjout() {
    const addSiteForm = document.getElementById("addSiteForm");
    if (!addSiteForm) return;

    addSiteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        // Vérification consentement RGPD
    const consent = document.getElementById("rgpd-consent");
    if (!consent.checked) {
        return showNotification("Vous devez accepter la collecte des données pour continuer.", "error");
    }
    const user = JSON.parse(sessionStorage.getItem("user"));
        if (!user) return showNotification("Vous devez être connecté !", "error");

        const siteData = {
            nom: document.getElementById("siteName").value,
            url: document.getElementById("url").value,
            id_categorie: document.getElementById("category").value,
            description: document.getElementById("description").value,
            id_utilisateur: user.id_utilisateur
        };

    const cookie = document.cookie.split('; ').find(c => c.startsWith('jwt='));
    const token = cookie ? cookie.split('=')[1] : null;

        try {
            let res;
            if (editingSiteId) {
                res = await fetch(`http://localhost:3001/api/sites/${editingSiteId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": token ? `Bearer ${token}` : "" },
                    body: JSON.stringify(siteData)
                });
            } else {
                res = await fetch("http://localhost:3001/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": token ? `Bearer ${token}` : "" },
                    body: JSON.stringify(siteData)
                });
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erreur serveur");
            }

            showNotification(editingSiteId ? "Site modifié !" : "Site ajouté !", "success");
            document.getElementById("popupForm").style.display = "none";
            addSiteForm.reset();
            editingSiteId = null;
            document.getElementById("submitBtn").textContent = "Ajouter un site";
            await loadSites();
            afficherAccueil();

        } catch (err) {
            showNotification("Erreur : " + err.message, "error");
        }
    });
}

// ----------------------------
// Sidebar desktop
// ----------------------------
async function injectSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    sidebar.innerHTML = `
        <h2>Catégories</h2>
        <ul class="asideNav asideNav2" id="categoryList">
            <li><a href="#" data-category="all" class="active">Accueil</a></li>
            <li>Chargement...</li>
        </ul>

        <h2>Sites Populaires</h2>
        <ul class="asideNav">
            <li><a target="_blank" rel="noopener noreferrer" href="https://www.google.fr/">Google</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/?app=desktop&hl=FR">YouTube</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal">Wikipedia</a></li>
        </ul>
    `;

    const categoryList = document.getElementById("categoryList");

    try {
        const response = await fetch("http://localhost:3001/api/categories");
        if (!response.ok) throw new Error("Impossible de charger les catégories");
        const categories = await response.json();

        // Réinitialise la liste avec "Accueil"
        categoryList.innerHTML = `<li><a href="#" data-category="all" class="active">Accueil</a></li>`;
        categories.forEach(cat => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="#" data-category="${cat.nom}">${cat.nom}</a>`;
            categoryList.appendChild(li);
        });

        // Ajout des event listeners avec gestion de la classe active
        document.querySelectorAll('#categoryList a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Filtrer les sites selon la catégorie
                filtrerParCategorie(e, sites, afficherAccueil, afficherSites);

                // Supprimer la classe active à tous les liens
                document.querySelectorAll('#categoryList a').forEach(l => l.classList.remove('active'));

                // Ajouter la classe active au lien cliqué
                link.classList.add('active');
            });
        });
    } catch (error) {
        categoryList.innerHTML += `<li style="color:red;">Erreur de chargement</li>`;
        console.error(error);
    }
}


// ----------------------------
// Main-nav responsive
// ----------------------------
function injectMainNav() {
    const mainNavContainer = document.querySelector(".main-nav");
    if (!mainNavContainer) return;

    if (window.innerWidth >= 780) {
        // Desktop menu "À propos / Nous contacter"
        mainNavContainer.innerHTML = `
            <ul class="nav-info">
                <li><a href="#">À propos</a></li>
                <li><a href="#">Nous contacter</a></li>
            </ul>
        `;
    } else {
        // Mobile menu catégories
        mainNavContainer.innerHTML = `
            <ul class="nav-list" id="mainNavList">
                <li><a href="#" data-category="all">Accueil</a></li>
                <li>Chargement...</li>
            </ul>
        `;
        const mainNavList = document.getElementById("mainNavList");

        fetch("http://localhost:3001/api/categories")
            .then(res => res.ok ? res.json() : Promise.reject("Erreur catégories"))
            .then(categories => {
                mainNavList.innerHTML = `<li><a href="#" data-category="all">Accueil</a></li>`;
                categories.forEach(cat => {
                    const li = document.createElement("li");
                    li.innerHTML = `<a href="#" data-category="${cat.nom}">${cat.nom}</a>`;
                    mainNavList.appendChild(li);
                });
                document.querySelectorAll('#mainNavList a').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        filtrerParCategorie(e, sites, afficherAccueil, afficherSites);
                    });
                });
            })
            .catch(err => {
                mainNavList.innerHTML += `<li style="color:red;">Erreur de chargement</li>`;
                console.error(err);
            });
    }
}

// ----------------------------
// Navigation adaptative
// ----------------------------
function initNavigation() {
    if (window.innerWidth < 780) {
        injectMainNav();
        document.querySelector(".sidebar")?.classList.add("hidden");
    } else {
        injectMainNav();
        injectSidebar();
        document.querySelector(".sidebar")?.classList.remove("hidden");
    }
}

// ----------------------------
// Initialisation page
// ----------------------------
afficherAccueil();
afficherBoutonsHeader();
injecterFormulaire();
popupMovements();
activerFormulaireAjout();
initNavigation();
window.addEventListener("resize", initNavigation);

// ----------------------------
// Filtre recherche
// ----------------------------
document.querySelector('.search-box input').addEventListener('input', function() {
    const value = this.value.trim();

    if (value === '') {
        // Réaffiche l'accueil
        afficherAccueil();

        // Remet la catégorie active sur "Accueil"
        const categoryLinks = document.querySelectorAll('#categoryList a');
        categoryLinks.forEach(link => link.classList.remove('active'));

        const accueilLink = document.querySelector('#categoryList a[data-category="all"]');
        if (accueilLink) accueilLink.classList.add('active');

    } else {
        filtrerSitesParRecherche(value, afficherAccueil, afficherSites);
    }
});
