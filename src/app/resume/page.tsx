"use client";

import { careerTimeline, certifications, education, skills } from "@/data/portfolio";

export default function ResumePage() {
  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
        >
          Save as PDF
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg shadow hover:bg-gray-300 transition-colors text-sm font-medium cursor-pointer"
        >
          ← Back
        </button>
      </div>

      <div className="resume-page max-w-[8.5in] mx-auto bg-white text-gray-900 px-10 py-8 print:px-0 print:py-0 print:max-w-none min-h-screen">
        {/* Header */}
        <header className="text-center border-b border-gray-300 pb-4 mb-5">
          <h1 className="text-3xl font-bold tracking-tight">John Aquino</h1>
          <p className="text-sm text-gray-600 mt-1">
            AI Systems Engineer &nbsp;|&nbsp; LLM Architectures &nbsp;|&nbsp; Cloud-Native Applications
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <a href="https://github.com/john-aquino" className="hover:underline">github.com/john-aquino</a>
            {" · "}
            <a href="https://www.linkedin.com/in/john-a-aquino/" className="hover:underline">linkedin.com/in/john-a-aquino</a>
            {" · "}
            <a href="https://johnaquino.com" className="hover:underline">johnaquino.com</a>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {process.env.NEXT_PUBLIC_RESUME_EMAIL}
            {" · "}
            {process.env.NEXT_PUBLIC_RESUME_PHONE}
          </p>
        </header>

        {/* Summary */}
        <section className="mb-5">
          <h2 className="resume-section-title">Summary</h2>
          <p className="text-sm leading-relaxed">
            Software engineer with 6+ years of experience building production AI systems and cloud
            applications at Vanguard. Specializing in multi-agent orchestration, retrieval-augmented
            generation (RAG), and scalable backend infrastructure using Python and AWS. Released
            multiple mobile apps on iOS and Android.
          </p>
        </section>

        {/* AI Systems */}
        <section className="mb-5">
          <h2 className="resume-section-title">AI Systems Experience</h2>
          <div className="text-sm flex flex-wrap gap-x-8 gap-y-0.5">
            <span>• Multi-agent orchestration</span>
            <span>• Retrieval-augmented generation (RAG)</span>
            <span>• Tool-use agents</span>
            <span>• LLM reasoning chains</span>
          </div>
        </section>

        {/* Technical Skills */}
        <section className="mb-5">
          <h2 className="resume-section-title">Technical Skills</h2>
          <div className="text-sm space-y-1">
            {skills.map((group) => (
              <div key={group.category}>
                <span className="font-semibold">{group.category}:</span>{" "}
                {group.items.join(", ")}
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="mb-5">
          <h2 className="resume-section-title">Experience</h2>
          <div className="space-y-4">
            {careerTimeline.map((role) => (
              <div key={role.yearRange}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-semibold text-sm">{role.position}</span>
                    <span className="text-sm text-gray-600"> — {role.company}</span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {role.yearRange}
                  </span>
                </div>
                <ul className="mt-1 space-y-0.5 list-disc list-outside ml-4">
                  {role.responsibilities.map((r, i) => (
                    <li key={i} className="text-sm leading-snug">
                      {r.text}
                      {r.impact && (
                        <span className="text-gray-500"> — {r.impact}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mb-5">
          <h2 className="resume-section-title">Projects</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-sm">Inqo</span>
                <span className="text-xs text-gray-500">inqo.io</span>
              </div>
              <p className="text-sm leading-snug mt-0.5">
                AI-powered daily 20 questions game. Built with Flutter, AWS, and Python.
                Reached Top 200 in the iOS App Store Trivia category.
                Automated infrastructure with CloudFormation. Reduced cloud costs by over 50%.
                Launched on iOS and Android.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-sm">Stegg</span>
                <span className="text-xs text-gray-500">stegg.io</span>
              </div>
              <p className="text-sm leading-snug mt-0.5">
                Cross-platform steganography app built with Flutter. Implements LSB and
                Spread Spectrum techniques with encryption for secure message embedding in images.
              </p>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="mb-5">
          <h2 className="resume-section-title">Education</h2>
          {education.map((edu) => (
            <div key={edu.school} className="flex justify-between items-baseline">
              <div>
                <span className="font-semibold text-sm">{edu.degree}</span>
                <span className="text-sm text-gray-600"> — {edu.school}</span>
              </div>
              <span className="text-xs text-gray-500 ml-4">{edu.years}</span>
            </div>
          ))}
        </section>

        {/* Certifications */}
        <section className="mb-5">
          <h2 className="resume-section-title">Certifications</h2>
          <ul className="text-sm space-y-0.5">
            {certifications.map((cert) => (
              <li key={cert.name}>
                <span className="font-semibold">{cert.name}</span>
                <span className="text-gray-500"> — {cert.date}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
