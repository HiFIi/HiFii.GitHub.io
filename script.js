// script.js

window.onload = () => {
  // ---- SPLASH SCREEN CONTROL ----
  const splash = document.getElementById("splash-screen");
  const mainHeader = document.querySelector("header");
  const mainContent = document.querySelector("main");
  const bottomNav = document.querySelector(".bottom-navigation");

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

  // ---- GRADIENT ANIMATION ----
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
  let gradientTimer = 0;

  const applyGradient = (colors = currentColors) => {
    if (bg) {
      bg.style.backgroundImage = buildGradient(currentAngle, colors);
    }
  };

  let isVisible = true;
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
  });

  let lastTime = performance.now();

  const rotateStep = (dt) => {
    gradientTimer += dt;
    if (gradientTimer < 1000 / 30) return;
    gradientTimer = 0;
    currentAngle = (currentAngle + dt * 0.0025) % 360;
    applyGradient(currentColors);
  };

  const animate = (time) => {
    if (!isVisible) return requestAnimationFrame(animate);
    const dt = time - lastTime;
    rotateStep(dt);
    lastTime = time;
    requestAnimationFrame(animate);
  };

  applyGradient();
  requestAnimationFrame(animate);

  setInterval(() => {
    const nextColors = getRandomGradient(currentColors);
    const start = performance.now();

    const step = () => {
      const t = Math.min((performance.now() - start) / 3500, 1);
      const blended = currentColors.map((c, i) =>
        interpolateColor(c, nextColors[i] || nextColors.at(-1), t),
      );
      applyGradient(blended);
      if (t < 1) requestAnimationFrame(step);
      else currentColors = nextColors;
    };

    requestAnimationFrame(step);
  }, 15000);

  // ---- NAVIGATION ----
  const tabs = document.querySelectorAll(".nav-tab");
  const panels = {
    "home-panel": document.getElementById("home-panel"),
    "changelog-panel": document.getElementById("changelog-panel"),
    "source-code-panel": document.getElementById("source-code-panel"),
    "settings-panel": document.getElementById("settings-panel"),
  };

  const activateTab = (tab) => {
    if (!tab) return;

    // --- NEW LOGIC FOR "SOURCE" TAB ---
    // If the clicked tab is the "source-tab", open the link and stop further execution
    if (tab.id === "source-tab") {
      window.open("https://github.com/hifii/hifii.github.io", "_blank");
      return; // Stop activateTab from doing anything else for this specific tab
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
    const animatedBackground = document.querySelector(".animated-background");

    // This applies when the *internal* "Contribute" panel is activated
    if (target === "source-code-panel") {
      body.style.backgroundColor = "#10101c";
      if (animatedBackground) {
        animatedBackground.style.opacity = "0";
      }
    } else {
      // Revert to theme's primary background color if another tab is selected
      body.style.backgroundColor = "var(--primary-background)";
      // Restore animated background opacity
      if (animatedBackground) {
        animatedBackground.style.opacity = "var(--base-opacity)";
      }
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIndex = Array.from(tabs).indexOf(document.activeElement);
        // Ensure that navigating with arrow keys doesn't try to activate the 'Source' tab as an internal panel
        let nextIndex =
          (currentIndex + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length;
        // Skip the 'Source' tab if navigating to it via arrow keys, unless that's the only option
        if (tabs[nextIndex].id === "source-tab" && tabs.length > 1) {
          // If there's another tab to go to, skip this one
          nextIndex =
            (nextIndex + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
        }
        activateTab(tabs[nextIndex]);
      }
    });
  });

  // ---- THEME ----
  const themeButtons = document.querySelectorAll(".theme-button[data-theme]");
  const textButtons = document.querySelectorAll(
    ".theme-button[data-text-size]",
  );
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

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
    // This part should be safe since it targets the internal "source-code-panel"
    const currentActivePanel = document.querySelector("main section.active");
    if (currentActivePanel && currentActivePanel.id === "source-code-panel") {
      document.body.style.backgroundColor = "#10101c";
      if (document.querySelector(".animated-background")) {
        document.querySelector(".animated-background").style.opacity = "0";
      }
    } else {
      document.body.style.backgroundColor = "var(--primary-background)";
      if (document.querySelector(".animated-background")) {
        document.querySelector(".animated-background").style.opacity =
          "var(--base-opacity)";
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
      // You might want to add logic here to actually change text size
      document.body.setAttribute("data-text-size", btn.dataset.textSize);
    }),
  );

  const savedSize = localStorage.getItem("thunderhub-text-size");
  if (savedSize) {
    document
      .querySelector(`.theme-button[data-text-size="${savedSize}"]`)
      ?.classList.add("active-theme");
    document.body.setAttribute("data-text-size", savedSize); // Apply on load
  } else {
    // Default text size if none saved
    document.body.setAttribute("data-text-size", "medium");
  }

  // ---- BLENDING MODE ----
  const blendingButtons = document.querySelectorAll(
    ".theme-button[data-blending]",
  );

  const applyBlending = (mode) => {
    document.body.style.setProperty("--blending", mode);
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
