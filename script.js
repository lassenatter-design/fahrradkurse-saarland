document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("datePicker");
  const timeSelect = document.getElementById("timePicker");

  // 🔥 Heutiges Datum als Minimum setzen (keine Vergangenheit)
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // 🔥 Firestore: gesperrte Slots laden
  async function getBlocked() {
    const snapshot = await db.collection("blockedSlots").get();
    const list = [];
    snapshot.forEach(doc => list.push(doc.id));
    return list;
  }

  // 🔥 Zeiten aktualisieren, wenn Datum gewählt wird
  async function updateTimes() {
    const date = dateInput.value;
    if (!date) return;

    const day = new Date(date).getDay(); // 1 = Montag, 4 = Donnerstag

    // ❌ Andere Tage blockieren
    if (day !== 1 && day !== 4) {
      alert("Nur Montag und Donnerstag sind buchbar.");
      timeSelect.disabled = true;
      return;
    }

    timeSelect.disabled = false;

    const blocked = await getBlocked();

    // 🔥 Alle Optionen verstecken
    [...timeSelect.options].forEach(opt => {
      opt.disabled = false;
      opt.style.display = "none";
      opt.style.color = "#000";
    });

    // 🔥 Nur passende Optionen anzeigen
    [...timeSelect.options].forEach(opt => {
      if (day === 1 && opt.value.startsWith("Montag")) {
        opt.style.display = "block";
      }
      if (day === 4 && opt.value.startsWith("Donnerstag")) {
        opt.style.display = "block";
      }
    });

    // 🔥 Gesperrte Zeiten deaktivieren
    blocked.forEach(entry => {
      const [blockedDate, blockedTime] = entry.split(" | ");

      if (blockedDate === date) {
        const option = [...timeSelect.options].find(o => o.value.includes(blockedTime));
        if (option) {
          option.disabled = true;
          option.style.color = "#999";
        }
      }
    });
  }

  dateInput.addEventListener("input", updateTimes);
});
