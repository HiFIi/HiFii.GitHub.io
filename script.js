    document.addEventListener("DOMContentLoaded", () => {
        const gradientSets = [
            ["#000000", "#1A0020", "#330040", "#660080", "#9900B3", "#CC00E6", "#FF00FF"],
            ["#000000", "#0A1000", "#142000", "#284000", "#4D8000", "#72C000", "#99FF00"],
            ["#000000", "#0D001A", "#1A0033", "#330066", "#6600CC", "#9900FF", "#CC33FF"],
            ["#000000", "#1A0A00", "#332000", "#664000", "#996600", "#CC8C00", "#FFB300"],
            ["#000000", "#001A1A", "#003333", "#006666", "#009999", "#00CCCC", "#00FFFF"],
            ["#000000", "#1A000A", "#330014", "#660028", "#99004C", "#CC0070", "#FF0094"],
            ["#000000", "#0A0D1A", "#141A33", "#283366", "#4C6699", "#7099CC", "#94CCFF"],
            ["#000000", "#1A100A", "#332014", "#664028", "#99664C", "#CC8C70", "#FFB394"],
            ["#000000", "#0A1A00", "#143300", "#286600", "#4C9900", "#70CC00", "#94FF00"],
            ["#000000", "#1A0000", "#330000", "#660000", "#990000", "#CC0000", "#FF0000"],
        ];

    // --- Gradient Filtering Logic ---
    function isLightColor(hex) {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.7; // Adjust threshold as needed
    }

    const filteredGradientSets = [];
    const seenCombinations = new Set();

    originalGradientSets.forEach(set => {
        const hasLightColor = set.some(color => isLightColor(color));
        const stringifiedSet = JSON.stringify(set.slice().sort());

        if (!hasLightColor && !seenCombinations.has(stringifiedSet)) {
            filteredGradientSets.push(set);
            seenCombinations.add(stringifiedSet);
        }
    });

    const blendModes = ["overlay", "soft-light", "multiply", "screen", "color-dodge"];
    const bg = document.querySelector(".animated-background");

    let currentColors, currentAngle, blendMode;

    // --- Initial State Loading (from localStorage or random) ---
    const savedGradient = localStorage.getItem("gradient-colors");
    const savedAngle = localStorage.getItem("gradient-angle");
    const savedBlend = localStorage.getItem("blend-mode");

    if (savedGradient && savedAngle && savedBlend) {
        currentColors = JSON.parse(savedGradient);
        currentAngle = parseFloat(savedAngle);
        blendMode = savedBlend;
    } else {
        currentColors = filteredGradientSets[Math.floor(Math.random() * filteredGradientSets.length)];
        currentAngle = Math.floor(Math.random() * 360);
        blendMode = blendModes[Math.floor(Math.random() * blendModes.length)];
    }

    // Save initial (or loaded) state
    localStorage.setItem("gradient-colors", JSON.stringify(currentColors));
    localStorage.setItem("gradient-angle", currentAngle.toString());
    localStorage.setItem("blend-mode", blendMode);

    // --- Gradient Animation and Utility Functions ---
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function interpolateColor(color1, color2, factor) {
        const [r1, g1, b1] = hexToRgb(color1);
        const [r2, g2, b2] = hexToRgb(color2);
        return rgbToHex(
            Math.round(r1 + factor * (r2 - r1)),
            Math.round(g1 + factor * (g2 - g1)),
            Math.round(b1 + factor * (b2 - b1))
        );
    }

    function buildGradient(angle, colors) {
        return `linear-gradient(${angle}deg, ${colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(", ")}`;
    }

    let isAnimatingColors = false;

    function applyGradientAndRotate() {
        if (!isAnimatingColors) {
            currentAngle = (currentAngle + 0.25) % 360;
        }
        bg.style.backgroundImage = buildGradient(currentAngle, currentColors);
    }

    let lastRotationFrameTime = 0;
    function animateRotation(timestamp) {
        if (!lastRotationFrameTime) lastRotationFrameTime = timestamp;
        const elapsed = timestamp - lastRotationFrameTime;
        currentAngle = (currentAngle + (0.25 * elapsed / 1000 * 60)) % 360;
        applyGradientAndRotate();
        lastRotationFrameTime = timestamp;
        requestAnimationFrame(animateRotation);
    }
    requestAnimationFrame(animateRotation);

    setInterval(() => {
        let nextColors;
        do {
            nextColors = filteredGradientSets[Math.floor(Math.random() * filteredGradientSets.length)];
        } while (JSON.stringify(nextColors) === JSON.stringify(currentColors));

        const duration = 5000;
        const startTime = performance.now();
        isAnimatingColors = true;

        const animatePalette = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            currentColors = currentColors.map((color, i) =>
                interpolateColor(color, nextColors[i] || nextColors[nextColors.length - 1], progress)
            );

            applyGradientAndRotate();

            if (progress < 1) {
                requestAnimationFrame(animatePalette);
            } else {
                currentColors = nextColors;
                isAnimatingColors = false;
                localStorage.setItem("gradient-colors", JSON.stringify(currentColors)); // Save new palette
            }
        };
        requestAnimationFrame(animatePalette);
    }, 30000);

    const grainStyle = document.createElement("style");
    grainStyle.textContent = `.animated-background::before { mix-blend-mode: ${blendMode}; }`;
    document.head.appendChild(grainStyle);

    // --- Custom Tab Logic ─────────────────────────────────────────────
    const navTabs = document.querySelectorAll('.nav-tab');
    const panels = {
        'home-panel': document.getElementById('home-panel'),
        'changelog-panel': document.getElementById('changelog-panel'),
        'source-code-panel': document.getElementById('source-code-panel'),
        'settings-panel': document.getElementById('settings-panel')
    };

    const activateTab = (tabElement) => {
        navTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        for (const panelId in panels) {
            panels[panelId].classList.remove('active');
            panels[panelId].setAttribute('hidden', 'true');
        }

        tabElement.classList.add('active');
        const targetPanelId = tabElement.dataset.targetPanel;
        const activePanel = panels[targetPanelId];
        if (activePanel) {
            activePanel.removeAttribute('hidden');
            activePanel.classList.add('active');
        }
    };

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            activateTab(tab);
        });
    });

    const initialTab = document.getElementById('home-tab');
    if (initialTab) {
        activateTab(initialTab);
    }

    // --- Theme Options Functionality ---
    const themeButtons = document.querySelectorAll('.theme-button[data-theme]');
    const systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (theme) => {
        const body = document.body;
        if (theme === 'system') {
            if (systemThemeMediaQuery.matches) {
                body.setAttribute('data-theme', 'dark');
            } else {
                body.setAttribute('data-theme', 'light');
            }
        } else {
            body.setAttribute('data-theme', theme);
        }
        // Update grain overlay blend mode based on theme for better contrast
        if (body.getAttribute('data-theme') === 'light') {
            grainStyle.textContent = `.animated-background::before { mix-blend-mode: soft-light !important; opacity: 0.5 !important; }`;
            bg.style.opacity = '0.15'; // Less intense background for light theme
        } else {
            grainStyle.textContent = `.animated-background::before { mix-blend-mode: overlay !important; opacity: 0.9 !important; }`;
            bg.style.opacity = '0.40'; // Original intensity for dark theme
        }
    };

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            themeButtons.forEach(btn => btn.classList.remove('active-theme'));
            button.classList.add('active-theme');
            localStorage.setItem('thunderhub-theme', button.dataset.theme);
            applyTheme(button.dataset.theme);
        });
    });

    systemThemeMediaQuery.addEventListener('change', (e) => {
        const activeThemeButton = document.querySelector('.theme-button.active-theme[data-theme="system"]');
        if (activeThemeButton) {
            applyTheme('system');
        }
    });

    const savedTheme = localStorage.getItem('thunderhub-theme');
    if (savedTheme) {
        document.querySelector(`.theme-button[data-theme="${savedTheme}"]`).classList.add('active-theme');
        applyTheme(savedTheme);
    } else {
        if (systemThemeMediaQuery.matches) {
            document.querySelector('.theme-button[data-theme="system"]').classList.add('active-theme');
            applyTheme('system');
        } else {
            document.querySelector('.theme-button[data-theme="dark"]').classList.add('active-theme');
            applyTheme('dark');
        }
    }




    // --- Text Size Functionality ---
    const textSizeButtons = document.querySelectorAll('.theme-button[data-text-size]');
    textSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            textSizeButtons.forEach(btn => btn.classList.remove('active-theme'));
            button.classList.add('active-theme');
            const textSize = button.dataset.textSize;
            console.log(`Text size selected: ${textSize}`);
            // Implement your text size logic here, e.g., by adding/removing classes on the body
            // document.body.style.fontSize = textSize; // Simple example
            localStorage.setItem('thunderhub-text-size', textSize);
        });
    });

    const savedTextSize = localStorage.getItem('thunderhub-text-size');
    if (savedTextSize) {
        document.querySelector(`.theme-button[data-text-size="${savedTextSize}"]`).classList.add('active-theme');
        // Apply saved text size, e.g., document.body.style.fontSize = savedTextSize;
    } else {
        document.querySelector('.theme-button[data-text-size="medium"]').classList.add('active-theme');
    }
});
