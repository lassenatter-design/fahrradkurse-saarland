document.addEventListener("DOMContentLoaded", () => {

  /* ELEMENTE */
  const dateInput = document.getElementById("adminDate");
  const timeList = document.getElementById("timeList");
  const blockedList = document.getElementById("blockedList");
  const clearAllBtn = document.getElementById("clearAll");

  const courseSelect = document.getElementById("courseSelect");
  const deleteCourse = document.getElementById("deleteCourse");
  const logoutBtn = document.getElementById("logoutBtn");

  /* KURS-ERSTELLUNG */
  const newCourseId = document.getElementById("newCourseId");
  const newCourseTitle = document.getElementById("newCourseTitle");
  const newCourseLabel = document.getElementById("newCourseLabel");
  const newCourseFormValue = document.getElementById("newCourseFormValue");
  const newCourseDescription = document.getElementById("newCourseDescription");
  const newCoursePrice = document.getElementById("newCoursePrice");
  const newCourseDay = document.getElementById("newCourseDay");
  const newCourseTimes = document.getElementById("newCourseTimes");
  const newCourseImage = document.getElementById("newCourseImage");
  const createCourse = document.getElementById("createCourse");

  /* KURS-BEARBEITUNG */
  const courseTitle = document.getElementById("courseTitle");
  const courseLabel = document.getElementById("courseLabel");
  const courseFormValue = document.getElementById("courseFormValue");
  const courseDescription = document.getElementById("courseDescription");
  const coursePrice = document.getElementById("coursePrice");
  const courseDay = document.getElementById("courseDay");
  const courseTimes = document.getElementById("courseTimes");
  const courseImage = document.getElementById("courseImage");
  const courseImagePreview = document.getElementById("courseImagePreview");
  const saveCourse = document.getElementById("saveCourse");

  let courses = {};
  let blockedSlots = [];

  /* MIN-DATUM */
  const today = new Date().toISOString().split("T")[0];
  if (dateInput) dateInput.setAttribute("min", today);

  /* 🔥 KURS ERSTELLEN (OHNE STORAGE!) */
  createCourse.onclick = async () => {
    const id = newCourseId.value.trim();
    if (!id) return alert("Bitte Kurs-ID eingeben.");

    let imagePath = "";
    if (newCourseImage.files.length > 0) {
      imagePath = `courses/${id}.jpg`; // Bild muss in GitHub liegen
    }

    await db.collection("courses").doc(id).set({
      title: newCourseTitle.value,
      label: newCourseLabel.value,
      formValue: newCourseFormValue.value,
      description: newCourseDescription.value,
      price: newCoursePrice.value,
      day: parseInt(newCourseDay.value),
      times: newCourseTimes.value.split(",").map(t => t.trim()),
      image: imagePath
    });

    alert("Kurs erstellt.");
    loadCourseList();
  };

  /* 🔥 KURS-LISTE LADEN */
  async function loadCourseList() {
    courseSelect.innerHTML = '<option value="">Bitte auswählen…</option>';

    const snap = await db.collection("courses").get();
    snap.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = doc.data().title;
      courseSelect.appendChild(opt);
    });
  }

  /* 🔥 KURS LADEN */
  courseSelect.onchange = async () => {
    const id = courseSelect.value;
    if (!id) return;

    const snap = await db.collection("courses").doc(id).get();
    const c = snap.data();

    courseTitle.value = c.title;
    courseLabel.value = c.label;
    courseFormValue.value = c.formValue;
    courseDescription.value = c.description;
    coursePrice.value = c.price;
    courseDay.value = c.day;
    courseTimes.value = c.times.join(",");

    if (c.image) {
      courseImagePreview.src = c.image;
      courseImagePreview.style.display = "block";
    }
  };

  /* 🔥 KURS SPEICHERN */
  saveCourse.onclick = async () => {
    const id = courseSelect.value;
    if (!id) return alert("Bitte Kurs auswählen.");

    let imagePath = null;
    if (courseImage.files.length > 0) {
      imagePath = `courses/${id}.jpg`;
    }

    const update = {
      title: courseTitle.value,
      label: courseLabel.value,
      formValue: courseFormValue.value,
      description: courseDescription.value,
      price: coursePrice.value,
      day: parseInt(courseDay.value),
      times: courseTimes.value.split(",").map(t => t.trim())
    };

    if (imagePath) update.image = imagePath;

    await db.collection("courses").doc(id).set(update, { merge: true });

    alert("Kurs gespeichert.");
  };

  /* 🔥 KURS LÖSCHEN */
  deleteCourse.onclick = async () => {
    const id = courseSelect.value;
    if (!id) return alert("Bitte Kurs auswählen.");

    if (!confirm("Willst du diesen Kurs wirklich löschen?")) return;

    await db.collection("courses").doc(id).delete();

    alert("Kurs gelöscht.");
    loadCourseList();
    courseSelect.value = "";
  };

  /* 🔥 ZEITEN SPERREN */
  async function loadCourses() {
    const snap = await db.collection("courses").get();
    snap.forEach(doc => {
      courses[doc.id] = doc.data();
    });
  }

  async function loadBlockedSlots() {
    const snap = await db.collection("blockedSlots").get();
    blockedSlots = snap.docs.map(d => d.id);
    renderBlockedList();
  }

  function renderBlockedList() {
    blockedList.innerHTML = "";

    if (blockedSlots.length === 0) {
      blockedList.innerHTML = "<li>Keine gesperrten Zeiten.</li>";
      return;
    }

    blockedSlots.sort().forEach(id => {
      const li = document.createElement("li");
      li.textContent = id;
      blockedList.appendChild(li);
    });
  }

  async function renderTimeList() {
    const date = dateInput.value;
    timeList.innerHTML = "";
    if (!date) return;

    const allTimes = new Set();
    Object.values(courses).forEach(c => (c.times || []).forEach(t => allTimes.add(t)));

    Array.from(allTimes).sort().forEach(time => {
      const slotId = `${date} | ${time}`;
      const isBlocked = blockedSlots.includes(slotId);

      const card = document.createElement("div");
      card.classList.add("card");
      card.style.cursor = "pointer";
      card.innerHTML = `<h4>${time}</h4><p>${isBlocked ? "Gesperrt" : "Frei"}</p>`;
      card.onclick = () => toggleSlot(slotId);

      timeList.appendChild(card);
    });
  }

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

  if (dateInput) dateInput.addEventListener("input", renderTimeList);
  if (clearAllBtn) clearAllBtn.addEventListener("click", clearAll);

  /* 🔥 LOGOUT */
  logoutBtn.onclick = () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "login.html";
  };

  /* 🔥 INITIAL */
  (async () => {
    await loadCourseList();
    await loadCourses();
    await loadBlockedSlots();
    renderTimeList();
  })();

});
