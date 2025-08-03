<script>
document.addEventListener("DOMContentLoaded", () => {
    const originalGradientSets = [
        ["#000000", "#0A0F0F", "#004E64", "#00A5CF", "#00FFE5", "#CFFFFF", "#FFFFFF"], // Black to Neon Cyan
        ["#000000", "#2D0036", "#4A0055", "#A000C8", "#FF00F7", "#FFBBF7", "#FFFFFF"], // Black to Neon Magenta
        ["#120318", "#35003D", "#732A82", "#FF6F61", "#FFAD5E", "#FFD682", "#FFF8E1"], // Sunrise
        ["#002033", "#4A2FBD", "#FF6B6B", "#FFA15F", "#FFD05F", "#FFFB9A", "#FFF5E1"], // Sunset
        ["#0B0C10", "#1F2833", "#45A29E", "#66FCF1", "#C5FCEE", "#EFFFFD", "#FFFFFF"], // Dark to Light Ocean
        ["#0D0D0D", "#1C1C1C", "#3C3C3C", "#5A5A5A", "#7A7A7A", "#A1A1A1", "#D3D3D3"], // Stormy Night
        ["#1A0000", "#3B0000", "#5C0000", "#8B0000", "#FF4500", "#FF8C00", "#FFD700"], // Lava Flow
        ["#000000", "#002B36", "#004E64", "#00A896", "#2EC4B6", "#FF6B6B", "#FFD23F"], // Aurora Borealis
        ["#140F2D", "#3E2F5B", "#7B6BAF", "#BFA1FD", "#D9D1FF", "#FBF9FF", "#FFFFFF"], // Iridescent
        ["#000428", "#004e92", "#00b09b", "#96c93d", "#d4fc79", "#faffd1", "#ffffff"], // Deep Blue to Electric Green
        ["#0A001F", "#240046", "#5A189A", "#9D4EDD", "#C77DFF", "#E0AAFF", "#FFFFFF"], // Cyberpunk Purple
        ["#0F2027", "#203A43", "#2C5364", "#47B5FF", "#00FFD5", "#00FF7F", "#FFFFFF"], // Icefire
        ["#000000", "#1F0036", "#4B0082", "#9400D3", "#00FFFF", "#7FFFD4", "#FFFFFF"], // Neon Circuit
        ["#FFE0F7", "#FFB3E6", "#FF85D1", "#FF4DB8", "#FF1A94", "#CC007A", "#99005C"], // Bubblegum Pop
        ["#330000", "#661100", "#CC3300", "#FF6600", "#FF9933", "#FFCC66", "#FFFFCC"], // Blazing Firestorm
        ["#1E2022", "#3A3F47", "#5C677D", "#9BA9BC", "#CBD9E6", "#EEF3F9", "#FFFFFF"], // Calm Mist
        ["#000014", "#12003A", "#2B0057", "#4A007D", "#7500B0", "#B500FF", "#F7E1FF"], // Galaxy Veil
        ["#000000", "#1A1A1A", "#333333", "#39FF14", "#76FF7A", "#D0FFD6", "#FFFFFF"]  // Cyber Glow
    ];

    function isLightColor(hex) {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.7;
    }

    const filteredGradientSets = [];
    const seenCombinations = new Set();
    originalGradientSets.forEach(set => {
        const hasLightColor = set.some(isLightColor);
        const key = JSON.stringify([...set].sort());
        if (!hasLightColor && !seenCombinations.has(key)) {
            filteredGradientSets.push(set);
            seenCombinations.add(key);
        }
    });

    const blendModes = ["overlay", "soft-light", "multiply", "screen", "color-dodge"];
    const bg = document.querySelector(".animated-background");

    function getRandomGradient(exclude = null) {
        let pick;
        do {
            pick = filteredGradientSets[Math.floor(Math.random() * filteredGradientSets.length)];
        } while (exclude && JSON.stringify(pick) === JSON.stringify(exclude));
        return [...pick];
    }

    let currentColors = getRandomGradient();
    let currentAngle = Math.floor(Math.random() * 360);
    let blendMode = blendModes[Math.floor(Math.random() * blendModes.length)];

    // Immediate apply on load
    function buildGradient(angle, colors) {
        return `linear-gradient(${angle}deg, ${colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(", ")})`;
    }

    function applyGradientAndRotate() {
        if (!isAnimatingColors) {
            currentAngle = (currentAngle + 0.25) % 360;
        }
        bg.style.backgroundImage = buildGradient(currentAngle, currentColors);
    }

    let lastRotationFrameTime = 0;
    let isAnimatingColors = false;

    function animateRotation(timestamp) {
        if (!lastRotationFrameTime) lastRotationFrameTime = timestamp;
        const elapsed = timestamp - lastRotationFrameTime;
        currentAngle = (currentAngle + (0.25 * elapsed / 1000 * 60)) % 360;
        applyGradientAndRotate();
        lastRotationFrameTime = timestamp;
        requestAnimationFrame(animateRotation);
    }

    applyGradientAndRotate();
    requestAnimationFrame(animateRotation);

    setInterval(() => {
        const nextColors = getRandomGradient(currentColors);
        const duration = 5000;
        const startTime = performance.now();
        isAnimatingColors = true;

        function hexToRgb(hex) {
            const bigint = parseInt(hex.slice(1), 16);
            return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        }

        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }

        function interpolateColor(c1, c2, factor) {
            const [r1, g1, b1] = hexToRgb(c1);
            const [r2, g2, b2] = hexToRgb(c2);
            return rgbToHex(
                Math.round(r1 + factor * (r2 - r1)),
                Math.round(g1 + factor * (g2 - g1)),
                Math.round(b1 + factor * (b2 - b1))
            );
        }

        function animatePalette() {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const transition = currentColors.map((c, i) =>
                interpolateColor(c, nextColors[i] || nextColors[nextColors.length - 1], progress)
            );
            bg.style.backgroundImage = buildGradient(currentAngle, transition);
            if (progress < 1) {
                requestAnimationFrame(animatePalette);
            } else {
                currentColors = [...nextColors];
                isAnimatingColors = false;
            }
        }

        requestAnimationFrame(animatePalette);
    }, 30000);

    const grainStyle = document.createElement("style");
    grainStyle.textContent = `.animated-background::before { mix-blend-mode: ${blendMode}; }`;
    document.head.appendChild(grainStyle);

    // --- Tabs ---
    const navTabs = document.querySelectorAll('.nav-tab');
    const panels = {
        'home-panel': document.getElementById('home-panel'),
        'changelog-panel': document.getElementById('changelog-panel'),
        'source-code-panel': document.getElementById('source-code-panel'),
        'settings-panel': document.getElementById('settings-panel')
    };

    const activateTab = (tabElement) => {
        navTabs.forEach(tab => tab.classList.remove('active'));
        Object.values(panels).forEach(p => {
            p.classList.remove('active');
            p.setAttribute('hidden', 'true');
        });

        tabElement.classList.add('active');
        const targetPanelId = tabElement.dataset.targetPanel;
        const activePanel = panels[targetPanelId];
        if (activePanel) {
            activePanel.removeAttribute('hidden');
            activePanel.classList.add('active');
        }
    };

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab));
    });

    const initialTab = document.getElementById('home-tab');
    if (initialTab) activateTab(initialTab);

    // --- Theme Buttons ---
    const themeButtons = document.querySelectorAll('.theme-button[data-theme]');
    const systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (theme) => {
        const body = document.body;
        const themeMode = theme === 'system'
            ? (systemThemeMediaQuery.matches ? 'dark' : 'light')
            : theme;

        body.setAttribute('data-theme', themeMode);
        if (themeMode === 'light') {
            grainStyle.textContent = `.animated-background::before { mix-blend-mode: soft-light !important; opacity: 0.5 !important; }`;
            bg.style.opacity = '0.15';
        } else {
            grainStyle.textContent = `.animated-background::before { mix-blend-mode: overlay !important; opacity: 0.9 !important; }`;
            bg.style.opacity = '0.40';
        }
    };

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            themeButtons.forEach(btn => btn.classList.remove('active-theme'));
            button.classList.add('active-theme');
            const theme = button.dataset.theme;
            localStorage.setItem('thunderhub-theme', theme);
            applyTheme(theme);
        });
    });

    systemThemeMediaQuery.addEventListener('change', () => {
        if (document.querySelector('.theme-button.active-theme[data-theme="system"]')) {
            applyTheme('system');
        }
    });

    const savedTheme = localStorage.getItem('thunderhub-theme');
    if (savedTheme) {
        document.querySelector(`.theme-button[data-theme="${savedTheme}"]`)?.classList.add('active-theme');
        applyTheme(savedTheme);
    } else {
        const fallback = systemThemeMediaQuery.matches ? 'system' : 'dark';
        document.querySelector(`.theme-button[data-theme="${fallback}"]`)?.classList.add('active-theme');
        applyTheme(fallback);
    }

    // --- Text Size Buttons ---
    const textSizeButtons = document.querySelectorAll('.theme-button[data-text-size]');
    textSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            textSizeButtons.forEach(btn => btn.classList.remove('active-theme'));
            button.classList.add('active-theme');
            const size = button.dataset.textSize;
            localStorage.setItem('thunderhub-text-size', size);
        });
    });

    const savedTextSize = localStorage.getItem('thunderhub-text-size');
    if (savedTextSize) {
        document.querySelector(`.theme-button[data-text-size="${savedTextSize}"]`)?.classList.add('active-theme');
    } else {
        document.querySelector('.theme-button[data-text-size="medium"]')?.classList.add('active-theme');
    }
});
</script>

