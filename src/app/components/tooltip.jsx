"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

export function ToolTip({
  text = (
    <div className="rounded  bg-gray-800 px-2 py-1 text-sm text-white shadow-lg  w-80">
      Deep Scan: The crawler starts at the given domain and recursively follows
      all links, covering the entire website.
      <br></br>
      Sitemap: The crawler scans only the links listed in the sitemap.
    </div>
  ),
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="relative mt-0.5">
      <button
        type="button"
        className="focus:outline-none"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="Help"
      >
        <HelpCircle className="h-5 w-5 text-gray-500" />
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform">
          {text}
          <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
