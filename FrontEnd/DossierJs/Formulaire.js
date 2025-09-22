
// ----------------------------
// Affichage et contrôle du popup
// ----------------------------

// Injecte le formulaire UNE FOIS au chargement
export function injecterFormulaire() {
    const addSiteForm = document.getElementById("addSiteForm");
    if (!addSiteForm) return;

    addSiteForm.innerHTML = `
        <label for="siteName">Nom du site :</label>
        <input type="text" id="siteName" name="siteName" placeholder="Ex: MonSiteWeb" required>
        <label for="url">URL :</label>
        <input type="url" id="url" name="url" placeholder="https://monsite.com" required>

        <label for="category">Catégorie :</label>
        <select id="category" name="category" required>
            <option value="">Sélectionnez une catégorie</option>
            <option value="1">Technologie</option>
            <option value="2">Éducation</option>
            <option value="3">Loisirs</option>
        </select>

        <label for="description">Description :</label>
        <textarea id="description" name="description" placeholder="Une courte description" rows="3" required></textarea>

        <button type="submit" id="submitBtn" class="btn">Ajouter le site</button>
    `;
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

