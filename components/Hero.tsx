"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import SlidingTopAscii from "./ascii/SlidingTop";

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
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-r from-[#0c0b14] to-[#121025]">
      <div className="container mx-auto px-6 lg:px-8 h-full flex flex-col justify-center py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center h-full">
          <div className="max-w-4xl">
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
          <div className="relative flex items-center justify-center h-full py-10 lg:py-0">
            <div className="w-full h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[80vh] max-w-3xl flex items-center justify-center">
              <SlidingTopAscii />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
