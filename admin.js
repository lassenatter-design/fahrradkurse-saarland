document.addEventListener("DOMContentLoaded", () => {

  const dateInput = document.getElementById("adminDate");
  const timeList = document.getElementById("timeList");
  const blockedList = document.getElementById("blockedList");
  const clearAllBtn = document.getElementById("clearAll");

  const courseSelect = document.getElementById("courseSelect");
  const deleteCourse = document.getElementById("deleteCourse");

  let courses = {};
  let blockedSlots = [];

  // Heutiges Datum als Minimum
  const today = new Date().toISOString().split("T")[0];
  if (dateInput) dateInput.setAttribute("min", today);

  /* 🔥 Kurse laden */
  async function loadCourseList() {
    if (!courseSelect) return;

    courseSelect.innerHTML = `<option value="">Kurs auswählen…</option>`;
    const snap = await db.collection("courses").get();

    snap.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = doc.data().title;
      courseSelect.appendChild(opt);
    });
  }

  /* 🔥 Kurse laden (für Zeitliste) */
  async function loadCourses() {
    const snap = await db.collection("courses").get();
    snap.forEach(doc => {
      const c = doc.data();
      courses[doc.id] = c;
    });
  }

  /* 🔥 Gesperrte Slots laden */
  async function loadBlockedSlots() {
    const snap = await db.collection("blockedSlots").get();
    blockedSlots = snap.docs.map(d => d.id);
    renderBlockedList();
  }

  /* 🔥 Gesperrte Liste anzeigen */
  function renderBlockedList() {
    if (!blockedList) return;
    blockedList.innerHTML = "";

    if (blockedSlots.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Keine gesperrten Zeiten.";
      blockedList.appendChild(li);
      return;
    }

    blockedSlots.sort().forEach(id => {
      const li = document.createElement("li");
      li.textContent = id;
      blockedList.appendChild(li);
    });
  }

  /* 🔥 Zeitliste für gewähltes Datum anzeigen */
  async function renderTimeList() {
    if (!dateInput || !timeList) return;

    const date = dateInput.value;
    timeList.innerHTML = "";

    if (!date) return;

    const allTimes = new Set();
    Object.values(courses).forEach(c => {
      (c.times || []).forEach(t => allTimes.add(t));
    });

    if (allTimes.size === 0) {
      timeList.innerHTML = "<p>Keine Zeiten definiert.</p>";
      return;
    }

    Array.from(allTimes).sort().forEach(time => {
      const slotId = `${date} | ${time}`;
      const isBlocked = blockedSlots.includes(slotId);

      const card = document.createElement("div");
      card.classList.add("card");
      card.style.cursor = "pointer";

      card.innerHTML = `
        <h4>${time}</h4>
        <p>${isBlocked ? "Gesperrt" : "Frei"}</p>
      `;

      card.onclick = () => toggleSlot(slotId);
      timeList.appendChild(card);
    });
  }

  /* 🔥 Slot sperren / freigeben */
  async function toggleSlot(slotId) {
    const ref = db.collection("blockedSlots").doc(slotId);
    const exists = blockedSlots.includes(slotId);

    if (exists) {
      await ref.delete();
      blockedSlots = blockedSlots.filter(id => id !== slotId);
    } else {
      await ref.set({ createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      blockedSlots.push(slotId);
    }

    renderTimeList();
    renderBlockedList();
  }

  /* 🔥 Alle Sperrungen löschen */
  async function clearAll() {
    if (!confirm("Wirklich alle Sperrungen löschen?")) return;

    const snap = await db.collection("blockedSlots").get();
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    blockedSlots = [];
    renderTimeList();
    renderBlockedList();
  }

  /* 🔥 Kurs löschen */
  deleteCourse.onclick = async () => {
    const id = courseSelect.value;
    if (!id) return alert("Bitte Kurs auswählen.");

    if (!confirm("Willst du diesen Kurs wirklich löschen?")) return;

    await db.collection("courses").doc(id).delete();

    alert("Kurs gelöscht.");
    loadCourseList();
    courseSelect.value = "";
  };

  /* 🔥 Events */
  if (dateInput) dateInput.addEventListener("input", renderTimeList);
  if (clearAllBtn) clearAllBtn.addEventListener("click", clearAll);

  /* 🔥 Initial laden */
  (async () => {
    await loadCourseList();
    await loadCourses();
    await loadBlockedSlots();
    renderTimeList();
  })();
logoutBtn.onclick = () => {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
};

});
