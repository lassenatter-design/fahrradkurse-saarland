document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("datePicker");
  const timeSelect = document.getElementById("timePicker");
  const courseSelect = document.getElementById("courseSelectPublic");

  let courses = {};        // Kurse aus Firestore
  let blockedSlots = [];   // Gesperrte Slots aus Firestore

  /* -----------------------------------------
     1. Mindestdatum setzen (heute)
  ----------------------------------------- */
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  /* -----------------------------------------
     2. Kurse aus Firestore laden
  ----------------------------------------- */
  async function loadCourses() {
    const snapshot = await db.collection("courses").get();
    snapshot.forEach(doc => {
      const data = doc.data();
      courses[data.formValue] = data;
    });
  }

  /* -----------------------------------------
     3. Gesperrte Slots laden
  ----------------------------------------- */
  async function loadBlockedSlots() {
    const snap = await db.collection("blockedSlots").get();
    blockedSlots = snap.docs.map(d => d.id);
  }

  /* -----------------------------------------
     4. Uhrzeiten dynamisch anzeigen
  ----------------------------------------- */
  async function updateTimes() {
    const date = dateInput.value;
    const selectedCourseValue = courseSelect.value;

    if (!date || !selectedCourseValue) {
      timeSelect.innerHTML = "";
      return;
    }

    const course = courses[selectedCourseValue];
    if (!course) return;

    const selectedDay = new Date(date).getDay(); // 1 = Montag, 4 = Donnerstag

    // ❌ Falscher Tag
    if (selectedDay !== course.day) {
      timeSelect.innerHTML = "";
      timeSelect.disabled = true;

      alert(
        `Dieser Kurs ist nur am ${
          course.day === 1 ? "Montag" : "Donnerstag"
        } buchbar.`
      );

      return;
    }

    // ✔ Richtiger Tag → Uhrzeiten anzeigen
    timeSelect.disabled = false;
    timeSelect.innerHTML = "";

    course.times.forEach(time => {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;

      // Prüfen, ob gesperrt
      const slotId = `${date} | ${time}`;
      if (blockedSlots.includes(slotId)) {
        option.disabled = true;
        option.style.color = "#999";
      }

      timeSelect.appendChild(option);
    });
  }

  /* -----------------------------------------
     5. Events
  ----------------------------------------- */
  dateInput.addEventListener("input", updateTimes);
  courseSelect.addEventListener("input", updateTimes);

  /* -----------------------------------------
     6. Initialisierung
  ----------------------------------------- */
  async function init() {
    await loadCourses();
    await loadBlockedSlots();
  }

  init();
});
