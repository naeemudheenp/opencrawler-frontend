// import puppeteer from 'puppeteer';
// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// // export async function GET(request) {
// //   const textEncoder = new TextEncoder();
// //   const { readable } = new TransformStream();
// //   let responseStream = new TransformStream();
// //   const writer = responseStream.writable.getWriter();

// //   try {
// //     const startUrl = new URL(request.url).searchParams.get('startUrl');
// //     console.log(startUrl, "startee");

// //     if (!startUrl) {
// //       return new Response(JSON.stringify({ error: "No start URL provided" }), {
// //         status: 400,
// //         headers: { 'Content-Type': 'application/json' },
// //       });
// //     }

// //     writer.write(textEncoder.encode('Vercel is a platform for....'));

// //     // const browser = await puppeteer.launch({
// //     //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
// //     //   headless: true,
// //     // });

// //     // const results = { notFound: [], allPages: [] };

// //     // const crawl = async (url, visited = new Set()) => {
// //     //   if (visited.has(url)) return;
// //     //   visited.add(url);
// //     //   console.log(url, "humuss");

// //     //   try {
// //     //     const page = await browser.newPage();
// //     //     const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 5000 });

// //     //     // Send current URL to client
// //     //     // writer.write(textEncoder.encode(`data: ${JSON.stringify({ currentUrl: url })}\n\n`));
// //     //     writer.write(textEncoder.encode(`data: ${JSON.stringify({ currentUrl: `Error accessing page: ` })}\n\n`));

// //     //     results.allPages.push(url);

// //     //     // Check if page is 404
// //     //     if (response.status() === 404) {
// //     //       results.notFound.push(url);
// //     //       writer.write(textEncoder.encode(`data: ${JSON.stringify({ notFoundUrl: url })}\n\n`));
// //     //     }

// //     //     const links = await page.evaluate(() =>
// //     //       Array.from(document.querySelectorAll('a'))
// //     //         .map(link => link.href)
// //     //         .filter(href => href.startsWith(window.location.origin))
// //     //     );
// //     //     await page.close();

// //     //     for (const link of links) {
// //     //       await crawl(link, visited);
// //     //     }
// //     //   } catch (error) {
// //     //     console.error(`Error accessing page: ${url}`, error);
// //     //     writer.write(textEncoder.encode(`data: ${JSON.stringify({ error: `Error accessing page: ${url}` })}\n\n`));
// //     //   }
// //     // };

// //     // await crawl(startUrl);
// //     // await browser.close();

// //     // writer.write(textEncoder.encode(`data: ${JSON.stringify(results)}\n\n`));
// //     // writer.close();

// //   } catch (error) {
// //     console.error("Unexpected error:", error);
// //     return new Response(JSON.stringify({ error: "Internal server error" }), {
// //       status: 500,
// //       headers: { 'Content-Type': 'application/json' },
// //     });
// //   }
// //   return new Response(responseStream.readable, {
// //     headers: {
// //       'Content-Type': 'text/event-stream',
// //       Connection: 'keep-alive',
// //       'Cache-Control': 'no-cache, no-transform',
// //     },
// //   });
// // }

// // export async function GET() {

// //   let responseStream = new TransformStream();
// //   const writer = responseStream.writable.getWriter();
// //   const encoder = new TextEncoder();

// //   try {
// //     writer.write(encoder.encode('Vercel is a platform for....'));
// //   } catch (error) {
// //     console.error('An error occurred during OpenAI request', error);
// //     writer.write(encoder.encode('An error occurred during OpenAI request'));
// //     writer.close();
// //   }

// //   return new Response(responseStream.readable, {
// //     headers: {
// //       "Access-Control-Allow-Origin": "*",
// //       "Content-Type": "text/event-stream; charset=utf-8",
// //       Connection: "keep-alive",
// //       "Cache-Control": "no-cache, no-transform",
// //       "X-Accel-Buffering": "no",
// //       "Content-Encoding": "none",
// //     },
// //   });
// // }

// // export const config = {
// //   runtime: "edge",
// // };

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// interface Notify {
//   log: (message: string) => void;
//   complete: (data: any) => void;
//   error: (error: Error | any) => void;
//   close: () => void;
// }

// const longRunning = async (notify: Notify) => {
//   notify.log("Started")
//   await delay(1000)
//   notify.log("Done 15%")
//   await delay(1000)
//   notify.log("Done 35%")
//   await delay(1000)
//   notify.log("Done 75%")
//   await delay(1000)
//   notify.complete({ data: "My data" })
// }
// export default async function longRunningResponse(req: NextApiRequest, res: NextApiResponse) {
//   let responseStream = new TransformStream();
//   const writer = responseStream.writable.getWriter();
//   const encoder = new TextEncoder();
//   let closed = false;

//   // Invoke long running process
//   longRunning({
//     log: (msg: string) => writer.write(encoder.encode("data: " + msg + "\n\n")),
//     complete: (obj: any) => {
//       writer.write(encoder.encode("data: " + JSON.stringify(obj) + "\n\n")),
//       if (!closed) {
//         writer.close();
//         closed = true;
//       }
//     }
//     error: (err: Error | any) => {
//       writer.write(encoder.encode("data: " + err?.message + "\n\n"));
//       if (!closed) {
//         writer.close();
//         closed = true;
//       }
//     },
//     close: () => {
//       if (!closed) {
//         writer.close();
//         closed = true;
//       }
//     },
//   }).then(() => {
//     console.info("Done");
//     if (!closed) {
//       writer.close();
//     }
//   }).catch((e) => {
//     console.error("Failed", e);
//     if (!closed) {
//       writer.close();
//     }
//   });

//   // Return response connected to readable
//   return new Response(responseStream.readable, {
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Content-Type": "text/event-stream; charset=utf-8",
//       Connection: "keep-alive",
//       "Cache-Control": "no-cache, no-transform",
//       "X-Accel-Buffering": "no",
//       "Content-Encoding": "none",
//     },
//   });
// }
