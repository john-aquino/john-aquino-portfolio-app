import { careerTimeline } from "@/data/portfolio";

export default function CareerTimeline() {
  return (
    <section id="career" className="mb-10">
      <h2 className="text-2xl font-semibold mb-6">Career Timeline</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600 hidden md:block" />

        {careerTimeline.map((item, i) => (
          <div key={item.yearRange} className="relative md:pl-12 mb-8 last:mb-0">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-gray-50 dark:ring-gray-900 hidden md:block" />

            {/* Card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg">{item.position}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.company}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 whitespace-nowrap">
                    {item.yearRange}
                  </span>
                </div>
                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <ul className="px-6 py-4 space-y-3">
                {item.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 dark:bg-blue-500 flex-shrink-0" />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {resp.text}
                      </span>
                      {resp.impact && (
                        <span className="ml-1 font-semibold text-blue-600 dark:text-blue-400">
                          — {resp.impact}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
