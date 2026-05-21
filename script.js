document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("datePicker");
  const timeSelect = document.getElementById("timePicker");
  const courseSelect = document.querySelector("select[name='course']");

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

  // 🔥 Erlaubter Tag je nach Kurs
  function getAllowedDayForCourse() {
    const course = courseSelect.value;

    if (course.includes("Kinder")) return 1; // Montag
    if (course.includes("Erwachsene (Anfänger)")) return 4; // Donnerstag

    return null; // falls später mehr Kurse kommen
  }

  // 🔥 Zeiten aktualisieren
  async function updateTimes() {
    const date = dateInput.value;
    const course = courseSelect.value;

    if (!date || !course) return;

    const selectedDay = new Date(date).getDay(); // 1 = Montag, 4 = Donnerstag
    const allowedDay = getAllowedDayForCourse();

    // ❌ Kurs hat festen Tag → Datum MUSS passen
    if (allowedDay !== null && selectedDay !== allowedDay) {
      alert("Für diesen Kurs ist nur ein bestimmter Tag buchbar.");
      timeSelect.disabled = true;
      return;
    }

    // ❌ Falls später mehr Kurse kommen → nur Mo/Do
    if (allowedDay === null && selectedDay !== 1 && selectedDay !== 4) {
      alert("Nur Montag und Donnerstag sind buchbar.");
      timeSelect.disabled = true;
      return;
    }

    timeSelect.disabled = false;

    const blocked = await getBlocked();

    // 🔥 Alle Optionen verstecken
    [...timeSelect.options].forEach(opt => {
      opt.style.display = "none";
      opt.disabled = false;
      opt.style.color = "#000";
    });

    // 🔥 Nur passende Optionen anzeigen
    [...timeSelect.options].forEach(opt => {
      if (parseInt(opt.dataset.day) === selectedDay) {
        opt.style.display = "block";
      }
    });

    // 🔥 Gesperrte Zeiten deaktivieren
    blocked.forEach(entry => {
      const [blockedDate, blockedTime] = entry.split(" | ");

      if (blockedDate === date) {
        const option = [...timeSelect.options].find(
          o => o.value === blockedTime
        );
        if (option) {
          option.disabled = true;
          option.style.color = "#999";
        }
      }
    });

    // 🔥 Auswahl zurücksetzen
    timeSelect.value = "";
  }

  dateInput.addEventListener("input", updateTimes);
  courseSelect.addEventListener("input", updateTimes);
});
