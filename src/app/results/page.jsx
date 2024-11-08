"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function ResultsContent() {
  const searchParams = useSearchParams();
  const sitemapUrls = searchParams.get("startUrl") || "[]";

  const [results, setResults] = useState(null);
  async function fetchData() {
    const response = await fetch("/api/check404", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sitemapUrls }),
    });

    const data = await response.json();
    setResults(data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (!results) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>404 Checker Results</h1>

      <section>
        <h2>Pages with 404 Errors</h2>
        <ul>
          {results?.notFound?.length > 0 ? (
            results.notFound.map((url, index) => <li key={index}>{url}</li>)
          ) : (
            <p>No 404 errors found!</p>
          )}
        </ul>
      </section>

      <section>
        <h2>All Scanned Pages</h2>
        <ul>
          {results?.allPages?.map((url, index) => (
            <li key={index}>{url}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<p>Loading results...</p>}>
      <ResultsContent />
    </Suspense>
  );
}
