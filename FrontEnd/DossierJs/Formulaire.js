
// ----------------------------
// Affichage et contrôle du popup
// ----------------------------

// Injecte le formulaire UNE FOIS au chargement
export async function injecterFormulaire() {
    const addSiteForm = document.getElementById("addSiteForm");
    if (!addSiteForm) return;

    // HTML de base du formulaire sans le select dynamique
    addSiteForm.innerHTML = `
        <label for="siteName">Nom du site :</label>
        <input type="text" id="siteName" name="siteName" placeholder="Ex: MonSiteWeb" required>
        <label for="url">URL :</label>
        <input type="url" id="url" name="url" placeholder="https://monsite.com" required>

        <label for="category">Catégorie :</label>
        <select id="category" name="category" required>
            <option value="">Sélectionnez une catégorie</option>
        </select>

        <label for="description">Description :</label>
        <textarea id="description" name="description" placeholder="Une courte description" rows="3" required></textarea>
        <button type="submit" id="submitBtn" class="btn">Ajouter le site</button>
        <div class="rgpd-checkbox">
        <input type="checkbox" id="rgpd-consent" required>
        <label for="rgpd-consent">
        J'accepte que mes données soient utilisées pour le traitement des informations de mon site.
        </label>
        </div>
    `;

    const categorySelect = document.getElementById("category");

    try {
        const response = await fetch('http://localhost:3001/api/categories'); // ton endpoint
        if (!response.ok) throw new Error("Erreur lors de la récupération des catégories");

        const categories = await response.json();

        // Injection dynamique des options
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id_categorie;
            option.textContent = cat.nom;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Impossible de charger les catégories :", error);
    }
}


// Affiche le popup et pré-remplit si mode modification
export function afficherPopUp(editingSite = null) {
    const popup = document.getElementById("popupForm");
    const addSiteForm = document.getElementById("addSiteForm");

    if (!popup || !addSiteForm) return;

    // Pré-remplissage pour modification
    if (editingSite) {
        document.getElementById("siteName").value = editingSite.name || "";
        document.getElementById("url").value = editingSite.url || "";
        document.getElementById("category").value = editingSite.id_categorie || "";
        document.getElementById("description").value = editingSite.description || "";
        document.getElementById("submitBtn").textContent = "Modifier le site";
    } else {
        addSiteForm.reset();
        document.getElementById("submitBtn").textContent = "Ajouter le site";
    }

    // Affiche le popup
    popup.style.display = "block";
}

// ----------------------------
// Ouverture et fermeture du popup
// ----------------------------
export function popupMovements() {
    const popup = document.getElementById("popupForm");
    const openBtn = document.getElementById("openPopup");
    const closeBtn = popup ? popup.querySelector(".close") : null;

    if (!popup) return;

    // Ouvrir popup pour ajout
    if (openBtn) {
        openBtn.addEventListener("click", () => {
            afficherPopUp(); // mode ajout
        });
    }

    // Fermer popup avec la croix
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            popup.style.display = "none";
        });
    }

    // Fermer popup si clic en dehors
    window.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.style.display = "none";
        }
    });
}

