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
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  // shader stuff
  let gl;
  let program;
  let positionBuffer;
  let uTimeLocation;
  let uResolutionLocation;
  let animationFrameId;

  const initWebGL = (canvas) => {
          if (gl) return; // Prevent re-initialization

          canvas.style.display = ""; // Resets display to its default value from CSS

          gl = canvas.getContext("webgl");
          if (!gl) {
               console.error("WebGL not supported");
               return;
          }

          const compileShader = (source, type) => {
               const shader = gl.createShader(type);
               gl.shaderSource(shader, source);
               gl.compileShader(shader);
               if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.error("Shader failed to compile: " + gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                    return null;
               }
               return shader;
          };

          const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
          const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

          program = gl.createProgram();
          gl.attachShader(program, vertexShader);
          gl.attachShader(program, fragmentShader);
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
               console.error("Program failed to link: " + gl.getProgramInfoLog(program));
               gl.deleteProgram(program);
               return;
          }

          gl.deleteShader(vertexShader);
          gl.deleteShader(fragmentShader);

          gl.useProgram(program);

          uTimeLocation = gl.getUniformLocation(program, "u_time");
          uResolutionLocation = gl.getUniformLocation(program, "u_resolution");

          positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

          const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
          gl.enableVertexAttribArray(positionAttributeLocation);
          gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

          render(0);
     };

     const deinitWebGL = () => {
          if (!gl) return;

          shaderCanvas.style.display = "none";

          if (animationFrameId) {
               cancelAnimationFrame(animationFrameId);
               animationFrameId = null;
          }

          gl.deleteProgram(program);
          gl.deleteBuffer(positionBuffer);

          gl = null;
          program = null;
          positionBuffer = null;
          console.log("WebGL resources released.");
     };

  const render = (time) => {
    if (!gl) return;

    const timeInSeconds = time * 0.001;
    const canvas = gl.canvas;

    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    gl.uniform1f(uTimeLocation, timeInSeconds);
    gl.uniform2f(uResolutionLocation, gl.canvas.width, gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameId = requestAnimationFrame(render);
  };

  const shaderCanvas = document.getElementById("shader-canvas");
  shaderCanvas.width = window.innerWidth;
  shaderCanvas.height = window.innerHeight;

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
        }, {
          once: true
        },
      );
    }, 1600);
  } else {
    activateTab(document.getElementById("home-tab"));
  }

  // ---- NAVIGATION ----
  const activateTab = (tab) => {
    if (!tab) return;

    if (tab.id === "source-tab") {
      window.open("https://github.com/hifii/hifii.github.io", "_blank");
      return;
    }

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

    const body = document.body;
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
        initWebGL(shaderCanvas);
        break;
      case "light":
        document.body.style.setProperty("--base-opacity", "0.15");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(0, 255, 255, 0.05)",
        );
        initWebGL(shaderCanvas);
        break;
      case "grey":
        document.body.style.setProperty("--base-opacity", "0.35");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(187, 134, 252, 0.08)",
        );
        initWebGL(shaderCanvas);
        break;
      case "material-purple":
        document.body.style.setProperty("--base-opacity", "0.3");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(206, 189, 255, 0.15)",
        );
        deinitWebGL()
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

  const savedTheme = localStorage.getItem("thunderhub-theme") || "system"; // Default to system
  document
    .querySelector(`.theme-button[data-theme="${savedTheme}"]`)
    ?.classList.add("active-theme");
  applyTheme(savedTheme);


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
};

const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

