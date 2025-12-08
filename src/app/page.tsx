"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaAngular,
  FaAws,
  FaDatabase,
  FaGithub,
  FaLinkedinIn,
  FaMobileAlt,
  FaPython,
} from "react-icons/fa";
import { SiFlutter, SiSwift } from "react-icons/si";

/** ========== DATA SECTION ========== */
const projects = [
  {
    name: "Inqo",
    description: "A daily 20 questions game for iOS/Android.",
    icon: "/inqo-icon.png", // Use a smaller icon image instead
    url: "https://inqo.io",
    techStack: [
      <SiFlutter key="flutter" />,
      <FaAws key="aws" />,
      <FaPython key="python" />,
      <FaAngular key="angular" />,
      <FaDatabase key="database" />,
    ],
    details:
      "Architected and developed the full-stack infrastructure for Inqo, a daily AI-driven game app built with Flutter and AWS services. Automated infrastructure provisioning using AWS CloudFormation for rapid deployment and scaling. Launched on both iOS and Android platforms, ensuring a consistent user experience. Reduced cloud costs by over 50% through effective optimization and iterative Agile methodologies.",
  },
  {
    name: "Stegg",
    description: "Hide any message in any image (steganography).",
    icon: "/stegg_app_logo.svg", // Use a smaller icon image
    url: "https://apps.apple.com/ng/app/stegg/id1487379535",
    techStack: [<FaMobileAlt key="mobile" />, <SiSwift key="swift" />],
    details:
      "Developed a Swift iOS application that enables users to securely embed text within images using steganography techniques. Implemented robust encryption algorithms to ensure data privacy and integrity. Designed an intuitive user interface for embedding and extracting messages, and conducted comprehensive testing prior to deployment.",
  },
  // Add more projects here...
];

const careerTimeline = [
  {
    yearRange: "Mar 2025 - Present",
    position: "Application Engineer III at Vanguard",
    responsibilities: [
      "Helped ship call center bots to improve customer service efficiency.",
      "Created robust production support dashboards for better system observability.",
      "Working to deliver a multi-agent AI application to cut processing time by 1-3 weeks.",
    ],
  },
  {
    yearRange: "Mar 2023 - Mar 2025",
    position: "Application Engineer II at Vanguard",
    responsibilities: [
      "Designed and developed robust web applications using Angular for the front-end and Python Lambdas & Spring Boot (Java) for the backend, ensuring seamless integration and high performance.",
      "Migrated legacy mainframe data for users holding over $1 trillion in assets to AWS cloud infrastructure, enhancing scalability and accessibility.",
      "Contributed to the modernization of the call center infrastructure, reducing agent call volume and lowering operational costs.",
      "Implemented microservices-based solutions, improving system modularity and maintainability.",
      "Implemented monitoring and logging solutions using AWS CloudWatch and Splunk to track application performance and ensure high availability.",
      "Acted as Site Reliability Champion, leading efforts to improve system availability, performance monitoring, and incident response processes.",
      "Mentored and guided junior engineers, fostering their professional growth and improving team productivity.",
      "Developed and successfully demoed an AWS Bedrock Generative UI POC to leadership, showcasing innovative AI-driven solutions.",
    ],
  },
  {
    yearRange: "Jun 2020 - Mar 2023",
    position: "Application Engineer I at Vanguard",
    responsibilities: [
      "Contributed to the development of a high-value transactions web application, enabling users to process large transactions with enhanced security and reliability.",
      "Led the development of a mobile-responsive version of the app using Angular, empowering users to complete transactions on the go.",
      "Implemented RESTful APIs to facilitate seamless communication between front-end and back-end systems.",
    ],
  },
];

const certifications = [
  {
    name: "AWS Certified Developer - Associate",
    date: "Dec 2022",
    details: "Expertise in deploying, debugging, and developing on AWS.",
  },
  {
    name: "AWS Certified Cloud Practitioner",
    date: "Aug 2022",
    details: "Foundational cloud concepts, AWS services, security, and pricing.",
  },
  {
    name: "AWS Certified AI Practitioner",
    date: "Jan 2025",
    details: "Foundational knowledge in machine learning and AI on AWS.",
    // credlyLink: "https://www.credly.com/badges/your-badge-link", // Update with your actual Credly URL if needed
  },
];


const education = [
  {
    school: "University of Georgia",
    degree: "B.S. in Computer Science",
    years: "2016-2020",
    details:
      "Relevant Coursework: Cyber Security, Linear Algebra, Evolutionary Computation",
  },
];

