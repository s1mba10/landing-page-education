"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="w-full py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-12 lg:p-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Готовы начать обучение?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Получите доступ к более чем 250 курсам, персональному ментору и сообществу IT-специалистов. Первая неделя бесплатно!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-base" asChild>
                  <Link href="/register">
                    Начать бесплатно
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base" asChild>
                  <Link href="/courses">
                    Посмотреть курсы
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Без привязки карты • Отмена в любое время • Доступ ко всем материалам
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
