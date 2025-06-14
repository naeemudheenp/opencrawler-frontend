"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Computer,
  Download,
  Github,
  Map,
  MapPin,
  Rss,
  Server,
  Settings,
} from "lucide-react";
import TechStackShowcase from "./components/tech-stack-showcase";
import RhcModal from "./components/rhc";
import { logToServer, isValidURL, downloadReport } from "@/app/helpers";
import { ToolTip } from "../app/components/tooltip";
import { Input } from "@chakra-ui/react";
import Link from "next/link";
const { parseStringPromise } = require("xml2js");

export default function ClientSideCrawler() {
  const [startUrl, setStartUrl] = useState("");
  const [email, setEmail] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);
  const [isSiteMapMode, setIsSiteMapMode] = useState(false);
  const [isServerMode, setIsServerMode] = useState(true);

  let terminateCrawl = false;

  const checkServerStatus = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/allhamullilah`);
  }

  useEffect(() => {
    try {
      checkServerStatus();
    } catch (error) {
      console.log(error, "error");
    }
  }, []);

  const handleToggle = () => {
    setIsSiteMapMode((prev) => !prev);
  };
  const handleToggleServerMode = () => {
    setIsServerMode((prev) => !prev);
    if (isServerMode) {
      setIsSiteMapMode(false);
    }
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
    await logToServer(startUrl);

    setIsCrawling(true);

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url);
          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
          return response;
        } catch (error) {
          console.warn(`Retry ${i + 1} for ${url}: ${error}`);
          if (i === retries - 1) throw error;
          await new Promise((resolve) => setTimeout(resolve, delay * 2 ** i));
        }
      }
    };

    const processUrlsInBatches = async (urls, batchSize = 10) => {
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (url) => {
            try {
              setCurrentUrl(url);
              const data = await fetchWithRetry(
                `${process.env.NEXT_PUBLIC_FRONTEND}/api/fetch?url=${url}`
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
              console.error(`Error processing URL: ${url}`, error);
            }
          })
        );
      }
    };

    try {
      let response = await fetchWithRetry(initialUrl);
      const xml = await response.text();
      const result = await parseStringPromise(xml);
      let urls = [];

      if (result.sitemapindex) {
        const sitemapUrls = result.sitemapindex.sitemap.map(
          (entry) => entry.loc[0]
        );

        for (const sitemapUrl of sitemapUrls) {
          await new Promise((resolve) => setTimeout(resolve, 500)); // Throttle requests
          const subResponse = await fetchWithRetry(sitemapUrl);
          const subXml = await subResponse.text();
          const subResult = await parseStringPromise(subXml);
          try {
            const subUrls = subResult.urlset.url.map((entry) => entry.loc[0]);
            urls = urls.concat(subUrls);
          } catch {
            console.warn(`No valid URLs found in ${sitemapUrl}`);
          }
        }
      } else {
        urls = result.urlset.url.map((entry) => entry.loc[0]);
      }

      await processUrlsInBatches(urls, 10);
    } catch (error) {
      console.error("Failed to parse sitemap:", error);
    }

    setIsReportReady(true);
    setCurrentUrl("Crawl completed");
  };

  const normalizeUrl = (url) => {
    try {
      const u = new URL(url, location.origin);
      u.hash = '';
      u.search = '';
      return u.href.replace(/\/$/, '');
    } catch {
      return url;
    }
  };

  const crawlSite = async (initialUrl) => {
    if (!isValidURL(initialUrl)) {
      alert("Invalid URL");
      return;
    }

    try {
      setIsCrawling(true);
      await logToServer(initialUrl);

      const visited = new Set();
      const queue = [normalizeUrl(initialUrl)];
      const domain = new URL(initialUrl).origin;

      const crawlPage = async (url) => {
        if (visited.has(url)) return;
        visited.add(url);
        setCurrentUrl(url);

        let links = [];

        try {
          const data = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/get-page-status?url=${url}`);
          const response = await data.json();

          if (response.status !== 200) {
            setResults((prev) => ({
              ...prev,
              notFound: [...prev.notFound, url],
            }));
          }
          const text = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "text/html");

          links = Array.from(doc.querySelectorAll("a[href]"))
            .map((el) => el.getAttribute("href"))
            .map((href) => new URL(href, url).href)
            .map(normalizeUrl)
            .filter((href) => href.startsWith(domain));
        } catch (error) {
          console.warn(`DOM parse failed for ${url}, trying Puppeteer fallback...`);
        }

        if (!links.length) {
          try {
            const response = await fetch(`/api/crawl-using-pptr?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            links = data.links?.map(normalizeUrl) || [];
          } catch (error) {
            console.error("Fallback fetch failed", error);
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
          }
        }
      };

      while (queue.length > 0) {
        const url = queue.shift();
        if (terminateCrawl) return;
        await crawlPage(url);
      }

      setIsReportReady(true);
      setCurrentUrl("Crawl completed");
    } catch (error) {
      alert("Make sure that internet is available.");
      console.error(error);
    }
  };

  const startCrawl = async () => {
    setResults({ notFound: [], allPages: [], parentUrls: [] });
    setCurrentUrl("");
    setIsReportReady(false);
    terminateCrawl = false;

    if (isServerMode) {
      setIsCrawling(true);
      await logToServer(startUrl);

      const data = {
        email,
        url: startUrl,
        mode: isSiteMapMode ? "sitemap" : "deepscan",
      };

      const response = await fetch(
        "https://opencrawler-backend.onrender.com/add-job",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        alert("Added to queue. You will receive a confirmation mail.");
        setIsCrawling(false);
        setEmail("");
        setStartUrl("");
      }
      return;
    }

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
        className={`w-full border border-gray-300   rounded-2xl p-6 flex flex-col gap-4 mt-32 bg-white/80 backdrop-blur-xl  shadow-lg  ${isCrawling && !isReportReady && "animate-gradient-shadow"
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
          <div className=" flex flex-col gap-2">
            <div className="  gap-2">
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
            </div>

            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={"mail@opencrawler.com"}
                className={`  transition-all bg-white ${isServerMode
                  ? "opacity-100 w-96 max-h-max h-9 py-3 px-2 animate-in border   rounded-md  max-md:w-full"
                  : " invisible !h-0 !w-0 !max-h-0  !max-w-0 min-h-0 min-w-0"
                  }`}
              />
              {isReportReady && (
                <button
                  disabled={!isReportReady}
                  onClick={() => {
                    downloadReport(results);
                  }}
                  className={` overflow-hidden group bg-black gap-2 flex text-white rounded-lg p-2 border-none transition-all ${!isReportReady && "cursor-not-allowed hover:bg-black/60"
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
          </div>

          {/* <button
            className={` ${
              !isCrawling && "hidden"
            } bg-black/60 hover:bg-black text-white rounded-lg p-2 border-none transition-all`}
            onClick={stopCrawl}
          >
            Stop
          </button> */}
        </div>
        <button
          className=" flex  overflow-hidden  max-w-48 border-black border bg-black  group justify-center gap-2 items-center  text-white cursor-pointer   rounded-lg p-2  transition-all"
          onClick={startCrawl}
          disabled={isCrawling}
          variant={"surface"}
        >
          <Activity
            color="white"
            className="h-4 w-4   group-hover:translate-y-[0px] -translate-y-[70px] transition-all duration-700"
          />
          <div className=" -translate-x-4 group-hover:translate-x-0 transition-all duration-700">
            {" "}
            {isCrawling
              ? isReportReady
                ? "Completed"
                : isServerMode
                  ? "Adding to queue"
                  : "Crawling.."
              : "Start Crawling"}
          </div>
        </button>

        {/* <RhcModal /> */}

        <div className="">
          <div className="flex gap-1 items-center">
            <Settings height={16} width={16} />
            Configurations:
          </div>
          <div className=" flex gap-4 ">
            <div className=" mt-3 flex gap-2 items-center">
              <button
                aria-controls="listbox-id"
                aria-expanded="false"
                type="button"
                onClick={() => handleToggleServerMode()}
                className="relative inline-flex h-9  w-[220px] items-center rounded-full bg-gray-200 transition-colors focus:outline-none   "
              >
                <span
                  className={`${isServerMode ? "translate-x-[7.7rem]" : " translate-x-1"
                    } inline-block h-7 w-24 transform rounded-full bg-white  transition-transform`}
                />
                <span
                  className={`absolute gap-2 items-center justify-center left-2 text-sm font-medium flex ${isServerMode ? "text-gray-500 " : "text-gray-800"
                    }`}
                >
                  {isServerMode && (
                    <Server height={13} width={13} className=" animate-pulse" />
                  )}
                  Client mode
                </span>
                <span
                  className={`absolute gap-2 items-center justify-center right-2 text-sm font-medium flex ${isServerMode ? "text-gray-800" : " text-gray-500"
                    }`}
                >
                  {!isServerMode && (
                    <Computer
                      height={13}
                      width={13}
                      className=" animate-pulse"
                    />
                  )}
                  Server mode
                </span>
              </button>
              <ToolTip
                text={
                  <div className="rounded  bg-gray-800 px-2 py-1 text-sm text-white shadow-lg  w-80">
                    Server mode: Your request will added our queue and will be
                    executed in the background and report will be emailed to you
                    back.
                    <br></br> <br></br>
                    Client mode: Your request will be executed from your browser
                    itself. You need <b>keep this tab open</b> and you will be
                    able to view live result. You can download report once scan
                    is completed.
                  </div>
                }
              />
            </div>{" "}
            <div className=" mt-3 flex gap-2 items-center">
              <button
                aria-controls="listbox-id"
                aria-expanded="false"
                type="button"
                onClick={() => {
                  handleToggle();
                }}
                className={`relative inline-flex h-9  w-[88px]
                  items-center rounded-full bg-gray-200 transition-all focus:outline-none  `}
              >
                <span
                  className={`${isSiteMapMode ? "translate-x-[5.75rem]" : " translate-x-1"
                    } inline-block h-7 w-20 transform rounded-full bg-white  transition-transform`}
                />

                <span
                  className={`absolute gap-2 items-center justify-center left-2 text-sm font-medium flex ${isSiteMapMode ? "text-gray-500 " : "text-gray-800"
                    }`}
                >
                  {isSiteMapMode && (
                    <Activity
                      height={13}
                      width={13}
                      className=" animate-pulse"
                    />
                  )}
                  Deep scan
                </span>

                {/* <span
                  className={`absolute gap-2 items-center justify-center right-2 text-sm font-medium flex ${isSiteMapMode ? "text-gray-800" : " text-gray-500"
                    }`}
                >
                  {!isSiteMapMode && (
                    <Map height={13} width={13} className=" animate-pulse" />
                  )}
                  Sitemap
                </span> */}
              </button>
              <ToolTip />
            </div>
          </div>
        </div>

        <div
          className={`${isCrawling && !isServerMode
            ? "mt-7  min-h-64"
            : "max-h-0 h-0 opacity-0 "
            } transition-all duration-700 `}
        >
          <h2 className="flex gap-2 items-center justify-between">
            <div className="flex gap-2  items-center  xl:w-[50%] flex-nowrap">
              Currently Crawling: {currentUrl || "example.com"}
              <div
                className={`aspect-auto rounded-full p-2 size-2 bg-gradient-to-r from-black/80 to-black/40 animate-spin ${isReportReady && "!hidden"
                  }`}
              ></div>
            </div>
          </h2>

          <div className="border border-gray-200 h-auto py-5 my-3 rounded-md ">
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
                  className="flex gap-3 justify-between items-center px-5 border-b  border-gray-200 hover:bg-gray-100 transition-all  py-2.5"
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
      </div>
      <Link
        href="/stories/integrate-with-slack"
        className=" cursor-pointer underline z-30 relative"
      >
        Integrate OpenCrawler to slack and get notifed when broken links are
        found.
      </Link>

      <TechStackShowcase />
    </section>
  );
}
