document.addEventListener("DOMContentLoaded", () => {
  const adminDate = document.getElementById("adminDate");
  const timeList = document.getElementById("timeList");
  const blockedList = document.getElementById("blockedList");
  const clearAllBtn = document.getElementById("clearAll");
  const logoutBtn = document.getElementById("logoutBtn");

  const mondayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];
  const thursdayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];

  function getBlocked() {
    return JSON.parse(localStorage.getItem("blockedSlots") || "[]");
  }

  function saveBlocked(list) {
    localStorage.setItem("blockedSlots", JSON.stringify(list));
    renderBlockedList();
  }

  function renderBlockedList() {
    const blocked = getBlocked();
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

  function renderTimes() {
    timeList.innerHTML = "";

    const date = adminDate.value;
    if (!date) return;

    const day = new Date(date).getDay();
    if (day !== 1 && day !== 4) {
      timeList.innerHTML = "<p>Nur Montag und Donnerstag sind buchbar.</p>";
      return;
    }

    const times = day === 1 ? mondayTimes : thursdayTimes;
    const blocked = getBlocked();

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

      div.addEventListener("click", () => {
        let list = getBlocked();
        if (isBlocked) {
          list = list.filter(x => x !== key);
        } else {
          list.push(key);
        }
        saveBlocked(list);
        renderTimes();
      });

      timeList.appendChild(div);
    });
  }

  if (adminDate) {
    adminDate.addEventListener("input", renderTimes);
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (confirm("Alle Sperrungen wirklich löschen?")) {
        saveBlocked([]);
        renderTimes();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("adminLoggedIn");
      window.location.href = "login.html";
    });
  }

  renderBlockedList();
});
