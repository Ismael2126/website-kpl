// Run everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initHeroMedia();
  initNotices();
  initVesselMovements();
  animateStats();
  applyGlobalLogo();
  initWeeklyPopupClose();
});

/* ===============================
   1) THEME
   =============================== */
function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  if (!toggle) return;

  const saved = localStorage.getItem("kpl-theme");
  if (saved === "light") {
    body.classList.replace("theme-dark", "theme-light");
    toggle.checked = false;
  } else {
    body.classList.replace("theme-light", "theme-dark");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.replace("theme-light", "theme-dark");
      localStorage.setItem("kpl-theme", "dark");
    } else {
      body.classList.replace("theme-dark", "theme-light");
      localStorage.setItem("kpl-theme", "light");
    }
  });
}

/* ===============================
   2) HERO VIDEO
   =============================== */
function initHeroMedia() {
  const heroBox = document.getElementById("hero-media");
  if (!heroBox) return;

  heroBox.innerHTML = `
      <video class="hero__video" src="assets/media/KPL_DRONE.mp4"
      autoplay muted loop playsinline></video>
  `;
}

/* ===============================
   3) NOTICES
   =============================== */
function initNotices() {
  const c = document.getElementById("notice-list");
  if (!c) return;
  loadNoticesFromSheet();
}

function loadNoticesFromSheet() {
  const SHEET_ID = "105qEW2kBnUb3rNWNmffHWAtnlpDOiavo8zFsXPbPrxk";
  const SHEET_NAME = "Notices";

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

  fetch(url)
    .then(r => r.text())
    .then(text => {
      const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
      const rows = json.table.rows;

      const box = document.getElementById("notice-list");
      box.innerHTML = "";

      rows.forEach(row => {
        const date = row.c[0]?.v || "";
        const title = row.c[1]?.v || "";
        const message = row.c[2]?.v || "";

        box.innerHTML += `
<div class="notice-card-box" 
     onclick="openNoticePopup('${title.replace(/'/g, "\\'")}', '${date}', \`${message}\`)">

  <h3 class="notice-card-title">📢 ${title}</h3>
  ${date ? `<p class="notice-card-date">${date}</p>` : ""}
  <p class="notice-card-text">${message}</p>

</div>`;
      });
    })
    .catch(err => console.error("Notices error:", err));
}

/* ===============================
   4) VESSEL MOVEMENTS API
   =============================== */
function initVesselMovements() {
  if (!document.getElementById("estimatedArrivals")) return;
  loadVesselMovements();
}

