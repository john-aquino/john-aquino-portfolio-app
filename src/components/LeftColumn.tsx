import Link from 'next/link';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';

const LeftColumn = () => {
  return (
    <div className=" flex flex-col md:justify-between items-start p-2 md:p-4 h-screen md:overflow-y-auto y-overflow-hidden">
      <h1 className="text-5xl font-bold">John Aquino</h1>
      <p className="text-lg font-light italic">Experienced Full Stack Engineer</p>
      <div className="group mt-4 mb-6">
        <img
          src="/john-aquino.jpeg"
          alt="John Aquino"
          className="w-48 h-48 rounded-lg shadow-lg object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-300 ease-in-out"
        />
      </div>
      <p className="mt-4 text-left pr-4 md:pr-0">Innovative software engineer with a passion for developing cutting-edge applications. Fascinated by the intersection of technology and user experience, I bring forth a blend of engineering, design, and entrepreneurship to every project.</p>
      <div className="flex space-x-4 md:mt-auto mt-10 md:pb-40 pb-4"> {/* mt-auto will push the links to the bottom */}
        <Link href="https://github.com/john-aquino" target="_blank" passHref>
          <span className="text-3xl hover:text-gray-700" aria-label="GitHub"  rel="noopener noreferrer">
            <FaGithub />
          </span>
        </Link>
        <Link href="https://www.linkedin.com/in/john-aquino/" target="_blank" passHref>
          <span className="text-3xl hover:text-blue-700" aria-label="LinkedIn" rel="noopener noreferrer">
            <FaLinkedinIn />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default LeftColumn;
