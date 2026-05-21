console.log("ADMIN JS WIRD GELADEN");

document.addEventListener("DOMContentLoaded", () => {
  const adminDate = document.getElementById("adminDate");
  const timeList = document.getElementById("timeList");
  const blockedList = document.getElementById("blockedList");
  const clearAllBtn = document.getElementById("clearAll");
  const logoutBtn = document.getElementById("logoutBtn");

  const mondayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];
  const thursdayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];

  // --- FIRESTORE: BLOCKED SLOTS LADEN ---
  async function getBlocked() {
    const snapshot = await db.collection("blockedSlots").get();
    const list = [];
    snapshot.forEach(doc => list.push(doc.id));
    return list;
  }

  // --- FIRESTORE: BLOCKED SLOTS SPEICHERN ---
  async function saveBlocked(list) {
    // alles löschen
    const snap = await db.collection("blockedSlots").get();
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // neue Liste speichern
    const batch2 = db.batch();
    list.forEach(key => {
      const ref = db.collection("blockedSlots").doc(key);
      batch2.set(ref, { blocked: true });
    });
    await batch2.commit();

    renderBlockedList();
    renderTimes();
  }

  // --- ADMIN LISTE ---
  async function renderBlockedList() {
    const blocked = await getBlocked();
    blockedList.innerHTML = "";

    if (blocked.length === 0) {
      blockedList.innerHTML = "<li>Keine gesperrten Zeiten.</li>";
      return;
    }

    blocked.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry;
      blockedList.appendChild(li);
    });
  }

  // --- ADMIN ZEITEN ---
  async function renderTimes() {
    timeList.innerHTML = "";

    const date = adminDate.value;
    if (!date) return;

    const day = new Date(date).getDay();
    if (day !== 1 && day !== 4) {
      timeList.innerHTML = "<p>Nur Montag und Donnerstag sind buchbar.</p>";
      return;
    }

    const times = day === 1 ? mondayTimes : thursdayTimes;
    const blocked = await getBlocked();

    times.forEach(t => {
      const key = `${date} | ${t}`;
      const isBlocked = blocked.includes(key);

      const div = document.createElement("div");
      div.className = "card";
      div.style.cursor = "pointer";
      div.style.borderColor = isBlocked ? "#ff3b30" : "#e5e5ea";
      div.innerHTML = `
        <h3>${t}</h3>
        <p>${isBlocked ? "Ausgebucht" : "Verfügbar"}</p>
      `;

      div.addEventListener("click", async () => {
        let list = await getBlocked();
        if (isBlocked) {
          list = list.filter(x => x !== key);
        } else {
          list.push(key);
        }
        await saveBlocked(list);
      });

      timeList.appendChild(div);
    });
  }

  // --- ALLES LÖSCHEN ---
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", async () => {
      if (confirm("Alle Sperrungen wirklich löschen?")) {
        await saveBlocked([]);
      }
    });
  }

  // --- LOGOUT ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("adminLoggedIn");
      window.location.href = "login.html";
    });
  }

  // Start
  renderBlockedList();
  if (adminDate) adminDate.addEventListener("input", renderTimes);
});
