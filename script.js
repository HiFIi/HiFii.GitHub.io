document.addEventListener("DOMContentLoaded", () => {
    // --- Splash Screen Logic ---
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    // Note: bottomNav is part of appContainer's content now, so no need to explicitly hide/show it here
    // as it will be shown when appContainer becomes visible.

    const minDisplayTime = 2000; // Minimum 2 seconds for splash screen
    const startTime = performance.now();

    const hideSplashScreen = () => {
        const elapsedTime = performance.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

        setTimeout(() => {
            splashScreen.classList.add('fade-out'); // Start fade out animation

            splashScreen.addEventListener('transitionend', () => {
                splashScreen.style.display = 'none'; // Fully hide after transition
                document.body.style.overflow = 'auto'; // Restore scrolling

                // Show the main application content smoothly
                appContainer.style.display = 'flex'; // Change to flex for main layout
                requestAnimationFrame(() => { // Use rAF for immediate reflow and transition start
                    appContainer.classList.add('show');
                });

            }, { once: true }); // Ensure listener fires only once
        }, remainingTime);
    };

    // Call hideSplashScreen once all external resources (images, fonts, etc.) are loaded
    window.addEventListener('load', hideSplashScreen);

    // Fallback for very fast loads or if 'load' event doesn't fire as expected
    // If DOMContentLoaded is fired and load hasn't, hide after a short delay
    setTimeout(() => {
        if (!splashScreen.classList.contains('fade-out')) {
            hideSplashScreen();
        }
    }, 5000); // Max splash screen display time

    // --- Gradient Logic ---
    const originalGradientSets = [
        ["#1A1A1A", "#222831", "#31363F", "#3A4750", "#00FFF5", "#EEEEEE", "#FFFFFF"],
        ["#190A2D", "#2E1A47", "#47305F", "#5F4879", "#9B59B6", "#BC13FE", "#F5F5F5"],
        ["#0F2027", "#203A43", "#2C5364", "#52E1E2", "#A9F7FF", "#FFFFFF", "#FF007F"],
        ["#0F0C29", "#302B63", "#24243E", "#3E8EDE", "#00E0FF", "#B2FFFF", "#EAF9F9"],
        ["#1F1C2C", "#928DAB", "#C3CBDC", "#FFFFFF", "#FFD3E0", "#FF00FF", "#00FFFF"],
        ["#3E5151", "#4E6464", "#627878", "#E1FFFA", "#A1FFFF", "#00FFC6", "#0BFF00"],
        ["#232526", "#414345", "#636566", "#8E9091", "#DADADA", "#FFFFFF", "#FF6EC7"],
        ["#202020", "#3D3D3D", "#5A5A5A", "#77B6EA", "#5FFBF1", "#B2FFFF", "#FA00FF"],
        ["#2C3E50", "#4CA1AF", "#C4E0E5", "#ECF0F1", "#FFFFFF", "#FF0080", "#00FF80"],
        ["#141E30", "#243B55", "#2C5364", "#7DCEA0", "#D4EFDF", "#FFFFFF", "#FFDC00"],
        ["#1A2980", "#2677B4", "#32C4E0", "#6FE4E6", "#A2F1E9", "#D1FAF4", "#FFFFFF"],
        ["#FF512F", "#FF3C1F", "#FF2C0F", "#E0260F", "#B3200F", "#7F1A0F", "#4C140F"],
        ["#0B486B", "#227397", "#3BA0C2", "#62BFE7", "#88D3F9", "#B6E4FB", "#E3F5FD"],
        ["#2980B9", "#3E99D0", "#54B2E7", "#6FCBF7", "#9BDDFB", "#C7EEFD", "#F2FFFF"],
        ["#EB3349", "#D72845", "#BF1D40", "#A6123C", "#8F0737", "#770032", "#5F002D"],
        ["#2C3E50", "#27394E", "#22344C", "#1D2F4A", "#182A47", "#132544", "#0E2042"],
        ["#360033", "#540048", "#72005D", "#900072", "#AF0087", "#CD009C", "#EB00B1"],
        ["#FC00FF", "#D900DC", "#B300B9", "#8C0096", "#660073", "#400050", "#1A002D"],
        ["#4DA0B0", "#56B1A8", "#5FC2A0", "#68D398", "#71E490", "#A1F5AA", "#D1FFCC"],
        ["#BDCCC1", "#B3C2B8", "#A8B8AF", "#9EAEA6", "#93A49D", "#899A94", "#7E908B"],
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
        const hasLightColor = set.some(color => isLightColor(color));
        const stringifiedSet = JSON.stringify(set.slice().sort());

        if (!hasLightColor && !seenCombinations.has(stringifiedSet)) {
            filteredGradientSets.push(set);
            seenCombinations.add(stringifiedSet);
        }
    });

    const blendModes = ["overlay", "soft-light", "multiply", "screen", "color-dodge"];

    // Get both animated background containers
    const mainAnimatedBackground = appContainer.querySelector(".animated-background");
    const splashAnimatedBackground = splashScreen.querySelector('.animated-background');

    let currentColors, currentAngle, blendMode;

    // --- Initial State - ALWAYS choose random on load ---
    currentColors = filteredGradientSets[Math.floor(Math.random() * filteredGradientSets.length)];
    currentAngle = Math.floor(Math.random() * 360);
    blendMode = blendModes[Math.floor(Math.random() * blendModes.length)];

    // Removed localStorage.setItem for initial state to ensure random on every load

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

        const gradientString = buildGradient(currentAngle, currentColors);

        // Apply to the main app's background
        if (mainAnimatedBackground) {
            mainAnimatedBackground.style.backgroundImage = gradientString;
        }
        // Also apply to the splash screen's background if it's still visible
        if (splashAnimatedBackground && splashScreen.style.display !== 'none') {
            splashAnimatedBackground.style.backgroundImage = gradientString;
            // Ensure splash background has the right blend mode/opacity initially
            const bodyTheme = document.body.getAttribute('data-theme');
            if (bodyTheme === 'light') {
              splashAnimatedBackground.style.opacity = '0.15';
              splashAnimatedBackground.style.mixBlendMode = 'soft-light';
            } else {
              splashAnimatedBackground.style.opacity = '0.30'; // Default for dark theme
              splashAnimatedBackground.style.mixBlendMode = 'overlay'; // Default for dark theme
            }
        }

        // Update the CSS variables for the gooey elements dynamically
        document.documentElement.style.setProperty('--color1', hexToRgb(currentColors[0]).join(', '));
        document.documentElement.style.setProperty('--color2', hexToRgb(currentColors[1] || currentColors[0]).join(', '));
        document.documentElement.style.setProperty('--color3', hexToRgb(currentColors[2] || currentColors[0]).join(', '));
        document.documentElement.style.setProperty('--color4', hexToRgb(currentColors[3] || currentColors[0]).join(', '));
        document.documentElement.style.setProperty('--color5', hexToRgb(currentColors[4] || currentColors[0]).join(', '));
        document.documentElement.style.setProperty('--blending', blendMode);
    }

    let lastRotationFrameTime = 0;
    function animateRotation(timestamp) {
        if (!lastRotationFrameTime) lastRotationFrameTime = timestamp;
        const elapsed = timestamp - lastRotationFrameTime;
        currentAngle = (currentAngle + (0.25 * elapsed / 1000 * 60)) % 360;
        applyGradientAndRotate(); // This will now update the colors for goo as well
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
                // No longer saving new palette to localStorage
            }
        };
        requestAnimationFrame(animatePalette);
    }, 30000);

    const grainStyle = document.createElement("style");
    // This style tag now manages the blend mode for *both* animated backgrounds' ::before pseudo-elements
    // Ensure it's correctly placed in <head> for global effect.
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
            if (mainAnimatedBackground) mainAnimatedBackground.style.opacity = '0.15'; // Less intense for main app
            if (splashAnimatedBackground) splashAnimatedBackground.style.opacity = '0.15'; // Less intense for splash
        } else {
            grainStyle.textContent = `.animated-background::before { mix-blend-mode: overlay !important; opacity: 0.9 !important; }`;
            if (mainAnimatedBackground) mainAnimatedBackground.style.opacity = '0.30'; // Original for main app
            if (splashAnimatedBackground) splashAnimatedBackground.style.opacity = '0.30'; // Original for splash
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

    // Apply theme initially on load
    const savedTheme = localStorage.getItem('thunderhub-theme');
    if (savedTheme) {
        const themeBtn = document.querySelector(`.theme-button[data-theme="${savedTheme}"]`);
        if (themeBtn) themeBtn.classList.add('active-theme');
        applyTheme(savedTheme);
    } else {
        if (systemThemeMediaQuery.matches) {
            const systemBtn = document.querySelector('.theme-button[data-theme="system"]');
            if (systemBtn) systemBtn.classList.add('active-theme');
            applyTheme('system');
        } else {
            const darkBtn = document.querySelector('.theme-button[data-theme="dark"]');
            if (darkBtn) darkBtn.classList.add('active-theme');
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
        const sizeBtn = document.querySelector(`.theme-button[data-text-size="${savedTextSize}"]`);
        if (sizeBtn) sizeBtn.classList.add('active-theme');
        // Apply saved text size, e.g., document.body.style.fontSize = savedTextSize;
    } else {
        const mediumBtn = document.querySelector('.theme-button[data-text-size="medium"]');
        if (mediumBtn) mediumBtn.classList.add('active-theme');
    }
});
