const auth = firebase.auth();

loginBtn.onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await auth.signInWithEmailAndPassword(email, password);
    localStorage.setItem("adminLoggedIn", "true");
    window.location.href = "admin.html";
  } catch (err) {
    errorMsg.textContent = "Login fehlgeschlagen.";
  }
};
