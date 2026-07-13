import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import {
  getSummary,
  getTopPaths,
  getTopReferrers,
  getViewsOverTime,
  type AnalyticsSummary,
  type TopPath,
  type TopReferrer,
  type ViewsOverTime,
} from "../../lib/analytics.ts";
import AnalyticsChart from "../../islands/AnalyticsChart.tsx";
import { getStorageInfo } from "../../lib/analytics.ts";

function getCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const pair of header.split(";")) {
    const [key, ...val] = pair.trim().split("=");
    cookies[key] = val.join("=");
  }
  return cookies;
}

function defaultRange() {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

export default define.page(async function Analytics(ctx) {
  const cookies = getCookies(ctx.req.headers.get("cookie"));
  const url = new URL(ctx.url);
  const keyParam = url.searchParams.get("key");
  const apiSecret = Deno.env.get("API_SECRET") || "";
  const adminToken = cookies["admin_token"]
    ? decodeURIComponent(cookies["admin_token"])
    : "";

  const authenticated = (apiSecret && adminToken === apiSecret) ||
    (apiSecret && keyParam === apiSecret);

  if (!authenticated) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin" },
    });
  }

  const { from, to } = defaultRange();
  const queryFrom = url.searchParams.get("from") || from;
  const queryTo = url.searchParams.get("to") || to;

  let summary: AnalyticsSummary = {
    totalViews: 0,
    uniqueVisitors: 0,
    viewsToday: 0,
  };
  let topPaths: TopPath[] = [];
  let topReferrers: TopReferrer[] = [];
  let viewsOverTime: ViewsOverTime[] = [];
  let loadError = "";

  try {
    [summary, topPaths, topReferrers, viewsOverTime] = await Promise.all([
      getSummary(queryFrom, queryTo),
      getTopPaths(queryFrom, queryTo),
      getTopReferrers(queryFrom, queryTo),
      getViewsOverTime(queryFrom, queryTo),
    ]);
  } catch (e) {
    console.error("Analytics error:", e);
    loadError = "Error loading analytics data: " + (e instanceof Error ? e.message : String(e));
  }

  const storageInfo = getStorageInfo();

  return (
    <div>
      <Head>
        <title>Analytics &middot; Vertizontical Studios</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js">
        </script>
      </Head>
      <div class="min-h-screen bg-black text-white p-6">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-3xl pt-serif-caption-regular">Analytics</h1>
            <a
              href="/"
              class="text-gray-400 hover:text-white transition-colors text-sm"
            >
              &larr; Home
            </a>
          </div>

          {loadError && (
            <p class="text-red-400 mb-6 text-center">{loadError}</p>
          )}

          <form method="GET" action="/admin/analytics" class="flex gap-4 items-end mb-8 flex-wrap">
            <div>
              <label class="block text-xs text-gray-400 mb-1">From</label>
              <input
                type="date"
                name="from"
                value={queryFrom}
                class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">To</label>
              <input
                type="date"
                name="to"
                value={queryTo}
                class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Update
            </button>
          </form>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-gray-900 rounded-xl p-6">
              <p class="text-gray-400 text-sm">Total Views</p>
              <p class="text-3xl font-bold mt-1">{summary.totalViews}</p>
            </div>
            <div class="bg-gray-900 rounded-xl p-6">
              <p class="text-gray-400 text-sm">Unique Visitors</p>
              <p class="text-3xl font-bold mt-1">{summary.uniqueVisitors}</p>
            </div>
            <div class="bg-gray-900 rounded-xl p-6">
              <p class="text-gray-400 text-sm">Views Today</p>
              <p class="text-3xl font-bold mt-1">{summary.viewsToday}</p>
            </div>
          </div>

          <div class="bg-gray-900 rounded-xl p-6 mb-8">
            <h2 class="text-xl pt-serif-caption-regular mb-4">
              Views Over Time
            </h2>
            <AnalyticsChart data={viewsOverTime} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div class="bg-gray-900 rounded-xl p-6">
              <h2 class="text-xl pt-serif-caption-regular mb-4">Top Pages</h2>
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-gray-400 border-b border-gray-700">
                    <th class="text-left py-2">Page</th>
                    <th class="text-right py-2">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topPaths.map((p) => (
                    <tr class="border-b border-gray-800">
                      <td class="py-2 text-blue-400">{p.path}</td>
                      <td class="py-2 text-right">{p.count}</td>
                    </tr>
                  ))}
                  {topPaths.length === 0 && (
                    <tr>
                      <td colSpan={2} class="py-4 text-center text-gray-500">
                        No data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div class="bg-gray-900 rounded-xl p-6">
              <h2 class="text-xl pt-serif-caption-regular mb-4">
                Top Referrers
              </h2>
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-gray-400 border-b border-gray-700">
                    <th class="text-left py-2">Source</th>
                    <th class="text-right py-2">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topReferrers.map((r) => (
                    <tr class="border-b border-gray-800">
                      <td class="py-2 text-blue-400 truncate max-w-[200px]">
                        {r.referrer}
                      </td>
                      <td class="py-2 text-right">{r.count}</td>
                    </tr>
                  ))}
                  {topReferrers.length === 0 && (
                    <tr>
                      <td colSpan={2} class="py-4 text-center text-gray-500">
                        No data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-8 p-4 bg-gray-900 rounded-xl text-xs text-gray-400">
            <p>
              Storage:{" "}
              <span class={storageInfo.storage === "kv" ? "text-green-400" : "text-yellow-400"}>
                {storageInfo.storage}
              </span>
            </p>
            {storageInfo.onDenoDeploy && <p>Runtime: Deno Deploy</p>}
            {storageInfo.error && <p>Error: <span class="text-red-400">{storageInfo.error}</span></p>}
            {storageInfo.onDenoDeploy && storageInfo.storage !== "kv" && (
              <p class="text-yellow-400 mt-2">
                Deno KV is not available. Enable it in your project settings at{" "}
                <a href="https://dash.deno.com" class="text-blue-400 underline hover:text-blue-300">dash.deno.com</a>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