/** ========== COMPONENT ========== */
export default function Home() {
  // ========== DARK MODE TOGGLE STATE ==========
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

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  
  return (
    <>
      {/* Outer container with responsive layout */}
      <div
        className={`relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors md:flex`}
      >
        {/* Main Content */}
        <div className="flex-grow transition-all duration-300">
          {/* HERO SECTION */}
          <header className="flex flex-col items-center text-center p-6 bg-gray-100 dark:bg-gray-800">
            <Image
              src="/john-aquino.jpeg"
              alt="John Aquino"
              width={128}
              height={128}
              className="rounded-full shadow-lg object-cover hover:scale-105 transition-all duration-300"
            />
            <h1 className="text-3xl md:text-5xl font-bold mt-4 text-gray-800 dark:text-gray-100">
              John Aquino
            </h1>
            <p className="text-lg font-light italic mt-2 text-gray-600 dark:text-gray-300">
              Experienced Full Stack Engineer
            </p>
            <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
              Innovative software engineer with a passion for developing cutting-edge applications. Fascinated by the intersection of technology and user experience, I bring forth a blend of engineering, design, and entrepreneurship to every project.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="https://github.com/john-aquino" target="_blank">
                <FaGithub
                  size={28}
                  className="text-gray-800 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                />
              </Link>
              <Link href="https://www.linkedin.com/in/john-a-aquino/" target="_blank">
                <FaLinkedinIn
                  size={28}
                  className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                />
              </Link>
            </div>
          </header>

          {/* MAIN SECTIONS */}
          <main className="p-6 md:p-10 text-gray-800 dark:text-gray-100">
            {/* Projects Section */}
            <section id="projects" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.name}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center gap-4"
                  >
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image
                        src={project.icon}
                        alt={project.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold mb-1">{project.name}</h3>
                      <p className="text-sm mb-2">{project.description}</p>
                      <Link
                        href={project.url}
                        target="_blank"
                        className="text-blue-600 dark:text-blue-400 underline text-sm"
                      >
                        View Project
                      </Link>
                      <div className="flex space-x-2 text-xl mt-2">
                        {project.techStack.map((icon, idx) => (
                          <span key={idx} className="text-gray-700 dark:text-gray-300">
                            {icon}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Career Timeline Section */}
            <section id="career" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Career Timeline</h2>
              {careerTimeline.map((item) => (
                <div
                  key={item.yearRange}
                  className="rounded-lg shadow-xl p-6 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-4"
                >
                  <h3 className="font-bold text-lg">{item.position}</h3>
                  <p className="text-sm mb-2">{item.yearRange}</p>
                  <ul className="list-disc list-inside space-y-1 mt-4">
                    {item.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

           
            {/* Certifications Section */}
            {/* Technical Skills Section */}
            <section id="skills" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Technical Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg shadow-xl p-6 bg-gray-100 dark:bg-gray-800">
                  <h3 className="text-lg font-bold mb-2">Programming Languages</h3>
                  <ul className="list-disc list-inside">
                    <li>Java</li>
                    <li>Python</li>
                    <li>TypeScript/JavaScript</li>
                    <li>Dart</li>
                  </ul>
                </div>
                <div className="rounded-lg shadow-xl p-6 bg-gray-100 dark:bg-gray-800">
                  <h3 className="text-lg font-bold mb-2">Frameworks & Libraries</h3>
                  <ul className="list-disc list-inside">
                    <li>Spring Boot</li>
                    <li>Angular</li>
                    <li>Next.js</li>
                    <li>React</li>
                    <li>Flutter</li>
                  </ul>
                </div>
                <div className="rounded-lg shadow-xl p-6 bg-gray-100 dark:bg-gray-800">
                  <h3 className="text-lg font-bold mb-2">Cloud & DevOps</h3>
                  <ul className="list-disc list-inside">
                    <li>
                      AWS (Lambda, API Gateway, DynamoDB, S3, Cognito, Bedrock, EC2, Step Functions, SQS, SNS, CloudWatch, CloudFormation)
                    </li>
                    <li>CI/CD & API Development</li>
                  </ul>
                </div>
                <div className="rounded-lg shadow-xl p-6 bg-gray-100 dark:bg-gray-800">
                  <h3 className="text-lg font-bold mb-2">Monitoring & Logging</h3>
                  <ul className="list-disc list-inside">
                    <li>Splunk</li>
                    <li>AWS CloudWatch</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Certifications Section */}
            <section id="certifications" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="rounded-lg shadow-xl p-6 bg-gray-100 dark:bg-gray-800"
                  >
                    <h3 className="font-bold text-lg mb-1">{cert.name}</h3>
                    <p className="text-sm mb-1">Date: {cert.date}</p>
                    <p className="text-sm">{cert.details}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Education Section */}
            {/* Education Section */}
            <section id="education" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Education</h2>
              {education.map((edu) => (
                <div
                  key={edu.school}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4"
                >
                  <h3 className="font-bold text-lg mb-1">{edu.school}</h3>
                  <p className="text-sm mb-1">
                    {edu.degree} ({edu.years})
                  </p>
                  <p className="text-sm">{edu.details}</p>
                </div>
              ))}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}