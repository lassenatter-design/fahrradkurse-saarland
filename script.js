document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("datePicker");
  const timeSelect = document.getElementById("timePicker");
  const courseSelect = document.querySelector("select[name='course']");

  // Heutiges Datum blockieren
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // Firestore lesen
  async function getBlocked() {
    const snapshot = await db.collection("blockedSlots").get();
    const list = [];
    snapshot.forEach(doc => list.push(doc.id));
    return list;
  }

  // Welcher Kurs → welcher Tag?
  function getAllowedDayForCourse() {
    const course = courseSelect.value;

    if (course === "Kinderkurs") return 1; // Montag
    if (course === "Erwachsene-Anfaenger") return 4; // Donnerstag

    return null;
  }

  async function updateTimes() {
    const date = dateInput.value;
    const course = courseSelect.value;

    if (!date || !course) return;

    const selectedDay = new Date(date).getDay(); // 1 = Montag, 4 = Donnerstag
    const allowedDay = getAllowedDayForCourse();

    // ❌ Kurs hat festen Tag → Datum MUSS passen
    if (allowedDay !== null && selectedDay !== allowedDay) {
      alert("Für diesen Kurs ist nur ein bestimmter Tag buchbar.");

      // Uhrzeiten komplett deaktivieren
      timeSelect.disabled = true;

      // Alle Optionen verstecken
      [...timeSelect.options].forEach(opt => {
        opt.style.display = "none";
      });

      // Auswahl zurücksetzen
      timeSelect.value = "";

      return; // aber erst NACHDEM wir alles ausgeblendet haben
    }

    // ❌ Falls später mehr Kurse kommen → nur Mo/Do
    if (allowedDay === null && selectedDay !== 1 && selectedDay !== 4) {
      alert("Nur Montag und Donnerstag sind buchbar.");

      timeSelect.disabled = true;
      [...timeSelect.options].forEach(opt => opt.style.display = "none");
      timeSelect.value = "";
      return;
    }

    // Wenn wir hier sind → Tag ist gültig
    timeSelect.disabled = false;

    const blocked = await getBlocked();

    // Alle Optionen verstecken
    [...timeSelect.options].forEach(opt => {
      opt.style.display = "none";
      opt.disabled = false;
      opt.style.color = "#000";
    });

    // Nur passende Optionen anzeigen
    [...timeSelect.options].forEach(opt => {
      if (parseInt(opt.dataset.day) === selectedDay) {
        opt.style.display = "block";
      }
    });

    // Gesperrte Zeiten deaktivieren
    blocked.forEach(entry => {
      const [blockedDate, blockedTime] = entry.split(" | ");
      if (blockedDate === date) {
        const option = [...timeSelect.options].find(o => o.value === blockedTime);
        if (option) {
          option.disabled = true;
          option.style.color = "#999";
        }
      }
    });

    // Auswahl zurücksetzen
    timeSelect.value = "";
  }

  dateInput.addEventListener("input", updateTimes);
  courseSelect.addEventListener("input", updateTimes);
});
