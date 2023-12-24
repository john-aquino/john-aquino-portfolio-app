import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-700">
      <header className="flex flex-col items-center justify-center p-5">
        <h1 className="text-4xl font-bold mb-4">John Aquino</h1>
      </header>

      <main className="flex-grow p-10 text-center">
        <p className="mt-4">
          Innovative software engineer with a passion for developing cutting-edge applications.
          Fascinated by the intersection of technology and user experience, I bring forth a blend of
          engineering, design, and entrepreneurship to every project.
        </p>
        

        <section className="my-8">
          <div className="flex justify-center space-x-4">
            <Link href="https://github.com/john-aquino" target="_blank">
              <span className="cursor-pointer hover:underline">GitHub</span>
            </Link>
            <Link href="https://inqo.io" target="_blank">
              <span className="cursor-pointer hover:underline">Inqo</span>
            </Link>
            <Link href="https://apps.apple.com/ng/app/stegg/id1487379535" target="_blank">
              <span className="cursor-pointer hover:underline">Stegg</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="p-5 border-t border-gray-200">
        <div className="flex justify-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} John Aquino. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
