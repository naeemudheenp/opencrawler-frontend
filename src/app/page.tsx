"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [sitemapUrls, setSitemapUrls] = useState([""]);
  const router = useRouter();

  const handleInputChange = (index, value) => {
    const updatedUrls = [...sitemapUrls];
    updatedUrls[index] = value;
    setSitemapUrls(updatedUrls);
  };

  const handleAddUrl = () => setSitemapUrls([...sitemapUrls, ""]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    router.push(`/results?sitemapUrls=${JSON.stringify(sitemapUrls)}`);
  };

  return (
    <div>
      <h1>404 Checker</h1>
      <form onSubmit={handleSubmit}>
        {sitemapUrls.map((url, index) => (
          <div key={index}>
            <input
              type="url"
              placeholder="Enter sitemap URL"
              value={url}
              onChange={(e) => handleInputChange(index, e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddUrl}>
          Add Another Sitemap
        </button>
        <button type="submit">Start</button>
      </form>
    </div>
  );
}
