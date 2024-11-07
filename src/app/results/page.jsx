"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Results() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const sitemapUrls = JSON.parse(searchParams.get("sitemapUrls") || "[]");

  const fetchData = async () => {
    const response = await fetch("/api/check404", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sitemapUrls }),
    });

    const data = await response.json();
    setResults(data);
  };

  useEffect(() => {
    if (sitemapUrls.length > 0) fetchData();
  }, []);

  if (!results) return <p>Loading...</p>;

  return (
    <div>
      <h1>404 Checker Results</h1>

      <section>
        <h2>Pages with 404 Errors</h2>
        <ul>
          {results.notFound.length > 0 ? (
            results.notFound.map((url, index) => <li key={index}>{url}</li>)
          ) : (
            <p>No 404 errors found!</p>
          )}
        </ul>
      </section>

      <section>
        <h2>All Scanned Pages</h2>
        <ul>
          {results.allPages.map((url, index) => (
            <li key={index}>{url}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
