import Link from 'next/link';

const LeftColumn = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold">John Aquino</h1>
        <p className="mt-2">Software engineer with a passion for developing cutting-edge applications...</p>
        <div className="mt-4">
          <Link href="https://github.com/john-aquino">
            <span className="cursor-pointer hover:underline mr-2">GitHub</span>
          </Link>
          <Link href="https://www.linkedin.com/in/john-aquino/">
            <span className="cursor-pointer hover:underline">LinkedIn</span>
          </Link>
        </div>
      </div>
    );
  };

export default LeftColumn;
  