const fragmentShaderSource = `
precision mediump float;

uniform vec2  u_resolution;
uniform float u_time;

#define PI 3.14159265359
#define DEG_TO_RAD (PI / 180.0)

#define iResolution u_resolution
#define iTime       u_time

#define TIME_SCALE 3.0
#define CANVAS_SIZE_STRETCH_SCALE 0.4
#define STRETCH_BIAS vec2(0.0, 0.0)

#define BACKGROUND_GRADIENT_ROTATION_SPEED 0.01
#define BACKGROUND_GRADIENT_OFFSET_SPEED   0.03
#define BACKGROUND_FIRST_COLOR  vec4(0.804, 0.584, 0.380, 1.000)
#define BACKGROUND_SECOND_COLOR vec4(0.376, 0.408, 0.678, 1.000)

#define BASE_BLUR_WIDTH 0.17

vec3 linearBurn (vec3 target, vec3 blend){
    return target + blend - 1.0;
}

vec3 screen (vec3 target, vec3 blend){
    return 1.0 - (1.0 - target) * (1.0 - blend);
}

vec4 createBackgroundGradient(vec2 normalizedCoordinates, vec2 direction, float distanceOffset, vec4 colorStart, vec4 colorEnd) {
    vec2 centeredCoordinates = normalizedCoordinates - 0.5;
    float dotProduct = dot(centeredCoordinates, direction) + distanceOffset;
    float gradientFactor = 0.5 + 0.5 * sin(dotProduct);
    return mix(colorStart, colorEnd, gradientFactor);
}

vec4 drawCircle(
    vec2 normalizedCoordinates,
    vec2 center,
    float radius,
    vec4 colorInner, vec4 colorOuter,
    float blurWidth
){
    vec2 diff = normalizedCoordinates - center;
    float dist = length(diff);

    // blurred circle edge
    float alphaValue = 1.0 - smoothstep(radius - blurWidth, radius + blurWidth, dist);
    if (alphaValue <= 0.0) return vec4(0.0);

    // radial gradient
    float gradientMixFactor = clamp(dist / radius, 0.0, 1.0);
    vec4 circleColor = mix(colorInner, colorOuter, gradientMixFactor);
    circleColor.a *= alphaValue;
    return circleColor;
}

void renderAndCompositeCircle(
    inout vec4 accumulatedColor,
    vec2 normalizedCoordinates,
    float radius,
    vec2 offsetBase,
    vec2 offsetSpeed,
    vec2 offsetAmplitude,
    float blurMultiplier,
    vec4 colorInner, vec4 colorOuter,
    float time,
    int blendMode
){
    vec2 positionOffset = offsetBase + vec2(
        sin(time * offsetSpeed.x) * offsetAmplitude.x,
        cos(time * offsetSpeed.y) * offsetAmplitude.y
    );

    vec2 circleCenter = vec2(0.5) + positionOffset;

    vec4 newCircleColor = drawCircle(
        normalizedCoordinates, circleCenter, radius,
        colorInner, colorOuter, BASE_BLUR_WIDTH * blurMultiplier
    );

    vec3 blended;
    if (blendMode == 0) blended = screen(accumulatedColor.rgb, newCircleColor.rgb);
    else if (blendMode == 1) blended = linearBurn(accumulatedColor.rgb, newCircleColor.rgb);
    else blended = newCircleColor.rgb; // fallback

    accumulatedColor.rgb = mix(accumulatedColor.rgb, blended, newCircleColor.a);
}

void mainImage(out vec4 outputColor, in vec2 fragmentCoordinates) {
    vec2 normalizedCoordinates = fragmentCoordinates / iResolution.xy;
    float aspect = iResolution.x / iResolution.y;

    vec2 origin = STRETCH_BIAS * vec2(-0.5, 0.5) + 0.5;
    normalizedCoordinates -= origin;
    vec2 uvStretched = normalizedCoordinates;
    uvStretched.x *= aspect;
    normalizedCoordinates = mix(normalizedCoordinates, uvStretched, 1.0 - CANVAS_SIZE_STRETCH_SCALE);
    normalizedCoordinates += origin;


    float time = iTime * TIME_SCALE;
    float directionCosine = cos(time * BACKGROUND_GRADIENT_ROTATION_SPEED);
    float directionSine = sin(time * BACKGROUND_GRADIENT_ROTATION_SPEED);
    vec4 finalColor = createBackgroundGradient(normalizedCoordinates, vec2(directionCosine, directionSine), time * BACKGROUND_GRADIENT_OFFSET_SPEED,
                          BACKGROUND_FIRST_COLOR, BACKGROUND_SECOND_COLOR);

    renderAndCompositeCircle(
        /* accumulatedColor */ finalColor,
        /* normalizedCoordinates */ normalizedCoordinates,
        /* radius */ 0.3,
        /* offsetBase */ vec2(-0.2, -0.1),
        /* offsetSpeed */ vec2(0.10),
        /* offsetAmplitude */ vec2(0.45, 0.2),
        /* blurMultiplier */ 1.0,
        /* colorInner */ vec4(0.784, 0.424, 0.761, 1.000),
        /* colorOuter */ vec4(0.733, 0.404, 0.757, 1.000),
        /* time */ time,
        /* blendMode */ 0
    );

    renderAndCompositeCircle(
        /* accumulatedColor */ finalColor,
        /* normalizedCoordinates */ normalizedCoordinates,
        /* radius */ 0.5,
        /* offsetBase */ vec2(0.2, -0.1),
        /* offsetSpeed */ vec2(-0.20),
        /* offsetAmplitude */ vec2(0.25, 0.62),
        /* blurMultiplier */ 2.0,
        /* colorInner */ vec4(0.325, 0.235, 0.902, 1.000),
        /* colorOuter */ vec4(0.596, 0.463, 1.000, 1.000),
        /* time */ time,
        /* blendMode */ 0
    );

    renderAndCompositeCircle(
        /* accumulatedColor */ finalColor,
        /* normalizedCoordinates */ normalizedCoordinates,
        /* radius */ 0.5,
        /* offsetBase */ vec2(0.2, -0.61),
        /* offsetSpeed */ vec2(-0.30),
        /* offsetAmplitude */ vec2(0.425, 0.1),
        /* blurMultiplier */ 3.0,
        /* colorInner */ vec4(0.000, 1.000, 0.102, 1.000),
        /* colorOuter */ vec4(0.518, 1.000, 0.325, 1.000),
        /* time */ time,
        /* blendMode */ 0
    );


    renderAndCompositeCircle(
        /* accumulatedColor */ finalColor,
        /* normalizedCoordinates */ normalizedCoordinates,
        /* radius */ 1.0,
        /* offsetBase */ vec2(2, 0.0),
        /* offsetSpeed */ vec2(-0.01),
        /* offsetAmplitude */ vec2(4, 0.0),
        /* blurMultiplier */ 7.0,
        /* colorInner */ vec4(0.184, 0.184, 0.184, 1.000),
        /* colorOuter */ vec4(0.239, 0.239, 0.239, 1.000),
        /* time */ time,
        /* blendMode */ 1
    );

    outputColor = finalColor;
}

void main() {
  vec4 fragColor;
  mainImage(fragColor, gl_FragCoord.xy);
  gl_FragColor = fragColor;
}
  `;

