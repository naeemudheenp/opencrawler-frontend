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
  let statusCode;
  let links = [];

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    const response = await page.goto(url, { waitUntil: "networkidle0" });
    statusCode = response && response.status() === 200 ? 200 : 404;

    if (statusCode === 200) {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;

      links = await page.$$eval(
        "a",
        (anchors, domain) => {
          return anchors
            .filter((anchor) => {
              const href = anchor.href;
              const style = window.getComputedStyle(anchor);
              const isVisible =
                anchor.offsetParent !== null &&
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                style.opacity !== "0";

              const isObfuscated =
                href.includes("/cdn-cgi/l/email-protection") ||
                anchor.hasAttribute("data-cfemail");

              try {
                const linkDomain = new URL(href).hostname;
                return (
                  isVisible &&
                  !isObfuscated &&
                  linkDomain === domain &&
                  href.trim() !== ""
                );
              } catch {
                return false;
              }
            })
            .map((anchor) => anchor.href);
        },
        domain
      );
    }

    await page.close();
  } catch (error) {
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
