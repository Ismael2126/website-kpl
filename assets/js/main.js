document.addEventListener("DOMContentLoaded", () => {
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
});
