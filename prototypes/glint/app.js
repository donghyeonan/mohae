const fields = [...document.querySelectorAll(".field")];
const hourlyRate = 32000;
const workPeriods = [[9, 12], [13, 18]];
const liveHours = document.querySelector("#liveHours");
const liveEarnings = document.querySelector("#liveEarnings");
const nowMarker = document.querySelector("#nowMarker");
const nowTime = document.querySelector("#nowTime");

function clearPinned() {
  for (const field of fields) {
    field.classList.remove("is-pinned");
    field.setAttribute("aria-pressed", "false");
  }
}

for (const field of fields) {
  field.addEventListener("click", () => {
    const wasPinned = field.classList.contains("is-pinned");
    clearPinned();
    if (!wasPinned) {
      field.classList.add("is-pinned");
      field.setAttribute("aria-pressed", "true");
    }
  });
  field.addEventListener("pointerenter", () => {
    if (!field.classList.contains("is-pinned")) clearPinned();
  });
  field.addEventListener("focus", () => {
    if (!field.classList.contains("is-pinned")) clearPinned();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") clearPinned();
});

function updateTime() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  let workedMinutes = 0;

  for (const [startHour, endHour] of workPeriods) {
    const start = startHour * 60;
    const end = endHour * 60;
    workedMinutes += Math.max(0, Math.min(minutes, end) - start);
  }

  const hours = workedMinutes / 60;
  liveHours.textContent = `${hours.toFixed(2)}h`;
  liveEarnings.textContent = Math.round(hours * hourlyRate).toLocaleString("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  });
  nowMarker.style.top = `${minutes / 14.4}%`;
  nowTime.textContent = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

updateTime();
setInterval(updateTime, 1000);
