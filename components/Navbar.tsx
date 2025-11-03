"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="container mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">Devium</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/courses"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Курсы
            </Link>
            <Link
              href="/paths"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Направления
            </Link>
            <Link
              href="/mentors"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Менторы
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Сообщество
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              О платформе
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button size="default" asChild>
              <Link href="/register">Зарегистрироваться</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
