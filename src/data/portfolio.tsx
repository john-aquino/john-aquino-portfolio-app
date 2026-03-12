import {
  FaAws,
  FaDatabase,
  FaMobileAlt,
  FaPython,
} from "react-icons/fa";
import { SiFlutter, SiSwift } from "react-icons/si";

export const projects = [
  {
    name: "Inqo",
    description: "AI-powered daily 20 questions game for iOS and Android.",
    icon: "/inqo.webp",
    url: "https://inqo.io",
    techStack: [
      { icon: <SiFlutter key="flutter" />, label: "Flutter" },
      { icon: <FaAws key="aws" />, label: "AWS" },
      { icon: <FaPython key="python" />, label: "Python" },
      { icon: <FaDatabase key="database" />, label: "DynamoDB" },
    ],
    highlights: ["Top 200 iOS Trivia", "50% cloud cost reduction", "iOS & Android", "AWS CloudFormation"],
    details:
      "Architected and developed the full-stack infrastructure for Inqo, a daily AI-driven game app built with Flutter and AWS services. Reached the Top 200 in the iOS App Store Trivia category. Automated infrastructure provisioning using AWS CloudFormation for rapid deployment and scaling. Launched on both iOS and Android platforms, ensuring a consistent user experience. Reduced cloud costs by over 50% through effective optimization and iterative Agile methodologies.",
  },
  {
    name: "Stegg",
    description: "Hide any message in any image (steganography).",
    icon: "/stegg-app-logo-dark-green.webp",
    url: "https://stegg.io",
    techStack: [
      { icon: <SiFlutter key="flutter" />, label: "Flutter" },
    ],
    highlights: ["LSB Steganography", "Spread Spectrum", "Encryption"],
    details:
      "Built a Flutter iOS application that enables users to securely embed text within images using both LSB (Least Significant Bit) and Spread Spectrum steganography techniques. Implemented robust encryption algorithms to ensure data privacy and integrity. Designed an intuitive user interface for embedding and extracting messages, and launched on iOS.",
  },
];

export const careerTimeline = [
  {
    yearRange: "Mar 2025 - Present",
    position: "Application Engineer III",
    company: "Vanguard",
    tags: ["AI/LLMs", "RAG", "LangChain", "AWS Bedrock", "Observability"],
    responsibilities: [
      {
        text: "Engineered Python-based AI service infrastructure on AWS to support scalable agent workflows, integrating Bedrock models, retrieval pipelines, and internal APIs into production-ready systems.",
        impact: null,
      },
      {
        text: "Built core components of a multi-agent AI system using LangChain and AWS Bedrock to orchestrate agents that gather, synthesize, and analyze enterprise data.",
        impact: "Reduced research turnaround time by up to 3 weeks",
      },
      {
        text: "Implemented RAG pipelines using Pinecone and Neptune GraphRAG to provide grounded, context-aware responses from internal knowledge bases and document stores.",
        impact: null,
      },
      {
        text: "Designed the agent orchestration layer with tool-use patterns, enabling agents to query internal APIs, parse documents, and chain reasoning steps.",
        impact: "Autonomously answering complex business questions",
      },
      {
        text: "Shipped AI-powered call center bots that automated customer support workflows and reduced live-agent call volume.",
        impact: null,
      },
      {
        text: "Built production support observability dashboards for real-time system health monitoring and faster incident triage.",
        impact: null,
      },
    ],
  },
  {
    yearRange: "Mar 2023 - Mar 2025",
    position: "Application Engineer II",
    company: "Vanguard",
    tags: ["Angular", "Spring Boot", "AWS", "Python", "Splunk"],
    responsibilities: [
      {
        text: "Designed and developed web applications using Angular, Python Lambdas, and Spring Boot for backend services and customer-facing workflows.",
        impact: null,
      },
      {
        text: "Migrated legacy mainframe data to AWS cloud infrastructure serving users holding over $1 trillion in assets.",
        impact: null,
      },
      {
        text: "Modernized call center infrastructure, reducing agent call volume and lowering operational costs.",
        impact: null,
      },
      {
        text: "Acted as Site Reliability Champion, leading system availability, performance monitoring, and incident response.",
        impact: null,
      },
      {
        text: "Mentored junior engineers, fostering professional growth and improving team productivity.",
        impact: null,
      },
      {
        text: "Developed and demoed an AWS Bedrock Generative UI POC to leadership.",
        impact: "Led directly to production AI products built from the initial POC",
      },
    ],
  },
  {
    yearRange: "Jun 2020 - Mar 2023",
    position: "Application Engineer I",
    company: "Vanguard",
    tags: ["Angular", "REST APIs", "Responsive Design"],
    responsibilities: [
      {
        text: "Built a high-value transactions web application with enhanced security and reliability for Vanguard's institutional and retail clients.",
        impact: null,
      },
      {
        text: "Led delivery of the mobile-responsive Angular experience for the transactions platform.",
        impact: "Enabled secure high-value transactions from mobile browsers across iOS and Android",
      },
    ],
  },
];

export const certifications = [
  {
    name: "AWS Certified AI Practitioner",
    date: "Jan 2025",
    details: "Foundational knowledge in machine learning and AI on AWS.",
    active: true,
  },
  {
    name: "AWS Certified Developer - Associate",
    date: "Dec 2022",
    details: "Expertise in deploying, debugging, and developing on AWS.",
    active: false,
  },
  {
    name: "AWS Certified Cloud Practitioner",
    date: "Aug 2022",
    details: "Foundational cloud concepts, AWS services, security, and pricing.",
    active: false,
  },
];

export const education = [
  {
    school: "University of Georgia",
    degree: "B.S. in Computer Science",
    years: "2016-2020",
    details:
      "Relevant Coursework: Cyber Security, Linear Algebra, Evolutionary Computation",
  },
];

export const skills = [
  {
    category: "Primary Languages",
    items: ["Python (primary)", "Java", "TypeScript/JavaScript", "Dart"],
  },
  {
    category: "AI & Data",
    items: ["Pinecone", "Neptune (GraphRAG)", "Bedrock"],
  },
  {
    category: "Frameworks & Libraries",
    items: ["LangChain", "Spring Boot", "Angular", "Next.js", "React", "Flutter"],
  },
  {
    category: "Cloud & DevOps",
    items: [
      "Lambda",
      "ECS",
      "API Gateway",
      "DynamoDB",
      "S3",
      "Cognito",
      "EC2",
      "Step Functions",
      "SQS",
      "SNS",
      "CloudWatch",
      "CloudFormation",
      "CI/CD",
    ],
  },
  {
    category: "Monitoring & Logging",
    items: ["Sentry", "Splunk", "AWS CloudWatch"],
  },
];
