/**
 * Render an exact, Gelato-ready print file for a book WITHOUT creating an
 * order, charging anyone, or uploading anything.
 *
 * It mirrors the render half of the `stitch-pdf` edge function: same page math,
 * same print URLs, same page geometry, same cover-spread-then-interior merge.
 * The only substitution is the PDF engine — local headless Chrome instead of
 * Api2Pdf — so the output is a proof, not a fulfillment artifact.
 *
 * Usage (from the site repo, dev server already running):
 *   deno run -A --env-file=.env scripts/print-proof.ts \
 *     --book 576b423d-... --format mini --out ~/Desktop/mini-proof.pdf
 *
 * Optional: --png ./proof-pages   (also writes per-page PNGs)
 *           --base http://127.0.0.1:5391   (default)
 *           --slots 32                      (override inner content slots)
 *
 * KEEP IN SYNC with supabase/functions/stitch-pdf/index.ts. If that file's page
 * math changes, change it here too, or the proof will happily lie to you.
 */

// Same build the edge function uses; loaded over HTTP so this script needs no
// deno.json / node_modules entry of its own.
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const MM2PX = (mm: number) => (mm / 25.4) * 96;
const mm2in = (mm: number) => mm / 25.4;

function arg(name: string, fallback?: string): string | undefined {
  const i = Deno.args.indexOf(`--${name}`);
  if (i >= 0 && Deno.args[i + 1] && !Deno.args[i + 1].startsWith("--")) {
    return Deno.args[i + 1];
  }
  return Deno.args.includes(`--${name}`) ? "true" : fallback;
}

const bookId = arg("book") ?? Deno.env.get("DEV_BOOK_ID");
if (!bookId) throw new Error("Pass --book <uuid> (or set DEV_BOOK_ID)");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be in the environment",
  );
}

const base = (arg("base") ?? "http://127.0.0.1:5391").replace(/\/$/, "");
const outPath = (arg("out") ?? `./print-proof-${Date.now()}.pdf`).replace(
  /^~(?=\/)/,
  Deno.env.get("HOME")!,
);
const pngDir = arg("png");
const assetBase = Deno.env.get("BOOK_BUILDER_URL") ??
  "https://vertizonticalstudios.com";

// ---------------------------------------------------------------- data
async function rest(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_ROLE!,
      Authorization: `Bearer ${SERVICE_ROLE!}`,
    },
  });
  if (!res.ok) {
    throw new Error(`REST ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const [book] = await rest(
  `books?id=eq.${bookId}&select=id,title,book_size,theme_id,book_quotes(count)`,
);
if (!book) throw new Error(`Book ${bookId} not found`);

const quoteCount: number = book.book_quotes?.[0]?.count ?? 0;
const format = (arg("format") ?? book.book_size ?? "mini").toLowerCase() as
  | "mini"
  | "classic";
if (!["mini", "classic"].includes(format)) {
  throw new Error(`Unknown format "${format}"`);
}

// --------------------------------------------------- page math (mirror)
const contentPages = quoteCount + 1;
const requestPages = Math.max(28, contentPages);
const oddBase = requestPages % 2 === 0 ? requestPages + 1 : requestPages + 2;

const fileRule = Deno.env.get("GELATO_FILE_PAGE_RULE") || "odd_plus_3";
let totalPages: number;
if (fileRule === "declared_plus_3") {
  const declared = Math.max(
    36,
    (requestPages % 2 === 0 ? requestPages : requestPages + 1) + 4,
  );
  totalPages = declared + 3;
} else {
  totalPages = Math.max(35, oddBase + 3);
  if (totalPages % 2 === 0) totalPages += 1;
}

const isMini = format === "mini";
const productUid = isMini
  ? "photobooks-softcover_pf_140x140-mm-5_5x5_5-inch_pt_170-gsm-65lb-coated-silk_cl_4-4_ccl_4-4_bt_glued-left_ct_matt-lamination_prt_1-0_cpt_250-gsm-100-lb-cover-coated-silk_ver"
  : "photobooks-hardcover_pf_200x200-mm-8x8-inch_pt_170-gsm-65lb-coated-silk_cl_4-4_ccl_4-4_bt_glued-left_ct_matt-lamination_prt_1-0_cpt_130-gsm-65-lb-cover-coated-silk_ver";

const fallbackAnatomy = isMini
  ? {
    coverW: 289.34,
    coverH: 146,
    backLeft: 3,
    backTop: 3,
    contentW: 140,
    contentH: 140,
    spineLeft: 143,
    spineW: 3.34,
    frontLeft: 146.34,
  }
  : {
    coverW: 458,
    coverH: 246,
    backLeft: 20,
    backTop: 20,
    contentW: 198,
    contentH: 206,
    spineLeft: 226,
    spineW: 6,
    frontLeft: 240,
  };

const BLEED_MM = 3;
const TRIM_CONTENT_MM = isMini ? 140 : 200;
const TRIM_W = TRIM_CONTENT_MM + BLEED_MM * 2;
const TRIM_H = TRIM_W;

let anatomy = { ...fallbackAnatomy };
const gelatoApiKey = Deno.env.get("GELATO_API_KEY");
if (gelatoApiKey) {
  try {
    const res = await fetch(
      `https://product.gelatoapis.com/v3/products/${productUid}/cover-dimensions?pageCount=${requestPages}`,
      { headers: { "X-API-KEY": gelatoApiKey } },
    );
    if (res.ok) {
      const dims = await res.json();
      const bleed = dims?.bleedSize,
        back = dims?.contentBackSize,
        spine = dims?.spineSize,
        front = dims?.contentFrontSize;
      if (bleed && back && spine && front) {
        anatomy = {
          coverW: bleed.width,
          coverH: bleed.height,
          backLeft: back.left ?? fallbackAnatomy.backLeft,
          backTop: back.top ?? fallbackAnatomy.backTop,
          contentW: back.width,
          contentH: back.height,
          spineLeft: spine.left ?? fallbackAnatomy.spineLeft,
          spineW: spine.width,
          frontLeft: front.left ?? fallbackAnatomy.frontLeft,
        };
      }
    } else {
      console.warn(
        `cover-dimensions HTTP ${res.status}; using fallback anatomy`,
      );
    }
  } catch (e) {
    console.warn(
      "cover-dimensions failed; using fallback anatomy:",
      e instanceof Error ? e.message : e,
    );
  }
}

