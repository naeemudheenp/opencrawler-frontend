"use client";

import React, { useState } from "react";
import { Github } from "lucide-react";

export default function ClientSideCrawler() {
  const [startUrl, setStartUrl] = useState("");
  const [results, setResults] = useState({
    notFound: [],
    allPages: [],
  });
  const [currentUrl, setCurrentUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [resultReady, setIsResultReady] = useState(false);

  const crawlSite = async (initialUrl) => {
    setIsCrawling(true);
    const visited = new Set();
    const queue = [initialUrl];
    const domain = new URL(initialUrl).origin;

    const crawlPage = async (url) => {
      try {
        const response = await fetch(url);
      } catch (error) {
        console.log("error");
      }
      setCurrentUrl(url);

      // Record status
      if (response.status === 404) {
        setResults((prev) => ({
          ...prev,
          notFound: [...prev.notFound, url],
        }));
      }

      setResults((prev) => ({
        ...prev,
        allPages: [...prev.allPages, url],
      }));

      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      // Extract and filter links to the same domain
      const links = Array.from(doc.querySelectorAll("a"))
        .map((link) => link.href)
        .filter((href) => href.startsWith(domain));

      // Add new links to the queue if they haven't been visited
      for (const link of links) {
        if (!visited.has(link)) {
          queue.push(link);
          visited.add(link);
        }
      }
    };

    while (queue.length > 0) {
      const url = queue.shift();
      await crawlPage(url);
    }
  };

  const startCrawl = () => {
    setResults({ notFound: [], allPages: [] });
    setCurrentUrl("");
    crawlSite(startUrl);
  };

  return (
    <section className=" xl:px-24 container bg-white xl:pt-8 flex justify-center items-center w-full h-full text-slate-400 flex-col gap-3">
      <div className=" w-full border rounded-md p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className=" font-bold text-3xl text-black flex items-center gap-2">
            openCrawler
            <a
              href="https://github.com/naeemudheenp/OpenCrawler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground  transition-colors"
              aria-label="View project on GitHub"
            >
              <Github className="h-6 w-6" />
            </a>
          </h1>
          <p>Check for 404 pages thorught the website.</p>
        </div>
        <div className=" flex gap-2 max-md:flex-col">
          <input
            type="text"
            value={startUrl}
            onChange={(e) => setStartUrl(e.target.value)}
            placeholder="https://example.com"
            className=" border py-1 px-2 rounded-md w-96 max-md:w-full"
          />
          <button
            className=" bg-black/60 hover:bg-black text-white rounded-lg p-2 border-none transition-all "
            onClick={startCrawl}
            disabled={isCrawling}
          >
            {isCrawling ? "Crawling..." : "Start Crawling"}
          </button>
        </div>

        <div
          className={`${
            isCrawling ? " mt-7 " : "max-h-0 h-0 hidden"
          } transition-all`}
        >
          <h2 className=" flex gap-2 items-center justify-between">
            {!resultReady && (
              <div className=" flex gap-2  items-center  xl:w-[50%] flex-nowrap">
                Currently Crawling: {currentUrl || "example.com"}
                <div className=" aspect-auto rounded-full p-2 size-2 bg-gradient-to-r from-black/80 to-black/40 animate-spin"></div>
              </div>
            )}
            <div>
              {resultReady && (
                <button className=" bg-black  text-white rounded-lg p-2 border-none transition-all ">
                  Download report
                </button>
              )}
            </div>
          </h2>

          <div className=" border h-auto p-3 my-3 rounded-md">
            <h3 className=" mb-2">Discovered links</h3>
            <ul className="max-h-[220px]  overflow-scroll flex flex-col">
              {results.allPages.map((url) => (
                <li
                  key={url}
                  className=" flex gap-3  items-center hover:bg-gray-200 transition-all px-2 rounded-md"
                >
                  <a href={url}>{url}</a>
                  {results.notFound.includes(url) ? (
                    <div className=" text-white rounded size-4 bg-red-400  py-2 px-4  text-xs  aspect-square flex justify-center items-center">
                      404
                    </div>
                  ) : (
                    <div className=" text-xs text-white size-4 bg-green-400  py-2 px-4 rounded aspect-square  flex justify-center items-center">
                      200
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p>
          Note: This crawler fetches links from the initial page and follows
          nested links, which may take some time to complete.<br></br>You can
          download the report once crawl is completed.
          <br></br> Please do not close the tab.
        </p>
      </div>
      {isCrawling && (
        <div className=" border rounded-md p-6 flex flex-col gap-4  w-full">
          <div>
            <h2 className=" text-black font-bold mb-2 text-xl">
              Upcoming features.
            </h2>
            <p>Exciting new capabilities on the horizon</p>
          </div>
          <ul className=" w-full">
            <li className=" mb-4">
              <span className="  font-bold">Report Download Option</span> - Our
              upcoming report download feature will enable users to effortlessly
              access detailed reports of 404 error pages identified across their
              website, streamlining the process of addressing and resolving
              broken links for an optimized user experience.
            </li>
            <li>
              <span className=" font-bold">Automated Report Emailing</span> -
              Our upcoming automated report emailing feature will deliver a
              comprehensive 404 error report directly to your inbox as soon as
              the scan is complete, ensuring you receive timely updates without
              needing to check manually.
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
