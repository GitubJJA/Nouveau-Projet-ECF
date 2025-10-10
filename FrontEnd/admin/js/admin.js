// admin.js
const API_BASE_URL = 'http://localhost:3001/api';

// ========================
// UTILITY FUNCTIONS
// ========================
function getAuthToken() {
    // read JWT from cookie named 'jwt'
    const cookie = document.cookie.split('; ').find(c => c.startsWith('jwt='));
    if (!cookie) return null;
    return cookie.split('=')[1];
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '../DossierHtml/login.html';
        return;
    }

    // Merge headers so callers can provide Content-Type or others without
    // overwriting the Authorization header
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`
    };
    const mergedHeaders = { ...defaultHeaders, ...(options.headers || {}) };

    try {
        const finalOptions = { ...options, headers: mergedHeaders };
        console.debug('fetchWithAuth', { url, method: finalOptions.method || 'GET', tokenPresent: !!token });
        const response = await fetch(url, finalOptions);

        if (response.status === 401) {
            // Not authenticated
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || 'user_not_authenticated');
        }

        if (response.status === 403) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || 'forbidden');
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// ========================
// NAVIGATION
// ========================
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.section;
            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(target).classList.add('active');

            // Load section data
            if (target === 'dashboard') loadDashboardData();
            else if (target === 'users') loadUsers();
            else if (target === 'sites') loadSites();
            else if (target === 'categories') loadCategories();
        });
    });
}

// ========================
// DASHBOARD
// ========================
async function loadDashboardData() {
    try {
        const [usersResponse, sitesResponse] = await Promise.all([
            fetchWithAuth(`${API_BASE_URL}/users`),
            fetchWithAuth(`${API_BASE_URL}/sites`)
        ]);

        const users = await usersResponse.json();
        const sites = await sitesResponse.json();

        document.getElementById('userCount').textContent = users.length;
        document.getElementById('siteCount').textContent = sites.length;
        document.getElementById('pendingSiteCount').textContent = sites.filter(s => !s.valide).length;
    } catch (error) {
        console.error(error);
        showNotification('Erreur lors du chargement du tableau de bord', 'error');
    }
}

// ========================
// USERS
// ========================
function getRoleName(roleId) {
    return {1: 'Administrateur', 2: 'Modérateur', 3: 'Utilisateur'}[roleId] || 'Utilisateur';
}

async function loadUsers() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users`);
        const users = await response.json();
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        // determine admin
        let isAdmin = false;
        try {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed && parsed.Id_Role === 1) isAdmin = true;
            } else {
                const token = getAuthToken();
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1] || ''));
                    if (payload && payload.Id_Role === 1) isAdmin = true;
                }
            }
        } catch (err) { console.warn('role parse err', err); }

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id_utilisateur}</td>
                <td>${user.nom}</td>
                <td>${user.prénom}</td>
                <td>${user.email}</td>
                <td>${getRoleName(user.Id_Role)}</td>
                <td>${isAdmin ? '' : ''}</td>
            `;
            // Buttons
            const tdActions = tr.querySelector('td:last-child');
            if (isAdmin) {
                const btnEdit = document.createElement('button');
                btnEdit.className = 'btn-secondary edit-user';
                btnEdit.textContent = 'Éditer';
                btnEdit.dataset.id = user.id_utilisateur;

                const btnDelete = document.createElement('button');
                btnDelete.className = 'btn-danger delete-user';
                btnDelete.textContent = 'Supprimer';
                btnDelete.dataset.id = user.id_utilisateur;

                tdActions.appendChild(btnEdit);
                tdActions.appendChild(btnDelete);
            }
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        showNotification('Erreur lors du chargement des utilisateurs', 'error');
    }
}

async function editUser(userId = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const userIdInput = document.getElementById('userId');

    if (userId) {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`);
            const user = await res.json();
            userIdInput.value = user.id_utilisateur;
            document.getElementById('userNom').value = user.nom;
            document.getElementById('userPrenom').value = user.prénom;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.Id_Role;
        } catch (e) {
            console.error(e);
            showNotification('Erreur chargement utilisateur', 'error');
            return;
        }
    } else form.reset();

    modal.style.display = 'block';
}

