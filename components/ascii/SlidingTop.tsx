"use client";

import { useEffect, useRef } from "react";

type Vec3 = [number, number, number];

const ASCII_CHARS = "@%#*+=-:. ";
const LIGHT_DIR: Vec3 = normalize([0.5, 0.5, 1.0] as Vec3);
const START_COLOR: Vec3 = [0x00, 0x3e, 0x3b];
const END_COLOR: Vec3 = [0xc9, 0xb7, 0xff];
const ASCII_WIDTH = 80;
const ASCII_HEIGHT = 40;
const U_SEGMENTS = 140;
const V_SEGMENTS = 90;
const GRADIENT_PHASE = 0.68;

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function mix(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function radiusProfile(y: number): number {
  const body = 0.62 * Math.pow(1 - clamp(Math.pow(y + 0.15, 2), 0, 1), 0.55);
  const collar = 0.18 * Math.exp(-Math.pow((y - 0.2) * 4.2, 2));
  const handle = 0.1 * Math.exp(-Math.pow((y - 0.82) * 6.5, 2));
  const flare = 0.25 * (1 - Math.pow(clamp(y + 0.4, 0, 1), 1.8));
  const tip = 0.06 * Math.exp(-Math.pow((y + 0.92) * 7.2, 2));
  return Math.max(0.06, body + collar + flare + handle - tip);
}

function rgbToHsl(color: Vec3): Vec3 {
  const [r, g, b] = color.map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToRgb(color: Vec3): Vec3 {
  const [h, s, l] = color;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function SlidingTopAscii() {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const canvas = document.createElement("canvas");
    if (!canvas.getContext("2d")) {
      return;
    }

    const pre = preRef.current;
    if (!pre) {
      return;
    }

    const depthBuffer = new Float32Array(ASCII_WIDTH * ASCII_HEIGHT);
    const charBuffer = new Array<string>(ASCII_WIDTH * ASCII_HEIGHT);
    const colorBuffer = new Array<string>(ASCII_WIDTH * ASCII_HEIGHT);

    let animationFrame = 0;
    let lastTime = performance.now();
    let autoRotX = -0.6;
    let autoRotY = 0.8;
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let mouseCurrentX = 0;
    let mouseCurrentY = 0;
    let lastMouseMove = performance.now();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = pre.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normalizedX = ((event.clientX - centerX) / rect.width) * 2;
      const normalizedY = ((event.clientY - centerY) / rect.height) * 2;
      mouseTargetX = clamp(normalizedX * 0.35, -0.6, 0.6);
      mouseTargetY = clamp(normalizedY * -0.35, -0.6, 0.6);
      lastMouseMove = performance.now();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const render = (time: number) => {
      animationFrame = requestAnimationFrame(render);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      autoRotX += delta * 0.35;
      autoRotY += delta * 0.45;

      if (time - lastMouseMove > 320) {
        mouseTargetX *= 0.92;
        mouseTargetY *= 0.92;
      }

      mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.12;
      mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.12;

      const rotX = autoRotX + mouseCurrentY;
      const rotY = autoRotY + mouseCurrentX;

      depthBuffer.fill(Number.POSITIVE_INFINITY);

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const camDistance = 4.6;
      const scaleFactor = ASCII_HEIGHT * 0.8;

      const uStep = (Math.PI * 2) / U_SEGMENTS;
      const vStep = 2 / V_SEGMENTS;

      const shimmering = Math.sin(time * 0.0028) * 0.5 + 0.5;

      for (let i = 0; i < ASCII_WIDTH * ASCII_HEIGHT; i += 1) {
        charBuffer[i] = " ";
        colorBuffer[i] = "";
      }

      for (let uIndex = 0; uIndex < U_SEGMENTS; uIndex += 1) {
        const theta = uIndex * uStep;
        const nextTheta = theta + uStep;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const cosThetaNext = Math.cos(nextTheta);
        const sinThetaNext = Math.sin(nextTheta);

        for (let vIndex = 0; vIndex < V_SEGMENTS; vIndex += 1) {
          const v = vIndex * vStep - 1; // range [-1, 1]
          const y = v;
          const yNext = clamp(v + vStep, -1, 1);
          const r = radiusProfile(y);
          const rNext = radiusProfile(yNext);

          const basePoint: Vec3 = [r * cosTheta, y * 1.05, r * sinTheta];
          const neighborU: Vec3 = [r * cosThetaNext, y * 1.05, r * sinThetaNext];
          const neighborV: Vec3 = [rNext * cosTheta, yNext * 1.05, rNext * sinTheta];

          const tangentU = subtract(neighborU, basePoint);
          const tangentV = subtract(neighborV, basePoint);
          let normal = cross(tangentU, tangentV);
          normal = normalize(normal);

          let position = basePoint;

          position = add(position, scale(normal, 0.25 * (0.5 - v * 0.25)));

          const x = position[0];
          const yRot = position[1] * cosX - position[2] * sinX;
          const z = position[1] * sinX + position[2] * cosX;

          const xRot = x * cosY + z * sinY;
          const zRot = -x * sinY + z * cosY;

          const yFinal = yRot;

          const normalX1 = normal[0];
          const normalY1 = normal[1] * cosX - normal[2] * sinX;
          const normalZ1 = normal[1] * sinX + normal[2] * cosX;
          const normalX = normalX1 * cosY + normalZ1 * sinY;
          const normalZ = -normalX1 * sinY + normalZ1 * cosY;
          const transformedNormal: Vec3 = normalize([normalX, normalY1, normalZ]);

          const viewPositionZ = zRot + camDistance;
          if (viewPositionZ <= 0.1) {
            continue;
          }

          const perspective = 1.2 / viewPositionZ;
          const projectedX = xRot * perspective;
          const projectedY = yFinal * perspective;

          const px = Math.floor(projectedX * scaleFactor + ASCII_WIDTH / 2);
          const py = Math.floor(projectedY * scaleFactor + ASCII_HEIGHT / 2);

          if (px < 0 || px >= ASCII_WIDTH || py < 0 || py >= ASCII_HEIGHT) {
            continue;
          }

          const index = px + py * ASCII_WIDTH;
          if (viewPositionZ >= depthBuffer[index]) {
            continue;
          }

          const lambert = clamp(dot(transformedNormal, LIGHT_DIR), 0, 1);
          const viewDir: Vec3 = normalize([-xRot, -yFinal, camDistance - zRot]);
          const halfVector = normalize(add(LIGHT_DIR, viewDir));
          const specular = Math.pow(clamp(dot(transformedNormal, halfVector), 0, 1), 32) * 0.5;
          const fresnel = 0.5 * Math.pow(1 - clamp(dot(transformedNormal, viewDir), 0, 1), 3);
          const reflection = specular * 0.43;
          const brightness = clamp(lambert * 0.57 + reflection + fresnel * 0.5, 0, 1);

          const charIndex = Math.min(
            ASCII_CHARS.length - 1,
            Math.floor(brightness * (ASCII_CHARS.length - 1))
          );

          const normalizedX = clamp(px / (ASCII_WIDTH - 1), 0, 1);
          const gradientOffset = (normalizedX + (time * 0.001 * GRADIENT_PHASE)) % 1;
          const baseGradient = mix(START_COLOR, END_COLOR, gradientOffset);
          const baseHsl = rgbToHsl(baseGradient);
          const noise = Math.sin(px * 0.31 + py * 0.37 + time * 0.005) * 0.5 + 0.5;
          const hueShift = (noise - 0.5) * 0.77 * 55 + shimmering * 8;
          const saturationShift = 0.18 * (noise - 0.5);
          const lightnessBoost = 0.2 * brightness;

          const finalHsl: Vec3 = [
            (baseHsl[0] + hueShift + 360) % 360,
            clamp(baseHsl[1] * (1 + saturationShift), 0.08, 1),
            clamp(baseHsl[2] + lightnessBoost, 0, 1),
          ];
          const finalColor = hslToRgb(finalHsl);

          depthBuffer[index] = viewPositionZ;
          charBuffer[index] = ASCII_CHARS[charIndex];
          colorBuffer[index] = `rgb(${finalColor[0]}, ${finalColor[1]}, ${finalColor[2]})`;
        }
      }

      let output = "";
      for (let yRow = 0; yRow < ASCII_HEIGHT; yRow += 1) {
        for (let xCol = 0; xCol < ASCII_WIDTH; xCol += 1) {
          const idx = xCol + yRow * ASCII_WIDTH;
          const char = charBuffer[idx];
          const color = colorBuffer[idx];
          if (char === " ") {
            output += "<span style=\"color: transparent\">&nbsp;</span>";
          } else {
            const displayChar = char === " " ? "&nbsp;" : char === "&" ? "&amp;" : char;
            output += `<span style="color: ${color}">${displayChar}</span>`;
          }
        }
        if (yRow < ASCII_HEIGHT - 1) {
          output += "\n";
        }
      }

      pre.innerHTML = output;
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <pre
      ref={preRef}
      className="w-full h-full flex items-center justify-center m-0"
      style={{
        fontFamily: '"Courier New", monospace',
        whiteSpace: "pre",
        lineHeight: "1em",
        fontSize: "11px",
        letterSpacing: "0.04em",
      }}
    />
  );
}

export default SlidingTopAscii;
