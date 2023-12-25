import Link from 'next/link';
import { FaAngular, FaAws, FaDatabase, FaMobileAlt, FaPython } from 'react-icons/fa'; // Include additional icons as needed
import { SiFlutter, SiSwift } from 'react-icons/si';

const RightColumn = () => {
  const projects = [
    {
      name: 'Inqo',
      description: 'A unique daily 20 questions game.',
      image: '/inqo-webpage.png',
      url: 'https://inqo.io',
      techStack: [<SiFlutter key="flutter" />, <FaAws key="aws" />, <FaPython key="python" />, <FaAngular key="angular" />, <FaDatabase key="database" />],
    },
    {
      name: 'Stegg',
      description: 'An app to hide any message in any image.',
      image: '/stegg-page.png',
      url: 'https://apps.apple.com/ng/app/stegg/id1487379535',
      techStack: [<FaMobileAlt key="xcode" />, <SiSwift key="swift" />],
    },
    // ... more projects
  ];

  return (
    <div>
       <h2 className="text-2xl font-semibold">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {projects.map(project => (
          <div key={project.name} className="bg-white rounded-lg shadow-lg overflow-hidden project-card">
            <Link href={project.url} target="_blank">
              <span  rel="noopener noreferrer">
                <img src={project.image} alt={project.name} className="w-full h-48 object-cover" />
              </span>
            </Link>
            <div className="p-4">
              <h3 className="text-lg font-bold">{project.name}</h3>
              <p className="text-sm">{project.description}</p>
              <div className="flex space-x-2 mt-2">
                {project.techStack}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightColumn;
