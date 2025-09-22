// ----------------------------
// Imports
// ----------------------------
import { sites, loadSites } from "../data/sites.js"; // <-- import de loadSites
import { afficherPopUp, popupMovements } from "./Formulaire.js";
import { filtrerSitesParRecherche, filtrerParCategorie } from "../Dossier Scripts/FiltreTriage.js";

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

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            alert("Déconnecté !");
            location.reload();
        });
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
                <button class="btn update-btn" data-id="${site.id}">Modifier</button>
                <button class="btn delete-btn" data-id="${site.id}">Supprimer</button>
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
            if (!token) return alert("Non autorisé");

            if (!confirm("Voulez-vous vraiment supprimer ce site ?")) return;

            try {
                const res = await fetch(`http://localhost:3001/api/sites/${siteId}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Erreur lors de la suppression");

                alert("Site supprimé !");
                await loadSites();        // Recharge les sites depuis la BDD
                afficherSites(sites);     // Affiche à nouveau
            } catch (err) {
                alert(err.message);
            }
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

    // Pré-remplit les champs
    document.getElementById("siteName").value = site.name;
    document.getElementById("description").value = site.description;
    document.getElementById("url").value = site.url;
    document.getElementById("category").value = site.category;

    // Change le texte du bouton
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
        if (!user) return alert("Vous devez être connecté !");

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
                // Mode édition
                res = await fetch(`http://localhost:3001/api/sites/${editingSiteId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token ? `Bearer ${token}` : ""
                    },
                    body: JSON.stringify(siteData)
                });
            } else {
                // Mode création
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

            alert(editingSiteId ? "Site modifié !" : "Site ajouté !");
            document.getElementById("popupForm").style.display = "none";

            // Reset formulaire
            addSiteForm.reset();
            editingSiteId = null;
            document.getElementById("submitBtn").textContent = "Ajouter un site";

            await loadSites();
            afficherSites(sites);

        } catch (err) {
            console.error(err);
            alert("Erreur : " + err.message);
        }
    });
}

// ----------------------------
// Initialisation de la page
// ----------------------------
// ----------------------------
// Initialisation de la page
// ----------------------------
afficherAccueil();
afficherBoutonsHeader();
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

