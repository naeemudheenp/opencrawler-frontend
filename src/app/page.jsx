"use client";

import React, { useState } from "react";
import { Github, Network, Rss } from "lucide-react";
import TechStackShowcase from "./components/tech-stack-showcase";
import { logToServer, isValidURL, downloadReport } from "@/app/helpers";

export default function ClientSideCrawler() {
  const [startUrl, setStartUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);
  let terminateCrawl = false;
  const [results, setResults] = useState({
    notFound: [],
    allPages: [],
    parentUrls: [],
  });

  const crawlSite = async (initialUrl) => {
    if (!isValidURL(initialUrl)) {
      alert("Invalid url");
      return;
    }
    try {
      setIsCrawling(true);
      await logToServer(startUrl);
      const visited = new Set();
      const queue = [initialUrl];
      const domain = new URL(initialUrl).origin;
      const crawlPage = async (url) => {
        let data;
        let response;
        try {
          data = await fetch(`/api/fetch?url=${url}`);
          response = await data.json();
        } catch (error) {
          return;
        }
        setCurrentUrl(url);
        if (response.status != 200) {
          setResults((prev) => ({
            ...prev,
            notFound: [...prev.notFound, url],
          }));
        }
        const text = await response.text;
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        let links = Array.from(doc.querySelectorAll("[href]"))
          .map((link) => link.href)
          .filter(
            (href) =>
              typeof href === "string" &&
              (href.startsWith(domain) || href.startsWith("/"))
          );

        if (!links.length) {
          try {
            const response = await fetch(`/api/crawl-using-pptr?url=${url}`);
            const data = await response.json();
            links = data.links;
          } catch (error) {
            links = [];
          }
        }
        for (const link of links) {
          if (!visited.has(link)) {
            queue.push(link);
            setResults((prev) => ({
              ...prev,
              allPages: [
                ...prev.allPages,
                {
                  url: link,
                  parentUrl: url,
                },
              ],
            }));
            visited.add(link);
          }
        }
      };

      while (queue.length > 0) {
        const url = queue.shift();

        if (!terminateCrawl) {
          await crawlPage(url);
        } else {
          return;
        }
      }
      setIsReportReady(true);
      setCurrentUrl("Crawl completed");
    } catch (error) {
      alert("Make sure that internet is available.", error);
    }
  };

  const startCrawl = async () => {
    setResults({ notFound: [], allPages: [], parentUrls: [] });
    setCurrentUrl("");
    setIsReportReady(false);
    terminateCrawl = false;
    crawlSite(startUrl);
  };
  const stopCrawl = async () => {
    setResults({ notFound: [], allPages: [], parentUrls: [] });
    terminateCrawl = true;
    setCurrentUrl("");
    setIsCrawling(false);
    setResults({ notFound: [], allPages: [], parentUrls: [] });
  };

  return (
    <section className="xl:px-20 container bg-white xl:pt-8 flex justify-center items-center w-full h-full text-slate-400 flex-col gap-3 ">
      <div className="w-full border  rounded-xl p-6 flex flex-col gap-4 mt-32">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-3xl text-black flex items-center gap-2">
            openCrawler
            <div className="bg-black text-white p-1 px-2 rounded-lg text-sm">
              Beta
            </div>
            <a
              href="https://github.com/naeemudheenp/openCrawler-public-"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors"
              aria-label="View project on GitHub"
            >
              <Github className="h-6 w-6 hover:border-black hover:bg-white transition-all" />
            </a>
            <a
              href="/stories/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors"
              aria-label="Stories"
            >
              <Rss className="h-6 w-6 hover:border-black hover:bg-white transition-all" />
            </a>
          </h1>
          <p>
            Scan the entire website for 404(broken) pages and its parent pages.
          </p>
        </div>
        <div className="flex gap-2 max-md:flex-col">
          <input
            type="url"
            value={startUrl}
            onChange={(e) => setStartUrl(e.target.value)}
            placeholder="https://example.com"
            className="border py-1 px-2 rounded-md w-96 max-md:w-full"
          />
          <button
            className="bg-black/60 hover:bg-black text-white rounded-lg p-2 border-none transition-all"
            onClick={startCrawl}
            disabled={isCrawling}
          >
            {isCrawling
              ? isReportReady
                ? "Completed"
                : "Crawling.."
              : "Start Crawling"}
          </button>
          <button
            className={` ${
              !isCrawling && "hidden"
            } bg-black/60 hover:bg-black text-white rounded-lg p-2 border-none transition-all`}
            onClick={stopCrawl}
          >
            Stop
          </button>
          <button
            disabled={!isReportReady}
            onClick={() => {
              downloadReport(results);
            }}
            className={`bg-black/60 hover:bg-black text-white rounded-lg p-2 border-none transition-all ${
              !isReportReady && "cursor-not-allowed hover:bg-black/60"
            } ${!isCrawling && "hidden"}`}
          >
            Download Report
          </button>
        </div>

        <div
          className={`${
            isCrawling ? "mt-7 " : "max-h-0 h-0 hidden"
          } transition-all`}
        >
          <h2 className="flex gap-2 items-center justify-between">
            <div className="flex gap-2  items-center  xl:w-[50%] flex-nowrap">
              Currently Crawling: {currentUrl || "example.com"}
              <div
                className={`aspect-auto rounded-full p-2 size-2 bg-gradient-to-r from-black/80 to-black/40 animate-spin ${
                  isReportReady && "!hidden"
                }`}
              ></div>
            </div>
          </h2>
          <div className="border h-auto p-3 my-3 rounded-md">
            <div className="flex justify-between px-2">
              <h3 className=" mb-2">Discovered links</h3>
              <div className="flex gap-2">
                <h3 className=" mb-2 w-20">Parent link</h3>
                <h3 className=" mb-2  w-20">Status</h3>
              </div>
            </div>
            <ul className="max-h-[220px] overflow-scroll flex flex-col gap-3">
              {results.allPages.map((url) => (
                <li
                  key={url.url}
                  className="flex gap-3 justify-between items-center hover:bg-gray-100 transition-all px-2 py-2 rounded-md"
                >
                  <a
                    target="_blank"
                    className="hover:underline flex gap-3 items-center"
                    href={url.url}
                  >
                    {url.url}
                  </a>
                  {results.notFound.includes(url.url) ? (
                    <div className="flex gap-4 justify-center items-center">
                      <a
                        target="_blank"
                        href={url.parentUrl}
                        className="group relative flex justify-center items-center"
                      >
                        <div className="bg-gray-200 flex justify-center items-center aspect-square rounded-full size-8 p-1">
                          <Network height={18} width={18} color="white" />
                        </div>
                        <div className="absolute text-sm w-[400px] -top-2 right-8 bg-gray-200 rounded p-1 hidden group-hover:block">
                          The parent URL (source of the link):{url.parentUrl}.
                          Click the icon to redirect.
                        </div>
                      </a>
                      <div className="text-white rounded h-8    w-20 bg-red-400  py-2 px-4  text-xs  aspect-square flex justify-center items-center">
                        Broken(404)
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 justify-center items-center relative">
                      <a
                        target="_blank"
                        href={url.parentUrl}
                        className="group relative flex justify-center items-center"
                      >
                        <div className="bg-gray-200 flex justify-center items-center aspect-square rounded-full size-8 p-1">
                          <Network height={18} width={18} color="white" />
                        </div>
                        <div className="absolute text-sm w-[400px] -top-2 right-8 bg-gray-200 rounded p-1 hidden group-hover:block">
                          The parent URL (source of the link):{url.parentUrl}.
                          Click the icon to redirect.
                        </div>
                      </a>

                      <div className="text-xs text-white h-8    w-20 bg-green-400  py-2 px-4 rounded aspect-square flex justify-center items-center">
                        Valid(200)
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p>
          The process may take some time to complete , please keep the tab open.
          <br></br> A report will be generated upon completion.
        </p>
      </div>

      <TechStackShowcase />
    </section>
  );
}
