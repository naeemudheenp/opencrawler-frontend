import {
  ArrowBigRight,
  ArrowBigRightDash,
  ArrowRightCircleIcon,
} from "lucide-react";

export default function StoriesHome() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-gray-900 bg-white ">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold leading-tight  mb-10">
          Stories
        </h1>
      </header>

      <div className="flex flex-col w-full mt-6 gap-4">
        <a
          href="/stories/improve-seo-with-opencrawler"
          className="group  transition-all duration-300 border  hover:underline rounded-md hover:shadow px-8 py-6 flex gap-2 justify-between text-2xl  items-center"
        >
          Improve Your SEO Rankings with OpenCrawler.
          <div className=" group-hover:rotate-[340deg] transition-all duration-500">
            <ArrowRightCircleIcon />
          </div>
        </a>
        <a
          href="/stories/what-is-broken-link"
          className="group  transition-all duration-300 border  hover:underline rounded-md hover:shadow px-8 py-6 flex gap-2 justify-between text-2xl  items-center"
        >
          What is a Broken Link and How OpenCrawler Helps Fix It.
          <div className=" group-hover:rotate-[340deg] transition-all duration-500">
            <ArrowRightCircleIcon />
          </div>
        </a>
      </div>

      {/* Footer Section */}
      <footer className="mt-12 border-t pt-6 relative top-0">
        <a
          href="https://www.opencrawler.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-lg font-semibold text-black border border-black px-6 py-3 rounded-md hover:bg-black hover:text-white transition"
        >
          Visit OpenCrawler
        </a>
      </footer>
    </main>
  );
}
