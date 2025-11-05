"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const ASCII_CHARS = "@%#*+=-:. ";
const ASCII_WIDTH = 80;
const ASCII_HEIGHT = 40;
const RADIAL_SEGMENTS = 96;
const HEIGHT_SEGMENTS = 48;

const GRADIENT_START = { r: 0x00, g: 0x3e, b: 0x3b };
const GRADIENT_END = { r: 0xc9, g: 0xb7, b: 0xff };
const LIGHT_DIRECTION = normalize([0.5, 0.5, 1]);
const CAMERA_DISTANCE = 4.2;
const SCALE_FACTOR = ASCII_HEIGHT * 0.4;

function normalize(vec: [number, number, number]) {
  const [x, y, z] = vec;
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len] as [number, number, number];
}

function dot(a: [number, number, number], b: [number, number, number]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: [number, number, number], b: [number, number, number]) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ] as [number, number, number];
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rgbToHsl(r: number, g: number, b: number) {
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

  return [h, s, l] as [number, number, number];
}

function hslToRgb(h: number, s: number, l: number) {
  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val] as [number, number, number];
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

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)] as [
    number,
    number,
    number,
  ];
}

function toHex(value: number) {
  return value.toString(16).padStart(2, "0");
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

type Vec3 = [number, number, number];

interface Sample {
  position: Vec3;
  normal: Vec3;
  noise: number;
}

function radiusProfile(t: number) {
  const easedT = t * t * (3 - 2 * t);
  const bulb = 0.58 + Math.sin(Math.PI * easedT) * 0.38;
  const neck = 0.18 + Math.pow(1 - t, 3) * 0.25;
  const base = 0.12 + Math.pow(t, 2) * 0.2;
  const rim = 0.08 + Math.sin(Math.PI * (t - 0.15)) * 0.04;

  let radius = bulb;
  radius += neck * Math.exp(-Math.pow((t - 0.08) / 0.12, 2));
  radius += base * Math.exp(-Math.pow((t - 0.92) / 0.18, 2));
  radius += rim * Math.exp(-Math.pow((t - 0.45) / 0.15, 2));

  return radius * 0.58;
}

function derivativeRadius(t: number) {
  const delta = 0.001;
  return (radiusProfile(t + delta) - radiusProfile(t - delta)) / (2 * delta);
}

function sampleTop(u: number, v: number): Sample {
  const theta = u * Math.PI * 2;
  const radius = radiusProfile(v);
  const y = mix(-1, 1, v);

  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);

  const drdv = derivativeRadius(v);
  const du: Vec3 = [
    -Math.sin(theta) * radius * 2 * Math.PI,
    0,
    Math.cos(theta) * radius * 2 * Math.PI,
  ];
  const dv: Vec3 = [
    Math.cos(theta) * drdv,
    2,
    Math.sin(theta) * drdv,
  ];
  const normal = normalize(cross(dv, du));

  return {
    position: [x, y, z],
    normal,
    noise: Math.sin(u * 17.1 + v * 39.7) * 0.5 + 0.5,
  };
}

function rotateX([x, y, z]: Vec3, angle: number): Vec3 {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return [x, y * cos - z * sin, y * sin + z * cos];
}

function rotateY([x, y, z]: Vec3, angle: number): Vec3 {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}

function reflect(light: Vec3, normal: Vec3): Vec3 {
  const dotLN = dot(light, normal) * 2;
  return [light[0] - dotLN * normal[0], light[1] - dotLN * normal[1], light[2] - dotLN * normal[2]];
}

