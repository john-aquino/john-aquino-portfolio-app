import { certifications } from "@/data/portfolio";

export default function Certifications() {
  return (
    <section id="certifications" className="mb-10">
      <h2 className="text-2xl font-semibold mb-6">Certifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {certifications.map((cert) => (
          <div
            key={cert.name}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col"
          >
            <span className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              {cert.date}
            </span>
            <h3 className="font-bold text-sm leading-snug mb-2">{cert.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
              {cert.details}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