function createVMTable(data, columns) {
  if (!data || data.length === 0) return `<p>No data available.</p>`;

  let html = `<table><thead><tr>`;
  columns.forEach(c => html += `<th>${c.label}</th>`);
  html += `</tr></thead><tbody>`;

  data.forEach(item => {
    html += `<tr>`;
    columns.forEach(c => {
      let value = item[c.key];

      if (c.key.includes(".")) {
        const parts = c.key.split(".");
        value = item;
        parts.forEach(k => value = value ? value[k] : "-");
      }
      html += `<td>${value ?? "-"}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  return html;
}

function loadVesselMovements() {
  const apiURL =
    "https://api.allorigins.win/raw?url=https://my.kulhudhuffushiport.mv/api/vessel_noticeboard";

  fetch(apiURL)
    .then(res => res.json())
    .then(json => {
      document.querySelector("#estimatedArrivals").innerHTML =
        "🟡 Estimated Arrivals" +
        createVMTable(json.eta, [
          { label: "Vessel", key: "vessel_name" },
          { label: "GT", key: "gross_register_tonnage" },
          { label: "LAO", key: "loa" },
          { label: "ETA", key: "eta" },
          { label: "Last Port", key: "sourceport_name" },
          { label: "Arrival Port", key: "destinationport_name" }
        ]);

      document.querySelector("#arrivals").innerHTML =
        "🟢 Arrivals" +
        createVMTable(json.arrival, [
          { label: "Vessel", key: "voyage.vessel_name" },
          { label: "GT", key: "voyage.gross_register_tonnage" },
          { label: "LAO", key: "voyage.loa" },
          { label: "Date", key: "start_time" },
          { label: "From", key: "fromberth.name" },
          { label: "To", key: "toberth.name" }
        ]);

      document.querySelector("#departures").innerHTML =
        "🔵 Departures" +
        createVMTable(json.departure, [
          { label: "Vessel", key: "voyage.vessel_name" },
          { label: "GT", key: "voyage.gross_register_tonnage" },
          { label: "LAO", key: "voyage.loa" },
          { label: "Date", key: "start_time" },
          { label: "From", key: "fromberth.name" },
          { label: "To", key: "toberth.name" }
        ]);

      document.querySelector("#shifting").innerHTML =
        "🟣 Shifting" +
        createVMTable(json.shifting, [
          { label: "Vessel", key: "voyage.vessel_name" },
          { label: "GT", key: "voyage.gross_register_tonnage" },
          { label: "LAO", key: "voyage.loa" },
          { label: "Date", key: "start_time" },
          { label: "Berth From", key: "fromberth.name" },
          { label: "Berth To", key: "toberth.name" }
        ]);

      document.querySelector("#vesselsAtPort").innerHTML =
        "⚓ Vessels At Port" +
        createVMTable(json.atport, [
          { label: "Vessel", key: "vessel_name" },
          { label: "GT", key: "gross_register_tonnage" },
          { label: "LAO", key: "loa" },
          { label: "Arrival", key: "arrival_at" },
          { label: "Last Port", key: "sourceport_name" },
          { label: "Berth", key: "pilotage.servicetoberth.name" }
        ]);
    })
    .catch(err => console.error("Vessel API Error:", err));
}

/* ===============================
   5) CAROUSELS
   =============================== */
function moveSlide(id, direction) {
  const el = document.getElementById(id);
  if (!el) return;

  const track = el.querySelector(".carousel-track");
  const images = track.querySelectorAll("img");
  const total = images.length;

  let index = Number(el.getAttribute("data-index")) || 0;
  index += direction;

  if (index < 0) index = total - 1;
  if (index >= total) index = 0;

  el.setAttribute("data-index", index);

  const imgWidth = images[0].clientWidth;
  track.style.transform = `translateX(-${index * imgWidth}px)`;
}

setInterval(() => moveSlide("sportsCarousel", 1), 8000);
setInterval(() => moveSlide("portCarousel", 1), 10000);
setInterval(() => moveSlide("announceCarousel", 1), 10000);

/* ===============================
   6) IMAGE POPUP + ARROWS
   =============================== */

let currentIndex = 0;
let currentGallery = [];

const popupImgBox = document.getElementById("imgPopup");
const popupImg = document.getElementById("popupImg");

function openImage(index, gallery) {
  if (!popupImgBox) return;

  currentIndex = index;
  currentGallery = gallery;
  popupImg.src = gallery[index];
  popupImgBox.style.display = "flex";
}

function nextImg(e) {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % currentGallery.length;
  popupImg.src = currentGallery[currentIndex];
}

function prevImg(e) {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  popupImg.src = currentGallery[currentIndex];
}

function closePopup() {
  if (popupImgBox) popupImgBox.style.display = "none";
}

if (popupImgBox) {
  popupImgBox.addEventListener("click", function (e) {
    if (e.target === popupImgBox) closePopup();
  });
}

/* ⭐ MAKE FUNCTIONS GLOBAL ⭐ */
window.openImage = openImage;
window.nextImg = nextImg;
window.prevImg = prevImg;
window.closePopup = closePopup;


/* ===============================
   7) NOTICE POPUP
   =============================== */
function openNoticePopup(title, date, message) {
  const pop = document.getElementById("noticePopup");
  const t = document.getElementById("popupTitle");
  const d = document.getElementById("popupDate");
  const m = document.getElementById("popupMessage");

  if (!pop) return;

  t.innerText = title;
  d.innerText = date;
  m.innerText = message;

  pop.style.display = "flex";
}

function closeNoticePopup() {
  const pop = document.getElementById("noticePopup");
  if (pop) pop.style.display = "none";
}

const noticePopup = document.getElementById("noticePopup");
if (noticePopup) {
  noticePopup.addEventListener("click", function (e) {
    const box = document.querySelector(".notice-popup-box");
    if (box && !box.contains(e.target)) {
      closeNoticePopup();
    }
  });
}

/* ===============================
   8) STATS ANIMATION
   =============================== */
function animateStats() {
  const stats = document.querySelectorAll(".stat-number");
  if (!stats) return;

  stats.forEach(stat => {
    let target = +stat.getAttribute("data-count");
    let count = 0;
    let speed = target / 150;

    let update = setInterval(() => {
      count += speed;
      if (count >= target) {
        stat.textContent = target.toLocaleString();
        clearInterval(update);
      } else {
        stat.textContent = Math.floor(count).toLocaleString();
      }
    }, 20);
  });
}

/* ===============================
   9) WEEKLY STATS POPUP (FULLY FIXED)
   =============================== */
function openStatsPopup(src) {
  const pop = document.getElementById("statsPopup");
  const img = document.getElementById("popupStatsImg");

  if (!pop) return;

  img.src = src;
  pop.style.display = "flex";
}

function closeStatsPopup() {
  const pop = document.getElementById("statsPopup");
  if (pop) pop.style.display = "none";
}

function initWeeklyPopupClose() {
  const statsPopup = document.getElementById("statsPopup");
  if (!statsPopup) return;

  statsPopup.addEventListener("click", function (e) {
    const img = document.getElementById("popupStatsImg");

    // If click is on the image, do NOT close
    if (img.contains(e.target)) return;

    // Otherwise close popup
    closeStatsPopup();
  });
}

/* ===============================
   10) GLOBAL LOGO SETTER (ONE PLACE)
   =============================== */
function applyGlobalLogo() {
  const logo = document.getElementById("kpl-logo");
  if (logo) {
    logo.src = "assets/images/KPL_Logo.png"; // EXACT name
    console.log("Logo applied:", logo.src);
  }
}
/* ===============================
   GALLERY IMAGE LISTS (GLOBAL)
   =============================== */

window.sportsGallery = [
  "assets/media/gallery/sports1.jpg",
  "assets/media/gallery/sports2.jpg",
  "assets/media/gallery/sports (4).jpg",
  "assets/media/gallery/sports (5).jpg",
  "assets/media/gallery/sports (6).jpg",
  "assets/media/gallery/sports (7).jpg"
];

window.portGallery = [
  "assets/media/gallery/port1.jpg",
  "assets/media/gallery/port2.jpg",
  "assets/media/gallery/port3.jpg"
];

window.announceGallery = [
  "assets/media/gallery/announce1.jpg",
  "assets/media/gallery/announce2.jpg",
  "assets/media/gallery/announce3.jpg"
];
