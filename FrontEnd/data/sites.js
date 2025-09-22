export let sites = [];

// Chemin par défaut pour les images locales
const DEFAULT_IMAGE = "/DossierImages/logoSitecard/default.png";

export async function loadSites() {
    try {
        const res = await fetch('http://localhost:3001/api/sites');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('API returned non-array');

        const mapped = data.map(site => {
            // Si le champ image est vide, utilise l'image par défaut
            // Sinon, on construit le chemin correct pour le front
            let imagePath = DEFAULT_IMAGE;
            if (site.image) {
                // Vérifie si l'image renvoyée par l'API est un chemin complet (URL) ou juste un nom de fichier
                if (site.image.startsWith("http") || site.image.startsWith("/")) {
                    imagePath = site.image; // chemin absolu ou URL externe
                } else {
                    // On suppose que le fichier est dans /DossierImages/logoSitecard/
                    imagePath = `/DossierImages/logoSitecard/${site.image}`;
                }
            }

            return {
                id: site.id_site || site.id,              // <-- identifiant unique du site
                id_utilisateur_1: site.id_utilisateur_1,  // <-- pour vérifier l'auteur
                name: site.nom || "Sans nom",
                description: site.description || "",
                url: site.url || "#",
                image: imagePath,
                category: site.categorie || "Divers"
            };
        });

        // Remplace le contenu du tableau `sites` sans casser la référence
        sites.splice(0, sites.length, ...mapped);
        return sites;
    } catch (err) {
        console.error('Failed to load sites:', err);
        return sites;
    }
}

// Chargement automatique au premier import
try {
    await loadSites();
    console.log('Initial sites load:', sites);
} catch (err) {
    console.error('Failed initial sites load:', err);
}
