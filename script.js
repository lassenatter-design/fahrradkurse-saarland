// MOBILE MENU
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// BUCHUNGSSYSTEM
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("datePicker");
  const timePicker = document.getElementById("timePicker");

  if (!dateInput || !timePicker) return;

  // Zeiten, die buchbar sind
  const mondayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];
  const thursdayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];

  // Gesperrte Zeiten aus Admin-Panel holen
  function getBlocked() {
    return JSON.parse(localStorage.getItem("blockedSlots") || "[]");
  }

  // Wenn Datum geändert wird
  dateInput.addEventListener("input", () => {
    const selected = new Date(dateInput.value);
    const day = selected.getDay();

    // Nur Montag (1) und Donnerstag (4)
    if (day !== 1 && day !== 4) {
      dateInput.value = "";
      timePicker.innerHTML = `<option>Bitte Montag oder Donnerstag wählen</option>`;
      return;
    }

    const times = day === 1 ? mondayTimes : thursdayTimes;
    const blocked = getBlocked();
    const date = dateInput.value;

    timePicker.innerHTML = "";

    // Nur freie Zeiten anzeigen
    const available = times.filter(t => !blocked.includes(`${date} | ${t}`));

    if (available.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "Keine freien Zeiten verfügbar";
      timePicker.appendChild(opt);
      return;
    }

    available.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      timePicker.appendChild(opt);
    });
  });
});
