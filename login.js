const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = async () => {
  try {
    await firebase.auth().signInWithEmailAndPassword(email.value, password.value);
    localStorage.setItem("adminLoggedIn", "true");
    window.location.href = "admin.html";
  } catch (err) {
    alert("Login fehlgeschlagen: " + err.message);
  }
};
