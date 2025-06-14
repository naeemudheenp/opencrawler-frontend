export default function OpenCrawlerPage() {

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-gray-900 bg-white">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold leading-tight mb-4">
          Integrate with Slack to Get Daily Reports on Broken Links
        </h1>
        <p className="text-lg text-gray-600">
          With the help of OpenCrawler, you can integrate it with Slack to receive daily reports on broken links in your Slack channel.
        </p>
      </header>

      <article className="prose prose-lg max-w-none">
        <section className="mb-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-2">Setup Instructions</h2>
          <ol className="list-decimal list-inside space-y-5">
            <li className="mb-4">
              <strong className="mb-4">Create a Slack App:</strong> Use the following manifest:<br></br>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mt-7 mb-4">
                {`{
  "display_information": { "name": "opencrawler" },
  "features": { "bot_user": { "display_name": "opencrawler", "always_online": false } },
  "oauth_config": {
    "redirect_urls": ["<hosteddomain-you-will-get-this-after-deploying-the-repo-in-below-step>/slack/events"],
    "scopes": { "bot": ["chat:write"] }
  },
  "settings": {
    "org_deploy_enabled": false,
    "socket_mode_enabled": false,
    "token_rotation_enabled": false
  }
}`}
              </pre>
            </li>
            <li className="mb-4">
              Go to this <a className="underline" href="https://github.com/naeemudheenp/opencrawler-slack-backend">GitHub repository</a>.
            </li>
            <li className="my-4">
              Deploy this repository on Vercel by clicking on the "Deploy" button.
              <a
                className="my-4"
                href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnaeemudheenp%2Fopencrawler-slack-backend&env=SLACK_BOT_TOKEN,SLACK_SIGNING_SECRET,CHANNEL_ID&envDescription=Make%20sure%20you%20add%20slack%20app%20token%20%2C%20signing%20secret%20%20and%20channel%20id%20where%20you%20want%20to%20sent%20message%2C"
              >
                <img className="my-4" src="https://vercel.com/button" alt="Deploy with Vercel" />
              </a>

            </li>
            <li className="my-4">
              <strong>Configure Environment Variables:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>SLACK_SIGNING_SECRET</strong> - Your Slack app's signing secret</li>
                <li><strong>SLACK_BOT_TOKEN</strong> - The bot token generated for your Slack app</li>
                <li><strong>SLACK_CHANNEL</strong> - The ID of the Slack channel where notifications will be sent</li>
              </ul>
            </li>
            <li>
              <strong className=" my-4">Set Up a Cron Job:</strong>
              <ul className="list-disc list-inside ml-4 space-y-3 my-4">
                <li>Go to <a href="https://cron-job.org/">cron-job.org</a> for automation.</li>
                <li>Set up a cron job to run the API endpoint <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">https://opencrawler-backend.onrender.com/add-job</pre> </li>
                <li>Click on "Advanced Settings" and change the request type from <a className="underline text-green-400">GET</a> to <a className="underline text-red-400">POST</a>.</li>
                <li>Add the following body to the request:
                  <pre className="bg-gray-100 p-4 my-4 rounded-md overflow-x-auto">
                    {`{
  "email": "test@test.com",
  "url": "https://test.com/",
  "mode": "deepscan",
  "postActionApi": "http://<replace-with-deployed-vercel-url>/api/slack"
}`}
                  </pre>
                </li>
                <li>Click "Save," and thats it now you will get daily reports on broken links in your slack channel(Currently you will receave message only if there are broken links.you can make necessary change in repo to get message even if there are no broken links).</li>
              </ul>
            </li>
          </ol>
        </section>
      </article>

      <footer className="mt-12 border-t pt-6">
        <a
          href="https://github.com/naeemudheenp/opencrawler-slack-backend"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-lg font-semibold text-black border border-black px-6 py-3 rounded-md hover:bg-black hover:text-white transition"
        >
          View on GitHub
        </a>
      </footer>
    </main>
  );
}