document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("datePicker");
    const timePicker = document.getElementById("timePicker");

    if (!dateInput || !timePicker) return;

    const mondayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];
    const thursdayTimes = ["15:00–16:00", "16:00–17:00", "17:00–18:00"];

    function getBlocked() {
        return JSON.parse(localStorage.getItem("blockedSlots") || "[]");
    }

    dateInput.addEventListener("input", () => {
        const selected = new Date(dateInput.value);
        const day = selected.getDay();

        if (day !== 1 && day !== 4) {
            dateInput.value = "";
            timePicker.innerHTML = `<option value="">Bitte Montag oder Donnerstag wählen</option>`;
            alert("Du kannst nur Montag oder Donnerstag auswählen.");
            return;
        }

        const times = day === 1 ? mondayTimes : thursdayTimes;
        const blocked = getBlocked();
        const date = dateInput.value;

        timePicker.innerHTML = "";

        const available = times.filter(t => !blocked.includes(`${date} | ${t}`));

        if (available.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Keine Uhrzeiten mehr verfügbar";
            timePicker.appendChild(opt);
            return;
        }

        available.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t;
            timePicker.appendChild(opt);
        });
    });
});

