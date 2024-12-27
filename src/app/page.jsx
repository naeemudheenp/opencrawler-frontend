"use client";

import React, { useState } from "react";
import { Activity, Download, Github, Map, MapPin, Rss } from "lucide-react";
import TechStackShowcase from "./components/tech-stack-showcase";
import { logToServer, isValidURL, downloadReport } from "@/app/helpers";
import { ToolTip } from "../app/components/tooltip";
import { Input } from "@chakra-ui/react";
const { parseStringPromise } = require("xml2js");

export default function ClientSideCrawler() {
  const [startUrl, setStartUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);
  const [isSiteMapMode, setIsSiteMapMode] = useState(false);
  let terminateCrawl = false;

  const handleToggle = () => {
    setIsSiteMapMode((prev) => !prev);
  };

  const [results, setResults] = useState({
    notFound: [],
    allPages: [],
    parentUrls: [],
  });

  const crawlSiteUsingSitemap = async (initialUrl) => {
    const parsedUrl = new URL(initialUrl);
    const isSitemap = parsedUrl.pathname.endsWith(".xml");
    if (!isSitemap) {
      alert("Invalid sitemap");
      return;
    }
    setIsCrawling(true);
    let response = await fetch(initialUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const xml = await response.text();
    const result = await parseStringPromise(xml);
    let urls;

    try {
      urls = result.sitemapindex.sitemap.map((entry) => entry.loc[0]);
    } catch {
      urls = result.urlset.url.map((entry) => entry.loc[0]);
    }

    await Promise.all(
      urls.map(async (url) => {
        try {
          setCurrentUrl(url);
          const data = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND}/api/fetch?url=${url}`
          );
          const response = await data.json();

          if (response.status != 200) {
            setResults((prev) => ({
              ...prev,
              notFound: [...prev.notFound, url],
            }));
          }

          setResults((prev) => ({
            ...prev,
            allPages: [
              ...prev.allPages,
              {
                url: url,
                parentUrl: initialUrl,
              },
            ],
          }));
        } catch (error) {
          console.error("Error fetching URL:", url, error);
        }
      })
    );

    setIsReportReady(true);
    setCurrentUrl("Crawl completed");
  };

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
          data = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND}/get-page-status?url=${url}`
          );
          response = await data.json();
        } catch (error) {
          console.log(process.env.NEXT_PUBLIC_BACKEND, "backed");

          console.log(error, "error", process.env.NEXT_PUBLIC_BACKEND);

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

    if (isSiteMapMode) {
      crawlSiteUsingSitemap(startUrl);
    } else {
      crawlSite(startUrl);
    }
  };
  const stopCrawl = async () => {
    setResults({ notFound: [], allPages: [], parentUrls: [] });
    terminateCrawl = true;
    setCurrentUrl("");
    setIsCrawling(false);
    setResults({ notFound: [], allPages: [], parentUrls: [] });
  };

  return (
    <section className="xl:px-20 container bg-white xl:pt-8 flex justify-center items-center w-full h-full  text-black flex-col gap-3 ">
      <div
        className={`w-full border  rounded-2xl p-6 flex flex-col gap-4 mt-32 bg-white/80 backdrop-blur-xl  shadow-lg  ${
          isCrawling && !isReportReady && "animate-gradient-shadow"
        }`}
      >
        <div className="flex flex-col gap-2 ">
          <h1 className="font-bold text-3xl text-black flex items-center gap-2">
            openCrawler
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
          <p className=" font-normal text-gray-500">
            Scan the entire website for 404 (broken) pages and their parent
            pages efficiently.
          </p>
        </div>

        <div className="flex gap-2 max-md:flex-col ">
          <Input
            type="url"
            value={startUrl}
            onChange={(e) => setStartUrl(e.target.value)}
            placeholder={
              isSiteMapMode
                ? "https://example.com/sitemap.xml"
                : "https://example.com"
            }
            className="border py-3 px-2 rounded-md w-96 max-md:w-full bg-white"
          />

          <button
            className=" flex min-w-[140px] border-black border bg-black  group justify-center gap-2 items-center  text-white cursor-pointer   rounded-lg p-2  transition-all"
            onClick={startCrawl}
            disabled={isCrawling}
            variant={"surface"}
          >
            <Activity
              color="white"
              className="h-4 w-4  group-hover:translate-y-[0px] -translate-y-[70px] transition-all duration-700"
            />
            <div className=" -translate-x-4 group-hover:translate-x-0 transition-all duration-700">
              {" "}
              {isCrawling
                ? isReportReady
                  ? "Completed"
                  : "Crawling.."
                : "Start Crawling"}
            </div>
          </button>
          {/* <button
            className={` ${
              !isCrawling && "hidden"
            } bg-black/60 hover:bg-black text-white rounded-lg p-2 border-none transition-all`}
            onClick={stopCrawl}
          >
            Stop
          </button> */}
          {isReportReady && (
            <button
              disabled={!isReportReady}
              onClick={() => {
                downloadReport(results);
              }}
              className={` group bg-black gap-2 flex text-white rounded-lg p-2 border-none transition-all ${
                !isReportReady && "cursor-not-allowed hover:bg-black/60"
              } ${!isCrawling && "hidden"}`}
            >
              <Download className="h-4 w-4 group-hover:translate-y-[4px] -translate-y-[70px] transition-all duration-700 " />
              <div className=" -translate-x-4 group-hover:translate-x-0 transition-all duration-700">
                {" "}
                Download Report
              </div>
            </button>
          )}
        </div>

        <div className=" mt-3 flex gap-2 items-center">
          <button
            aria-controls="listbox-id"
            aria-expanded="false"
            type="button"
            onClick={handleToggle}
            className="relative inline-flex h-9 w-44 items-center rounded-full bg-gray-200 transition-colors focus:outline-none   "
          >
            <span
              className={`${
                isSiteMapMode ? "translate-x-[5.75rem]" : " translate-x-1"
              } inline-block h-7 w-20 transform rounded-full bg-white  transition-transform`}
            />
            <span
              className={`absolute gap-2 items-center justify-center left-2 text-sm font-medium flex ${
                isSiteMapMode ? "text-gray-500 " : "text-gray-800"
              }`}
            >
              {isSiteMapMode && (
                <Activity height={13} width={13} className=" animate-pulse" />
              )}
              Deep scan
            </span>
            <span
              className={`absolute gap-2 items-center justify-center right-2 text-sm font-medium flex ${
                isSiteMapMode ? "text-gray-800" : " text-gray-500"
              }`}
            >
              {!isSiteMapMode && (
                <Map height={13} width={13} className=" animate-pulse" />
              )}
              Sitemap
            </span>
          </button>
          <ToolTip />
        </div>

        <div
          className={`${
            isCrawling ? "mt-7  min-h-64" : "max-h-0 h-0 opacity-0 "
          } transition-all duration-700 `}
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

          <div className="border h-auto py-5 my-3 rounded-md ">
            <div className="flex justify-between px-5">
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
                  className="flex gap-3 justify-between items-center px-5 border-b border-t border-gray-200 hover:bg-gray-100 transition-all  py-2.5"
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
                        <MapPin className=" size-6 text-muted-foreground cursor-pointer" />
                        <div className="absolute text-sm w-[400px] -top-2 right-8 bg-gray-200 rounded p-1 hidden group-hover:block">
                          The parent URL (source of the link):{url.parentUrl}.
                          Click the icon to redirect.
                        </div>
                      </a>
                      <div className=" rounded h-8    w-20 bg-red-50 text-red-700  font-semibold   py-2 px-4  text-xs  aspect-square flex justify-center items-center">
                        Broken(404)
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 justify-center items-center relative">
                      <a
                        target="_blank"
                        href={url.parentUrl}
                        className="group relative flex justify-center items-center "
                      >
                        <MapPin className=" size-6 text-muted-foreground cursor-pointer" />
                        <div className="absolute text-sm w-[400px] -top-2 right-8 bg-gray-200 rounded p-1 hidden group-hover:block">
                          The parent URL (source of the link):{url.parentUrl}.
                          Click the icon to redirect.
                        </div>
                      </a>

                      <div className="text-xs  h-8 bg-green-50 text-green-700  font-semibold   w-20   py-2 px-4 rounded aspect-square flex justify-center items-center">
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
          This process may take a few moments. Please keep the tab open.{" "}
          <br></br>A report will be generated once completed.
        </p>
      </div>

      <TechStackShowcase />
    </section>
  );
}
