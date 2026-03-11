import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";

export default function Hero() {
  return (
    <header className="flex flex-col items-center text-center p-6 bg-gray-100 dark:bg-gray-800">
      <Image
        src="/john-aquino.jpeg"
        alt="John Aquino"
        width={128}
        height={128}
        priority
        className="rounded-full shadow-lg object-cover hover:scale-105 transition-all duration-300"
      />
      <h1 className="text-3xl md:text-5xl font-bold mt-4 text-gray-800 dark:text-gray-100">
        John Aquino
      </h1>
      <p className="text-lg font-light italic mt-2 text-gray-600 dark:text-gray-300">
        AI Systems Engineer | LLM Architectures | Cloud-Native Applications
      </p>
      <p className="text-sm font-medium mt-1 text-blue-600 dark:text-blue-400">
        6+ years of professional experience building cloud and AI-powered software systems.
      </p>
      <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
        Software engineer at Vanguard building modern AI systems and cloud
        applications. I specialize in LLM architectures, agentic software, and
        scalable backend infrastructure—primarily using Python and AWS. I've
        also released multiple mobile apps, combining engineering, product
        design, and entrepreneurship to create intelligent software.
      </p>
      <div className="flex space-x-4 mt-6">
        <Link href="https://github.com/john-aquino" target="_blank">
          <FaGithub
            size={28}
            className="text-gray-800 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          />
        </Link>
        <Link
          href="https://www.linkedin.com/in/john-a-aquino/"
          target="_blank"
        >
          <FaLinkedinIn
            size={28}
            className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          />
        </Link>
      </div>
    </header>
  );
}
