// script.js

window.addEventListener("DOMContentLoaded", () => {
  // Animated Gradient Background Logic
  const originalGradientSets = [
    [
      "#000000",
      "#050A0F",
      "#003046",
      "#006B8F",
      "#00C4E1",
      "#A3E8FF",
      "#FFFFFF",
    ],
    [
      "#12001A",
      "#3B004D",
      "#680085",
      "#9A00B8",
      "#CC3DFF",
      "#E6B3FF",
      "#FFFFFF",
    ],
    [
      "#1A0010",
      "#420034",
      "#7D2E6F",
      "#FF577F",
      "#FF9A5E",
      "#FFCE82",
      "#FFF9E1",
    ],
    [
      "#001A2B",
      "#3A2E87",
      "#FF5C5C",
      "#FFAD6F",
      "#FFD865",
      "#FFFD9A",
      "#FFF7E1",
    ],
    [
      "#0A0B0F",
      "#19202A",
      "#398C85",
      "#62D9DD",
      "#B9F1EE",
      "#E7FFFF",
      "#FFFFFF",
    ],
    [
      "#0E0E0E",
      "#1F1F1F",
      "#434343",
      "#6B6B6B",
      "#929292",
      "#B9B9B9",
      "#E0E0E0",
    ],
    [
      "#2E0000",
      "#600000",
      "#9D0000",
      "#CC2900",
      "#FF5E00",
      "#FF9133",
      "#FFD766",
    ],
    [
      "#000000",
      "#003E40",
      "#006873",
      "#00A497",
      "#42C4B6",
      "#FF7A7A",
      "#FFD455",
    ],
    [
      "#150F34",
      "#4A3572",
      "#866EB0",
      "#BDA1F8",
      "#D9D1FF",
      "#FBFAFF",
      "#FFFFFF",
    ],
    [
      "#000628",
      "#005082",
      "#00B2B7",
      "#98CC5F",
      "#D4FD7C",
      "#F6FFD1",
      "#FFFFFF",
    ],
    [
      "#0D0029",
      "#31005B",
      "#741BA1",
      "#A95BD7",
      "#CD8DFF",
      "#E3B6FF",
      "#FFFFFF",
    ],
    [
      "#12212B",
      "#2C4651",
      "#3E6D77",
      "#63C6FF",
      "#00FFD6",
      "#00FF7F",
      "#FFFFFF",
    ],
    [
      "#000000",
      "#24003E",
      "#54008A",
      "#8F00CE",
      "#00FFFF",
      "#7FFFD4",
      "#FFFFFF",
    ],
    [
      "#FFD4F7",
      "#FFA3E6",
      "#FF6ED1",
      "#FF37B8",
      "#FF0094",
      "#CC007A",
      "#99005C",
    ],
    [
      "#4C0000",
      "#800000",
      "#D93900",
      "#FF6C00",
      "#FF9E33",
      "#FFCD66",
      "#FFFFCC",
    ],
    [
      "#1F2123",
      "#43494F",
      "#6F7890",
      "#A9B4CC",
      "#D4DCE6",
      "#F0F4F9",
      "#FFFFFF",
    ],
    [
      "#000016",
      "#1E0043",
      "#440077",
      "#6F00B3",
      "#9D00E0",
      "#CD65FF",
      "#F4E1FF",
    ],
    [
      "#000000",
      "#1F1F1F",
      "#393939",
      "#32FF18",
      "#70FF6E",
      "#D0FFD6",
      "#FFFFFF",
    ],
  ];

  const bg = document.querySelector(".animated-background");

  function buildGradient(angle, colors) {
    return `linear-gradient(${angle}deg, ${colors
      .map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`)
      .join(", ")})`;
  }

  function getRandomGradient(exclude) {
    let pick;
    do {
      pick =
        originalGradientSets[
          Math.floor(Math.random() * originalGradientSets.length)
        ];
    } while (exclude && JSON.stringify(pick) === JSON.stringify(exclude));
    return [...pick];
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  }

  function interpolateColor(c1, c2, t) {
    const [r1, g1, b1] = hexToRgb(c1);
    const [r2, g2, b2] = hexToRgb(c2);
    return rgbToHex(
      Math.round(r1 + (r2 - r1) * t),
      Math.round(g1 + (g2 - g1) * t),
      Math.round(b1 + (b2 - b1) * t),
    );
  }

  let currentColors = getRandomGradient();
  let currentAngle = Math.floor(Math.random() * 360);

  function applyGradient(colors = currentColors) {
    bg.style.backgroundImage = buildGradient(currentAngle, colors);
  }

  function rotateStep(deltaTime) {
    currentAngle = (currentAngle + deltaTime * 0.015) % 360;
    applyGradient();
  }

  // Initial paint
  applyGradient();

  let lastTime = performance.now();
  function animate(time) {
    const dt = time - lastTime;
    rotateStep(dt);
    lastTime = time;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Transition gradients every 30 seconds
  setInterval(() => {
    const nextColors = getRandomGradient(currentColors);
    const start = performance.now();

    function step() {
      const t = Math.min((performance.now() - start) / 5000, 1);
      const blended = currentColors.map((c, i) =>
        interpolateColor(
          c,
          nextColors[i] || nextColors[nextColors.length - 1],
          t,
        ),
      );
      applyGradient(blended);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        currentColors = nextColors;
      }
    }
    requestAnimationFrame(step);
  }, 30000);

  // Navigation tab logic
  const tabs = document.querySelectorAll(".nav-tab");
  const panels = {
    "home-panel": document.getElementById("home-panel"),
    "changelog-panel": document.getElementById("changelog-panel"),
    "source-code-panel": document.getElementById("source-code-panel"),
    "settings-panel": document.getElementById("settings-panel"),
  };

  function activateTab(tab) {
    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
    });
    Object.values(panels).forEach((panel) => {
      panel.classList.remove("active");
      panel.setAttribute("hidden", "true");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");
    const target = tab.dataset.targetPanel;
    if (panels[target]) {
      panels[target].removeAttribute("hidden");
      panels[target].classList.add("active");
    }
    tab.focus();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIndex = Array.from(tabs).indexOf(document.activeElement);
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        activateTab(tabs[nextIndex]);
      }
    });
  });

  activateTab(document.getElementById("home-tab"));

  // Theme and text size controls
  const themeButtons = document.querySelectorAll(".theme-button[data-theme]");
  const textButtons = document.querySelectorAll(
    ".theme-button[data-text-size]",
  );
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(name) {
    const mode = name === "system" ? (mq.matches ? "dark" : "light") : name;
    document.body.setAttribute("data-theme", mode);
    // Adjust background opacity accordingly
    const bg = document.querySelector(".animated-background");
    bg.style.opacity = mode === "light" ? "0.15" : "0.40";
  }

  themeButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      themeButtons.forEach((b) => b.classList.remove("active-theme"));
      btn.classList.add("active-theme");
      localStorage.setItem("thunderhub-theme", btn.dataset.theme);
      applyTheme(btn.dataset.theme);
    }),
  );

  mq.addEventListener("change", () => {
    if (
      document.querySelector('.theme-button.active-theme[data-theme="system"]')
    ) {
      applyTheme("system");
    }
  });

  const savedTheme = localStorage.getItem("thunderhub-theme");
  if (savedTheme) {
    document
      .querySelector(`.theme-button[data-theme="${savedTheme}"]`)
      ?.classList.add("active-theme");
    applyTheme(savedTheme);
  } else {
    const defaultTheme = mq.matches ? "system" : "dark";
    document
      .querySelector(`.theme-button[data-theme="${defaultTheme}"]`)
      ?.classList.add("active-theme");
    applyTheme(defaultTheme);
  }

  textButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      textButtons.forEach((b) => b.classList.remove("active-theme"));
      btn.classList.add("active-theme");
      localStorage.setItem("thunderhub-text-size", btn.dataset.textSize);
    }),
  );

  const savedSize = localStorage.getItem("thunderhub-text-size");
  if (savedSize) {
    document
      .querySelector(`.theme-button[data-text-size="${savedSize}"]`)
      ?.classList.add("active-theme");
  } else {
    document
      .querySelector('.theme-button[data-text-size="medium"]')
      ?.classList.add("active-theme");
  }
});
