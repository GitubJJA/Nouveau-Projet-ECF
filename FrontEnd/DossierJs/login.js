// ----------------------------
// Imports
// ----------------------------
import { showNotification } from "./notifications.js"; // 

// ----------------------------
// Login
// ----------------------------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showNotification("Connexion réussie !", "success");

      setTimeout(() => {
        window.location.href = "MonSiteAccueil.html";
      }, 1000); // petit délai pour voir la notification
    } catch (err) {
      showNotification(err.message, "error");
    }
  });
}