function computeColor(x: number, intensity: number, time: number, noise: number) {
  const baseT = clamp(x / (ASCII_WIDTH - 1), 0, 1);
  const phase = 0.34 + 0.34 * Math.sin(time * 0.0011 + noise * 6.2);
  const gradientT = clamp(baseT * 0.7 + phase * 0.3, 0, 1);

  const r = Math.round(mix(GRADIENT_START.r, GRADIENT_END.r, gradientT));
  const g = Math.round(mix(GRADIENT_START.g, GRADIENT_END.g, gradientT));
  const b = Math.round(mix(GRADIENT_START.b, GRADIENT_END.b, gradientT));

  const [h, s, l] = rgbToHsl(r, g, b);
  const hueShift = (Math.sin(time * 0.002 + noise * 18.9 + intensity * 4.1) * 0.77) / 6;
  const chromaBoost = clamp(s * (1 + 0.77 * 0.35 * Math.cos(time * 0.0014 + noise * 9.7)), 0, 1);

  const [rr, gg, bb] = hslToRgb((h + hueShift + 1) % 1, chromaBoost, clamp(l + (intensity - 0.5) * 0.12, 0, 1));
  return rgbToHex(rr, gg, bb);
}

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const asciiRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (headlineRef.current) {
      const chars = headlineRef.current.querySelectorAll(".char");

      gsap.fromTo(
        chars,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.03,
        }
      );
    }

    const pre = asciiRef.current;
    if (!pre) return;

    let animationFrame: number;
    let lastTime = performance.now();
    const autoRotation = { x: 0, y: 0 };
    const mouseRotation = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };
    let lastMouseMove = performance.now();

    const hasWebGL = (() => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    })();

    if (!hasWebGL) {
      pre.innerHTML = "";
      return;
    }

    const samples: Sample[] = [];
    for (let i = 0; i < RADIAL_SEGMENTS; i++) {
      const u = (i + 0.5) / RADIAL_SEGMENTS;
      for (let j = 0; j < HEIGHT_SEGMENTS; j++) {
        const v = (j + 0.5) / HEIGHT_SEGMENTS;
        samples.push(sampleTop(u, v));
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth) * 2 - 1;
      const y = (event.clientY / innerHeight) * 2 - 1;
      targetMouse.x = x;
      targetMouse.y = y;
      lastMouseMove = performance.now();
    };

    window.addEventListener("mousemove", onMouseMove);

    const depthBuffer = new Float32Array(ASCII_WIDTH * ASCII_HEIGHT);
    const charBuffer = new Array<string>(ASCII_WIDTH * ASCII_HEIGHT);
    const colorBuffer = new Array<string>(ASCII_WIDTH * ASCII_HEIGHT);

    const render = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      autoRotation.x += delta * 0.00038;
      autoRotation.y += delta * 0.00052;

      if (time - lastMouseMove > 320) {
        targetMouse.x *= 0.92;
        targetMouse.y *= 0.92;
      }

      mouseRotation.x += (targetMouse.x - mouseRotation.x) * 0.08;
      mouseRotation.y += (targetMouse.y - mouseRotation.y) * 0.08;

      depthBuffer.fill(-Infinity);

      const baseRotationX = autoRotation.x + mouseRotation.y * 0.35;
      const baseRotationY = autoRotation.y + mouseRotation.x * 0.35;

      for (let idx = 0; idx < samples.length; idx++) {
        const sample = samples[idx];
        const rotatedPos = rotateY(rotateX(sample.position, baseRotationX), baseRotationY);
        const rotatedNormal = normalize(
          rotateY(rotateX(sample.normal, baseRotationX), baseRotationY)
        );

        const translated: Vec3 = [rotatedPos[0], rotatedPos[1], rotatedPos[2] + CAMERA_DISTANCE];
        if (translated[2] <= 0.3) continue;

        const invZ = 1 / translated[2];
        const screenX = Math.round(ASCII_WIDTH / 2 + (rotatedPos[0] * SCALE_FACTOR) * invZ);
        const screenY = Math.round(
          ASCII_HEIGHT / 2 - (rotatedPos[1] * SCALE_FACTOR) * invZ * 0.9
        );

        if (screenX < 0 || screenX >= ASCII_WIDTH || screenY < 0 || screenY >= ASCII_HEIGHT) {
          continue;
        }

        const bufferIndex = screenY * ASCII_WIDTH + screenX;
        const depth = translated[2];

        if (depthBuffer[bufferIndex] > depth) {
          continue;
        }

        depthBuffer[bufferIndex] = depth;

        const viewDir = normalize([0 - rotatedPos[0], 0 - rotatedPos[1], CAMERA_DISTANCE - rotatedPos[2]]);
        const lambert = Math.max(dot(rotatedNormal, LIGHT_DIRECTION), 0);
        const halfway = normalize([
          LIGHT_DIRECTION[0] + viewDir[0],
          LIGHT_DIRECTION[1] + viewDir[1],
          LIGHT_DIRECTION[2] + viewDir[2],
        ]);
        const specular = Math.pow(Math.max(dot(rotatedNormal, halfway), 0), 32) * 0.5;
        const fresnel = Math.pow(1 - Math.max(dot(rotatedNormal, viewDir), 0), 3) * 0.5;
        const reflection = Math.pow(Math.max(dot(reflect(LIGHT_DIRECTION, rotatedNormal), viewDir), 0), 2);

        const intensity = clamp(lambert * 0.57 + specular * 0.25 + fresnel * 0.18 + reflection * 0.08, 0, 1);
        const charIndex = Math.min(
          ASCII_CHARS.length - 1,
          Math.floor((1 - intensity) * (ASCII_CHARS.length - 1))
        );
        const character = ASCII_CHARS[charIndex];
        const color = computeColor(screenX, intensity, time, sample.noise);

        charBuffer[bufferIndex] = character === " " ? "&nbsp;" : character;
        colorBuffer[bufferIndex] = color;
      }

      let output = "";
      for (let y = 0; y < ASCII_HEIGHT; y++) {
        for (let x = 0; x < ASCII_WIDTH; x++) {
          const index = y * ASCII_WIDTH + x;
          const char = charBuffer[index] ?? "&nbsp;";
          const color = colorBuffer[index] ?? "rgba(255,255,255,0.08)";
          output += `<span style="color:${color}">${char}</span>`;
        }
        output += "\n";
      }

      pre.innerHTML = output;

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const renderAnimatedText = (text: string) => {
    const words = text.split(" ");

    return words.map((word, wordIndex) => {
      const isPrimaryWord = word.toLowerCase().includes("легко");

      return (
        <div key={wordIndex} className="inline-block overflow-hidden mr-3 sm:mr-4 md:mr-6">
          {word.split("").map((char, charIndex) => (
            <span
              key={`${wordIndex}-${charIndex}`}
              className={`char inline-block ${isPrimaryWord ? "text-primary" : ""}`}
            >
              {char}
            </span>
          ))}
        </div>
      );
    });
  };

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "linear-gradient(90deg,#0c0b14 0%,#121025 100%)" }}
    >
      <div className="container mx-auto px-6 lg:px-8 h-full flex flex-col lg:flex-row items-center lg:items-stretch justify-center lg:justify-between gap-12">
        <div className="max-w-3xl lg:w-1/2 pt-32 lg:pt-0 self-end lg:self-center">
          <h1
            ref={headlineRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8"
            style={{ lineHeight: "0.9" }}
          >
            {renderAnimatedText("Изучай современные технологии легко.")}
          </h1>
          <Button size="lg" asChild className="text-base px-8">
            <Link href="/try">Попробовать</Link>
          </Button>
        </div>
        <div className="relative flex-1 w-full lg:w-1/2 h-[60vh] lg:h-full flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <pre
              ref={asciiRef}
              className="w-full h-full text-xs sm:text-sm md:text-base leading-[1] tracking-tight"
              style={{
                fontFamily: '"Courier New", monospace',
                whiteSpace: "pre",
                margin: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
                color: "white",
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
