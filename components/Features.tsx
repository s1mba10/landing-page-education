"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Users, Rocket, Target, BookOpen, Award } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Практические проекты",
    description: "Учитесь на реальных проектах, которые можно добавить в портфолио"
  },
  {
    icon: Users,
    title: "Менторская поддержка",
    description: "Персональные менторы помогут вам на каждом этапе обучения"
  },
  {
    icon: Rocket,
    title: "Актуальные технологии",
    description: "Изучайте самые востребованные технологии и фреймворки"
  },
  {
    icon: Target,
    title: "Индивидуальный путь",
    description: "Персонализированная траектория обучения под ваши цели"
  },
  {
    icon: BookOpen,
    title: "Структурированное обучение",
    description: "От основ до продвинутого уровня с четкой структурой"
  },
  {
    icon: Award,
    title: "Сертификация",
    description: "Получите признанные сертификаты после завершения курсов"
  }
];

export default function Features() {
  return (
    <section className="w-full py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Почему выбирают Devium
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Современная платформа для эффективного обучения IT-специалистов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border hover:border-primary transition-colors duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
