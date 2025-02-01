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
import { PuffLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";


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
    yearRange: "Mar 2023 - Present",
    position: "Application Engineer II at Vanguard",
    responsibilities: [
      "Designed and developed robust web applications using Angular for the front-end and Python Lambdas & Spring Boot (Java) for the backend, ensuring seamless integration and high performance.",
      "Migrated legacy mainframe data for users holding over $1 trillion in assets to AWS cloud infrastructure, enhancing scalability and accessibility.",
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
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null); // State for sessionId


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

  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
  }, []);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // ========== CHAT STATE & LOGIC ==========
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm your AI companion. Ask me anything about John—his projects, certs, education, or career!",
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");

  const suggestedQuestions = [
    "Show me John's top projects",
    "Does John have any AWS certifications?",
    "Where did John go to school?",
    "What's John's current role?",
  ];

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window?.getSelection()?.toString();
      if (selection) {
        console.log("User selected text:", selection);
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleSend = async () => {
    if (!currentInput.trim()) return;

    const userMessage = { role: "user", text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput("");
    const newBotIndex = messages.length + 1;

    try {
      setIsLoading(true);
      const placeholderBotMsg = { role: "bot", text: "" };
      const newBotIndex = messages.length + 1; // we’re adding userMessage + placeholder
      setMessages((prev) => [...prev, placeholderBotMsg]);

      const res = await fetch("/api/query-bedrock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userMessage.text, sessionId }),
      });

      if (!res.ok) {
        throw new Error(`Error from server: ${res.status} ${res.statusText}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      let partialText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partialText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[newBotIndex] = { role: "bot", text: partialText };
          return updated;
        });
      }

      partialText += decoder.decode();
      setMessages((prev) => {
        const updated = [...prev];
        updated[newBotIndex] = { role: "bot", text: partialText };
        return updated;
      });
    } catch (err) {
      console.error("Error calling AI API:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[newBotIndex] = {
          role: "bot",
          text: "Sorry, I couldn't fetch a response. Please try again.",
        };
        return updated
    });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setCurrentInput(question);
    if (!chatOpen) {
      setChatOpen(true);
    }
    setTimeout(() => handleSend(), 100);
  };

  
  return (
    <>
      {/* Outer container with responsive layout */}
      <div
        className={`relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors md:flex ${
          chatOpen ? "md:mr-[25vw]" : ""
        }`}
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
            <button
              onClick={() => setChatOpen(true)}
              className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors text-lg font-medium"
            >
              Ask My AI
            </button>
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
              <button
                onClick={() => handleSuggestedQuestion("Show me John's top projects")}
                className="mt-4 underline text-blue-600 dark:text-blue-400"
              >
                Ask AI about these projects
              </button>
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
                  {item.position === "Application Engineer II at Vanguard" && (
                     <ul className="list-disc list-inside space-y-1 mt-4">
                     <li>
                       <strong>Full Stack Development:</strong> Designed and developed robust web applications using Angular for the front-end
                       and Python Lambdas & Spring Boot (Java) for the backend, ensuring seamless integration and high performance.
                     </li>
                     <li>
                       <strong>AWS Integration:</strong> Migrated legacy mainframe data for users holding large amount of assets to AWS cloud infrastructure, enhancing scalability and accessibility.
                     </li>
                     <li>
                        <strong>Call Center Modernization:
                         </strong> Contributed to the modernization of the call center infrastructure, reducing agent call volume, and lowering operational costs.
                     </li>
                     <li>
                       <strong>Microservices Architecture:</strong> Implemented microservices-based solutions, improving system
                       modularity and maintainability.
                     </li>
                     <li>
                       <strong>Performance Monitoring:</strong> Implemented monitoring and logging solutions using CloudWatch and Splunk to track
                       application performance and ensure high availability.
                     </li>
                     <li>
                       <strong>Site Reliability Engineering:</strong> Acted as Site Reliability Champion, leading efforts to improve system availability, performance monitoring, and incident response processes.
                     </li>
                     <li>
                       <strong>Mentorship:</strong> Mentored and guided junior engineers, fostering their professional growth and improving team
                       productivity.
                     </li>
                   </ul>
                  )}
                    {item.position === "Application Engineer I at Vanguard" && (
                    <ul className="list-disc list-inside space-y-1 mt-4">
                    <li>
                      <strong>Transactions Application:</strong> Contributed to the development of a high-value transactions web application,
                      enabling users to process large transactions with enhanced security and reliability.
                    </li>
                    <li>
                      <strong>Responsive Design:</strong> Led the development of a mobile-responsive version of the transactions web app using Angular,
                      increasing user accessibility.
                    </li>
                    <li>
                      <strong>API Development:</strong> Implemented RESTful APIs to facilitate seamless communication between front-end and
                      back-end systems.
                    </li>
                  </ul>
                    )}
                </div>
              ))}
              <button
                onClick={() => handleSuggestedQuestion("What's John's current role?")}
                className="mt-4 underline text-blue-600 dark:text-blue-400"
              >
                Ask AI about John&rsquo;s career
              </button>
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
              <button
                onClick={() => handleSuggestedQuestion("What are John's technical skills?")}
                className="mt-4 underline text-blue-600 dark:text-blue-400"
              >
                Ask AI about John&rsquo;s technical skills
              </button>
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
              <button
                onClick={() =>
                  handleSuggestedQuestion("Does John have any AWS certifications?")
                }
                className="mt-4 underline text-blue-600 dark:text-blue-400"
              >
                Ask AI about these certifications
              </button>
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
              <button
                onClick={() => handleSuggestedQuestion("Where did John go to school?")}
                className="mt-4 underline text-blue-600 dark:text-blue-400"
              >
                Ask AI about John&rsquo;s education
              </button>
            </section>
          </main>
        </div>

        {/* DESKTOP CHAT PANEL */}
        <DesktopChatPanel
          isLoading={isLoading}
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          messages={messages}
          currentInput={currentInput}
          setCurrentInput={setCurrentInput}
          handleSend={handleSend}
          suggestedQuestions={suggestedQuestions}
          handleSuggestedQuestion={handleSuggestedQuestion}
        />
      </div>

      {/* MOBILE BOTTOM SHEET */}
      <MobileChatSheet
        chatOpen={chatOpen}
        isLoading={isLoading}
        setChatOpen={setChatOpen}
        messages={messages}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        handleSend={handleSend}
        suggestedQuestions={suggestedQuestions}
        handleSuggestedQuestion={handleSuggestedQuestion}
      />

      {/* Floating Chat Button for Desktop */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="hidden md:block fixed bottom-4 right-4 bg-blue-500 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors text-lg font-medium"
        >
          Ask AI
        </button>
      )}
    </>
  );
}

/*  ---------------------------
    DESKTOP RIGHT-SIDE CHAT
    ---------------------------
*/
function DesktopChatPanel({
  chatOpen,
  setChatOpen,
  messages,
  currentInput,
  setCurrentInput,
  handleSend,
  isLoading,
  suggestedQuestions,
  handleSuggestedQuestion,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: { role: string; text: string }[];
  currentInput: string;
  setCurrentInput: (val: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  suggestedQuestions: string[];
  handleSuggestedQuestion: (q: string) => void;
}) {
  if (!chatOpen) return null;

  return (
    <div className="hidden md:block">
      <div
        className="
          fixed top-0 right-0 
          w-[25vw] h-screen 
          bg-white dark:bg-gray-800 
          z-50 
          shadow-2xl 
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-blue-500 text-white">
          <h2 className="font-bold text-lg">John&rsquo;s AI</h2>
          <button onClick={() => setChatOpen(false)} className="hover:text-gray-300 transition">
            ✕
          </button>
        </div>
        {/* Chat Body */}
        <div className="flex-1 p-3 space-y-2 overflow-auto bg-gray-50 dark:bg-gray-700">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-3 py-2 rounded-md whitespace-pre-wrap break-words my-1 ${
                msg.role === "bot"
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 self-start"
                  : "bg-blue-500 text-white self-end ml-auto"
              }`}
            >
              {msg.text}
              {msg.role === "bot" && isLoading && i === messages.length - 1 && (
                <span className="ml-2 inline-block">
                  <PuffLoader color="#3498db" size={24} />
                </span>
              )}
            </div>
          ))}
        </div>
        {/* Suggested Prompts */}
        <div className="p-2 bg-gray-200 dark:bg-gray-600 flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedQuestion(q)}
              className="bg-white dark:bg-gray-500 text-xs px-2 py-1 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-400 transition"
            >
              {q}
            </button>
          ))}
        </div>
        {/* Input */}
        <div className="p-3 border-t border-gray-300 dark:border-gray-700 flex">
          <input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-grow p-2 rounded-l-md dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/*  ---------------------------
    MOBILE BOTTOM SHEET CHAT
    ---------------------------
*/
function MobileChatSheet({
  chatOpen,
  setChatOpen,
  messages,
  currentInput,
  setCurrentInput,
  isLoading,
  handleSend,
  suggestedQuestions,
  handleSuggestedQuestion,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: { role: string; text: string }[];
  currentInput: string;
  isLoading: boolean;
  setCurrentInput: (val: string) => void;
  handleSend: () => void;
  suggestedQuestions: string[];
  handleSuggestedQuestion: (q: string) => void;
}) {
  if (!chatOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={() => setChatOpen(false)}
      />
      {/* Bottom Sheet */}
      <div className="relative bg-white dark:bg-gray-800 w-full h-[80vh] rounded-t-3xl p-4 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg text-gray-700 dark:text-gray-100">
            John’s AI
          </span>
          <button
            onClick={() => setChatOpen(false)}
            className="text-gray-700 dark:text-gray-100 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 p-2 space-y-2 overflow-auto rounded-md bg-gray-50 dark:bg-gray-700">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-3 py-2 rounded-md whitespace-pre-wrap break-words my-1 ${
                msg.role === "bot"
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 self-start"
                  : "bg-blue-500 text-white self-end ml-auto"
              }`}
            
            >
              {msg.text}
              {msg.role === "bot" && isLoading && i === messages.length - 1 && (
                <span className="ml-2 inline-block">
                  <PuffLoader color="#3498db" size={24} />
                </span>
              )}
            </div>
          ))}
        </div>
        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2 my-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedQuestion(q)}
              className="bg-blue-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded-md shadow-sm hover:bg-blue-200 dark:hover:bg-gray-500 transition"
            >
              {q}
            </button>
          ))}
        </div>
        {/* Input */}
        <div className="flex border-t border-gray-200 dark:border-gray-700 pt-2">
          <input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-grow p-2 rounded-l-md dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}