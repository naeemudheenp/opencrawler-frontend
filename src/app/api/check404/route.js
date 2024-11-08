// app/api/crawl/route.js

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Helper function to extract all internal links on a page
async function getInternalLinks(page) {
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .map(link => link.href)
      .filter(href => href.startsWith(window.location.origin))
  );
  return [...new Set(links)]; // Remove duplicates
}

// Function to recursively crawl through all links
async function crawl(url, browser, visited = new Set(), results = { notFound: [], allPages: [] }) {
  if (visited.has(url)) return; // Avoid revisiting pages
  visited.add(url);

  try {
    const page = await browser.newPage();
    console.log("checking...", url);
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 5000 });

    results.allPages.push(url);

    if (response.status() === 404) {
      results.notFound.push(url);
    }

    console.log("checking...", url, response.status());


    const links = await getInternalLinks(page);
    await page.close();

    // Recursively crawl each internal link
    for (const link of links) {
      await crawl(link, browser, visited, results);
    }
  } catch (error) {
    console.log(`Error accessing page: ${url}`, error);
  }
}

// API handler
export async function POST(request) {
  const { sitemapUrls } = await request.json();
  const startUrl = sitemapUrls

  console.log(startUrl, "startUrlsumo");


  if (!startUrl) {
    return NextResponse.json({ error: 'Please provide a start URL' }, { status: 400 });
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = { notFound: [], allPages: [] };

  try {
    await crawl(startUrl, browser);
  } catch (error) {
    console.error('Error while crawling:', error);
  } finally {
    await browser.close();
  }

  return NextResponse.json(results, { status: 200 });
}
