import { skills } from "@/data/portfolio";
import { FaCode, FaCubes, FaCloud, FaChartBar, FaRobot } from "react-icons/fa";
import { ReactNode } from "react";

const categoryIcons: Record<string, ReactNode> = {
  "Programming Languages": <FaCode />,
  "Frameworks & Libraries": <FaCubes />,
  "Cloud & DevOps": <FaCloud />,
  "Monitoring & Logging": <FaChartBar />,
  "AI & Data": <FaRobot />,
};

export default function Skills() {
  return (
    <section id="skills" className="mb-10">
      <h2 className="text-2xl font-semibold mb-6">Technical Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((group) => (
          <div
            key={group.category}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <span className="text-base text-gray-400 dark:text-gray-500">
                {categoryIcons[group.category] ?? <FaCode />}
              </span>
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