async function saveUser(e) {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const data = {
        nom: document.getElementById('userNom').value,
        prénom: document.getElementById('userPrenom').value,
        email: document.getElementById('userEmail').value,
        Id_Role: Number(document.getElementById('userRole').value)
    };
    const password = document.getElementById('userPassword').value;
    if (password) data.mot_de_passe = password;

    try {
        const method = userId ? 'PUT' : 'POST';
        const url = userId ? `${API_BASE_URL}/users/${userId}` : `${API_BASE_URL}/users`;

    const res = await fetchWithAuth(url, {method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
        if (!res.ok) throw new Error('Erreur sauvegarde');

        document.getElementById('userModal').style.display = 'none';
        showNotification('Utilisateur sauvegardé');
        loadUsers();
    } catch (e) {
        console.error(e);
        showNotification('Erreur sauvegarde utilisateur', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
        const res = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {method: 'DELETE'});
        if (!res.ok) throw new Error('Erreur suppression');
        showNotification('Utilisateur supprimé');
        loadUsers();
    } catch (e) {
        console.error(e);
        showNotification('Erreur suppression utilisateur', 'error');
    }
}

// ========================
// SITES
// ========================
async function loadSites() {
    try {
        // Récupérer les réponses
        const [sitesRes, catRes] = await Promise.all([
            fetchWithAuth(`${API_BASE_URL}/sites`),
            fetchWithAuth(`${API_BASE_URL}/categories`)
        ]);

        const sites = await sitesRes.json();
        const categories = await catRes.json();

        const tbody = document.querySelector('#sitesTable tbody');
        tbody.innerHTML = '';

        // Déterminer si l'utilisateur courant est un admin
        let isAdmin = false;
        try {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed && parsed.Id_Role === 1) isAdmin = true;
            } else {
                // fallback: try to read role from token payload
                const token = getAuthToken();
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1] || ''));
                    if (payload && payload.Id_Role === 1) isAdmin = true;
                }
            }
        } catch (err) {
            console.warn('Impossible de déterminer le rôle de l\'utilisateur:', err);
        }

        // fonction d'échappement XSS
        const escapeHtml = (str) => str ? str.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;") : '';

        sites.forEach(site => {
            const tr = document.createElement('tr');
            // Si l'utilisateur est admin, on affiche les boutons, sinon on laisse vide
            const actionsHtml = isAdmin ? `
                <button class="btn-secondary edit-site" data-id="${site.id}">Éditer</button>
                <button class="btn-danger delete-site" data-id="${site.id}">Supprimer</button>
            ` : '';

            tr.innerHTML = `
                <td>${escapeHtml(site.id)}</td>
                <td>${escapeHtml(site.nom)}</td>
                <td><a href="${escapeHtml(site.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(site.url)}</a></td>
                <td>${escapeHtml(site.categorie || 'Non catégorisé')}</td>
                <td>${site.valide ? 'Validé' : 'En attente'}</td>
                <td>${actionsHtml}</td>
            `;

            tbody.appendChild(tr);
        });

        // Update categories in form
        const select = document.getElementById('siteCategory');
        select.innerHTML = '<option value="">Sélectionnez une catégorie</option>';
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id_categorie;
            opt.textContent = c.nom;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error(e);
        showNotification('Erreur chargement sites', 'error');
    }
}