// can add gradient preset random pick

//  const getRandomGradient = (exclude) => {
//    let pick;
//    do {
//      pick =
//        originalGradientSets[
//          Math.floor(Math.random() * originalGradientSets.length)
//        ];
//    } while (exclude && JSON.stringify(pick) === JSON.stringify(exclude));
//    return [...pick];
//  };

//  const hexToRgb = (hex) => {
//    const bigint = parseInt(hex.slice(1), 16);
//    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
//  };
//
//  const rgbToHex = (r, g, b) =>
//    "#" +
//    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

//const originalGradientSets = [
//  // Original Blueish -> Deepened Blueish
//  [
//    "#000000", // Black
//    "#001A33", // Very Dark Blue
//    "#004060", // Deep Blue
//    "#007A9E", // Rich Teal
//    "#00CDEB", // Brighter Aqua
//    "#7CE1FF", // Lighter Sky Blue
//    "#FFFFFF", // White
//  ],
//  // Original Purple -> Deepened Purple
//  [
//    "#0F001A", // Very Dark Purple
//    "#300040", // Deep Plum
//    "#550070", // Rich Violet
//    "#80009C", // Dark Orchid
//    "#B020E0", // Vibrant Purple
//    "#E099FF", // Light Lavender
//    "#FFFFFF", // White
//  ],
//  // Original Red/Orange -> Deepened Red/Orange
//  [
//    "#1A000A", // Very Dark Red
//    "#40002A", // Deep Crimson
//    "#702050", // Rich Magenta-Brown
//    "#D03050", // Strong Red
//    "#FF6030", // Bright Orange-Red
//    "#FFB060", // Soft Peach
//    "#FFF5D0", // Cream
//  ],
//  // Original Blue/Orange/Yellow -> Deepened Blue/Orange/Yellow
//  [
//    "#001020", // Very Dark Navy
//    "#201860", // Deep Indigo
//    "#C03030", // Strong Red
//    "#FF8040", // Deep Orange
//    "#FFB030", // Golden Yellow
//    "#FFFD80", // Pale Yellow
//    "#FFF0D0", // Light Cream
//  ],
//  // Original Greenish/Aqua -> Deepened Greenish/Aqua
//  [
//    "#050B0F", // Dark almost Black
//    "#102028", // Deep Slate Blue
//    "#257065", // Dark Teal
//    "#40B0B5", // Bright Teal
//    "#90E0D8", // Light Aqua
//    "#D0FFFF", // Pale Cyan
//    "#FFFFFF", // White
//  ],
//  // Original Grey -> Deepened Grey (More Contrast)
//  [
//    "#080808", // Near Black
//    "#181818", // Very Dark Grey
//    "#282828", // Dark Grey
//    "#404040", // Mid-Dark Grey
//    "#606060", // Medium Grey
//    "#808080", // Light Grey
//    "#C0C0C0", // Silver
//  ],
//  // Original Red/Orange (Stronger) -> Deepened Red/Orange (More Saturated)
//  [
//    "#200000", // Deep Maroon
//    "#500000", // Dark Red
//    "#800000", // Classic Red
//    "#B02000", // Orange-Red
//    "#E05000", // Vibrant Orange
//    "#FF8020", // Golden Orange
//    "#FFC060", // Light Gold
//  ],
//  // Original Blue/Green/Red -> Deepened Blue/Green/Red
//  [
//    "#000000", // Black
//    "#003030", // Deep Dark Cyan
//    "#005060", // Dark Cyan
//    "#009080", // Medium Teal
//    "#30B0A0", // Bright Teal
//    "#FF6060", // Bright Red
//    "#FFC040", // Golden Yellow
//  ],
//  // Original Purple/Blue -> Deepened Purple/Blue
//  [
//    "#100C2C", // Very Dark Blue-Purple
//    "#402860", // Deep Violet
//    "#705090", // Medium Purple
//    "#A070E0", // Light Purple
//    "#C0B0FF", // Pale Lavender
//    "#E8E0FF", // Very Pale Purple
//    "#FFFFFF", // White
//  ],
//  // Original Blue/Green/Yellow -> Deepened Blue/Green/Yellow
//  [
//    "#000418", // Very Dark Blue
//    "#004060", // Deep Cyan-Blue
//    "#009090", // Vibrant Aqua
//    "#70A040", // Olive Green
//    "#C0F060", // Bright Yellow-Green
//    "#E0FFB0", // Pale Green-Yellow
//    "#FFFFFF", // White
//  ],
//  // Original Deep Purple -> Deepened Darker Purple
//  [
//    "#0A0020", // Near Black-Purple
//    "#200040", // Very Deep Purple
//    "#501080", // Dark Royal Purple
//    "#8030C0", // Bright Purple
//    "#B060E0", // Medium Orchid
//    "#D090FF", // Light Purple
//    "#E8C0FF", // Very Light Purple
//  ],
//  // Original Blue/Cyan/Green -> Deepened Blue/Cyan/Green
//  [
//    "#101820", // Dark Blue-Grey
//    "#203840", // Deep Teal-Grey
//    "#305060", // Medium Teal-Blue
//    "#50A0D0", // Sky Blue
//    "#00E0B0", // Bright Aqua Green
//    "#00E070", // Emerald Green
//    "#FFFFFF", // White
//  ],
//  // Original Dark Blue/Purple/Cyan -> Deepened and More Contrast
//  [
//    "#000000", // Black
//    "#100020", // Very Dark Purple
//    "#300050", // Deep Violet
//    "#600090", // Rich Indigo
//    "#00C0C0", // Bright Cyan
//    "#60FFFF", // Pale Cyan
//    "#FFFFFF", // White
//  ],
//  // Original Pink/Purple -> Deepened Pink/Purple
//  [
//    "#FFB0E0", // Light Pink
//    "#FF80D0", // Medium Pink
//    "#FF40B0", // Bright Pink
//    "#FF1090", // Deep Pink
//    "#E00070", // Dark Magenta
//    "#B00050", // Deep Red-Purple
//    "#800030", // Very Dark Red-Purple
//  ],
//  // Original Brown/Orange -> Deepened Brown/Orange
//  [
//    "#400000", // Very Dark Brown-Red
//    "#700000", // Deep Red-Brown
//    "#B02000", // Burnt Orange
//    "#E05000", // Vivid Orange
//    "#FF8020", // Golden Orange
//    "#FFB050", // Light Orange
//    "#FFFFC0", // Pale Yellow
//  ],
//  // Original Subtle Grey -> Deepened Contrast Grey
//  [
//    "#151718", // Very Dark almost Black
//    "#25282B", // Deep Grey
//    "#404550", // Medium Dark Grey
//    "#707885", // Medium Grey
//    "#A0A8B5", // Light Medium Grey
//    "#D0D5E0", // Very Light Grey
//    "#F0F2F5", // Off-White
//  ],
//  // Original Dark Purple/Pink -> Deepened and More Electric
//  [
//    "#000010", // Near Black
//    "#100030", // Deep Indigo
//    "#300060", // Dark Violet
//    "#500090", // Royal Purple
//    "#8000C0", // Bright Purple
//    "#B040FF", // Electric Purple
//    "#D0A0FF", // Light Electric Purple
//  ],
//  // Original Black/Green -> Deepened and More Vibrant Green
//  [
//    "#000000", // Black
//    "#101010", // Dark Grey
//    "#202020", // Medium Dark Grey
//    "#00B000", // Vibrant Green
//    "#30E030", // Bright Green
//    "#80FF80", // Light Green
//    "#D0FFD0", // Pale Green
//  ],
//];