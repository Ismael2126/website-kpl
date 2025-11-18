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

  // Load saved theme
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
  if (!heroBox) return; // only on home page

  // 🔧 Change this when you upload a new image/video
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
  if (!noticeContainer) return; // only on notices page

  loadNoticesFromSheet();
}

function loadNoticesFromSheet() {
  const noticeContainer = document.getElementById("notice-list");
  const fallback = document.getElementById("notice-fallback");
  if (!noticeContainer) return;

  const SHEET_ID = "105qEW2kBnUb3rNWNmffHWAtnlpDOiavo8zFsXPbPrxk";
  const SHEET_NAME = "Notices"; // make sure this matches your tab name

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
   4) Vessel Movements from KPL API
   =============================== */
function initVesselMovements() {
  const tbody = document.getElementById("vessel-tbody");
  if (!tbody) return; // only on vessel-movements page

  loadVesselMovements();
}

function loadVesselMovements() {
  const tbody = document.getElementById("vessel-tbody");
  const fallback = document.getElementById("vessel-fallback");
  if (!tbody) return;

  const apiUrl = "https://my.kulhudhuffushiport.mv/api/vessel_noticeboard";

  fetch(apiUrl)
    .then(res => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then(data => {
      console.log("Vessel API data:", data); // For debugging in browser console

      // Try to support both: {data: [...]} or just [...]
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      if (!list.length) {
        if (fallback) fallback.style.display = "block";
        return;
      }

      tbody.innerHTML = "";

      list.forEach(item => {
        // Try common field names safely
        const name =
          item.vessel_name || item.vessel || item.name || "Unknown Vessel";

        const from =
          item.from_port || item.origin || item.from || item.arrived_from || "-";

        const to =
          item.to_port || item.destination || item.to || item.departing_to || "-";

        const etaRaw =
          item.eta || item.arrival || item.arrival_time || item.arrival_date;
        const etdRaw =
          item.etd || item.departure || item.departure_time || item.departure_date;

        const status = item.status || item.remarks || "-";

        const etaText = formatNiceDate(etaRaw);
        const etdText = formatNiceDate(etdRaw);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${name}</td>
          <td>${from}</td>
          <td>${to}</td>
          <td>
            ${etaText ? `ETA: ${etaText}<br>` : ""}
            ${etdText ? `ETD: ${etdText}` : ""}
          </td>
          <td><span class="vessel-status">${status}</span></td>
        `;

        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Error loading vessel movements:", err);
      if (fallback) fallback.style.display = "block";
    });
}

/* ===============================
   Helper: format date as "18 Nov 2025"
   =============================== */
function formatNiceDate(value) {
  if (!value) return "";

  const d = new Date(value);
  if (isNaN(d.getTime())) {
    // If it's not a parseable date, just return original text
    return value;
  }

  const day = d.getDate().toString().padStart(2, "0");
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}