async function editSite(siteId = null) {
    const modal = document.getElementById('siteModal');
    const form = document.getElementById('siteForm');
    const idInput = document.getElementById('siteId');

    if (siteId) {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/sites/${siteId}`);
            const site = await res.json();
            idInput.value = site.id;
            document.getElementById('siteName').value = site.nom;
            document.getElementById('siteUrl').value = site.url;
            document.getElementById('siteDescription').value = site.description;
            document.getElementById('siteCategory').value = site.id_categorie;
            document.getElementById('siteImage').value = site.image;
            document.getElementById('siteValid').checked = site.valide;
        } catch (e) {
            console.error(e);
            showNotification('Erreur chargement site', 'error');
            return;
        }
    } else form.reset();

    modal.style.display = 'block';
}

async function saveSite(e) {
    e.preventDefault();
    const siteId = document.getElementById('siteId').value;
    const data = {
        nom: document.getElementById('siteName').value,
        url: document.getElementById('siteUrl').value,
        description: document.getElementById('siteDescription').value,
        id_categorie: document.getElementById('siteCategory').value,
        image: document.getElementById('siteImage').value,
        valide: document.getElementById('siteValid').checked
    };
    try {
        const method = siteId ? 'PUT' : 'POST';
        const url = siteId ? `${API_BASE_URL}/sites/${siteId}` : `${API_BASE_URL}/sites`;
        const res = await fetchWithAuth(url, {method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || errBody.message || 'Erreur sauvegarde site');
        }
        document.getElementById('siteModal').style.display = 'none';
        showNotification('Site sauvegardé');
        await loadSites();
    } catch (e) {
        console.error(e);
        showNotification('Erreur sauvegarde site', 'error');
    }
}

async function deleteSite(siteId) {
    if (!confirm('Supprimer ce site ?')) return;
    try {
        const res = await fetchWithAuth(`${API_BASE_URL}/sites/${siteId}`, {method: 'DELETE'});
        if (!res.ok) throw new Error('Erreur suppression site');
        showNotification('Site supprimé');
        loadSites();
    } catch (e) {
        console.error(e);
        showNotification('Erreur suppression site', 'error');
    }
}

// ========================
// CATEGORIES
// ========================
async function loadCategories() {
    try {
        const res = await fetchWithAuth(`${API_BASE_URL}/categories`);
        const categories = await res.json();
        const tbody = document.querySelector('#categoriesTable tbody');
        tbody.innerHTML = '';

        // determine if current user is admin
        let isAdmin = false;
        try {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed && parsed.Id_Role === 1) isAdmin = true;
            } else {
                const token = getAuthToken();
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1] || ''));
                    if (payload && payload.Id_Role === 1) isAdmin = true;
                }
            }
        } catch (err) { console.warn('role parse err', err); }

        categories.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cat.id_categorie}</td>
                <td>${cat.nom}</td>
                <td>${cat.description}</td>
                <td></td>
            `;
            const tdActions = tr.querySelector('td:last-child');
            if (isAdmin) {
                const btnEdit = document.createElement('button');
                btnEdit.className = 'btn-secondary edit-category';
                btnEdit.textContent = 'Éditer';
                btnEdit.dataset.id = cat.id_categorie;

                const btnDelete = document.createElement('button');
                btnDelete.className = 'btn-danger delete-category';
                btnDelete.textContent = 'Supprimer';
                btnDelete.dataset.id = cat.id_categorie;

                tdActions.appendChild(btnEdit);
                tdActions.appendChild(btnDelete);
            }
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
        showNotification('Erreur chargement catégories', 'error');
    }
}

