import { FaProjectDiagram, FaSearch, FaTools, FaBrain } from "react-icons/fa";

const items = [
  { icon: <FaProjectDiagram className="text-blue-500" />, label: "Multi-agent orchestration" },
  { icon: <FaSearch className="text-blue-500" />, label: "Retrieval-augmented generation (RAG)" },
  { icon: <FaTools className="text-blue-500" />, label: "Tool-use agents" },
  { icon: <FaBrain className="text-blue-500" />, label: "LLM reasoning chains" },
];

export default function AIArchitecture() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        AI Systems Work
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
