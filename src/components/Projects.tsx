"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/portfolio";

export default function Projects() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedProject = projects.find((p) => p.name === selected);

  return (
    <section id="projects" className="mb-10">
      <h2 className="text-2xl font-semibold mb-2">Projects</h2>
      <p className="mb-6 text-sm md:text-base text-gray-600 dark:text-gray-300">
        Shipped multiple production mobile applications used by real users
        across iOS and Android.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const isActive = selected === project.name;
          return (
            <button
              key={project.name}
              type="button"
              onClick={() =>
                setSelected(isActive ? null : project.name)
              }
              className={`rounded-xl border bg-white dark:bg-gray-800 overflow-hidden transition-all text-left w-full hover:shadow-lg cursor-pointer flex flex-col ${
                isActive
                  ? "border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/30"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="p-5 flex items-start gap-4">
                <div className="w-14 h-14 relative flex-shrink-0 rounded-xl overflow-hidden">
                  <Image
                    src={project.icon}
                    alt={project.name}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{project.name}</h3>
                    <Link
                      href={project.url}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                    >
                      Visit →
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {project.description}
                  </p>

                  {/* Tech stack pills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        <span className="text-sm">{tech.icon}</span>
                        {tech.label}
                      </span>
                    ))}
                  </div>

                  {/* Highlight badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.highlights.map((h) => (
                      <span
                        key={h}
                        className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Click hint */}
              <div className="px-5 pb-3 mt-auto text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                {isActive ? "Click to collapse" : "Click for details ↓"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel below the grid */}
      {selectedProject && (
        <div className="mt-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-400">
              About {selectedProject.name}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Close ✕
            </button>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {selectedProject.details}
          </p>
        </div>
      )}
    </section>
  );
}
