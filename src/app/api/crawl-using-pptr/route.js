import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

export const dynamic = "force-dynamic";

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

let browser;

async function getBrowser() {
  if (browser) return browser;

  if (process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === "production") {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: true,
    });
  } else {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
  }
  return browser;
}

async function checkPageStatusAndGetLinks(url) {
  let statusCode = 404;
  let links: string[] = [];

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: "networkidle0" });
    statusCode = response?.status() || 404;

    if (statusCode === 200) {
      const origin = new URL(url).origin;

      links = await page.evaluate((origin) => {
        const anchors = Array.from(document.querySelectorAll("a"));
        const results: string[] = [];

        for (const anchor of anchors) {
          const href = anchor.getAttribute("href") || "";
          if (!href || href.startsWith("javascript:") || href.startsWith("#")) continue;

          // Cloudflare email protection checks
          if (href.includes("/cdn-cgi/l/email-protection")) continue;
          if (anchor.hasAttribute("data-cfemail")) continue;

          // Visibility checks
          const style = window.getComputedStyle(anchor);
          const rect = anchor.getBoundingClientRect();
          const isVisible =
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            rect.width > 0 &&
            rect.height > 0;

          if (!isVisible) continue;

          try {
            const absoluteUrl = new URL(href, window.location.href).href;
            if (absoluteUrl.startsWith(origin)) {
              results.push(absoluteUrl.split("#")[0].replace(/\/$/, ""));
            }
          } catch (e) {
            continue;
          }
        }

        return Array.from(new Set(results)); // deduplicate
      }, origin);
    }

    await page.close();
  } catch (err) {
    statusCode = 404;
  }

  return { statusCode, links };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(
      JSON.stringify({ error: "URL parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { statusCode, links } = await checkPageStatusAndGetLinks(url);

  return new Response(JSON.stringify({ links }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
