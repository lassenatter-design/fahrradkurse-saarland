document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("datePicker");
    const timePicker = document.getElementById("timePicker");

    // Uhrzeiten
    const mondayTimes = ["15:00", "16:00", "17:00", "18:00"];
    const thursdayTimes = ["14:00", "15:00", "16:00", "17:00"];

    // Nur Montag (1) & Donnerstag (4) erlauben
    dateInput.addEventListener("input", () => {
        const selected = new Date(dateInput.value);
        const day = selected.getDay();

        if (day !== 1 && day !== 4) {
            dateInput.value = "";
            timePicker.innerHTML = `<option value="">Bitte Montag oder Donnerstag wählen</option>`;
            alert("Du kannst nur Montag oder Donnerstag auswählen.");
            return;
        }

        // Uhrzeiten automatisch setzen
        timePicker.innerHTML = "";

        const times = day === 1 ? mondayTimes : thursdayTimes;

        times.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t + " Uhr";
            timePicker.appendChild(opt);
        });
    });
});
