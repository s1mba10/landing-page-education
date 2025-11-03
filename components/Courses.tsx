"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, BarChart } from "lucide-react";
import Link from "next/link";

const courses = {
  frontend: [
    {
      title: "React & Next.js Mastery",
      description: "Полное погружение в современную разработку веб-приложений",
      level: "Средний",
      duration: "12 недель",
      students: "2,450",
      tags: ["React", "Next.js", "TypeScript"]
    },
    {
      title: "Modern CSS & UI/UX",
      description: "Создавайте красивые и адаптивные интерфейсы",
      level: "Начальный",
      duration: "8 недель",
      students: "3,200",
      tags: ["CSS", "Tailwind", "Figma"]
    },
    {
      title: "JavaScript Deep Dive",
      description: "Углубленное изучение JavaScript и современных практик",
      level: "Продвинутый",
      duration: "10 недель",
      students: "1,850",
      tags: ["JavaScript", "ES6+", "Async"]
    }
  ],
  backend: [
    {
      title: "Node.js & Express",
      description: "Создание масштабируемых серверных приложений",
      level: "Средний",
      duration: "10 недель",
      students: "2,100",
      tags: ["Node.js", "Express", "MongoDB"]
    },
    {
      title: "Python для веб-разработки",
      description: "Django и FastAPI для создания современных API",
      level: "Средний",
      duration: "12 недель",
      students: "1,950",
      tags: ["Python", "Django", "FastAPI"]
    },
    {
      title: "Микросервисная архитектура",
      description: "Проектирование и разработка микросервисов",
      level: "Продвинутый",
      duration: "14 недель",
      students: "890",
      tags: ["Microservices", "Docker", "K8s"]
    }
  ],
  devops: [
    {
      title: "DevOps Fundamentals",
      description: "Основы CI/CD и автоматизации развертывания",
      level: "Начальный",
      duration: "8 недель",
      students: "1,650",
      tags: ["CI/CD", "Git", "Linux"]
    },
    {
      title: "Kubernetes в продакшене",
      description: "Оркестрация контейнеров на производственном уровне",
      level: "Продвинутый",
      duration: "12 недель",
      students: "720",
      tags: ["Kubernetes", "Docker", "Helm"]
    },
    {
      title: "Cloud Infrastructure",
      description: "AWS, Azure и GCP для современных приложений",
      level: "Средний",
      duration: "10 недель",
      students: "1,340",
      tags: ["AWS", "Azure", "Terraform"]
    }
  ]
};

function CourseCard({ course }: { course: typeof courses.frontend[0] }) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{course.level}</Badge>
        </div>
        <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
        <CardDescription className="text-base">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.students}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href="/courses">Узнать больше</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function Courses() {
  return (
    <section className="w-full py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Популярные курсы
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите направление и начните свой путь в IT
          </p>
        </div>

        <Tabs defaultValue="frontend" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="devops">DevOps</TabsTrigger>
          </TabsList>

          <TabsContent value="frontend" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.frontend.map((course, index) => (
                <CourseCard key={index} course={course} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backend" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.backend.map((course, index) => (
                <CourseCard key={index} course={course} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="devops" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.devops.map((course, index) => (
                <CourseCard key={index} course={course} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
