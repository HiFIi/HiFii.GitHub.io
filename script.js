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

  // New uniform locations for color interpolation
  let uBackgroundColor1StartLocation;
  let uBackgroundColor1TargetLocation;
  let uBackgroundColor2StartLocation;
  let uBackgroundColor2TargetLocation;
  let uCircle1ColorInnerStartLocation;
  let uCircle1ColorInnerTargetLocation;
  let uCircle1ColorOuterStartLocation;
  let uCircle1ColorOuterTargetLocation;
  let uCircle2ColorInnerStartLocation;
  let uCircle2ColorInnerTargetLocation;
  let uCircle2ColorOuterStartLocation;
  let uCircle2ColorOuterTargetLocation;
  let uCircle3ColorInnerStartLocation;
  let uCircle3ColorInnerTargetLocation;
  let uCircle3ColorOuterStartLocation;
  let uCircle3ColorOuterTargetLocation;
  let uCircle4ColorInnerStartLocation;
  let uCircle4ColorInnerTargetLocation;
  let uCircle4ColorOuterStartLocation;
  let uCircle4ColorOuterTargetLocation;
  let uColorTransitionFactorLocation; // Factor for GLSL mix function

  let animationFrameId;

  // Color transition settings
  const COLOR_TRANSITION_DURATION = 8500; // milliseconds
  let colorTransitionStartTime = 0;

  // Store current and target colors for shader interpolation
  let shaderColors = {
    background1: { start: [0.804, 0.584, 0.38, 1.0], target: [0, 0, 0, 1] }, // Will be randomized on init
    background2: { start: [0.376, 0.408, 0.678, 1.0], target: [0, 0, 0, 1] },
    circle1Inner: { start: [0.784, 0.424, 0.761, 1.0], target: [0, 0, 0, 1] },
    circle1Outer: { start: [0.733, 0.404, 0.757, 1.0], target: [0, 0, 0, 1] },
    circle2Inner: { start: [0.325, 0.235, 0.902, 1.0], target: [0, 0, 0, 1] },
    circle2Outer: { start: [0.596, 0.463, 1.0, 1.0], target: [0, 0, 0, 1] },
    circle3Inner: { start: [0.0, 1.0, 0.102, 1.0], target: [0, 0, 0, 1] },
    circle3Outer: { start: [0.518, 1.0, 0.325, 1.0], target: [0, 0, 0, 1] },
    circle4Inner: { start: [0.184, 0.184, 0.184, 1.0], target: [0, 0, 0, 1] },
    circle4Outer: { start: [0.239, 0.239, 0.239, 1.0], target: [0, 0, 0, 1] },
  };

  const getRandomColor = () => {
    return [Math.random(), Math.random(), Math.random(), 1.0]; // RGBA with full opacity [1, 2, 6, 9, 11]
  };

  const updateTargetColors = () => {
    for (const key in shaderColors) {
      if (shaderColors.hasOwnProperty(key)) {
        shaderColors[key].start = [...shaderColors[key].target]; // Current target becomes new start
        shaderColors[key].target = getRandomColor(); // Generate new random target [5, 22]
      }
    }
    colorTransitionStartTime = performance.now(); // Reset transition time
  };

  const setShaderColorsUniforms = () => {
    if (!gl || !program) return;

    gl.uniform4fv(
      uBackgroundColor1StartLocation,
      shaderColors.background1.start,
    );
    gl.uniform4fv(
      uBackgroundColor1TargetLocation,
      shaderColors.background1.target,
    );
    gl.uniform4fv(
      uBackgroundColor2StartLocation,
      shaderColors.background2.start,
    );
    gl.uniform4fv(
      uBackgroundColor2TargetLocation,
      shaderColors.background2.target,
    );
    gl.uniform4fv(
      uCircle1ColorInnerStartLocation,
      shaderColors.circle1Inner.start,
    );
    gl.uniform4fv(
      uCircle1ColorInnerTargetLocation,
      shaderColors.circle1Inner.target,
    );
    gl.uniform4fv(
      uCircle1ColorOuterStartLocation,
      shaderColors.circle1Outer.start,
    );
    gl.uniform4fv(
      uCircle1ColorOuterTargetLocation,
      shaderColors.circle1Outer.target,
    );
    gl.uniform4fv(
      uCircle2ColorInnerStartLocation,
      shaderColors.circle2Inner.start,
    );
    gl.uniform4fv(
      uCircle2ColorInnerTargetLocation,
      shaderColors.circle2Inner.target,
    );
    gl.uniform4fv(
      uCircle2ColorOuterStartLocation,
      shaderColors.circle2Outer.start,
    );
    gl.uniform4fv(
      uCircle2ColorOuterTargetLocation,
      shaderColors.circle2Outer.target,
    );
    gl.uniform4fv(
      uCircle3ColorInnerStartLocation,
      shaderColors.circle3Inner.start,
    );
    gl.uniform4fv(
      uCircle3ColorInnerTargetLocation,
      shaderColors.circle3Inner.target,
    );
    gl.uniform4fv(
      uCircle3ColorOuterStartLocation,
      shaderColors.circle3Outer.start,
    );
    gl.uniform4fv(
      uCircle3ColorOuterTargetLocation,
      shaderColors.circle3Outer.target,
    );
    gl.uniform4fv(
      uCircle4ColorInnerStartLocation,
      shaderColors.circle4Inner.start,
    );
    gl.uniform4fv(
      uCircle4ColorInnerTargetLocation,
      shaderColors.circle4Inner.target,
    );
    gl.uniform4fv(
      uCircle4ColorOuterStartLocation,
      shaderColors.circle4Outer.start,
    );
    gl.uniform4fv(
      uCircle4ColorOuterTargetLocation,
      shaderColors.circle4Outer.target,
    );
  };

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
        console.error(
          "Shader failed to compile: " + gl.getShaderInfoLog(shader),
        );
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(
      fragmentShaderSource,
      gl.FRAGMENT_SHADER,
    );

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
    uColorTransitionFactorLocation = gl.getUniformLocation(
      program,
      "u_colorTransitionFactor",
    );

    // Get locations for all start and target color uniforms
    uBackgroundColor1StartLocation = gl.getUniformLocation(
      program,
      "u_backgroundColor1Start",
    );
    uBackgroundColor1TargetLocation = gl.getUniformLocation(
      program,
      "u_backgroundColor1Target",
    );
    uBackgroundColor2StartLocation = gl.getUniformLocation(
      program,
      "u_backgroundColor2Start",
    );
    uBackgroundColor2TargetLocation = gl.getUniformLocation(
      program,
      "u_backgroundColor2Target",
    );
    uCircle1ColorInnerStartLocation = gl.getUniformLocation(
      program,
      "u_circle1ColorInnerStart",
    );
    uCircle1ColorInnerTargetLocation = gl.getUniformLocation(
      program,
      "u_circle1ColorInnerTarget",
    );
    uCircle1ColorOuterStartLocation = gl.getUniformLocation(
      program,
      "u_circle1ColorOuterStart",
    );
    uCircle1ColorOuterTargetLocation = gl.getUniformLocation(
      program,
      "u_circle1ColorOuterTarget",
    );
    uCircle2ColorInnerStartLocation = gl.getUniformLocation(
      program,
      "u_circle2ColorInnerStart",
    );
    uCircle2ColorInnerTargetLocation = gl.getUniformLocation(
      program,
      "u_circle2ColorInnerTarget",
    );
    uCircle2ColorOuterStartLocation = gl.getUniformLocation(
      program,
      "u_circle2ColorOuterStart",
    );
    uCircle2ColorOuterTargetLocation = gl.getUniformLocation(
      program,
      "u_circle2ColorOuterTarget",
    );
    uCircle3ColorInnerStartLocation = gl.getUniformLocation(
      program,
      "u_circle3ColorInnerStart",
    );
    uCircle3ColorInnerTargetLocation = gl.getUniformLocation(
      program,
      "u_circle3ColorInnerTarget",
    );
    uCircle3ColorOuterStartLocation = gl.getUniformLocation(
      program,
      "u_circle3ColorOuterStart",
    );
    uCircle3ColorOuterTargetLocation = gl.getUniformLocation(
      program,
      "u_circle3ColorOuterTarget",
    );
    uCircle4ColorInnerStartLocation = gl.getUniformLocation(
      program,
      "u_circle4ColorInnerStart",
    );
    uCircle4ColorInnerTargetLocation = gl.getUniformLocation(
      program,
      "u_circle4ColorInnerTarget",
    );
    uCircle4ColorOuterStartLocation = gl.getUniformLocation(
      program,
      "u_circle4ColorOuterStart",
    );
    uCircle4ColorOuterTargetLocation = gl.getUniformLocation(
      program,
      "u_circle4ColorOuterTarget",
    );

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position",
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    updateTargetColors(); // Set initial random target colors
    setShaderColorsUniforms(); // Send them to the shader
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
    uBackgroundColor1StartLocation = null;
    uBackgroundColor1TargetLocation = null;
    uBackgroundColor2StartLocation = null;
    uBackgroundColor2TargetLocation = null;
    uCircle1ColorInnerStartLocation = null;
    uCircle1ColorInnerTargetLocation = null;
    uCircle1ColorOuterStartLocation = null;
    uCircle1ColorOuterTargetLocation = null;
    uCircle2ColorInnerStartLocation = null;
    uCircle2ColorInnerTargetLocation = null;
    uCircle2ColorOuterStartLocation = null;
    uCircle2ColorOuterTargetLocation = null;
    uCircle3ColorInnerStartLocation = null;
    uCircle3ColorInnerTargetLocation = null;
    uCircle3ColorOuterStartLocation = null;
    uCircle3ColorOuterTargetLocation = null;
    uCircle4ColorInnerStartLocation = null;
    uCircle4ColorInnerTargetLocation = null;
    uCircle4ColorOuterStartLocation = null;
    uCircle4ColorOuterTargetLocation = null;
    uColorTransitionFactorLocation = null;
    console.log("WebGL resources released.");
  };

  const render = (time) => {
    if (!gl) return;

    const timeInSeconds = time * 0.001;
    const canvas = gl.canvas;

    if (
      canvas.width !== window.innerWidth ||
      canvas.height !== window.innerHeight
    ) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Calculate color transition factor
    let transitionProgress =
      (time - colorTransitionStartTime) / COLOR_TRANSITION_DURATION;
    if (transitionProgress >= 1.0) {
      updateTargetColors(); // Generate new target colors
      transitionProgress = 0; // Reset progress for the new transition
    }

    gl.uniform1f(uTimeLocation, timeInSeconds);
    gl.uniform2f(uResolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(uColorTransitionFactorLocation, transitionProgress); // Pass to shader

    // Always send the current start and target colors
    setShaderColorsUniforms();

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
        },
        {
          once: true,
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
      deinitWebGL(); // Deinitialize WebGL if on source code panel
    } else {
      body.style.backgroundColor = "var(--primary-background)";
      if (bg) {
        bg.style.opacity = "var(--base-opacity)";
      }
      initWebGL(shaderCanvas); // Initialize WebGL if not on source code panel
      updateTargetColors(); // Trigger new random colors on tab switch
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
        updateTargetColors(); // Trigger new random colors on theme change
        break;
      case "light":
        document.body.style.setProperty("--base-opacity", "0.15");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(0, 255, 255, 0.05)",
        );
        initWebGL(shaderCanvas);
        updateTargetColors(); // Trigger new random colors on theme change
        break;
      case "grey":
        document.body.style.setProperty("--base-opacity", "0.35");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(187, 134, 252, 0.08)",
        );
        initWebGL(shaderCanvas);
        updateTargetColors(); // Trigger new random colors on theme change
        break;
      case "material-purple":
        document.body.style.setProperty("--base-opacity", "0.3");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(206, 189, 255, 0.15)",
        );
        deinitWebGL();
        break;
      default:
        document.body.style.setProperty("--base-opacity", "0.40");
        document.body.style.setProperty(
          "--glow-color",
          "rgba(0, 255, 255, 0.1)",
        );
        initWebGL(shaderCanvas);
        updateTargetColors(); // Trigger new random colors on theme change
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
uniform float u_colorTransitionFactor; // New uniform for blend factor

