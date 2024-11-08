"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [sitemapUrls, setSitemapUrls] = useState("");
  const router = useRouter();

  const handleInputChange = (value: string) => {
    setSitemapUrls(value);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    router.push(`/results?startUrl=${sitemapUrls}`);
  };

  return (
    <Suspense>
      <div>
        <h1>404 Checker</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="Enter sitemap URL"
            value={sitemapUrls}
            onChange={(e) => handleInputChange(e.target.value)}
            required
          />

          <button type="submit">Start</button>
        </form>
      </div>
    </Suspense>
  );
}
