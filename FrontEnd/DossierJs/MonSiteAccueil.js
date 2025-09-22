// ----------------------------
// Imports
// ----------------------------
import { sites, loadSites } from "../data/sites.js";
import { injecterFormulaire, popupMovements } from "./Formulaire.js";
import { filtrerSitesParRecherche, filtrerParCategorie } from "../Dossier Scripts/FiltreTriage.js";

// ----------------------------
// Notifications
// ----------------------------
export function showNotification(message, type = "success", duration = 3000) {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const notif = document.createElement("div");
    notif.className = `notification ${type}`;
    notif.textContent = message;
    container.appendChild(notif);

    setTimeout(() => notif.classList.add("show"), 50);

    setTimeout(() => {
        notif.classList.remove("show");
        setTimeout(() => notif.remove(), 500);
    }, duration);
}

// ----------------------------
// Confirmation de suppression avec animation
// ----------------------------
function showConfirm(callbackYes) {
    const confirmContainer = document.getElementById("confirm-container");
    const btnYes = document.getElementById("confirm-yes");
    const btnNo = document.getElementById("confirm-no");

    // Affiche le conteneur et déclenche l’animation
    confirmContainer.style.display = "flex";
    setTimeout(() => confirmContainer.classList.add("show"), 10);

    const cleanup = () => {
        confirmContainer.classList.remove("show");
        setTimeout(() => {
            confirmContainer.style.display = "none";
        }, 300); // temps de l'animation
        btnYes.removeEventListener("click", yesHandler);
        btnNo.removeEventListener("click", noHandler);
    };

    const yesHandler = () => {
        cleanup();
        callbackYes();
    };
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
// Boutons Connexion / Inscription / Référencer
// ----------------------------
function afficherBoutonsHeader() {
    const buttonsContainer = document.querySelector(".buttons");
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (token && user) {
        buttonsContainer.innerHTML = `
            <span id="userEmail">${user.email}</span>
            <button class="btn" id="logoutBtn">Déconnexion</button>
            <button class="btn" id="openPopup">Référencer mon site</button>
        `;

        // Déconnexion
        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            location.reload();
        });

        // Notification connexion réussie
        showNotification("Connexion réussie !", "success");

    } else {
        buttonsContainer.innerHTML = `
            <a class="btn" href="login.html" rel="noopener noreferrer">Connexion</a>
            <a class="btn" href="signup.html" rel="noopener noreferrer">Inscription</a>
        `;
    }
}

// ----------------------------
// Variable globale pour mode édition
// ----------------------------
let editingSiteId = null;

// ----------------------------
// Affichage des sites
// ----------------------------
function afficherSites(sitesToShow = sites) {
    const user = JSON.parse(localStorage.getItem("user"));
    let mainPage = "";

    sitesToShow.forEach((site) => {
        mainPage += `
        <div class="site-card">
            <h2>${site.name}</h2>
            <p class="paragraphSite">${site.description}</p>
            <a class="transformText" href="${site.url}" target="_blank">Visiter le site</a>
            <img src="${site.image || 'default.png'}" alt="" width="100px" height="100px">
            ${user && user.id_utilisateur === site.id_utilisateur_1 ? `
            <div class="actions">
                <button class="btns update-btn" data-id="${site.id}">Modifier</button>
                <button class="btns delete-btn" data-id="${site.id}">Supprimer</button>
            </div>` : ''}
        </div>`;
    });

    document.querySelector(".main-content").innerHTML = mainPage;

    // Animation d’apparition
    setTimeout(() => {
        document.querySelectorAll('.site-card').forEach(card => {
            card.classList.add('visible');
        });
    }, 10);

    // Écouteurs des boutons update
    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const siteId = Number(e.target.dataset.id);
            const site = sites.find(s => s.id === siteId);
            if (site) ouvrirFormulaireUpdate(site);
        });
    });

    // Écouteurs des boutons delete
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const siteId = Number(e.target.dataset.id);
            const token = localStorage.getItem("token");
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
// Ouvre le formulaire en mode modification
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
// Formulaire d'ajout / modification
// ----------------------------
function activerFormulaireAjout() {
    const addSiteForm = document.getElementById("addSiteForm");
    if (!addSiteForm) return;

    addSiteForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return showNotification("Vous devez être connecté !", "error");

        const siteData = {
            nom: document.getElementById("siteName").value,
            url: document.getElementById("url").value,
            id_categorie: document.getElementById("category").value,
            description: document.getElementById("description").value,
            id_utilisateur: user.id_utilisateur
        };

        const token = localStorage.getItem("token");

        try {
            let res;
            if (editingSiteId) {
                res = await fetch(`http://localhost:3001/api/sites/${editingSiteId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token ? `Bearer ${token}` : ""
                    },
                    body: JSON.stringify(siteData)
                });
            } else {
                res = await fetch("http://localhost:3001/api/sites", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token ? `Bearer ${token}` : ""
                    },
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
            console.error(err);
            showNotification("Erreur : " + err.message, "error");
        }
    });
}

// ----------------------------
// Initialisation de la page
// ----------------------------
afficherAccueil();
afficherBoutonsHeader();
injecterFormulaire();
popupMovements();
activerFormulaireAjout();

// ----------------------------
// Filtres
// ----------------------------
document.querySelector('.search-box input').addEventListener('input', function() {
    filtrerSitesParRecherche(this.value, afficherAccueil, afficherSites);
});

document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', function(e) {
        filtrerParCategorie(e, sites, afficherAccueil, afficherSites);
    });
});

document.querySelectorAll('.asideNav2 a').forEach(link => {
    link.addEventListener('click', function(e) {
        filtrerParCategorie(e, sites, afficherAccueil, afficherSites);
    });
});
