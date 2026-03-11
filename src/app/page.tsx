"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import CareerTimeline from "@/components/CareerTimeline";
import Skills from "@/components/Skills";
import Certifications from "@/components/Certifications";
import Education from "@/components/Education";
import AIArchitecture from "@/components/AIArchitecture";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Hero />
      <div className="max-w-6xl mx-auto">
        <main className="px-6 py-10 md:px-10 text-gray-800 dark:text-gray-100">
          <AIArchitecture />
          <Projects />
          <CareerTimeline />
          <Skills />
          <Certifications />
          <Education />
        </main>
      </div>
    </div>
  );
}