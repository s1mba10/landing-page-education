"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Initialize Unicorn Studio when component mounts
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `!function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.34/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();`;
    document.body.appendChild(script);

    // GSAP Animation for headline
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

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
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
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background div for unicorn.studio interactive element */}
      <div
        id="unicorn-background"
        className="absolute inset-0 w-full h-full -z-10"
        data-purpose="unicorn-studio-integration"
      >
        <div
          data-us-project="FgLk7lrGfDFAG8Tj8AYA"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-6 lg:px-8 h-full flex flex-col justify-end pb-16 lg:pb-24">
        <div className="max-w-4xl">
          <h1
            ref={headlineRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8"
            style={{ lineHeight: '0.9' }}
          >
            {renderAnimatedText("Изучай современные технологии легко.")}
          </h1>
          <Button size="lg" asChild className="text-base px-8">
            <Link href="/try">Попробовать</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
