import { NextResponse } from 'next/server';
const { parseStringPromise } = require("xml2js");



const crawlSiteUsingSitemap = async (initialUrl) => {
  const parsedUrl = new URL(initialUrl);
  let brokenUrl = []

  let response = await fetch(initialUrl);

  const xml = await response.text();
  const result = await parseStringPromise(xml);
  let urls = [];

  try {
    // Handle sitemap index type
    if (result.sitemapindex) {
      const sitemapUrls = result.sitemapindex.sitemap.map(
        (entry) => entry.loc[0]
      );

      for (const sitemapUrl of sitemapUrls) {
        const subResponse = await fetch(sitemapUrl);
        if (!subResponse.ok) {
          throw new Error(
            `HTTP error in sub-sitemap! Status: ${subResponse.status}`
          );
        }
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
      // Handle regular sitemap type
      urls = result.urlset.url.map((entry) => entry.loc[0]);
    }
  } catch (error) {
    console.error("Failed to parse sitemap:", error);
  }

  await Promise.all(
    urls.map(async (url) => {
      try {

        const data = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/get-page-status?url=${url}`
        );
        const response = await data.json();
        if (response.status != 200) {
          brokenUrl.push(url)
        }


      } catch (error) { }
    })
  );

  return brokenUrl
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }
  const brokenLinks = await crawlSiteUsingSitemap(url) || []

  if (brokenLinks.length > 0) {
    return NextResponse.json({ brokenLinks }, { status: 422 });
  } else {
    return NextResponse.json({ status: 200 });
  }

}