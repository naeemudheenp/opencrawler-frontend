export async function logToServer(url) {
  await fetch("/api/log-to-server", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url }),
  });
}