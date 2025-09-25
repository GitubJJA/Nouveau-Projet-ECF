// notifications.js
export function showNotification(message, type = "success", duration = 3000) {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const notif = document.createElement("div");
    notif.className = `notification ${type}`;
    notif.textContent = message;
    container.appendChild(notif);

    setTimeout(() => notif.classList.add("show"), 50);

    setTimeout(() => {
        notif.classList.remove("show");
        setTimeout(() => notif.remove(), 500);
    }, duration);
}