const innerSlots = Number(arg("slots") ?? Math.max(3, totalPages - 3));
const basePrintUrl =
  `${base}/apps/babbl/book/print?bookId=${bookId}&token=${SERVICE_ROLE}&gelato=1&format=${format}`;
const anatomyParams = Object.entries(anatomy).map(([k, v]) => `&${k}=${v}`)
  .join("");
const coverUrl = `${basePrintUrl}&mode=cover${anatomyParams}`;
const interiorUrl =
  `${basePrintUrl}&mode=interior&interiorW=${TRIM_W}&interiorH=${TRIM_H}&innerSlots=${innerSlots}`;

console.log(
  `book        ${book.title} (${bookId})  quotes=${quoteCount}  theme=${book.theme_id}`,
);
console.log(
  `format      ${format} → interior ${TRIM_W}×${TRIM_H}mm, cover ${anatomy.coverW}×${anatomy.coverH}mm (spine ${anatomy.spineW}mm)`,
);
console.log(
  `pages       request ${requestPages}, file ${totalPages} (${fileRule}), content slots ${innerSlots}`,
);
console.log(`assets from ${assetBase}`);

// ------------------------------------------------------- Chrome via CDP
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profileDir = await Deno.makeTempDir({ prefix: "print-proof-chrome-" });
const port = 9300 + Math.floor(Math.random() * 600);

const chrome = new Deno.Command(CHROME, {
  args: [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "about:blank",
  ],
  stdout: "null",
  stderr: "null",
}).spawn();
// Don't let the browser child hold the Deno event loop open: the script must
// exit as soon as the PDF is written.
chrome.unref();

async function browserWs(): Promise<string> {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Chrome DevTools endpoint never came up");
}

const ws = new WebSocket(await browserWs());
await new Promise<void>((resolve, reject) => {
  ws.onopen = () => resolve();
  ws.onerror = () => reject(new Error("CDP socket failed"));
});

interface CdpMessage {
  id?: number;
  method?: string;
  sessionId?: string;
  error?: { message: string; data?: unknown };
  result?: Record<string, unknown>;
}

type CdpResult = Record<string, unknown>;

let msgId = 0;
const pending = new Map<
  number,
  { resolve: (v: CdpResult) => void; reject: (e: Error) => void }
>();
const listeners = new Set<(msg: CdpMessage) => void>();

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data as string) as CdpMessage;
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id)!;
    pending.delete(msg.id);
    msg.error
      ? p.reject(
        new Error(
          `${msg.error.message} (${JSON.stringify(msg.error.data ?? "")})`,
        ),
      )
      : p.resolve(msg.result ?? {});
    return;
  }
  for (const l of listeners) l(msg);
};

function send<T extends CdpResult = CdpResult>(
  method: string,
  params: Record<string, unknown> = {},
  sessionId?: string,
): Promise<T> {
  const id = ++msgId;
  ws.send(
    JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }),
  );
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: CdpResult) => void, reject });
    setTimeout(() => {
      if (pending.delete(id)) reject(new Error(`CDP timeout: ${method}`));
    }, 180_000);
  });
}