async function editCategory(catId = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const idInput = document.getElementById('categoryId');

    if (catId) {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/categories/${catId}`);
            const cat = await res.json();
            idInput.value = cat.id_categorie;
            document.getElementById('categoryName').value = cat.nom;
            document.getElementById('categoryDescription').value = cat.description;
        } catch (e) {
            console.error(e);
            showNotification('Erreur chargement catégorie', 'error');
            return;
        }
    } else form.reset();

    modal.style.display = 'block';
}

async function saveCategory(e) {
    e.preventDefault();
    const catId = document.getElementById('categoryId').value;
    const data = {
        nom: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };
    try {
        const method = catId ? 'PUT' : 'POST';
        const url = catId ? `${API_BASE_URL}/categories/${catId}` : `${API_BASE_URL}/categories`;
        // Debug: check token presence
        const token = getAuthToken();
        console.debug('saveCategory: token present?', !!token);

        const res = await fetchWithAuth(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // If fetchWithAuth returned null (auth issue) or response is not ok, handle gracefully
        if (!res) throw new Error('Erreur de connexion ou non autorisé');
        if (!res.ok) {
            // Backend may not implement POST/PUT for categories (404) or return an error
            if (res.status === 404) {
                // Fallback: add category client-side so admin sees it in the UI (not persisted)
                addCategoryToTableClientSide(data.nom, data.description);
                document.getElementById('categoryModal').style.display = 'none';
                showNotification('Catégorie ajoutée localement (endpoint backend manquant). Elle ne sera pas persistée.', 'error');
                return;
            }
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || errBody.message || 'Erreur sauvegarde catégorie');
        }

        // Success path
        document.getElementById('categoryModal').style.display = 'none';
        showNotification('Catégorie sauvegardée');
        await loadCategories();
    } catch (e) {
        console.error(e);
        if (e.message === 'user_not_authenticated') {
            showNotification('Vous devez être connecté pour effectuer cette action. Veuillez vous reconnecter.', 'error');
            return;
        }
        // If the error is network or 404 and we already tried fallback above, provide clear message
        if (e.message && e.message.includes('404')) {
            addCategoryToTableClientSide(data.nom, data.description);
            document.getElementById('categoryModal').style.display = 'none';
            showNotification('Catégorie ajoutée localement (backend non implémenté).', 'error');
            return;
        }
        showNotification(e.message || 'Erreur sauvegarde catégorie', 'error');
    }
}

// Client-side fallback: insert a row in the categories table (temporary, not persisted)
function addCategoryToTableClientSide(nom, description) {
    const tbody = document.querySelector('#categoriesTable tbody');
    if (!tbody) return;
    const tempId = `tmp-${Date.now()}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${tempId}</td>
        <td>${nom}</td>
        <td>${description}</td>
        <td>
            <button class="btn-secondary" disabled>Éditer</button>
            <button class="btn-danger" disabled>Supprimer</button>
        </td>
    `;
    tbody.appendChild(tr);
    // Also add to category select in site form if exists
    const select = document.getElementById('siteCategory');
    if (select) {
        const opt = document.createElement('option');
        opt.value = tempId;
        opt.textContent = nom;
        select.appendChild(opt);
    }
}

async function deleteCategory(catId) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
        const res = await fetchWithAuth(`${API_BASE_URL}/categories/${catId}`, {method: 'DELETE'});
        if (!res.ok) throw new Error('Erreur suppression catégorie');
        showNotification('Catégorie supprimée');
        loadCategories();
    } catch (e) {
        console.error(e);
        showNotification('Erreur suppression catégorie', 'error');
    }
}

// ========================
// MODALS
// ========================
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close, .close-modal');
    closeBtns.forEach(btn => btn.addEventListener('click', () => modals.forEach(m => m.style.display = 'none')));
    window.addEventListener('click', e => modals.forEach(m => { if(e.target===m) m.style.display='none'; }));

    document.getElementById('userForm').addEventListener('submit', saveUser);
    document.getElementById('siteForm').addEventListener('submit', saveSite);
    document.getElementById('categoryForm').addEventListener('submit', saveCategory);

    document.getElementById('addUserBtn').addEventListener('click', () => editUser());
    document.getElementById('addSiteBtn').addEventListener('click', () => editSite());
    document.getElementById('addCategoryBtn').addEventListener('click', () => editCategory());
}

// ========================
// SEARCH
// ========================
function setupSearch() {
    const searches = [
        {input: 'userSearch', selector: '#usersTable tbody tr'},
        {input: 'siteSearch', selector: '#sitesTable tbody tr'},
        {input: 'categorySearch', selector: '#categoriesTable tbody tr'}
    ];
    searches.forEach(({input, selector}) => {
        const inp = document.getElementById(input);
        if (!inp) return;
        inp.addEventListener('input', () => {
            const term = inp.value.toLowerCase();
            document.querySelectorAll(selector).forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    });
}

// ========================
// LOGOUT
// ========================
function setupLogout() {
    const btn = document.getElementById('logoutBtn');
    btn?.addEventListener('click', () => {
        // Supprimer token et infos utilisateur stockés
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            // Supprimer cookie jwt si présent
            document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        } catch (e) {
            console.warn('Erreur lors du nettoyage de la session:', e);
        }
        // Redirection vers la page de connexion
        window.location.href = '../DossierHtml/login.html';
    });
}

// ========================
// EVENT DELEGATION (EDIT / DELETE)
// ========================
function setupTableButtons() {
    // Users
    document.querySelector('#usersTable tbody').addEventListener('click', e => {
        if(e.target.classList.contains('edit-user')) editUser(e.target.dataset.id);
        if(e.target.classList.contains('delete-user')) deleteUser(e.target.dataset.id);
    });

    // Sites
    document.querySelector('#sitesTable tbody').addEventListener('click', e => {
        if(e.target.classList.contains('edit-site')) editSite(e.target.dataset.id);
        if(e.target.classList.contains('delete-site')) deleteSite(e.target.dataset.id);
    });

    // Categories
    document.querySelector('#categoriesTable tbody').addEventListener('click', e => {
        if(e.target.classList.contains('edit-category')) editCategory(e.target.dataset.id);
        if(e.target.classList.contains('delete-category')) deleteCategory(e.target.dataset.id);
    });
}

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupModals();
    setupSearch();
    setupLogout();
    setupTableButtons();
    loadDashboardData();
});
