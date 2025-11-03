"use client";

import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    value: "15,000+",
    label: "Активных студентов"
  },
  {
    value: "250+",
    label: "Курсов и направлений"
  },
  {
    value: "98%",
    label: "Уровень удовлетворенности"
  },
  {
    value: "500+",
    label: "Опытных менторов"
  }
];

export default function Stats() {
  return (
    <section className="w-full py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Devium в цифрах
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам IT-специалистов, которые развиваются вместе с нами
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-base text-primary-foreground/80">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
