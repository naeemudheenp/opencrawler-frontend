"use client";

import React, { useState } from "react";

export default function ClientSideCrawler() {
  const [startUrl, setStartUrl] = useState("");
  const [results, setResults] = useState({ notFound: [], allPages: [] });
  const [currentUrl, setCurrentUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);

  const crawlSite = async (initialUrl) => {
    setIsCrawling(true);
    const visited = new Set();
    const queue = [initialUrl];
    const domain = new URL(initialUrl).origin;

    const crawlPage = async (url) => {
      try {
        const response = await fetch(url);
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
      } catch (error) {
        console.error(`Error accessing page: ${url}`, error);
      }
    };

    while (queue.length > 0) {
      const url = queue.shift();
      await crawlPage(url);
    }

    setIsCrawling(false);
  };

  const startCrawl = () => {
    setResults({ notFound: [], allPages: [] });
    setCurrentUrl("");
    crawlSite(startUrl);
  };

  return (
    <div>
      <h1>Client-Side 404 Crawler</h1>
      <input
        type="text"
        value={startUrl}
        onChange={(e) => setStartUrl(e.target.value)}
        placeholder="Enter start URL"
      />
      <button onClick={startCrawl} disabled={isCrawling}>
        {isCrawling ? "Crawling..." : "Start Crawling"}
      </button>

      <h2>Currently Crawling: {currentUrl}</h2>
      <h3>404 Pages:</h3>
      <ul>
        {results.notFound.map((url) => (
          <li key={url}>{url}</li>
        ))}
      </ul>
      <h3>All Pages:</h3>
      <ul>
        {results.allPages.map((url) => (
          <li key={url}>{url}</li>
        ))}
      </ul>
    </div>
  );
}
