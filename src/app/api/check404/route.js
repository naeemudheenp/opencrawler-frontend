

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import axios from 'axios';
import xml2js from 'xml2js';

async function fetchSitemapUrls(sitemapUrls) {
  let allUrls = [];
  async function check404(pages) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const results = { notFound: [], allPages: [] };

    for (const url of pages) {
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle2' });
        console.log("checking..", url);

        results.allPages.push(url);

        if (response.status() === 404) {
          results.notFound.push(url);
        }
      } catch (error) {
        console.log(`Error accessing page: ${url}`, error);
      }
    }

    await browser.close();
    return results;
  }

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await axios.get(sitemapUrl);
      const parsedData = await xml2js.parseStringPromise(response.data);
      const urls = parsedData.urlset.url.map(urlObj => urlObj.loc[0]);
      allUrls = allUrls.concat(urls);
    } catch (error) {
      console.error(`Error fetching sitemap at ${sitemapUrl}: ${error.message}`);
    }
  }
  return check404(allUrls)

}



export async function POST(request) {
  const { sitemapUrls } = await request.json();

  if (!sitemapUrls || !Array.isArray(sitemapUrls)) {
    return NextResponse.json({ error: 'Invalid input, sitemapUrls must be an array' }, { status: 400 });
  }

  const results = await fetchSitemapUrls(sitemapUrls);


  return NextResponse.json(results, { status: 200 });
}
