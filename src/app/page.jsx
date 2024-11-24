"use client";

import React, { useState } from "react";
import { Github, Network, Rss } from "lucide-react";

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export default function ClientSideCrawler() {
  const [startUrl, setStartUrl] = useState("");
  const [results, setResults] = useState({
    notFound: [],
    allPages: [],
    parentUrls: [],
  });
  const [currentUrl, setCurrentUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [resultReady, setIsResultReady] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [crawlAllowed, setCrawlAllowed] = useState(false);

  var terminateCrawl = false;

  async function logToServer(url) {
    const response = await fetch("/api/log-to-server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url }),
    });
  }

  const crawlSite = async (initialUrl, crawlAllowed) => {
    if (!isValidURL(initialUrl)) {
      alert("Invalid url");
      return;
    }
    try {
      setIsCrawling(true);

      const visited = new Set();
      const queue = [initialUrl];
      const domain = new URL(initialUrl).origin;

      const crawlPage = async (url, terminateCrawl) => {
        const data = await fetch(`/api/fetch?url=${url}`);
        const response = await data.json();
        setCurrentUrl(url);

        // Record status
        if (response.status != 200) {
          console.log(url, "error", response.status);

          setResults((prev) => ({
            ...prev,
            notFound: [...prev.notFound, url],
          }));
        }

        console.log(results.notFound, "notfound");
        console.log(results.allPages, "allpages");

        const text = await response.text;
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Extract and filter links to the same domain
        const links = Array.from(doc.querySelectorAll("[href]"))
          .map((link) => link.href)
          .filter((href) => href?.startsWith(domain) || href?.startsWith("/"));

        // Add new links to the queue if they haven't been visited
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
      setCurrentUrl("Crawl completed");
      // setIsCrawling(false);
    } catch (error) {
      console.log("error-real", error);

      alert("Unable to crawl.Make sure that internet is available.", error);
    }
  };

  const startCrawl = async () => {
    setResults({ notFound: [], allPages: [], parentUrls: [] });
    setCurrentUrl("");
    await logToServer(startUrl);
    terminateCrawl = false;

    crawlSite(startUrl, terminateCrawl);
  };
  const stopCrawl = async () => {
    setResults({ notFound: [], allPages: [], parentUrls: [] });
    terminateCrawl = true;
    setCurrentUrl("");
    setIsCrawling(false);
    setResults({ notFound: [], allPages: [], parentUrls: [] });
  };

  return (
    <section className=" xl:px-20 container bg-white xl:pt-8 flex justify-center items-center w-full h-full text-slate-400 flex-col gap-3">
      <div className=" w-full border rounded-md p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className=" font-bold text-3xl text-black flex items-center gap-2">
            openCrawler
            <span className=" bg-black text-white p-1 px-2  rounded-lg text-sm">
              Beta
            </span>
            <a
              href="https://github.com/naeemudheenp/openCrawler-public-"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground  transition-colors"
              aria-label="View project on GitHub"
            >
              <Github className="h-6 w-6 hover:border-black hover:bg-white transition-all" />
            </a>
            <a
              href="/stories/improve-seo-with-opencrawler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground  transition-colors"
              aria-label="Stories"
            >
              <Rss className="h-6 w-6 hover:border-black hover:bg-white transition-all" />
            </a>
          </h1>
          <p>Check for 404 pages thorught the website.</p>
        </div>
        <div className=" flex gap-2 max-md:flex-col">
          <input
            type="url"
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
          <button
            className={` ${
              !isCrawling && " hidden"
            } bg-black/60 hover:bg-black text-white rounded-lg p-2 border-none transition-all `}
            onClick={stopCrawl}
          >
            Stop
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
            <div className="flex justify-between px-2">
              {" "}
              <h3 className=" mb-2">Discovered links</h3>
              <div className="flex gap-2">
                <h3 className=" mb-2">Parent link</h3>
                <h3 className=" mb-2">Status</h3>
              </div>
            </div>
            <ul className="max-h-[220px]  overflow-scroll flex flex-col gap-3">
              {results.allPages.map((url) => (
                <li
                  key={url.url}
                  className=" flex gap-3 justify-between   items-center hover:bg-gray-100 transition-all px-2 py-2 rounded-md"
                >
                  <a
                    target="_blank"
                    className="hover:underline flex gap-3  items-center "
                    href={url.url}
                  >
                    {`${url.url}`}
                  </a>

                  {/* <a target="_blank" className="hover:underline" href={url.url}>
                    {`<-${url.parentUrl}`}
                  </a> */}

                  {results.notFound.includes(url.url) ? (
                    <div className="flex gap-4 justify-center items-center">
                      {console.log(url, "notfoun")}
                      <a
                        target="_blank"
                        href={url.parentUrl}
                        className="group relative flex justify-center items-center"
                      >
                        <div className="bg-gray-200 aspect-square rounded-full size-6 p-1">
                          <Network height={16} width={16} color="white" />
                        </div>
                        <div className=" absolute text-sm -top-2  right-8 bg-gray-200 rounded p-1 hidden group-hover:block">
                          Parent url :{`${url.parentUrl}`}{" "}
                        </div>
                      </a>
                      <div className=" text-white rounded size-4 bg-red-400  py-2 px-4  text-xs  aspect-square flex justify-center items-center">
                        404
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 justify-center items-center relative">
                      <a
                        target="_blank"
                        href={url.parentUrl}
                        className="group relative flex justify-center items-center"
                      >
                        <div className="bg-gray-200 aspect-square rounded-full size-6 p-1">
                          <Network height={16} width={16} color="white" />
                        </div>
                        <div className=" absolute text-sm -top-2  right-8 bg-gray-200 rounded p-1 hidden group-hover:block">
                          Parent url :{`${url.parentUrl}`}{" "}
                        </div>
                      </a>

                      <div className=" text-xs text-white size-4 bg-green-400  py-2 px-4 rounded aspect-square  flex justify-center items-center">
                        200
                      </div>
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
        <div
          className={` flex flex-col gap-2 transition-all ${
            showDisclaimer ? "" : "max-h-0 h-0 hidden"
          }`}
        >
          Disclaimer<br></br>
          This tool is designed solely for auditing purposes on websites owned,
          operated, or authorized by the user. By using this tool, you
          acknowledge and agree to the following terms:
          <ol className="flex gap-1 flex-col">
            <li>
              Authorized Use Only: You may only use this tool to analyze and
              audit websites for which you have explicit authorization.
              Unauthorized access to other websites may violate local laws,
              website terms of service, and/or data privacy regulations.
            </li>
            <li>
              Compliance with Website Policies: You are solely responsible for
              ensuring that your use of this tool complies with any applicable
              terms of service, privacy policies, and local regulations for each
              website you interact with. Misuse of this tool may result in legal
              or administrative consequences.
            </li>
            <li>
              User Responsibility: openCrawler assumes no responsibility or
              liability for any misuse of this tool or for any actions taken by
              users in violation of these terms. You agree to use this tool at
              your own risk, and you accept full responsibility for any legal or
              regulatory consequences arising from your use of this tool.
            </li>
            <li>
              {" "}
              No Data Storage: This tool does not collect, store, or distribute
              any data from the websites it audits. It is designed to perform
              minimal interactions strictly for the purpose of locating broker
              links with user authorization.
            </li>
          </ol>
        </div>
        <div>
          {" "}
          By using this tool, you confirm that you understand and agree to{" "}
          <span
            className=" underline"
            onClick={() => setShowDisclaimer(!showDisclaimer)}
          >
            Our terms
          </span>{" "}
          and that you will use the tool responsibly and legally.
        </div>
      </div>
    </section>
  );
}
