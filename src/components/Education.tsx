import { education } from "@/data/portfolio";

export default function Education() {
  return (
    <section id="education" className="mb-10">
      <h2 className="text-2xl font-semibold mb-6">Education</h2>
      {education.map((edu) => (
        <div
          key={edu.school}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-bold text-lg">{edu.school}</h3>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {edu.years}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {edu.degree}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {edu.details}
          </p>
        </div>
      ))}
    </section>
  );
}
