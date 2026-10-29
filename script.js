/* ========= CONFIGURACIÓN (edita aquí) ========= */
const BODA = {
  titulo: "Boda de Milton y Magaly",
  // Año, mes (0=enero … 10=noviembre), día, hora, minutos — hora de Guatemala (UTC-6)
  inicio: new Date("2026-11-21T17:00:00-06:00"),
  duracionHoras: 5,
  lugar: "Casa Gualom, Lotificación Gualom, zona 11, Cobán, Alta Verapaz",
  mapa: "https://maps.app.goo.gl/gqjE6JSJLyN85rks7",
  // Cambia 9 por la cantidad de fotos que tengas en la carpeta fotos/ (foto1.jpg, foto2.jpg…)
  fotos: Array.from({ length: 9 }, (_, n) => `fotos/foto${n + 1}.jpg`)
};

/* ========= PORTADA + MÚSICA ========= */
const audio = document.getElementById("musica");
const btnMusica = document.getElementById("musica-btn");
document.getElementById("abrir").addEventListener("click", () => {
  document.getElementById("portada").classList.add("fuera");
  document.body.classList.remove("bloqueado");
  document.body.classList.add("abierto");
  audio.volume = 0.6;
  audio.play().catch(() => btnMusica.classList.add("off"));
});
btnMusica.addEventListener("click", () => {
  if (audio.paused) { audio.play(); btnMusica.classList.remove("off"); }
  else { audio.pause(); btnMusica.classList.add("off"); }
});

/* ========= CUENTA REGRESIVA ========= */
const pad = n => String(n).padStart(2, "0");
function tick() {
  let diff = Math.max(0, BODA.inicio - new Date());
  const s = Math.floor(diff / 1000);
  document.getElementById("d").textContent = pad(Math.floor(s / 86400));
  document.getElementById("h").textContent = pad(Math.floor(s % 86400 / 3600));
  document.getElementById("m").textContent = pad(Math.floor(s % 3600 / 60));
  document.getElementById("s").textContent = pad(s % 60);
}
tick(); setInterval(tick, 1000);

/* ========= CALENDARIO VISIBLE ========= */
(function calendario() {
  const el = document.getElementById("calendario");
  // Se toma el mes/año de la fecha tal como se ve en Guatemala
  const [y, mo, dia] = [2026, 10, 21];
  const nombreMes = new Date(y, mo, 1).toLocaleDateString("es", { month: "long", year: "numeric" });
  const primero = new Date(y, mo, 1).getDay();           // 0 = domingo
  const total = new Date(y, mo + 1, 0).getDate();
  let html = `<h4>${nombreMes}</h4><div class="cal-grid">`;
  ["D", "L", "M", "M", "J", "V", "S"].forEach(d => html += `<div class="dia-sem">${d}</div>`);
  for (let i = 0; i < primero; i++) html += "<div></div>";
  for (let d = 1; d <= total; d++) html += `<div class="${d === dia ? "marcado" : ""}">${d}</div>`;
  el.innerHTML = html + "</div>";
})();

/* ========= AÑADIR AL CALENDARIO ========= */
const fin = new Date(BODA.inicio.getTime() + BODA.duracionHoras * 3600000);
const fmt = d => d.toISOString().replace(/[-:]|\.\d{3}/g, "");   // 20261121T230000Z
document.getElementById("btn-google").href =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(BODA.titulo)}` +
  `&dates=${fmt(BODA.inicio)}/${fmt(fin)}` +
  `&location=${encodeURIComponent(BODA.lugar)}` +
  `&details=${encodeURIComponent("Mapa: " + BODA.mapa)}`;

document.getElementById("btn-ics").addEventListener("click", () => {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Boda Magaly y Milton//ES",
    "BEGIN:VEVENT", "UID:boda-magaly-milton-2026@invitacion",
    `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(BODA.inicio)}`, `DTEND:${fmt(fin)}`,
    `SUMMARY:${BODA.titulo}`, `LOCATION:${BODA.lugar}`, `DESCRIPTION:Mapa: ${BODA.mapa}`,
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Mañana es la boda", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "boda-magaly-milton.ics";
  a.click();
});

/* ========= CARRUSEL ========= */
(function carrusel() {
  const pista = document.getElementById("pista");
  const puntos = document.getElementById("puntos");
  let i = 0, timer;
  BODA.fotos.forEach((src, n) => {
    const fig = document.createElement("figure");
    const fondo = new Image(), frente = new Image();
    fondo.src = frente.src = src; fondo.alt = ""; fondo.className = "fondo";
    frente.alt = `Foto ${n + 1} de Milton y Magaly`; frente.className = "frente"; frente.loading = "lazy";
    fig.append(fondo, frente); pista.appendChild(fig);
    const p = document.createElement("button");
    p.setAttribute("aria-label", `Ir a la foto ${n + 1}`);
    p.addEventListener("click", () => ir(n, true));
    puntos.appendChild(p);
  });
  function ir(n, manual) {
    i = (n + BODA.fotos.length) % BODA.fotos.length;
    pista.style.transform = `translateX(-${i * 100}%)`;
    [...puntos.children].forEach((p, k) => p.classList.toggle("on", k === i));
    if (manual) { clearInterval(timer); timer = setInterval(() => ir(i + 1), 5000); }
  }
  document.getElementById("prev").onclick = () => ir(i - 1, true);
  document.getElementById("next").onclick = () => ir(i + 1, true);
  // Deslizar con el dedo
  let x0 = null;
  pista.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
  pista.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) ir(i + (dx < 0 ? 1 : -1), true);
    x0 = null;
  });
  ir(0, true);
})();
