import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";

export const downloadReport = (results) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Report-404 pages | Only Broken(404) pages are shown.", 14, 20);
  doc.setFontSize(12);
  doc.text(`Generated with openCrawler`, 14, 30);
  doc.text(`https://www.opencrawler.in/`, 14, 40);
  const headers = [["Url", "Parent url"]];
  const data = results.allPages.map((result) => [
    result.url,
    result.parentUrl,
    results.notFound.includes(result.url) ? "Not Found" : "Found",
  ]);

  const notFoundItems = data
    .filter((item) => results.notFound.includes(item[0]))
    .map(([url, parentUrl]) => [url, parentUrl]);
  autoTable(doc, {
    head: headers,
    body: notFoundItems,
    startY: 50,

    styles: {
      cellPadding: 5,
    },
    margin: { top: 0, right: 5, bottom: 0, left: 5 },
  });
  doc.save("opencrawler-report.pdf");
};