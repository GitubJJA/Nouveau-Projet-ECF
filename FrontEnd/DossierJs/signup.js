// ----------------------------
// Imports
// ----------------------------
import { showNotification } from "./notifications.js";
// ----------------------------
// Signup
// ----------------------------
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const mot_de_passe = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, email, mot_de_passe }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");

      showNotification("Inscription réussie ! Vous pouvez maintenant vous connecter.", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500); // délai pour voir la notification
    } catch (err) {
      showNotification(err.message, "error");
    }
  });
}