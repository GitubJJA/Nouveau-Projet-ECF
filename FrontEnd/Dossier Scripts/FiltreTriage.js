export function filtrerSitesParRecherche(searchTerm, afficherAccueil, afficherSites) {
    searchTerm = searchTerm.toLowerCase();
    if (searchTerm === "") {
        afficherAccueil();
        return;
    }
    if (!document.querySelector('.site-card')) {
        afficherSites();
    }
    const siteCards = document.querySelectorAll('.site-card');
    let found = false;
    siteCards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            card.style.display = 'grid';
            found = true;
        } else {
            card.style.display = 'none';
        }
    });
}
export function filtrerParCategorie(event, sites, afficherAccueil, afficherSites) {
    event.preventDefault();
    const cat = event.currentTarget.dataset.category;
    if (cat === "all") {
        afficherAccueil();
    } else {
        afficherSites(sites.filter(site => site.category.toLowerCase() === cat.toLowerCase()));
    }
}
