// user.js
// ----------------------------
// Gère la modification / suppression du compte utilisateur
// ----------------------------

import { showNotification } from "./notifications.js";

// Récupère le form et les inputs
const userForm = document.getElementById("userForm");
const inputPrenom = document.getElementById("prenom");
const inputNom = document.getElementById("nom");
const inputEmail = document.getElementById("email");
const inputCurrentPassword = document.getElementById("currentPassword");
const inputNewPassword = document.getElementById("newPassword");

// Fonction pour récupérer le token JWT
function getAuthToken() {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('jwt='));
    return cookie ? cookie.split('=')[1] : null;
}

// Fonction pour décoder les informations du token
function getUserInfoFromToken() {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload;
    } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
        return null;
    }
}

// Bouton supprimer
let deleteBtn = document.getElementById("deleteAccountBtn");
if (!deleteBtn) {
    deleteBtn = document.createElement("button");
    deleteBtn.id = "deleteAccountBtn";
    deleteBtn.type = "button";
    deleteBtn.className = "btn-danger";
    deleteBtn.textContent = "Supprimer mon compte";
    if (userForm) userForm.appendChild(deleteBtn);
    else document.body.appendChild(deleteBtn);
}

// --- Modale de confirmation ---
function ensureDeleteModal() {
    if (document.getElementById("user-delete-modal")) return;

    const modal = document.createElement("div");
    modal.id = "user-delete-modal";
    modal.className = "confirm-container";
    modal.style.display = "none";
    modal.innerHTML = `
        <div class="confirm-box">
            <div class="confirm-icon" style="font-size: 2rem; color: red; text-align: center;">&#9888;</div>
            <p style="text-align: center; font-weight: bold;">Voulez-vous vraiment supprimer définitivement votre compte ?</p>
            <div class="confirm-buttons" style="display: flex; justify-content: center; gap: 10px;">
                <button id="user-delete-yes" class="btn-yes">Oui, supprimer</button>
                <button id="user-delete-no" class="btn-no">Non</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showDeleteModal(onYes) {
    ensureDeleteModal();
    const modal = document.getElementById("user-delete-modal");
    const yes = document.getElementById("user-delete-yes");
    const no = document.getElementById("user-delete-no");

    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("show"), 10);

    const cleanup = () => {
        modal.classList.remove("show");
        setTimeout(() => (modal.style.display = "none"), 250);
        yes.removeEventListener("click", yesHandler);
        no.removeEventListener("click", noHandler);
    };

    const yesHandler = () => {
        cleanup();
        onYes();
    };
    const noHandler = () => cleanup();

    yes.addEventListener("click", yesHandler);
    no.addEventListener("click", noHandler);
}

// --- Charger les informations utilisateur depuis l'API ---
async function loadUserData() {
    const userInfo = getUserInfoFromToken();
    if (!userInfo || !userInfo.id_utilisateur) {
        showNotification("Session expirée, veuillez vous reconnecter", "error");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/users/${userInfo.id_utilisateur}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        showNotification("Erreur lors du chargement des données: " + error.message, "error");
        return null;
    }
}

// --- Pré-remplit le formulaire ---
async function loadUserIntoForm() {
    try {
        const userData = await loadUserData();
        if (!userData) return;

        inputPrenom.value = userData.prénom || "";
        inputNom.value = userData.nom || "";
        inputEmail.value = userData.email || "";
        inputCurrentPassword.value = "";
        inputNewPassword.value = "";

        // Sauvegarder les valeurs initiales pour détecter les modifications
        inputNom.defaultValue = inputNom.value;
        inputPrenom.defaultValue = inputPrenom.value;
        inputEmail.defaultValue = inputEmail.value;
    } catch (err) {
        console.error("Impossible de pré-remplir le formulaire utilisateur :", err);
    }
}

// --- Mettre à jour un utilisateur ---
async function submitUpdate(e) {
    e.preventDefault();

    const userInfo = getUserInfoFromToken();
    if (!userInfo || !userInfo.id_utilisateur) {
        showNotification("Session expirée, veuillez vous reconnecter", "error");
        return;
    }

    const payload = {};
    
    // Vérifier quels champs ont été modifiés
    if (inputNom.value.trim() !== inputNom.defaultValue) {
        payload.nom = inputNom.value.trim();
    }
    if (inputPrenom.value.trim() !== inputPrenom.defaultValue) {
        payload.prénom = inputPrenom.value.trim();
    }
    if (inputEmail.value.trim() !== inputEmail.defaultValue) {
        payload.email = inputEmail.value.trim();
    }
    
    // Gestion du mot de passe
    if (inputNewPassword.value.trim()) {
        if (!inputCurrentPassword.value.trim()) {
            showNotification("Veuillez entrer votre mot de passe actuel", "error");
            return;
        }
        payload.mot_de_passe = inputNewPassword.value.trim();
        payload.current_password = inputCurrentPassword.value.trim();
    }

    try {
        const res = await fetch(`http://localhost:3001/api/users/${userInfo.id_utilisateur}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de la mise à jour");

        // Mise à jour des valeurs par défaut
        inputNom.defaultValue = inputNom.value;
        inputPrenom.defaultValue = inputPrenom.value;
        inputEmail.defaultValue = inputEmail.value;
        
        // Vider les champs de mot de passe
        inputCurrentPassword.value = "";
        inputNewPassword.value = "";

        showNotification("Profil mis à jour avec succès ✅", "success");

        // 🔹 Redirection vers la session / dashboard après update
        setTimeout(() => {
            window.location.href = "MonSiteAccueil.html"; // <- Change selon ta page de session
        }, 1200);

    } catch (err) {
        console.error(err);
        showNotification("Erreur : " + err.message, "error");
    }
}

// --- Suppression utilisateur ---
function attachDeleteHandler() {
    deleteBtn.addEventListener("click", () => {
        showDeleteModal(async () => {
            const userInfo = getUserInfoFromToken();
            if (!userInfo || !userInfo.id_utilisateur) {
                showNotification("Session expirée, veuillez vous reconnecter", "error");
                return;
            }

            try {
                const res = await fetch(`http://localhost:3001/api/users/${userInfo.id_utilisateur}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${getAuthToken()}`
                    }
                });

                if (!res.ok) {
                    const result = await res.json();
                    throw new Error(result.error || "Erreur lors de la suppression");
                }

                // Suppression du token (cookie) et session
                sessionStorage.removeItem('user');
                document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
                showNotification("Compte supprimé 🚨", "success");

                setTimeout(() => {
                    window.location.href = "signup.html";
                }, 1200);
            } catch (err) {
                console.error(err);
                showNotification("Erreur : " + err.message, "error");
            }
        });
    });
}

// --- Initialisation ---
async function initUserPage() {
    // Vérification de l'authentification
    const token = getAuthToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    await loadUserIntoForm();
    if (userForm) userForm.addEventListener("submit", submitUpdate);
    attachDeleteHandler();
    ensureDeleteModal();
}

initUserPage();
