"use client";

import { useEffect, useRef } from "react";

const ASCII_WIDTH = 80;
const ASCII_HEIGHT = 40;
const ASCII_CHARS = "@%#*+=-:. ";

const LIGHT_VECTOR = normalize([0.5, 0.5, 1]);
const CAMERA_DISTANCE = 3.6;
const MODEL_SCALE = 1.1;
const HEIGHT_SCALE = 1.8;

function normalize(vec: [number, number, number]): [number, number, number] {
  const [x, y, z] = vec;
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function dot(a: [number, number, number], b: [number, number, number]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(
  a: [number, number, number],
  b: [number, number, number]
): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function radiusProfile(t: number) {
  const eased = clamp(t, 0, 1);
  if (eased < 0.08) {
    return mix(0.03, 0.45, eased / 0.08);
  }
  if (eased < 0.32) {
    const local = (eased - 0.08) / 0.24;
    return 0.45 + Math.sin(local * Math.PI) * 0.08;
  }
  if (eased < 0.62) {
    const local = (eased - 0.32) / 0.3;
    return mix(0.5, 0.18, local ** 0.9);
  }
  if (eased < 0.78) {
    const local = (eased - 0.62) / 0.16;
    return mix(0.18, 0.13, local);
  }
  if (eased < 0.9) {
    const local = (eased - 0.78) / 0.12;
    return mix(0.13, 0.2, Math.sqrt(local));
  }
  const local = (eased - 0.9) / 0.1;
  return mix(0.2, 0.12, clamp(local, 0, 1));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const gray = l * 255;
    return [gray, gray, gray];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return [r * 255, g * 255, b * 255];
}

function colorToCss([r, g, b]: [number, number, number]) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function applyChromaVariation(
  color: [number, number, number],
  jitter: number
): [number, number, number] {
  const [h, s, l] = rgbToHsl(color[0], color[1], color[2]);
  const hueShift = (jitter - 0.5) * 0.77 * 0.22;
  const satBoost = 1 + (jitter - 0.5) * 0.77 * 0.35;
  const newH = (h + hueShift + 1) % 1;
  const newS = clamp(s * satBoost, 0, 1);
  const newL = clamp(l + (jitter - 0.5) * 0.12, 0, 1);
  return hslToRgb(newH, newS, newL);
}

function rotatePoint(
  point: [number, number, number],
  angleX: number,
  angleY: number
): [number, number, number] {
  const [x, y, z] = point;
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);

  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;

  const x2 = x * cosY + z1 * sinY;
  const z2 = -x * sinY + z1 * cosY;

  return [x2, y1, z2];
}

interface FrameBuffers {
  depth: Float32Array;
  chars: string[];
  colors: string[];
}

function createFrameBuffers(): FrameBuffers {
  return {
    depth: new Float32Array(ASCII_WIDTH * ASCII_HEIGHT).fill(-Infinity),
    chars: new Array(ASCII_WIDTH * ASCII_HEIGHT).fill(" "),
    colors: new Array(ASCII_WIDTH * ASCII_HEIGHT).fill(""),
  };
}

export function AsciiSlidingTop() {
  const preRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.WebGLRenderingContext) {
      return;
    }
    const pre = preRef.current;
    const container = containerRef.current;
    if (!pre || !container) return;

    let animationFrame = 0;
    let isMounted = true;
    let pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let lastPointerTime = performance.now();

    const baseGradientStart: [number, number, number] = [0x00, 0x3e, 0x3b];
    const baseGradientEnd: [number, number, number] = [0xc9, 0xb7, 0xff];

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;
      pointerTarget = {
        x: (0.5 - relativeY) * 0.35,
        y: (relativeX - 0.5) * 0.35,
      };
      lastPointerTime = performance.now();
    };

    const handlePointerLeave = () => {
      pointerTarget = { x: 0, y: 0 };
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    const frameBuffers = createFrameBuffers();

    const thetaSamples = ASCII_WIDTH * 2;
    const heightSamples = ASCII_HEIGHT * 2;

    const render = (time: number) => {
      if (!isMounted) return;
      const seconds = time / 1000;
      const autoX = seconds * 0.6;
      const autoY = seconds * 0.45;

      if (performance.now() - lastPointerTime > 1400) {
        pointerTarget.x *= 0.93;
        pointerTarget.y *= 0.93;
      }

      pointerCurrent.x = mix(pointerCurrent.x, pointerTarget.x, 0.08);
      pointerCurrent.y = mix(pointerCurrent.y, pointerTarget.y, 0.08);

      const angleX = autoX + pointerCurrent.x;
      const angleY = autoY + pointerCurrent.y;

      frameBuffers.depth.fill(-Infinity);
      frameBuffers.chars.fill(" ");
      frameBuffers.colors.fill("");

      const gradientShift = (0.68 + 0.18 * Math.sin(seconds * 0.42)) % 1;

      for (let i = 0; i < heightSamples; i++) {
        const v = i / (heightSamples - 1);
        const yBase = (v - 0.5) * HEIGHT_SCALE;
        const radius = radiusProfile(v);
        const delta = 1 / heightSamples;
        const radiusPrev = radiusProfile(clamp(v - delta, 0, 1));
        const radiusNext = radiusProfile(clamp(v + delta, 0, 1));
        const drdt = (radiusNext - radiusPrev) / (2 * delta);

        for (let j = 0; j < thetaSamples; j++) {
          const u = j / thetaSamples;
          const theta = u * Math.PI * 2;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          const px = radius * cosTheta * MODEL_SCALE;
          const py = yBase * MODEL_SCALE;
          const pz = radius * sinTheta * MODEL_SCALE;

          const rotated = rotatePoint([px, py, pz], angleX, angleY);

          const dTheta: [number, number, number] = [
            -radius * sinTheta * MODEL_SCALE,
            0,
            radius * cosTheta * MODEL_SCALE,
          ];

          const dV: [number, number, number] = [
            drdt * cosTheta * MODEL_SCALE,
            HEIGHT_SCALE * MODEL_SCALE,
            drdt * sinTheta * MODEL_SCALE,
          ];

          const rotatedNormal = normalize(
            rotatePoint(cross(dTheta, dV), angleX, angleY)
          );

          const viewVector = normalize([
            -rotated[0],
            -rotated[1],
            CAMERA_DISTANCE - rotated[2],
          ]);

          const lambert = Math.max(dot(rotatedNormal, LIGHT_VECTOR), 0);
          const reflection = Math.max(
            dot(
              rotatedNormal,
              normalize([
                LIGHT_VECTOR[0] + viewVector[0],
                LIGHT_VECTOR[1] + viewVector[1],
                LIGHT_VECTOR[2] + viewVector[2],
              ])
            ),
            0
          );
          const specular = Math.pow(reflection, 24) * 0.5;
          const fresnel = Math.pow(1 - Math.max(dot(rotatedNormal, viewVector), 0), 3) * 0.5;
          const glossy = lambert * 0.57 + specular * 0.43;
          const intensity = clamp(0.12 + glossy + fresnel * 0.5, 0, 1);

          const perspective = MODEL_SCALE * 1.4 / (CAMERA_DISTANCE - rotated[2]);
          const screenX = Math.round(
            (ASCII_WIDTH / 2) + rotated[0] * perspective * ASCII_WIDTH * 0.4
          );
          const screenY = Math.round(
            (ASCII_HEIGHT / 2) - rotated[1] * perspective * ASCII_HEIGHT * 0.5
          );

          if (
            screenX < 0 ||
            screenX >= ASCII_WIDTH ||
            screenY < 0 ||
            screenY >= ASCII_HEIGHT
          ) {
            continue;
          }

          const depthValue = rotated[2];
          const index = screenY * ASCII_WIDTH + screenX;
          if (depthValue <= frameBuffers.depth[index]) continue;

          frameBuffers.depth[index] = depthValue;
          const charIndex = Math.floor(
            clamp(1 - intensity, 0, 0.999) * ASCII_CHARS.length
          );
          const asciiChar = ASCII_CHARS.charAt(
            Math.min(charIndex, ASCII_CHARS.length - 1)
          );

          const gradientPosition = (screenX / (ASCII_WIDTH - 1) + gradientShift) % 1;
          const baseColor: [number, number, number] = [
            mix(baseGradientStart[0], baseGradientEnd[0], gradientPosition),
            mix(baseGradientStart[1], baseGradientEnd[1], gradientPosition),
            mix(baseGradientStart[2], baseGradientEnd[2], gradientPosition),
          ];

          const shimmer = (Math.sin(seconds * 5 + screenX * 0.18 + screenY * 0.27) + 1) / 2;
          const jitter = clamp(shimmer * 0.77, 0, 1);
          const variedColor = applyChromaVariation(baseColor, jitter);

          frameBuffers.chars[index] = asciiChar;
          frameBuffers.colors[index] = colorToCss(variedColor);
        }
      }

      let output = "";
      for (let y = 0; y < ASCII_HEIGHT; y++) {
        for (let x = 0; x < ASCII_WIDTH; x++) {
          const idx = y * ASCII_WIDTH + x;
          const color = frameBuffers.colors[idx];
          const char = frameBuffers.chars[idx];
          if (color) {
            output += `<span style="color:${color}">${char}</span>`;
          } else {
            output += "<span style=\"opacity:0\"> \\u00A0</span>";
          }
        }
        output += "\n";
      }

      pre.innerHTML = output;
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrame);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full flex items-center justify-center"
    >
      <pre
        ref={preRef}
        className="font-['Courier_New',monospace] leading-none text-[clamp(7px,1.4vh,14px)] select-none"
        style={{
          margin: 0,
          color: "transparent",
          whiteSpace: "pre",
          pointerEvents: "none",
          background: "transparent",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default AsciiSlidingTop;
