document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    const ADMIN_USER = "Lasse";
    const ADMIN_PASS = "Lasse";

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem("adminLoggedIn", "true");
      window.location.href = "admin.html";
    } else {
      errorBox.style.display = "block";
    }
  });
});
