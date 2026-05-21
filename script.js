document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("datePicker");
  const timeSelect = document.getElementById("timePicker");

  // Firestore: gesperrte Slots laden
  async function getBlocked() {
    const snapshot = await db.collection("blockedSlots").get();
    const list = [];
    snapshot.forEach(doc => list.push(doc.id));
    return list;
  }

  // Zeiten aktualisieren, wenn Datum gewählt wird
  async function updateTimes() {
    const date = dateInput.value;
    if (!date) return;

    const day = new Date(date).getDay();

    // Nur Montag (1) & Donnerstag (4)
    if (day !== 1 && day !== 4) {
      alert("Nur Montag und Donnerstag sind buchbar.");
      timeSelect.disabled = true;
      return;
    }

    timeSelect.disabled = false;

    const blocked = await getBlocked();

    // Erst alles freigeben
    [...timeSelect.options].forEach(opt => {
      opt.disabled = false;
      opt.style.color = "#000";
    });

    // Dann gesperrte Zeiten deaktivieren
    blocked.forEach(entry => {
      const [blockedDate, blockedTime] = entry.split(" | ");

      if (blockedDate === date) {
        const option = [...timeSelect.options].find(
          o => o.value.includes(blockedTime)
        );
        if (option) {
          option.disabled = true;
          option.style.color = "#999";
        }
      }
    });
  }

  dateInput.addEventListener("input", updateTimes);
});
