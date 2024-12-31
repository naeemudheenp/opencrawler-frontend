import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Provider } from "@/components/ui/provider";

import "./globals.css";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OpenCrawler - Find and Download 404 Error Pages on Your Website",
  description:
    "OpenCrawler is a powerful tool that scans your website to detect 404 error pages, helping you identify broken links and improve user experience. Easily download comprehensive reports and fix issues fast with OpenCrawler.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-FXL9EH2EV8"
        ></script>
        <Script>
          {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-FXL9EH2EV8');`}
        </Script>

        <Script id="ss-spot-script">{`
  (function () {
    var e = "ss-widget",
    t = "script",
    a = document,
    r = window;
    var s, n, c;
    r.SP_TARGET_TOKEN = "tar-id4m7eBXsRAkpTByen9W44";
    r.SS_SP_ACCOUNT = "opencrawler.surveysparrow.com";
    if (!a.getElementById(e)) {
      var S = function () {
        S.update(arguments);
      };
      S.args = [];
      S.update = function (e) {
        S.args.push(e);
      };
      r.SpotCheckLauncher = S;
      s = a.getElementsByTagName(t);
      c = s[s.length - 1];
      n = a.createElement(t);
      n.type = "text/javascript";
      n.async = !0;
      n.id = e;
      n.src = [
        "https://",
        "opencrawler.surveysparrow.com/spotcheck/widget/",
        r.SP_TARGET_TOKEN,
      ].join("");
      c.parentNode.insertBefore(n, c);
    }
  })();
`}</Script>
        <Script>{`
  window.SpotCheckLauncher('popup',  {
    userDetails: {},
    variables: {},
    properties: {}
  });
`}</Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white flex justify-center items-center !text-black`}
      >
        <Provider>{children}</Provider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
