// admin.js
const API_BASE_URL = 'http://localhost:3001/api';

// Utility Functions
function getAuthToken() {
    return localStorage.getItem('token');
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '../DossierHtml/login.html';
        return;
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        if (response.status === 401) {
            window.location.href = '../DossierHtml/login.html';
            return;
        }
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// Navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;
            
            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            // Load section data
            switch(targetSection) {
                case 'dashboard':
                    loadDashboardData();
                    break;
                case 'users':
                    loadUsers();
                    break;
                case 'sites':
                    loadSites();
                    break;
                case 'categories':
                    loadCategories();
                    break;
            }
        });
    });
}

// Dashboard
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
        document.getElementById('pendingSiteCount').textContent = 
            sites.filter(site => !site.valide).length;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Erreur lors du chargement du tableau de bord', 'error');
    }
}

// Users Management
async function loadUsers() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users`);
        const users = await response.json();

        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id_utilisateur}</td>
                <td>${user.nom}</td>
                <td>${user.prénom}</td>
                <td>${user.email}</td>
                <td>${getRoleName(user.Id_Role)}</td>
                <td>
                    <button onclick="editUser(${user.id_utilisateur})" class="btn-secondary">Éditer</button>
                    <button onclick="deleteUser(${user.id_utilisateur})" class="btn-danger">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Erreur lors du chargement des utilisateurs', 'error');
    }
}

function getRoleName(roleId) {
    const roles = {
        1: 'Administrateur',
        2: 'Modérateur',
        3: 'Utilisateur'
    };
    return roles[roleId] || 'Utilisateur';
}

async function editUser(userId = null) {
    const userModal = document.getElementById('userModal');
    const userForm = document.getElementById('userForm');
    const userIdInput = document.getElementById('userId');

    if (userId) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`);
            const user = await response.json();

            userIdInput.value = user.id_utilisateur;
            document.getElementById('userNom').value = user.nom;
            document.getElementById('userPrenom').value = user.prénom;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.Id_Role;
        } catch (error) {
            console.error('Error loading user:', error);
            showNotification('Erreur lors du chargement de l\'utilisateur', 'error');
            return;
        }
    } else {
        userForm.reset();
        userIdInput.value = '';
    }

    userModal.style.display = 'block';
}

