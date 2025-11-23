// Run everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initHeroMedia();
  initNotices();
  initVesselMovements();
});

/* ===============================
   1) Theme
   =============================== */
function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

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
   2) Hero
   =============================== */
function initHeroMedia() {
  const heroBox = document.getElementById("hero-media");
  if (!heroBox) return;
  heroBox.innerHTML = `
      <video class="hero__video" src="assets/media/Mood.mp4"
      autoplay muted loop playsinline></video>
  `;
}

/* ===============================
   3) Notices
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
          <div class="notice-card">
            <h3 class="notice-title">📢 ${title}</h3>
            ${date ? `<p class="notice-date">${date}</p>` : ""}
            <p>${message}</p>
          </div>
        `;
      });
    })
    .catch(err => console.error("Notices error:", err));
}

/* ===============================
   4) Vessel Movements
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

      // nested objects (arrival, departure, berth etc)
      if (c.key.includes(".")) {
        const keys = c.key.split(".");
        value = item;
        keys.forEach(k => value = value ? value[k] : "-");
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

  console.log("Fetching vessel API...");

  fetch(apiURL)
    .then(res => res.json())
    .then(json => {
      console.log("✔ API Response:", json);

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
    .catch(err => {
      console.error("❌ Vessel API Error:", err);
      alert("API unreachable. Please check connection or try again.");
    });
}
/* ===============================
   IMAGE CAROUSEL (3 Independent Sliders)
   =============================== */

function moveSlide(id, direction) {
    const el = document.getElementById(id);
    const track = el.querySelector(".carousel-track");
    const images = track.querySelectorAll("img");
    const total = images.length;

    let index = Number(el.getAttribute("data-index")) || 0;
    index += direction;

    if (index < 0) index = total - 1;
    if (index >= total) index = 0;

    el.setAttribute("data-index", index);

    // Get width of ONE image
    const imgWidth = images[0].clientWidth;

    // Move based on pixel value (correct way)
    track.style.transform = `translateX(-${index * imgWidth}px)`;
}

/* Independent auto-scroll */
setInterval(() => moveSlide("sportsCarousel", 1), 8000);
setInterval(() => moveSlide("portCarousel", 1), 10000);
setInterval(() => moveSlide("announceCarousel", 1), 10000);

/* POPUP IMAGE VIEWER */
function openPopup(src) {
    document.getElementById("popupImg").src = src;
    document.getElementById("imgPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("imgPopup").style.display = "none";
}

document.addEventListener("click", function(e) {
    if (e.target.tagName === "IMG" && e.target.closest(".carousel-track")) {
        openPopup(e.target.src);
    }
});