// Start colors for background gradient
uniform vec4  u_backgroundColor1Start;
uniform vec4  u_backgroundColor1Target;
uniform vec4  u_backgroundColor2Start;
uniform vec4  u_backgroundColor2Target;

// Start colors for circle 1
uniform vec4  u_circle1ColorInnerStart;
uniform vec4  u_circle1ColorInnerTarget;
uniform vec4  u_circle1ColorOuterStart;
uniform vec4  u_circle1ColorOuterTarget;

// Start colors for circle 2
uniform vec4  u_circle2ColorInnerStart;
uniform vec4  u_circle2ColorInnerTarget;
uniform vec4  u_circle2ColorOuterStart;
uniform vec4  u_circle2ColorOuterTarget;

// Start colors for circle 3
uniform vec4  u_circle3ColorInnerStart;
uniform vec4  u_circle3ColorInnerTarget;
uniform vec4  u_circle3ColorOuterStart;
uniform vec4  u_circle3ColorOuterTarget;

// Start colors for circle 4
uniform vec4  u_circle4ColorInnerStart;
uniform vec4  u_circle4ColorInnerTarget;
uniform vec4  u_circle4ColorOuterStart;
uniform vec4  u_circle4ColorOuterTarget;


#define PI 3.14159265359
#define DEG_TO_RAD (PI / 180.0)

