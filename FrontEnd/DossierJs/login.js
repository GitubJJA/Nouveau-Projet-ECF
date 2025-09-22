const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // On récupère l'email et le mot de passe
    const email = document.getElementById("email").value.trim();
    const mot_de_passe = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion");

      // Stockage du token + infos utilisateur
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Connexion réussie !");
      window.location.href = "MonSiteAccueil.html"; // redirection vers accueil

    } catch (err) {
      alert(err.message);
    }
  });
}
