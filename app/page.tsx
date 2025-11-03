import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TestimonialsScroll from "@/components/TestimonialsScroll";
import Features from "@/components/Features";
import Courses from "@/components/Courses";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <Hero />
      <TestimonialsScroll />
      <Features />
      <Courses />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}
