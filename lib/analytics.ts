export interface PageView {
  path: string;
  referrer: string;
  session_id: string;
  user_agent: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
}

export interface TopPath {
  path: string;
  count: number;
}

export interface TopReferrer {
  referrer: string;
  count: number;
}

export interface ViewsOverTime {
  date: string;
  count: number;
}

// --- Storage backend selection ---

const DATA_DIR = Deno.cwd() + "/.analytics";
const DATA_FILE = DATA_DIR + "/page_views.jsonl";

let kv: Deno.Kv | null = null;
let storage: "kv" | "file" = "file";
let storageError = "";

async function initKv() {
  try {
    kv = await Deno.openKv();
    storage = "kv";
    console.log("[analytics] using Deno KV");
  } catch (e) {
    storageError = e instanceof Error ? e.message : String(e);
    console.log("[analytics] Deno.openKv() failed, using file storage:", storageError);
    try {
      Deno.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // dir already exists
    }
  }
}

// Initialize eagerly so KV is available from the start.
const initPromise = initKv();

async function ensureInit() {
  await initPromise;
}

async function appendFile(view: PageView) {
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(view) + "\n", {
    append: true,
  });
}

async function readAllFromFile(): Promise<PageView[]> {
  try {
    const text = await Deno.readTextFile(DATA_FILE);
    const views: PageView[] = [];
    for (const line of text.split("\n").filter(Boolean)) {
      try {
        views.push(JSON.parse(line));
      } catch {
        // skip malformed lines
      }
    }
    return views;
  } catch {
    return [];
  }
}

function filterByRange(views: PageView[], from: string, to: string) {
  const fromMs = new Date(from).getTime();
  const toMs = new Date(to + "T23:59:59.999Z").getTime();
  return views.filter((v) => {
    const t = new Date(v.created_at).getTime();
    return t >= fromMs && t <= toMs;
  });
}

export function getStorageInfo() {
  return { storage, error: storageError, onDenoDeploy: !!Deno.env.get("DENO_DEPLOYMENT_ID") };
}

// --- Public API ---

export async function trackView(view: PageView) {
  await ensureInit();
  if (storage === "kv" && kv) {
    await kv.set(["pv", view.created_at, view.session_id], view);
  } else {
    await appendFile(view);
  }
}

async function readAllViews(): Promise<PageView[]> {
  await ensureInit();
  if (storage === "kv" && kv) {
    const iter = kv.list<PageView>({ prefix: ["pv"] });
    const views: PageView[] = [];
    for await (const entry of iter) {
      views.push(entry.value);
    }
    return views;
  }
  return await readAllFromFile();
}

export async function getSummary(
  from: string,
  to: string,
): Promise<AnalyticsSummary> {
  const views = filterByRange(await readAllViews(), from, to);
  const sessions = new Set(views.map((v) => v.session_id));
  const todayStr = new Date().toISOString().slice(0, 10);
  const viewsToday = views.filter((v) =>
    v.created_at.startsWith(todayStr)
  ).length;

  return {
    totalViews: views.length,
    uniqueVisitors: sessions.size,
    viewsToday,
  };
}

export async function getTopPaths(
  from: string,
  to: string,
  limit = 10,
): Promise<TopPath[]> {
  const views = filterByRange(await readAllViews(), from, to);
  const counts = new Map<string, number>();
  for (const v of views) {
    counts.set(v.path, (counts.get(v.path) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getTopReferrers(
  from: string,
  to: string,
  limit = 10,
): Promise<TopReferrer[]> {
  const views = filterByRange(await readAllViews(), from, to);
  const counts = new Map<string, number>();
  for (const v of views) {
    const ref = v.referrer || "(direct)";
    counts.set(ref, (counts.get(ref) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getViewsOverTime(
  from: string,
  to: string,
): Promise<ViewsOverTime[]> {
  const views = filterByRange(await readAllViews(), from, to);
  const counts = new Map<string, number>();
  for (const v of views) {
    const date = v.created_at.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
