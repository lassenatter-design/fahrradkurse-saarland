document.addEventListener("DOMContentLoaded", () => {
    const adminDate = document.getElementById("adminDate");
    const timeList = document.getElementById("timeList");

    const mondayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];
    const thursdayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];

    const clearAllBtn = document.getElementById("clearAll");

    function getBlocked() {
        return JSON.parse(localStorage.getItem("blockedSlots") || "[]");
    }

    function saveBlocked(list) {
        localStorage.setItem("blockedSlots", JSON.stringify(list));
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
            div.style.borderColor = isBlocked ? "tomato" : "rgba(148,163,184,0.25)";
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

    adminDate.addEventListener("input", renderTimes);

    clearAllBtn.addEventListener("click", () => {
        if (confirm("Alle Sperrungen wirklich löschen?")) {
            saveBlocked([]);
            renderTimes();
        }
    });
});
