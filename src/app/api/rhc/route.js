import { NextResponse } from 'next/server';
const { parseStringPromise } = require("xml2js");



const crawlSiteUsingSitemap = async (initialUrl) => {
  const parsedUrl = new URL(initialUrl);
  let brokenUrl = [];

  const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
            const data = await fetchWithRetry(
              `${process.env.NEXT_PUBLIC_FRONTEND}/api/fetch?url=${url}`
            );
            const response = await data.json();
            if (response.status != 200) {
              brokenUrl.push(url);
            }
          } catch (error) {

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
      const sitemapUrls = result.sitemapindex.sitemap.map((entry) => entry.loc[0]);

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

  return brokenUrl;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }
  const brokenLinks = await crawlSiteUsingSitemap(url) || []

  if (brokenLinks.length > 0) {
    return NextResponse.json({ brokenLinks }, { status: 202 });
  } else {
    return NextResponse.json({ status: 200 });
  }

}