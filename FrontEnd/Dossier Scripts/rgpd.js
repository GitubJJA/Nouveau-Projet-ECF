// ----------------------------
// RGPD banner
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("rgpd-banner");
  const acceptBtn = document.getElementById("rgpd-accept");

  if (!localStorage.getItem("rgpdAccepted")) {
    banner.classList.add("show");
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("rgpdAccepted", "true");
    banner.classList.remove("show");
    setTimeout(() => {
      banner.style.display = "none";
    }, 400); // attend la fin de la transition
  });
});