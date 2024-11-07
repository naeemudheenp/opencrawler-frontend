const puppeteer = require('puppeteer');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');


async function fetchSitemapUrls(sitemapUrls) {
  let allUrls = [];

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

  return allUrls;
}


async function check404(pages) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const results = { notFound: [], allPages: [] };

  for (const url of pages) {
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2' });
      results.allPages.push(url);

      if (response.status() === 404) {
        results.notFound.push(url);
        console.log(`404 Error on page: ${url}`);
      } else {
        console.log(`Page loaded successfully: ${url}`);
      }
    } catch (error) {
      console.log(`Error accessing page: ${url}`, error);
    }
  }

  await browser.close();
  return results;
}

// Function to create HTML report
function generateHtmlReport(results) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title> Surveysparrow - 404 Check Report</title>
      <style>
        body { font-family: Arial, sans-serif; }
        h2 { color: #333; }
        .section { margin-bottom: 20px; }
        .error { color: red; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 5px 0; }
      </style>
    </head>
    <body>
      <h1>404 Check Report</h1>
      
      <div class="section">
        <h2>Pages with 404 Errors</h2>
        ${results.notFound.length > 0 ? `
          <ul class="error">
            ${results.notFound.map(url => `<li>${url}</li>`).join('')}
          </ul>
        ` : '<p>No 404 errors found.</p>'}
      </div>
      
      <div class="section">
        <h2>All Scanned Pages</h2>
        <ul>
          ${results.allPages.map(url => `<li>${url}</li>`).join('')}
        </ul>
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync('404_check_report.html', htmlContent, 'utf-8');
  console.log('Report generated: 404_check_report.html');
}


async function main() {
  const sitemapUrls = [
    'https://surveysparrow.ae/page-sitemap.xml',
    'https://surveysparrow.ae/post-sitemap.xml',
    'https://surveysparrow.com/next-sitemap-0.xml',
    'https://surveysparrow.com/templates/sitemap.xml',
    'https://surveysparrow.com/blog/sitemap.xml',
    'https://surveysparrow.com/apps/sitemap.xml'
  ];


  const pages = await fetchSitemapUrls(sitemapUrls);
  if (pages.length === 0) {
    console.log('No URLs found in sitemaps or error fetching sitemaps.');
    return;
  }


  const results = await check404(pages);


  generateHtmlReport(results);
}

main();
