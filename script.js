// script.js

window.onload = () => {
  // ---- CACHE DOM ELEMENTS ----
  const splash = document.getElementById("splash-screen");
  const mainHeader = document.querySelector("header");
  const mainContent = document.querySelector("main");
  const bottomNav = document.querySelector(".bottom-navigation");
  const bg = document.querySelector(".animated-background"); // Cached
  const tabs = document.querySelectorAll(".nav-tab");
  const panels = {
    "home-panel": document.getElementById("home-panel"),
    "changelog-panel": document.getElementById("changelog-panel"),
    "source-code-panel": document.getElementById("source-code-panel"),
    "settings-panel": document.getElementById("settings-panel"),
  };
  const themeButtons = document.querySelectorAll(".theme-button[data-theme]");
  const textButtons = document.querySelectorAll(
    ".theme-button[data-text-size]",
  );
  const blendingButtons = document.querySelectorAll(
    ".theme-button[data-blending]",
  );
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  // ---- SPLASH SCREEN CONTROL ----
  if (splash) {
    mainHeader.style.display = "none";
    mainContent.style.display = "none";
    bottomNav.style.display = "none";

    setTimeout(() => {
      splash.classList.add("fade-out");
      splash.addEventListener(
        "transitionend",
        () => {
          splash.remove();
          mainHeader.style.display = "";
          mainContent.style.display = "";
          bottomNav.style.display = "";
          requestAnimationFrame(() => {
            activateTab(document.getElementById("home-tab"));
          });
        },
        { once: true },
      );
    }, 1600);
  } else {
    // Ensure home-tab is activated if no splash screen
    activateTab(document.getElementById("home-tab"));
  }

  const originalGradientSets = [
  // Original Blueish -> Deepened Blueish
  [
    "#000000", // Black
    "#001A33", // Very Dark Blue
    "#004060", // Deep Blue
    "#007A9E", // Rich Teal
    "#00CDEB", // Brighter Aqua
    "#7CE1FF", // Lighter Sky Blue
    "#FFFFFF", // White
  ],
  // Original Purple -> Deepened Purple
  [
    "#0F001A", // Very Dark Purple
    "#300040", // Deep Plum
    "#550070", // Rich Violet
    "#80009C", // Dark Orchid
    "#B020E0", // Vibrant Purple
    "#E099FF", // Light Lavender
    "#FFFFFF", // White
  ],
  // Original Red/Orange -> Deepened Red/Orange
  [
    "#1A000A", // Very Dark Red
    "#40002A", // Deep Crimson
    "#702050", // Rich Magenta-Brown
    "#D03050", // Strong Red
    "#FF6030", // Bright Orange-Red
    "#FFB060", // Soft Peach
    "#FFF5D0", // Cream
  ],
  // Original Blue/Orange/Yellow -> Deepened Blue/Orange/Yellow
  [
    "#001020", // Very Dark Navy
    "#201860", // Deep Indigo
    "#C03030", // Strong Red
    "#FF8040", // Deep Orange
    "#FFB030", // Golden Yellow
    "#FFFD80", // Pale Yellow
    "#FFF0D0", // Light Cream
  ],
  // Original Greenish/Aqua -> Deepened Greenish/Aqua
  [
    "#050B0F", // Dark almost Black
    "#102028", // Deep Slate Blue
    "#257065", // Dark Teal
    "#40B0B5", // Bright Teal
    "#90E0D8", // Light Aqua
    "#D0FFFF", // Pale Cyan
    "#FFFFFF", // White
  ],
  // Original Grey -> Deepened Grey (More Contrast)
  [
    "#080808", // Near Black
    "#181818", // Very Dark Grey
    "#282828", // Dark Grey
    "#404040", // Mid-Dark Grey
    "#606060", // Medium Grey
    "#808080", // Light Grey
    "#C0C0C0", // Silver
  ],
  // Original Red/Orange (Stronger) -> Deepened Red/Orange (More Saturated)
  [
    "#200000", // Deep Maroon
    "#500000", // Dark Red
    "#800000", // Classic Red
    "#B02000", // Orange-Red
    "#E05000", // Vibrant Orange
    "#FF8020", // Golden Orange
    "#FFC060", // Light Gold
  ],
  // Original Blue/Green/Red -> Deepened Blue/Green/Red
  [
    "#000000", // Black
    "#003030", // Deep Dark Cyan
    "#005060", // Dark Cyan
    "#009080", // Medium Teal
    "#30B0A0", // Bright Teal
    "#FF6060", // Bright Red
    "#FFC040", // Golden Yellow
  ],
  // Original Purple/Blue -> Deepened Purple/Blue
  [
    "#100C2C", // Very Dark Blue-Purple
    "#402860", // Deep Violet
    "#705090", // Medium Purple
    "#A070E0", // Light Purple
    "#C0B0FF", // Pale Lavender
    "#E8E0FF", // Very Pale Purple
    "#FFFFFF", // White
  ],
  // Original Blue/Green/Yellow -> Deepened Blue/Green/Yellow
  [
    "#000418", // Very Dark Blue
    "#004060", // Deep Cyan-Blue
    "#009090", // Vibrant Aqua
    "#70A040", // Olive Green
    "#C0F060", // Bright Yellow-Green
    "#E0FFB0", // Pale Green-Yellow
    "#FFFFFF", // White
  ],
  // Original Deep Purple -> Deepened Darker Purple
  [
    "#0A0020", // Near Black-Purple
    "#200040", // Very Deep Purple
    "#501080", // Dark Royal Purple
    "#8030C0", // Bright Purple
    "#B060E0", // Medium Orchid
    "#D090FF", // Light Purple
    "#E8C0FF", // Very Light Purple
  ],
  // Original Blue/Cyan/Green -> Deepened Blue/Cyan/Green
  [
    "#101820", // Dark Blue-Grey
    "#203840", // Deep Teal-Grey
    "#305060", // Medium Teal-Blue
    "#50A0D0", // Sky Blue
    "#00E0B0", // Bright Aqua Green
    "#00E070", // Emerald Green
    "#FFFFFF", // White
  ],
  // Original Dark Blue/Purple/Cyan -> Deepened and More Contrast
  [
    "#000000", // Black
    "#100020", // Very Dark Purple
    "#300050", // Deep Violet
    "#600090", // Rich Indigo
    "#00C0C0", // Bright Cyan
    "#60FFFF", // Pale Cyan
    "#FFFFFF", // White
  ],
  // Original Pink/Purple -> Deepened Pink/Purple
  [
    "#FFB0E0", // Light Pink
    "#FF80D0", // Medium Pink
    "#FF40B0", // Bright Pink
    "#FF1090", // Deep Pink
    "#E00070", // Dark Magenta
    "#B00050", // Deep Red-Purple
    "#800030", // Very Dark Red-Purple
  ],
  // Original Brown/Orange -> Deepened Brown/Orange
  [
    "#400000", // Very Dark Brown-Red
    "#700000", // Deep Red-Brown
    "#B02000", // Burnt Orange
    "#E05000", // Vivid Orange
    "#FF8020", // Golden Orange
    "#FFB050", // Light Orange
    "#FFFFC0", // Pale Yellow
  ],
  // Original Subtle Grey -> Deepened Contrast Grey
  [
    "#151718", // Very Dark almost Black
    "#25282B", // Deep Grey
    "#404550", // Medium Dark Grey
    "#707885", // Medium Grey
    "#A0A8B5", // Light Medium Grey
    "#D0D5E0", // Very Light Grey
    "#F0F2F5", // Off-White
  ],
  // Original Dark Purple/Pink -> Deepened and More Electric
  [
    "#000010", // Near Black
    "#100030", // Deep Indigo
    "#300060", // Dark Violet
    "#500090", // Royal Purple
    "#8000C0", // Bright Purple
    "#B040FF", // Electric Purple
    "#D0A0FF", // Light Electric Purple
  ],
  // Original Black/Green -> Deepened and More Vibrant Green
  [
    "#000000", // Black
    "#101010", // Dark Grey
    "#202020", // Medium Dark Grey
    "#00B000", // Vibrant Green
    "#30E030", // Bright Green
    "#80FF80", // Light Green
    "#D0FFD0", // Pale Green
  ],
];

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  const rgbToHex = (r, g, b) =>
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

  const interpolateColor = (c1, c2, t) => {
    const [r1, g1, b1] = hexToRgb(c1);
    const [r2, g2, b2] = hexToRgb(c2);
    return rgbToHex(
      Math.round(r1 + (r2 - r1) * t),
      Math.round(g1 + (g2 - g1) * t),
      Math.round(b1 + (b2 - b1) * t),
    );
  };

  const buildGradient = (angle, colors) =>
    `linear-gradient(${angle}deg, ${colors
      .map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`)
      .join(", ")})`;

  const getRandomGradient = (exclude) => {
    let pick;
    do {
      pick =
        originalGradientSets[
          Math.floor(Math.random() * originalGradientSets.length)
        ];
    } while (exclude && JSON.stringify(pick) === JSON.stringify(exclude));
    return [...pick];
  };

  let currentColors = getRandomGradient();
  let currentAngle = Math.floor(Math.random() * 360);
  // gradientTimer is removed, as we'll use time in requestAnimationFrame directly
  const GRADIENT_FPS = 30; // Target FPS for gradient rotation
  const GRADIENT_INTERVAL = 1000 / GRADIENT_FPS; // Milliseconds per frame

  const applyGradient = (colors = currentColors) => {
    if (bg) {
      bg.style.backgroundImage = buildGradient(currentAngle, colors);
    }
  };

  let isVisible = true;
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible) {
      // Restart animation loop if it was paused
      lastTime = performance.now(); // Reset lastTime to avoid huge dt when tab becomes visible
      requestAnimationFrame(animate);
    }
  });

  let lastTime = performance.now();
  let lastGradientRotateTime = performance.now(); // New: Track last time gradient angle was updated

  const animate = (time) => {
    if (!isVisible) {
      // If not visible, just return; the visibilitychange listener will restart it
      return;
    }

    const dt = time - lastTime;
    lastTime = time; // Update lastTime at the beginning of the loop

    // Only update gradient angle and apply if enough time has passed for target FPS
    if (time - lastGradientRotateTime > GRADIENT_INTERVAL) {
      currentAngle = (currentAngle + dt * 0.0025) % 360;
      applyGradient(currentColors);
      lastGradientRotateTime = time; // Reset the timer for the next rotation update
    }

    requestAnimationFrame(animate);
  };

  applyGradient();
  requestAnimationFrame(animate);

  // Gradient color blending interval
  setInterval(() => {
    const nextColors = getRandomGradient(currentColors);
    const start = performance.now();
    const DURATION = 3500; // Duration for color transition

    const step = (blendTime) => {
      const t = Math.min((blendTime - start) / DURATION, 1);
      const blended = currentColors.map((c, i) =>
        interpolateColor(c, nextColors[i] || nextColors.at(-1), t),
      );
      applyGradient(blended); // Apply the blended colors

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        currentColors = nextColors; // Once blend is complete, update currentColors
      }
    };

    requestAnimationFrame(step); // Start the blending animation
  }, 15000);

  // ---- NAVIGATION ----
  const activateTab = (tab) => {
    if (!tab) return;

    // --- NEW LOGIC FOR "SOURCE" TAB ---
    if (tab.id === "source-tab") {
      window.open("https://github.com/hifii/hifii.github.io", "_blank");
      return;
    }

    // Normal tab activation logic for all *other* tabs
    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
    });
    Object.values(panels).forEach((panel) => {
      if (panel) {
        panel.classList.remove("active");
        panel.setAttribute("hidden", "true");
      }
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

    // --- LOGIC FOR GITHUB TAB BACKGROUND (for the internal "Contribute" panel) ---
    const body = document.body;
    // Use cached 'bg'
    if (target === "source-code-panel") {
      body.style.backgroundColor = "#10101c";
      if (bg) {
        bg.style.opacity = "0";
      }
    } else {
      body.style.backgroundColor = "var(--primary-background)";
      if (bg) {
        bg.style.opacity = "var(--base-opacity)";
      }
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIndex = Array.from(tabs).indexOf(document.activeElement);
        let nextIndex =
          (currentIndex + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length;
        if (tabs[nextIndex].id === "source-tab" && tabs.length > 1) {
          nextIndex =
            (nextIndex + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
        }
        activateTab(tabs[nextIndex]);
      }
    });
  });

  // ---- THEME ----
  const applyTheme = (name) => {
    const mode = name === "system" ? (mq.matches ? "dark" : "light") : name;
    document.body.setAttribute("data-theme", mode);
    switch (mode) {
      case "dark":
        document.body.style.setProperty("--base-opacity", "0.40");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(0, 255, 255, 0.8)",
        );
        break;
      case "light":
        document.body.style.setProperty("--base-opacity", "0.15");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(0, 255, 255, 0.05)",
        );
        break;
      case "grey":
        document.body.style.setProperty("--base-opacity", "0.35");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(187, 134, 252, 0.08)",
        );
        break;
      case "material-purple":
        document.body.style.setProperty("--base-opacity", "0.3");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(206, 189, 255, 0.15)",
        );
        break;
      default:
        document.body.style.setProperty("--base-opacity", "0.40");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(0, 255, 255, 0.1)",
        );
        break;
    }
    // Reapply background logic after theme change if the "Contribute" tab is active
    const currentActivePanel = document.querySelector("main section.active");
    if (currentActivePanel && currentActivePanel.id === "source-code-panel") {
      document.body.style.backgroundColor = "#10101c";
      if (bg) {
        bg.style.opacity = "0";
      }
    } else {
      document.body.style.backgroundColor = "var(--primary-background)";
      if (bg) {
        bg.style.opacity = "var(--base-opacity)";
      }
    }
  };

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
  }

  // ---- TEXT SIZE ----
  textButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      textButtons.forEach((b) => b.classList.remove("active-theme"));
      btn.classList.add("active-theme");
      localStorage.setItem("thunderhub-text-size", btn.dataset.textSize);
      document.body.setAttribute("data-text-size", btn.dataset.textSize);
    }),
  );

  const savedSize = localStorage.getItem("thunderhub-text-size");
  if (savedSize) {
    document
      .querySelector(`.theme-button[data-text-size="${savedSize}"]`)
      ?.classList.add("active-theme");
    document.body.setAttribute("data-text-size", savedSize);
  } else {
    document.body.setAttribute("data-text-size", "medium");
  }

  // ---- BLENDING MODE ----
  const applyBlending = (mode) => {
    document.body.setProperty("--blending", mode); // Changed to setProperty
  };

  blendingButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      blendingButtons.forEach((b) => b.classList.remove("active-theme"));
      btn.classList.add("active-theme");
      localStorage.setItem("thunderhub-blending", btn.dataset.blending);
      applyBlending(btn.dataset.blending);
    }),
  );

  const savedBlend = localStorage.getItem("thunderhub-blending") || "screen";
  document
    .querySelector(`.theme-button[data-blending="${savedBlend}"]`)
    ?.classList.add("active-theme");
  applyBlending(savedBlend);
};
