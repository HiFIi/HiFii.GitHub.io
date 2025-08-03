document.addEventListener("DOMContentLoaded", () => {
  const originalGradientSets = [
    // (same gradient array as defined in your HTML head version)
    ["#000000", "#0A0F0F", "#004E64", "#00A5CF", "#00FFE5", "#CFFFFF", "#FFFFFF"],
    ["#000000", "#2D0036", "#4A0055", "#A000C8", "#FF00F7", "#FFBBF7", "#FFFFFF"],
    ["#120318", "#35003D", "#732A82", "#FF6F61", "#FFAD5E", "#FFD682", "#FFF8E1"],
    ["#002033", "#4A2FBD", "#FF6B6B", "#FFA15F", "#FFD05F", "#FFFB9A", "#FFF5E1"],
    ["#0B0C10", "#1F2833", "#45A29E", "#66FCF1", "#C5FCEE", "#EFFFFD", "#FFFFFF"],
    ["#0D0D0D", "#1C1C1C", "#3C3C3C", "#5A5A5A", "#7A7A7A", "#A1A1A1", "#D3D3D3"],
    ["#1A0000", "#3B0000", "#5C0000", "#8B0000", "#FF4500", "#FF8C00", "#FFD700"],
    ["#000000", "#002B36", "#004E64", "#00A896", "#2EC4B6", "#FF6B6B", "#FFD23F"],
    ["#140F2D", "#3E2F5B", "#7B6BAF", "#BFA1FD", "#D9D1FF", "#FBF9FF", "#FFFFFF"],
    ["#000428", "#004e92", "#00b09b", "#96c93d", "#d4fc79", "#faffd1", "#ffffff"],
    ["#0A001F", "#240046", "#5A189A", "#9D4EDD", "#C77DFF", "#E0AAFF", "#FFFFFF"],
    ["#0F2027", "#203A43", "#2C5364", "#47B5FF", "#00FFD5", "#00FF7F", "#FFFFFF"],
    ["#000000", "#1F0036", "#4B0082", "#9400D3", "#00FFFF", "#7FFFD4", "#FFFFFF"],
    ["#FFE0F7", "#FFB3E6", "#FF85D1", "#FF4DB8", "#FF1A94", "#CC007A", "#99005C"],
    ["#330000", "#661100", "#CC3300", "#FF6600", "#FF9933", "#FFCC66", "#FFFFCC"],
    ["#1E2022", "#3A3F47", "#5C677D", "#9BA9BC", "#CBD9E6", "#EEF3F9", "#FFFFFF"],
    ["#000014", "#12003A", "#2B0057", "#4A007D", "#7500B0", "#B500FF", "#F7E1FF"],
    ["#000000", "#1A1A1A", "#333333", "#39FF14", "#76FF7A", "#D0FFD6", "#FFFFFF"]
  ];

  const blendModes = ["overlay", "soft-light", "multiply", "screen", "color-dodge"];
  const bg = document.querySelector(".animated-background");

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  function interpolateColor(c1, c2, t) {
    const [r1, g1, b1] = hexToRgb(c1);
    const [r2, g2, b2] = hexToRgb(c2);
    return rgbToHex(
      Math.round(r1 + (r2 - r1) * t),
      Math.round(g1 + (g2 - g1) * t),
      Math.round(b1 + (b2 - b1) * t)
    );
  }

  function buildGradient(angle, colors) {
    return `linear-gradient(${angle}deg, ${colors.map((c,i) => `${c} ${(i/(colors.length-1))*100}%`).join(", ")})`;
  }

  function getRandomGradient(exclude) {
    let pick;
    do {
      pick = originalGradientSets[Math.floor(Math.random() * originalGradientSets.length)];
    } while (exclude && JSON.stringify(pick) === JSON.stringify(exclude));
    return [...pick];
  }

  let currentColors = getRandomGradient();
  let currentAngle = Math.floor(Math.random() * 360);
  const blendMode = blendModes[Math.floor(Math.random() * blendModes.length)];
  let isAnimating = false;

  function applyGradient() {
    bg.style.backgroundImage = buildGradient(currentAngle, currentColors);
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

  // Transition every 30 seconds
  setInterval(() => {
    const nextColors = getRandomGradient(currentColors);
    const start = performance.now();
    isAnimating = true;

    function step() {
      const t = Math.min((performance.now() - start) / 5000, 1);
      const blended = currentColors.map((c, i) =>
        interpolateColor(c, nextColors[i] || nextColors[nextColors.length - 1], t)
      );
      bg.style.backgroundImage = buildGradient(currentAngle, blended);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        currentColors = nextColors;
        isAnimating = false;
      }
    }
    requestAnimationFrame(step);
  }, 30000);

  const style = document.createElement("style");
  style.textContent = `.animated-background::before { mix-blend-mode: ${blendMode}; }`;
  document.head.appendChild(style);

  // --- Bottom nav
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = {
    'home-panel': document.getElementById('home-panel'),
    'changelog-panel': document.getElementById('changelog-panel'),
    'source-code-panel': document.getElementById('source-code-panel'),
    'settings-panel': document.getElementById('settings-panel')
  };

  function activateTab(tab) {
    tabs.forEach(t => t.classList.remove('active'));
    Object.values(panels).forEach(p => {
      p.classList.remove('active');
      p.setAttribute('hidden', 'true');
    });
    tab.classList.add('active');
    const target = tab.dataset.targetPanel;
    const panel = panels[target];
    if (panel) {
      panel.removeAttribute('hidden');
      panel.classList.add('active');
    }
  }

  tabs.forEach(t => t.addEventListener('click', () => activateTab(t)));
  const init = document.getElementById('home-tab');
  if (init) activateTab(init);

  // --- Theme & text-size logic
  const themeButtons = document.querySelectorAll('.theme-button[data-theme]');
  const textButtons = document.querySelectorAll('.theme-button[data-text-size]');
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(name) {
    const mode = name === 'system' ? (mq.matches ? 'dark' : 'light') : name;
    document.body.setAttribute('data-theme', mode);
    style.textContent = mode === 'light'
      ? `.animated-background::before { mix-blend-mode: soft-light !important; opacity: 0.5; }`
      : `.animated-background::before { mix-blend-mode: overlay !important; opacity: 0.9; }`;
    bg.style.opacity = mode === 'light' ? '0.15' : '0.40';
  }

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active-theme'));
      btn.classList.add('active-theme');
      localStorage.setItem('thunderhub-theme', btn.dataset.theme);
      applyTheme(btn.dataset.theme);
    });
  });
  mq.addEventListener('change', () => {
    if (document.querySelector('.theme-button.active-theme[data-theme="system"]')) {
      applyTheme('system');
    }
  });
  const saved = localStorage.getItem('thunderhub-theme');
  if (saved) {
    document.querySelector(`.theme-button[data-theme="${saved}"]`)?.classList.add('active-theme');
    applyTheme(saved);
  } else {
    const defaultTheme = mq.matches ? 'system' : 'dark';
    document.querySelector(`.theme-button[data-theme="${defaultTheme}"]`)?.classList.add('active-theme');
    applyTheme(defaultTheme);
  }

  // Text-size logic
  textButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      textButtons.forEach(b => b.classList.remove('active-theme'));
      btn.classList.add('active-theme');
      localStorage.setItem('thunderhub-text-size', btn.dataset.textSize);
    });
  });
  const savedSize = localStorage.getItem('thunderhub-text-size');
  if (savedSize) {
    document.querySelector(`.theme-button[data-text-size="${savedSize}"]`)?.classList.add('active-theme');
  } else {
    document.querySelector('.theme-button[data-text-size="medium"]')?.classList.add('active-theme');
  }
});