async function saveUser(event) {
    event.preventDefault();
    const userId = document.getElementById('userId').value;
    const userData = {
        nom: document.getElementById('userNom').value,
        prénom: document.getElementById('userPrenom').value,
        email: document.getElementById('userEmail').value,
        Id_Role: document.getElementById('userRole').value
    };

    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.mot_de_passe = password;
    }

    try {
        const method = userId ? 'PUT' : 'POST';
        const url = userId 
            ? `${API_BASE_URL}/users/${userId}`
            : `${API_BASE_URL}/users`;

        const response = await fetchWithAuth(url, {
            method,
            body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

        document.getElementById('userModal').style.display = 'none';
        showNotification('Utilisateur sauvegardé avec succès');
        loadUsers();
    } catch (error) {
        console.error('Error saving user:', error);
        showNotification('Erreur lors de la sauvegarde de l\'utilisateur', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');

        showNotification('Utilisateur supprimé avec succès');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
    }
}

// Sites Management
async function loadSites() {
    try {
        const [sitesResponse, categoriesResponse] = await Promise.all([
            fetchWithAuth(`${API_BASE_URL}/sites`),
            fetchWithAuth(`${API_BASE_URL}/categories`)
        ]);

        const sites = await sitesResponse.json();
        const categories = await categoriesResponse.json();

        const tbody = document.querySelector('#sitesTable tbody');
        tbody.innerHTML = '';

        sites.forEach(site => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${site.id}</td>
                <td>${site.nom}</td>
                <td><a href="${site.url}" target="_blank">${site.url}</a></td>
                <td>${site.categorie || 'Non catégorisé'}</td>
                <td>${site.valide ? 'Validé' : 'En attente'}</td>
                <td>
                    <button onclick="editSite(${site.id})" class="btn-secondary">Éditer</button>
                    <button onclick="deleteSite(${site.id})" class="btn-danger">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update categories in site form
        const categorySelect = document.getElementById('siteCategory');
        categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id_categorie;
            option.textContent = category.nom;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading sites:', error);
        showNotification('Erreur lors du chargement des sites', 'error');
    }
}

async function editSite(siteId = null) {
    const siteModal = document.getElementById('siteModal');
    const siteForm = document.getElementById('siteForm');
    const siteIdInput = document.getElementById('siteId');

    if (siteId) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/sites/${siteId}`);
            const site = await response.json();

            siteIdInput.value = site.id;
            document.getElementById('siteName').value = site.nom;
            document.getElementById('siteUrl').value = site.url;
            document.getElementById('siteDescription').value = site.description;
            document.getElementById('siteCategory').value = site.id_categorie;
            document.getElementById('siteImage').value = site.image;
            document.getElementById('siteValid').checked = site.valide;
        } catch (error) {
            console.error('Error loading site:', error);
            showNotification('Erreur lors du chargement du site', 'error');
            return;
        }
    } else {
        siteForm.reset();
        siteIdInput.value = '';
    }

    siteModal.style.display = 'block';
}

async function saveSite(event) {
    event.preventDefault();
    const siteId = document.getElementById('siteId').value;
    const siteData = {
        nom: document.getElementById('siteName').value,
        url: document.getElementById('siteUrl').value,
        description: document.getElementById('siteDescription').value,
        id_categorie: document.getElementById('siteCategory').value,
        image: document.getElementById('siteImage').value,
        valide: document.getElementById('siteValid').checked
    };

    try {
        const method = siteId ? 'PUT' : 'POST';
        const url = siteId 
            ? `${API_BASE_URL}/sites/${siteId}`
            : `${API_BASE_URL}/sites`;

        const response = await fetchWithAuth(url, {
            method,
            body: JSON.stringify(siteData)
        });

        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

        document.getElementById('siteModal').style.display = 'none';
        showNotification('Site sauvegardé avec succès');
        loadSites();
    } catch (error) {
        console.error('Error saving site:', error);
        showNotification('Erreur lors de la sauvegarde du site', 'error');
    }
}

async function deleteSite(siteId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) return;

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/sites/${siteId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');

        showNotification('Site supprimé avec succès');
        loadSites();
    } catch (error) {
        console.error('Error deleting site:', error);
        showNotification('Erreur lors de la suppression du site', 'error');
    }
}

// Categories Management
async function loadCategories() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/categories`);
        const categories = await response.json();

        const tbody = document.querySelector('#categoriesTable tbody');
        tbody.innerHTML = '';

        categories.forEach(category => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${category.id_categorie}</td>
                <td>${category.nom}</td>
                <td>${category.description}</td>
                <td>
                    <button onclick="editCategory(${category.id_categorie})" class="btn-secondary">Éditer</button>
                    <button onclick="deleteCategory(${category.id_categorie})" class="btn-danger">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Erreur lors du chargement des catégories', 'error');
    }
}

async function editCategory(categoryId = null) {
    const categoryModal = document.getElementById('categoryModal');
    const categoryForm = document.getElementById('categoryForm');
    const categoryIdInput = document.getElementById('categoryId');

    if (categoryId) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/categories/${categoryId}`);
            const category = await response.json();

            categoryIdInput.value = category.id_categorie;
            document.getElementById('categoryName').value = category.nom;
            document.getElementById('categoryDescription').value = category.description;
        } catch (error) {
            console.error('Error loading category:', error);
            showNotification('Erreur lors du chargement de la catégorie', 'error');
            return;
        }
    } else {
        categoryForm.reset();
        categoryIdInput.value = '';
    }

    categoryModal.style.display = 'block';
}

async function saveCategory(event) {
    event.preventDefault();
    const categoryId = document.getElementById('categoryId').value;
    const categoryData = {
        nom: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };

    try {
        const method = categoryId ? 'PUT' : 'POST';
        const url = categoryId 
            ? `${API_BASE_URL}/categories/${categoryId}`
            : `${API_BASE_URL}/categories`;

        const response = await fetchWithAuth(url, {
            method,
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

        document.getElementById('categoryModal').style.display = 'none';
        showNotification('Catégorie sauvegardée avec succès');
        loadCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        showNotification('Erreur lors de la sauvegarde de la catégorie', 'error');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');

        showNotification('Catégorie supprimée avec succès');
        loadCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification('Erreur lors de la suppression de la catégorie', 'error');
    }
}

// Modal Management
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close, .close-modal');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Setup form submissions
    document.getElementById('userForm').addEventListener('submit', saveUser);
    document.getElementById('siteForm').addEventListener('submit', saveSite);
    document.getElementById('categoryForm').addEventListener('submit', saveCategory);

    // Setup add buttons
    document.getElementById('addUserBtn').addEventListener('click', () => editUser());
    document.getElementById('addSiteBtn').addEventListener('click', () => editSite());
    document.getElementById('addCategoryBtn').addEventListener('click', () => editCategory());
}

// Setup search functionality
function setupSearch() {
    const searchInputs = {
        userSearch: '#usersTable tbody tr',
        siteSearch: '#sitesTable tbody tr',
        categorySearch: '#categoriesTable tbody tr'
    };

    Object.entries(searchInputs).forEach(([inputId, tableSelector]) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', () => {
            const searchTerm = input.value.toLowerCase();
            const rows = document.querySelectorAll(tableSelector);

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    });
}

// Logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '../DossierHtml/login.html';
        });
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupModals();
    setupSearch();
    setupLogout();
    loadDashboardData(); // Load initial dashboard data
});