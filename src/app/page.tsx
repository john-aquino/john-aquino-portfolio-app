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
      "Built with Flutter, AWS Lambdas (Python), ChatGPT API, and a playful UI. Responsible for full-stack architecture and deployment.",
  },
  {
    name: "Stegg",
    description: "Hide any message in any image (steganography).",
    icon: "/stegg_app_logo.svg", // Use a smaller icon image
    url: "https://apps.apple.com/ng/app/stegg/id1487379535",
    techStack: [<FaMobileAlt key="mobile" />, <SiSwift key="swift" />],
    details:
      "Developed a Swift app implementing steganography. Users can embed text in images and share securely.",
  },
  // Add more projects here...
];

const careerTimeline = [
  {
    yearRange: "Mar 2023 - Present",
    position: "Application Engineer II at Vanguard",
    responsibilities: [
      "Migrated legacy mainframe data for users holding over $1 trillion in assets to AWS cloud infrastructure.",
      "Contributed to the modernization of the call center infrastructure, reducing agent call volume and lowering operational costs.",
      "Acted as Site Reliability Champion, improving system availability, performance monitoring, and incident response.",
      "Mentored junior engineers, fostering career development.",
    ],
  },
  {
    yearRange: "Jun 2020 - Mar 2023",
    position: "Application Engineer I at Vanguard",
    responsibilities: [
      "Developed a transactions web app enabling seamless processing of high-value transactions exceeding $250,000.",
      "Led the development of a mobile-responsive version of the app, empowering users to complete transactions on the go.",
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
    credlyLink: "https://www.credly.com/badges/your-badge-link", // Update this link with your actual Credly URL
  },
];
const education = [
  {
    school: "University of Georgia",
    degree: "B.S. in Computer Science",
    years: "2016-2020",
    details:
      "Relevant Coursework: Evolutionary Computation, Linear Algebra, Cyber Security, Distributed Systems.",
  },
];

/** ========== COMPONENT ========== */
export default function Home() {
  // ========== DARK MODE TOGGLE STATE ==========
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    // On mount, check if user prefers dark
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    // Toggle the <html> or <body> class
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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

  // Example “suggested questions”
  const suggestedQuestions = [
    "Show me John's top projects",
    "Does John have any AWS certifications?",
    "Where did John go to school?",
    "What's John's current role?",
  ];

  /** Simple text selection handler (optional) */
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

  /** Handle sending a message */
  const handleSend = async () => {
    if (!currentInput.trim()) return;

    // Add user message to the UI
    const userMessage = { role: "user", text: currentInput };
    setMessages((prev) => [...prev, userMessage]);

    // Clear the input
    setCurrentInput("");

    try {
      // Call your Next.js API route — e.g., "/api/query-bedrock"
      const res = await fetch("/api/query-bedrock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: userMessage.text }),
      });

      if (!res.ok) {
        throw new Error(`Error from server: ${res.status} ${res.statusText}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      let rawData = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        rawData += decoder.decode(value, { stream: true });
      }
  
      rawData += decoder.decode(); // Finalize decoding
      console.log("Decoded Response Data:", rawData);
  
      // Parse the data if it's JSON
      let data;
      // try {
      //   data = JSON.parse(rawData);
      // } catch (err) {
      //   throw new Error("Failed to parse JSON from response.");
      // }
  
      const botReplyText = rawData || "No response from AI.";
  
      // Add the bot's message to the conversation
      setMessages((prev) => [...prev, { role: "bot", text: botReplyText }]);
    } catch (err) {
      console.error("Error calling AI API:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Oops, something went wrong!" },
      ]);
    }
  };

  /** For suggested Qs */
  const handleSuggestedQuestion = (question: string) => {
    setCurrentInput(question);
    // auto-send for a snappier user experience
    setTimeout(() => handleSend(), 100);
  };

  /** ========== BASIC KEYWORD LOGIC (MVP) ========== */
  const generateBotReply = (query: string) => {
    let replyText = "Hmm, that's interesting. Tell me more!";

    const lowerQ = query.toLowerCase();

    if (lowerQ.includes("project")) {
      replyText = `John has ${projects.length} featured projects: ${projects
        .map((p) => p.name)
        .join(", ")}. Ask for details on any project!`;
    } else if (lowerQ.includes("cert") || lowerQ.includes("aws")) {
      replyText = `John holds certifications such as: ${certifications
        .map((c) => c.name)
        .join(", ")}.`;
    } else if (lowerQ.includes("educat") || lowerQ.includes("school")) {
      replyText = `John studied at UGA from 2016-2020, focusing on Evolutionary Computation, Cyber Security, etc.`;
    } else if (lowerQ.includes("role") || lowerQ.includes("career")) {
      replyText = `John has worked at Vanguard since 2020. Currently an Application Engineer II (since March 2023). Ask more about responsibilities!`;
    } else if (lowerQ.includes("responsib")) {
      replyText = careerTimeline
        .map(
          (job) =>
            `${job.yearRange}: ${job.position}\nResponsibilities:\n- ${job.responsibilities.join(
              "\n- "
            )}`
        )
        .join("\n\n");
    } else if (lowerQ.includes("details inqo")) {
      // Example if user wants more detail on Inqo specifically
      replyText = projects.find((p) => p.name.toLowerCase().includes("inqo"))
        ?.details || "Inqo is a daily 20 questions game.";
    }

    return { role: "bot", text: replyText };
  };

  return (
    <>
      {/* Outer container: flex for desktop layout so we can shift main content. */}
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors md:flex">
        {/* Dark Mode Toggle in top-right */}
        {/* <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-full 
            bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200
            shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 z-50"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <BsSunFill /> : <BsMoonFill />}
        </button> */}

        {/* Main content area. Add margin-right on desktop if chat is open. */}
        <div
          className={`flex-grow transition-all duration-300 
            ${chatOpen ? "md:mr-[25vw]" : ""}`}
        >
          {/* ========== HERO SECTION ========== */}
          <header className="flex flex-col items-center text-center p-6 bg-gray-100 dark:bg-gray-800">
            <Image
              src="/john-aquino.jpeg"
              alt="John Aquino"
              width={128}
              height={128}
              className="rounded-full shadow-lg object-cover grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300"
            />
            <h1 className="text-3xl md:text-5xl font-bold mt-4 text-gray-800 dark:text-gray-100">
              John Aquino
            </h1>
            <p className="text-lg font-light italic mt-2 text-gray-600 dark:text-gray-300">
              Experienced Full Stack Engineer
            </p>
            <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
              Innovative software engineer with a passion for developing
              cutting-edge applications. Fascinated by the intersection of
              technology and user experience, I bring forth a blend of
              engineering, design, and entrepreneurship to every project.
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

          {/* ========== MAIN SECTIONS ========== */}
          <main className="p-6 md:p-10 text-gray-800 dark:text-gray-100">
            {/* Projects */}
            <section id="projects" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.name}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center gap-4"
                  >
                    {/* Smaller icon instead of large screenshot */}
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

            {/* Career Timeline (moved up) */}
            <section id="career" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Career Timeline</h2>
              {careerTimeline.map((item) => (
                <div
                  key={item.yearRange}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4"
                >
                  <h3 className="font-bold text-lg">{item.position}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {item.yearRange}
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    {item.responsibilities.map((res, i) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                onClick={() => handleSuggestedQuestion("What's John's current role?")}
                className="mt-4 underline text-blue-600 dark:text-blue-400"
              >
                Ask AI about John's career
              </button>
            </section>

            {/* Certifications */}
            <section id="certifications" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
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

            {/* Education (moved lower) */}
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
                Ask AI about John's education
              </button>
            </section>
          </main>
        </div>

        {/* DESKTOP CHAT PANEL */}
        <DesktopChatPanel
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
        setChatOpen={setChatOpen}
        messages={messages}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        handleSend={handleSend}
        suggestedQuestions={suggestedQuestions}
        handleSuggestedQuestion={handleSuggestedQuestion}
      />

      {/* If chat isn't open, show floating button on desktop */}
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
  suggestedQuestions,
  handleSuggestedQuestion,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: { role: string; text: string }[];
  currentInput: string;
  setCurrentInput: (val: string) => void;
  handleSend: () => void;
  suggestedQuestions: string[];
  handleSuggestedQuestion: (q: string) => void;
}) {
  if (!chatOpen) {
    // Hidden if chat isn't open
    return null;
  }

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
          <h2 className="font-bold text-lg">John's AI</h2>
          <button
            onClick={() => setChatOpen(false)}
            className="hover:text-gray-300 transition"
          >
            ✕
          </button>
        </div>
        {/* Chat body */}
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
  handleSend,
  suggestedQuestions,
  handleSuggestedQuestion,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: { role: string; text: string }[];
  currentInput: string;
  setCurrentInput: (val: string) => void;
  handleSend: () => void;
  suggestedQuestions: string[];
  handleSuggestedQuestion: (q: string) => void;
}) {
  // Show only on mobile
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