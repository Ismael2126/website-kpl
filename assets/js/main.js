// Run everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initHeroMedia();
  initNotices();
  initVesselMovements();
});

/* ===============================
   1) Dark / Light Theme
   =============================== */
function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  const saved = localStorage.getItem("kpl-theme");
  if (saved === "light") {
    body.classList.remove("theme-dark");
    body.classList.add("theme-light");
    if (toggle) toggle.checked = false;
  } else {
    body.classList.remove("theme-light");
    body.classList.add("theme-dark");
    if (toggle) toggle.checked = true;
  }

  if (toggle) {
    toggle.addEventListener("change", () => {
      if (toggle.checked) {
        body.classList.remove("theme-light");
        body.classList.add("theme-dark");
        localStorage.setItem("kpl-theme", "dark");
      } else {
        body.classList.remove("theme-dark");
        body.classList.add("theme-light");
        localStorage.setItem("kpl-theme", "light");
      }
    });
  }
}

/* ===============================
   2) AUTO-DETECT HERO IMAGE / VIDEO
   =============================== */
function initHeroMedia() {
  const heroBox = document.getElementById("hero-media");
  if (!heroBox) return;

  const heroFile = "assets/media/Mood.mp4";

  if (heroFile.endsWith(".mp4") || heroFile.endsWith(".webm")) {
    heroBox.innerHTML = `
      <video class="hero__video" src="${heroFile}" autoplay muted loop playsinline></video>
    `;
  } else {
    heroBox.innerHTML = `
      <img class="hero__video" src="${heroFile}" alt="Hero Image">
    `;
  }
}

/* ===============================
   3) Notices from Google Sheet
   =============================== */
function initNotices() {
  const noticeContainer = document.getElementById("notice-list");
  if (!noticeContainer) return;

  loadNoticesFromSheet();
}

function loadNoticesFromSheet() {
  const noticeContainer = document.getElementById("notice-list");
  const fallback = document.getElementById("notice-fallback");
  if (!noticeContainer) return;

  const SHEET_ID = "105qEW2kBnUb3rNWNmffHWAtnlpDOiavo8zFsXPbPrxk";
  const SHEET_NAME = "Notices";

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
    `tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
      const rows = json.table.rows || [];
      if (!rows.length) {
        if (fallback) fallback.style.display = "block";
        return;
      }

      noticeContainer.innerHTML = "";

      rows.forEach(row => {
        const date = row.c[0]?.v || "";
        const title = row.c[1]?.v || "";
        const message = row.c[2]?.v || "";

        if (!title && !message) return;

        const card = document.createElement("div");
        card.className = "notice-card";

        card.innerHTML = `
          <h3 class="notice-title">📢 ${title}</h3>
          ${date ? `<p class="notice-date">Published: ${date}</p>` : ""}
          <p class="notice-text">${message}</p>
        `;

        noticeContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error loading notices:", err);
      if (fallback) fallback.style.display = "block";
    });
}

/* ===============================
   4) Vessel Movements (5-box layout)
   =============================== */
function initVesselMovements() {
  const check = document.getElementById("estimatedArrivals");
  if (!check) return; // only run on vessel page

  loadVesselMovements();
}

function createVMTable(data, columns) {
  if (!data || data.length === 0) return "<p>No data available.</p>";

  let html = "<table><thead><tr>";
  columns.forEach(col => {
    html += `<th>${col.label}</th>`;
  });
  html += "</tr></thead><tbody>";

  data.forEach(row => {
    html += "<tr>";
    columns.forEach(col => {
      html += `<td data-label="${col.label}">${row[col.key] ?? "-"}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}

function loadVesselMovements() {
  const apiUrl =
  "https://api.allorigins.win/raw?url=https://my.kulhudhuffushiport.mv/api/vessel_noticeboard";


  fetch(apiUrl)
    .then(res => res.json())
    .then(json => {

      document.querySelector("#estimatedArrivals").innerHTML =
  createVMTable(json.estimated_arrivals, [
    { label: "Vessel", key: "vessel_name" },
    { label: "GT", key: "gt" },
    { label: "LAO", key: "lao" },
    { label: "Date", key: "eta" },
    { label: "Berth From", key: "last_port" },
    { label: "Berth To", key: "arrival_port" }
  ]);

document.querySelector("#arrivals").innerHTML =
  createVMTable(json.arrivals, [
    { label: "Vessel", key: "vessel_name" },
    { label: "GT", key: "gt" },
    { label: "LAO", key: "lao" },
    { label: "Date", key: "date" },
    { label: "Berth From", key: "berth_from" },
    { label: "Berth To", key: "berth_to" }
  ]);

document.querySelector("#departures").innerHTML =
  createVMTable(json.departures, [
    { label: "Vessel", key: "vessel_name" },
    { label: "GT", key: "gt" },
    { label: "LAO", key: "lao" },
    { label: "Date", key: "date" },
    { label: "Berth From", key: "berth_from" },
    { label: "Berth To", key: "berth_to" }
  ]);

document.querySelector("#shifting").innerHTML =
  createVMTable(json.shifting, [
    { label: "Vessel", key: "vessel_name" },
    { label: "GT", key: "gt" },
    { label: "LAO", key: "lao" },
    { label: "Date", key: "date" },
    { label: "Berth From", key: "berth_from" },
    { label: "Berth To", key: "berth_to" }
  ]);

document.querySelector("#vesselsAtPort").innerHTML =
  createVMTable(json.vessels_at_port, [
    { label: "Vessel", key: "vessel_name" },
    { label: "GT", key: "gt" },
    { label: "LAO", key: "lao" },
    { label: "Date", key: "arrival_time" },
    { label: "Berth From", key: "last_port" },
    { label: "Berth To", key: "berth_at" }
  ]);

    })
    .catch(err => console.error("Error loading vessel data:", err));
}
