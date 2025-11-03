"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const testimonials = [
  {
    name: "Алексей Петров",
    company: "Яндекс",
    avatar: "/avatars/avatar1.jpg",
    initials: "АП",
    quote: "Devium помог мне систематизировать знания и перейти на новый уровень в карьере."
  },
  {
    name: "Мария Сидорова",
    company: "VK",
    avatar: "/avatars/avatar2.jpg",
    initials: "МС",
    quote: "Лучшая платформа для обучения! Практические проекты действительно работают."
  },
  {
    name: "Дмитрий Иванов",
    company: "СБЕР",
    avatar: "/avatars/avatar3.jpg",
    initials: "ДИ",
    quote: "Курсы по DevOps превзошли все ожидания. Материал актуальный и понятный."
  },
  {
    name: "Екатерина Волкова",
    company: "Тинькoff",
    avatar: "/avatars/avatar4.jpg",
    initials: "ЕВ",
    quote: "Благодаря Devium я смогла сменить карьеру и стать разработчиком."
  },
  {
    name: "Сергей Новиков",
    company: "Ozon",
    avatar: "/avatars/avatar5.jpg",
    initials: "СН",
    quote: "Использую для повышения квалификации команды. Отличное качество контента."
  },
  {
    name: "Анна Соколова",
    company: "Авито",
    avatar: "/avatars/avatar6.jpg",
    initials: "АС",
    quote: "Прошла курсы по React. Теперь уверенно работаю с современным стеком."
  },
  {
    name: "Игорь Морозов",
    company: "Wildberries",
    avatar: "/avatars/avatar7.jpg",
    initials: "ИМ",
    quote: "Менторская поддержка на высшем уровне. Всегда получаю ответы на вопросы."
  },
  {
    name: "Ольга Белова",
    company: "Лаборатория Касперского",
    avatar: "/avatars/avatar8.jpg",
    initials: "ОБ",
    quote: "Структурированный подход к обучению помог быстро освоить новые технологии."
  },
  {
    name: "Максим Федоров",
    company: "МТС",
    avatar: "/avatars/avatar9.jpg",
    initials: "МФ",
    quote: "Отличная платформа! Курсы покрывают все необходимые аспекты разработки."
  },
  {
    name: "Татьяна Козлова",
    company: "Ростелеком",
    avatar: "/avatars/avatar10.jpg",
    initials: "ТК",
    quote: "Devium - это инвестиция в будущее. Рекомендую всем коллегам."
  }
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <Card className="w-[350px] flex-shrink-0 mx-3">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {testimonial.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-foreground">{testimonial.name}</div>
            <div className="text-sm text-muted-foreground">{testimonial.company}</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          "{testimonial.quote}"
        </p>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const firstRowRef = useRef<HTMLDivElement>(null);
  const secondRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !firstRowRef.current || !secondRowRef.current) return;

    const ctx = gsap.context(() => {
      // Animate first row cards
      const firstRowCards = firstRowRef.current?.querySelectorAll(".testimonial-card");
      if (firstRowCards) {
        gsap.fromTo(
          firstRowCards,
          {
            y: 100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: firstRowRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Animate second row cards
      const secondRowCards = secondRowRef.current?.querySelectorAll(".testimonial-card");
      if (secondRowCards) {
        gsap.fromTo(
          secondRowCards,
          {
            y: 100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: secondRowRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-16 lg:py-24 overflow-hidden bg-muted/30">
      <div className="mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-3">
          Что говорят наши студенты
        </h2>
        <p className="text-center text-muted-foreground">
          Истории успеха от профессионалов индустрии
        </p>
      </div>

      {/* First Row - Scrolling Left */}
      <div ref={firstRowRef} className="relative mb-8">
        <div className="flex animate-scroll-left">
          {/* Duplicate testimonials for seamless loop */}
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div key={`left-${index}`} className="testimonial-card">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Second Row - Scrolling Right */}
      <div ref={secondRowRef} className="relative">
        <div className="flex animate-scroll-right">
          {/* Duplicate testimonials for seamless loop, reversed order */}
          {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((testimonial, index) => (
            <div key={`right-${index}`} className="testimonial-card">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
