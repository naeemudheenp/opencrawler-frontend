"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Github, Linkedin } from "lucide-react";

export default function DarkTerminalLanding() {
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [puppeteer, setPuppeteer] = useState(false);
  const [delay, setDelay] = useState("200");
  const [maxPages, setMaxPages] = useState("500");
  const [jsonOutput, setJsonOutput] = useState(false);

  const [copied, setCopied] = useState(false);

  const buildCommand = () => {
    let cmd = `npx opencrawler ${targetUrl.trim() || "https://example.com"}`;
    if (puppeteer) cmd += " --puppeteer";
    if (delay && parseInt(delay, 10) > 0) cmd += ` --delay ${delay}`;
    if (maxPages && parseInt(maxPages, 10) !== 500) cmd += ` --max-pages ${maxPages}`;
    if (jsonOutput) cmd += " --json";
    return cmd;
  };

  const command = buildCommand();

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 w-full flex flex-col items-center justify-between py-12 px-4 sm:px-6 font-mono selection:bg-emerald-500 selection:text-black">
      {/* Background terminal matrix glow effect */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="max-w-2xl w-full my-auto space-y-6">
        {/* Terminal Header Tag with Github & Linkedin Icons */}
        <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-300 font-semibold">openCrawler CLI v1.2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/naeemudheenp/opencrawler-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-emerald-400 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/naeemudheenp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-cyan-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Main Title Banner */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="text-emerald-400">$</span> npx opencrawler
          </h1>
          <p className="text-zinc-400 text-sm font-sans max-w-xl">
            Fast, zero-config 404 broken link scanner with request frequency throttling & parent link tracing right from your terminal.
          </p>
        </div>

        {/* Prominent Stat Badge */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-zinc-950 border border-emerald-500/40 rounded-xl px-4 py-3 text-xs font-mono shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400 font-sans text-xs">Total Audit Capacity:</span>
            <span className="text-emerald-400 font-bold text-sm tracking-wide">145 Unique URLs Scanned</span>
          </div>
          <span className="text-emerald-400/80 text-[11px] font-mono font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60 hidden sm:inline">
            CLI Audit
          </span>
        </div>

        {/* Terminal Window Frame */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden text-sm">
          {/* Mac Window Control Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
              </div>
              <span className="ml-2 text-zinc-400 text-[11px]">bash - npx opencrawler</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1 rounded transition-all cursor-pointer shadow-md active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "COPIED!" : "COPY COMMAND"}
            </button>
          </div>

          {/* Interactive Command Display */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 bg-black p-3.5 rounded-lg border border-zinc-800 overflow-x-auto text-emerald-400">
              <span className="text-zinc-500 select-none">user@localhost:~$</span>
              <span className="text-zinc-100 font-bold whitespace-nowrap">{command}</span>
              <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block shrink-0"></span>
            </div>

            {/* Terminal Parameter Inputs */}
            <div className="pt-3 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1 font-mono font-medium">Target URL</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1 font-mono font-medium">--delay (ms)</label>
                <input
                  type="number"
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                  placeholder="200"
                  className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-4 pt-3 sm:pt-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={puppeteer}
                    onChange={(e) => setPuppeteer(e.target.checked)}
                    className="accent-emerald-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono">--puppeteer</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={jsonOutput}
                    onChange={(e) => setJsonOutput(e.target.checked)}
                    className="accent-emerald-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono">--json</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Minimal Terminal Footer */}
      <footer className="pt-8 text-center text-xs text-zinc-500 font-mono">
        Created by Naeemudheen P
      </footer>
    </div>
  );
}