async function renderPart(
  url: string,
  wMm: number,
  hMm: number,
  name: string,
  shots?: string[],
) {
  const { targetId } = await send<{ targetId: string }>("Target.createTarget", {
    url: "about:blank",
  });
  const { sessionId } = await send<{ sessionId: string }>(
    "Target.attachToTarget",
    {
    targetId,
    flatten: true,
  });
  const viewportW = Math.round(mm2in(wMm) * 96);
  const viewportH = Math.round(mm2in(hMm) * 96);

  try {
    await send("Page.enable", {}, sessionId);
    await send("Network.enable", {}, sessionId);
    await send("Emulation.setDeviceMetricsOverride", {
      width: viewportW,
      height: viewportH,
      deviceScaleFactor: 1,
      mobile: false,
    }, sessionId);

    const loaded = new Promise<void>((resolve) => {
      const onMsg = (msg: CdpMessage) => {
        if (
          msg.sessionId === sessionId && msg.method === "Page.loadEventFired"
        ) {
          listeners.delete(onMsg);
          resolve();
        }
      };
      listeners.add(onMsg);
    });
    console.log(`  ${name}: loading ${url.replace(SERVICE_ROLE!, "***")}`);
    const nav = await send<{ errorText?: string }>(
      "Page.navigate",
      { url },
      sessionId,
    );
    if (nav.errorText) {
      throw new Error(`${name} navigation failed: ${nav.errorText}`);
    }
    await loaded;

    // Match Api2Pdf's waitForNetworkIdle + extraDelay: fonts, images, then a beat.
    await send("Runtime.evaluate", {
      expression: `Promise.all([
        document.fonts.ready,
        ...[...document.images].map(i => i.complete ? true : new Promise(r => { i.onload = i.onerror = r })),
      ]).then(() => document.querySelectorAll('.print-page').length)`,
      awaitPromise: true,
      returnByValue: true,
    }, sessionId);
    await new Promise((r) => setTimeout(r, 3500));

    const pdfBase64 = (await send<{ data: string }>("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      transferMode: "ReturnAsBase64",
    }, sessionId)).data as string;

    if (shots) {
      const pageWpx = MM2PX(wMm), pageHpx = MM2PX(hMm);
      for (const spec of shots) {
        const [label, idxStr] = spec.split(":");
        const idx = Number(idxStr);
        const shot = await send<{ data: string }>("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: true,
          clip: {
            x: 0,
            y: idx * pageHpx,
            width: pageWpx,
            height: pageHpx,
            scale: 1,
          },
        }, sessionId);
        const file = `${pngDir}/${label}.png`;
        await Deno.writeFile(
          file,
          Uint8Array.from(atob(shot.data), (c) => c.charCodeAt(0)),
        );
        console.log(`  ${name}: wrote ${file}`);
      }
    }

    return Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
  } finally {
    await send("Target.closeTarget", { targetId }).catch(() => {});
  }
}

const shotsForInterior = pngDir
  ? [
    "interior-01-endpaper:0",
    "interior-02-title:1",
    "interior-03-quote:2",
    "interior-05-quote:4",
    "interior-18-notes:17",
  ]
  : undefined;
const shotsForCover = pngDir ? ["cover-spread:0"] : undefined;
if (pngDir) await Deno.mkdir(pngDir, { recursive: true });

console.log("rendering…");
const coverPdf = await renderPart(
  coverUrl,
  anatomy.coverW,
  anatomy.coverH,
  "cover",
  shotsForCover,
);
const interiorPdf = await renderPart(
  interiorUrl,
  TRIM_W,
  TRIM_H,
  "interior",
  shotsForInterior,
);

ws.close();
try {
  chrome.kill("SIGKILL");
} catch { /* already gone */ }
try {
  await Deno.remove(profileDir, { recursive: true });
} catch { /* best effort */ }

// ---------------------------------------------------------------- merge
const merged = await PDFDocument.create();
for (const part of [coverPdf, interiorPdf]) {
  const doc = await PDFDocument.load(part);
  const copied = await merged.copyPages(doc, doc.getPageIndices());
  copied.forEach((pg) => merged.addPage(pg));
}
const mergedPages = merged.getPageCount();
if (mergedPages !== totalPages) {
  throw new Error(
    `Rendered ${mergedPages} pages, Gelato expects ${totalPages}`,
  );
}
const bytes = await merged.save();
await Deno.writeFile(outPath, bytes);

const sizeOf = (i: number) => {
  const { width, height } = merged.getPage(i).getSize();
  return `${(width / 72 * 25.4).toFixed(2)}×${
    (height / 72 * 25.4).toFixed(2)
  }mm`;
};
console.log(`\n✓ ${mergedPages} pages → ${outPath}`);
console.log(`  page 1 (cover spread) ${sizeOf(0)}`);
console.log(`  page 2 (interior)     ${sizeOf(1)}`);
console.log(`  page ${mergedPages} (last)    ${sizeOf(mergedPages - 1)}`);
