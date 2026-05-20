function handleSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const kurs = document.getElementById("kurs").value;
    const nachricht = document.getElementById("nachricht").value.trim();
    const status = document.getElementById("form-status");

    if (!name || !email || !nachricht) {
        status.textContent = "Bitte fülle alle Pflichtfelder aus.";
        status.style.color = "#ff5252";
        return false;
    }

    // Hier könntest du später echten Versand einbauen (z.B. mit Formspree / Backend)
    status.textContent = "Danke für deine Anfrage! Ich melde mich so schnell wie möglich.";
    status.style.color = "#00e676";

    // Felder leeren
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("nachricht").value = "";

    return false;
}