#define iResolution u_resolution
#define iTime       u_time

#define TIME_SCALE 3.0
#define CANVAS_SIZE_STRETCH_SCALE 0.4
#define STRETCH_BIAS vec2(0.0, 0.0)

#define BACKGROUND_GRADIENT_ROTATION_SPEED 0.01
#define BACKGROUND_GRADIENT_OFFSET_SPEED   0.03

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
    vec4 colorInnerStart, vec4 colorInnerTarget,
    vec4 colorOuterStart, vec4 colorOuterTarget,
    float time,
    float transitionFactor, // Passed to mix colors
    int blendMode
){
    vec2 positionOffset = offsetBase + vec2(
        sin(time * offsetSpeed.x) * offsetAmplitude.x,
        cos(time * offsetSpeed.y) * offsetAmplitude.y
    );

    vec2 circleCenter = vec2(0.5) + positionOffset;

    // Interpolate colors based on the transition factor
    vec4 currentInnerColor = mix(colorInnerStart, colorInnerTarget, transitionFactor);
    vec4 currentOuterColor = mix(colorOuterStart, colorOuterTarget, transitionFactor);

    vec4 newCircleColor = drawCircle(
        normalizedCoordinates, circleCenter, radius,
        currentInnerColor, currentOuterColor, BASE_BLUR_WIDTH * blurMultiplier
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

    // Interpolate background colors
    vec4 currentBackgroundColor1 = mix(u_backgroundColor1Start, u_backgroundColor1Target, u_colorTransitionFactor);
    vec4 currentBackgroundColor2 = mix(u_backgroundColor2Start, u_backgroundColor2Target, u_colorTransitionFactor);

    vec4 finalColor = createBackgroundGradient(normalizedCoordinates, vec2(directionCosine, directionSine), time * BACKGROUND_GRADIENT_OFFSET_SPEED,
                          currentBackgroundColor1, currentBackgroundColor2);

    renderAndCompositeCircle(
        /* accumulatedColor */ finalColor,
        /* normalizedCoordinates */ normalizedCoordinates,
        /* radius */ 0.3,
        /* offsetBase */ vec2(-0.2, -0.1),
        /* offsetSpeed */ vec2(0.10),
        /* offsetAmplitude */ vec2(0.45, 0.2),
        /* blurMultiplier */ 1.0,
        /* colorInnerStart */ u_circle1ColorInnerStart,
        /* colorInnerTarget */ u_circle1ColorInnerTarget,
        /* colorOuterStart */ u_circle1ColorOuterStart,
        /* colorOuterTarget */ u_circle1ColorOuterTarget,
        /* time */ time,
        /* transitionFactor */ u_colorTransitionFactor,
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
        /* colorInnerStart */ u_circle2ColorInnerStart,
        /* colorInnerTarget */ u_circle2ColorInnerTarget,
        /* colorOuterStart */ u_circle2ColorOuterStart,
        /* colorOuterTarget */ u_circle2ColorOuterTarget,
        /* time */ time,
        /* transitionFactor */ u_colorTransitionFactor,
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
        /* colorInnerStart */ u_circle3ColorInnerStart,
        /* colorInnerTarget */ u_circle3ColorInnerTarget,
        /* colorOuterStart */ u_circle3ColorOuterStart,
        /* colorOuterTarget */ u_circle3ColorOuterTarget,
        /* time */ time,
        /* transitionFactor */ u_colorTransitionFactor,
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
        /* colorInnerStart */ u_circle4ColorInnerStart,
        /* colorInnerTarget */ u_circle4ColorInnerTarget,
        /* colorOuterStart */ u_circle4ColorOuterStart,
        /* colorOuterTarget */ u_circle4ColorOuterTarget,
        /* time */ time,
        /* transitionFactor */ u_colorTransitionFactor,
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
