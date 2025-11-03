"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import AsciiSlidingTop from "./AsciiSlidingTop";

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

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
  }, []);

  // Split text into characters wrapped in spans
  const renderAnimatedText = (text: string) => {
    const words = text.split(" ");

    return words.map((word, wordIndex) => {
      // Check if this word is "легко" and add primary color
      const isPrimaryWord = word.toLowerCase().includes("легко");

      return (
        <div key={wordIndex} className="inline-block overflow-hidden mr-3 sm:mr-4 md:mr-6">
          {word.split("").map((char, charIndex) => (
            <span
              key={`${wordIndex}-${charIndex}`}
              className={`char inline-block ${isPrimaryWord ? 'text-primary' : ''}`}
            >
              {char}
            </span>
          ))}
        </div>
      );
    });
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-r from-[#0c0b14] to-[#121025]">
      <div className="absolute inset-0 -z-10" aria-hidden="true" />
      <div className="container mx-auto h-full px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center lg:items-stretch gap-16 lg:gap-20">
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
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
        <div className="w-full lg:w-1/2 h-[50vh] sm:h-[60vh] lg:h-full flex items-center justify-center">
          <AsciiSlidingTop />
        </div>
      </div>
    </section>
  );
}
