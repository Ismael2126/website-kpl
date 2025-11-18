// Run everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initHeroMedia();
  initNotices();
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
    // Load video
    heroBox.innerHTML = `
      <video class="hero__video" src="${heroFile}" autoplay muted loop playsinline></video>
    `;
  } else {
    // Load image
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

  // 👉 Your Google Sheet config
  const SHEET_ID = "105qEW2kBnUb3rNWNmffHWAtnlpDOiavo8zFsXPbPrxk";
  const SHEET_NAME = "Notices"; // 🔁 make sure this matches your tab name exactly

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
    `tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      // Google adds weird prefix/suffix, so clean it
      const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

      const rows = json.table.rows || [];
      if (!rows.length) {
        if (fallback) fallback.style.display = "block";
        return;
      }

      noticeContainer.innerHTML = "";

      rows.forEach(row => {
        // Columns: 0=Date, 1=Title, 2=Message
        const date = row.c[0]?.v || "";
        const title = row.c[1]?.v || "";
        const message = row.c[2]?.v || "";

        if (!title && !message) return; // skip empty rows

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
