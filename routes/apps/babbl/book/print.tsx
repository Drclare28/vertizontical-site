import { define } from "../../../../utils.ts";
import { BookPageData } from "./_data.ts";
import { getSupabaseClient } from "../../../../lib/supabase.ts";

// Book dimensions in pixels at 96 DPI
const BOOK_PX: Record<string, { w: number; h: number; inW: number; inH: number }> = {
  mini: { w: 576, h: 576, inW: 6, inH: 6 },
  classic: { w: 768, h: 768, inW: 8, inH: 8 },
};

function getAgeLabel(dobString?: string | null, quoteDateString?: string | null): string {
  if (!dobString || !quoteDateString) return "";
  const dob = new Date(dobString);
  const quoteDate = new Date(quoteDateString);
  if (isNaN(dob.getTime()) || isNaN(quoteDate.getTime())) return "";
  let age = quoteDate.getFullYear() - dob.getFullYear();
  const m = quoteDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && quoteDate.getDate() < dob.getDate())) age--;
  if (age < 0) return "";
  if (age === 0) return " (<1 yr)";
  return ` (${age} yr${age > 1 ? "s" : ""})`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function renderPage(page: BookPageData, dim: { w: number; h: number; inW: number; inH: number }): string {
  const layout = page.layout_style;
  const q = page.quote;

  const containerStyle = `width:${dim.w}px;height:${dim.h}px;overflow:hidden;position:relative;flex-shrink:0;`;

  const childName = () => q?.child?.nickname || q?.child?.name || "";
  const childAge = () => getAgeLabel(q?.child?.date_of_birth, q?.date);
  const photoDate = () => formatDate(q?.date) + (q?.location ? ` at ${q.location}` : "");
  const avatarUrl = q?.child?.avatar_url;
  const parentAvatarUrl = q?.parent?.avatar_url;
  const photoUrl = q?.photo_url;

  if (layout === "cover") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-cover" style="width:100%;height:100%;overflow:hidden;position:relative;">
        <div class="bg-shape-1"></div>
        <div class="bg-shape-2"></div>
        <div class="bg-shape-3"></div>
        <div class="title-container">
          <div class="text"><h1>${page.title || "Book Title"}</h1></div>
        </div>
        ${avatarUrl ? `<div class="child-avatar-container"><img crossorigin="anonymous" src="${avatarUrl}" alt="Cover" /></div>` : ""}
      </div>
    </div>`;
  }

  if (layout === "back_cover") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-back_cover" style="width:100%;height:100%;overflow:hidden;position:relative;">
        <img src="/images/babbl-book.svg" alt="Back Cover" />
      </div>
    </div>`;
  }

  if (!q) return `<div class="print-page theme-babbl_theme" style="${containerStyle}"></div>`;

  if (layout === "circle_photo") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-circle_photo" style="width:100%;height:100%;overflow:hidden;position:relative;">
        <div class="bg-image">${photoUrl ? `<img crossorigin="anonymous" src="${photoUrl}" alt="Background" />` : `<span>No image available.</span>`}</div>
        <div class="content-card">
          ${avatarUrl ? `<div class="avatar-container"><img crossorigin="anonymous" src="${avatarUrl}" alt="Child" /></div>` : ""}
          <h3>${q.text}</h3>
          <div class="meta-container"><span class="meta-date">${photoDate()}</span><span class="meta-separator">-</span><span class="meta-author">${childName()}${childAge()}</span></div>
        </div>
      </div>
    </div>`;
  }

  if (layout === "quote_top_photo_bottom") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-quote_top_photo_bottom" style="width:100%;height:100%;overflow:hidden;position:relative;">
        <div class="quote-section">
          ${avatarUrl ? `<div class="avatar-container"><img crossorigin="anonymous" src="${avatarUrl}" alt="Child" /></div>` : ""}
          <div class="quote-text">
            <h3>"${q.text}"</h3>
            <div class="author-details">${childName()}${childAge()}</div>
            ${!(q.context && page.show_context !== false) ? `<div class="meta-date">${photoDate()}</div>` : ""}
          </div>
        </div>
        <div class="image-context-wrapper">
          ${q.context && page.show_context !== false ? `<div class="context-box">${parentAvatarUrl ? `<div class="parent-avatar"><img crossorigin="anonymous" src="${parentAvatarUrl}" alt="Parent" /></div>` : ""}<p class="context-text">${q.context}</p><div class="meta-date">${photoDate()}</div></div>` : ""}
          <div class="image-section">${photoUrl ? `<img crossorigin="anonymous" src="${photoUrl}" alt="Photo" />` : `<span>No image available.</span>`}</div>
        </div>
      </div>
    </div>`;
  }

  if (layout === "full_page_photo_quote_centered") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-full_page_photo_quote_centered" style="width:100%;height:100%;overflow:hidden;position:relative;">
        <div class="author-pill">
          ${avatarUrl ? `<div class="author-avatar"><img crossorigin="anonymous" src="${avatarUrl}" alt="Child" /></div>` : ""}
          <span class="author-name">${childName()}${childAge()}</span>
        </div>
        <div class="quote-section"><h3>"${q.text}"</h3></div>
        ${q.context && page.show_context !== false ? `<div class="context-container">${parentAvatarUrl ? `<div class="parent-avatar"><img crossorigin="anonymous" src="${parentAvatarUrl}" alt="Parent" /></div>` : ""}<p class="context-text">${q.context}</p><div class="meta-row"><div class="meta-details"><span class="meta-date">${photoDate()}</span></div></div></div>` : ""}
        <div class="image-section">${photoUrl ? `<img class="main-photo" crossorigin="anonymous" src="${photoUrl}" alt="Photo" />` : `<span>No image available.</span>`}</div>
      </div>
    </div>`;
  }

  if (layout === "full_width_photo_top_quote_bottom") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-full_width_photo_top_quote_bottom" style="width:100%;height:100%;overflow:hidden;position:relative;">
        <div class="image-section">${photoUrl ? `<img crossorigin="anonymous" src="${photoUrl}" alt="Photo" />` : `<span>No image available.</span>`}</div>
        <div class="quote-section">
          <h3>"${q.text}"</h3>
          <span class="meta-date">${photoDate()}</span>
          <div class="author-row">
            <div class="author-details">${childName()}${childAge()}</div>
            ${avatarUrl ? `<div class="author-avatar"><img crossorigin="anonymous" src="${avatarUrl}" alt="Child" /></div>` : ""}
          </div>
        </div>
      </div>
    </div>`;
  }

  if (layout === "full_screen_photo_short_quote") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-full_screen_photo_short_quote" style="width:100%;height:100%;overflow:hidden;position:relative;">
        <div class="quote-section">
          <div class="main-text"><h3>"${q.text}"</h3><div class="meta-row">${photoDate()}</div></div>
          <div class="author-pill">
            <span class="author-name">${childName()}${childAge()}</span>
            ${avatarUrl ? `<div class="author-avatar"><img crossorigin="anonymous" src="${avatarUrl}" alt="Child" /></div>` : ""}
          </div>
        </div>
        <div class="image-section">${photoUrl ? `<img crossorigin="anonymous" src="${photoUrl}" alt="Photo" />` : `<span>No image available.</span>`}</div>
      </div>
    </div>`;
  }

  if (layout === "photo_window_top_quote_bottom") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-photo_window_top_quote_bottom" style="width:100%;height:100%;overflow:hidden;position:relative;">
        <div class="bg-photo">${photoUrl ? `<img crossorigin="anonymous" src="${photoUrl}" alt="Photo" />` : `<span>No image available.</span>`}</div>
        <div class="quote-card">
          <div class="quote-text">
            <h3>"${q.text}"</h3>
            <div class="meta-row"><span class="author-date">${photoDate()}</span></div>
          </div>
          ${q.context && page.show_context !== false ? `<div class="context-container">${parentAvatarUrl ? `<div class="parent-avatar"><img crossorigin="anonymous" src="${parentAvatarUrl}" alt="Parent" /></div>` : ""}<p class="context-text">${q.context}</p></div>` : ""}
        </div>
        <div class="author-pill">
          <span class="author-name">${childName()}${childAge()}</span>
          ${avatarUrl ? `<div class="author-avatar"><img crossorigin="anonymous" src="${avatarUrl}" alt="Child" /></div>` : ""}
        </div>
      </div>
    </div>`;
  }

  if (layout === "quote_only_centered") {
    return `<div class="print-page theme-babbl_theme" style="${containerStyle}">
      <div class="page-layout layout-quote_only_centered" style="width:100%;height:100%;overflow:hidden;position:relative;">
        ${avatarUrl ? `<div class="avatar-container"><img crossorigin="anonymous" src="${avatarUrl}" alt="Child" /></div>` : ""}
        <div class="quote-section">
          <h3>"${q.text.trim()}"</h3>
          <div class="author-details">${childName()}${childAge()}</div>
        </div>
        ${q.context && page.show_context !== false ? `<div class="context-bar"><div class="context-row">${parentAvatarUrl ? `<div class="parent-avatar"><img crossorigin="anonymous" src="${parentAvatarUrl}" alt="Parent" /></div>` : ""}<div class="text-container"><p class="context-text">${q.context.trim()}</p><span class="context-date">${photoDate()}</span></div></div></div>` : ""}
      </div>
    </div>`;
  }

  return `<div class="print-page theme-babbl_theme" style="${containerStyle}"><div style="padding:2em;font-size:0.9em;color:#999;">Unknown layout: ${layout}</div></div>`;
}

export const handler = define.handlers({
  async GET(ctx) {
    const { url } = ctx;
    const bookId = url.searchParams.get("bookId");
    const token = url.searchParams.get("token");

    if (!bookId || !token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const apiSecret = Deno.env.get("API_SECRET");
    const isAdminBypass =
      (serviceRoleKey && token === serviceRoleKey) ||
      (apiSecret && token === apiSecret);

    if (!isAdminBypass) {
      return new Response("Forbidden", { status: 403 });
    }

    const supabase = getSupabaseClient(token);

    // Fetch book
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return new Response(`Book not found: ${bookError?.message}`, { status: 404 });
    }

    // Fetch book quotes
    const { data: bookQuotes, error: quotesError } = await supabase
      .from("book_quotes")
      .select(`
        order_index,
        layout_style,
        show_context,
        quote:quotes (
          id,
          quote_text,
          context,
          quote_date,
          location_name,
          child:children (
            id,
            name,
            nickname,
            date_of_birth,
            avatar_url
          ),
          parent:profiles!recorded_by (
            full_name,
            avatar_url
          ),
          media_url
        )
      `)
      .eq("book_id", bookId)
      .order("order_index");

    if (quotesError) {
      return new Response(`Error loading quotes: ${quotesError.message}`, { status: 500 });
    }

    const finalFormat = (book.book_size || "mini").toLowerCase();
    const dim = BOOK_PX[finalFormat] || BOOK_PX.mini;

    // Map quotes to pages
    // deno-lint-ignore no-explicit-any
    const innerPages: BookPageData[] = (bookQuotes || []).map((bq: any) => {
      const quoteData = Array.isArray(bq.quote) ? bq.quote[0] : bq.quote;
      if (!quoteData) return null;
      return {
        page_number: bq.order_index + 1,
        layout_style: bq.layout_style || "photo_window_top_quote_bottom",
        show_context: bq.show_context !== false,
        quote: {
          id: quoteData.id,
          text: quoteData.quote_text,
          context: quoteData.context || undefined,
          location: quoteData.location_name || undefined,
          date: quoteData.quote_date,
          child: Array.isArray(quoteData.child) ? quoteData.child[0] : quoteData.child,
          parent: (() => {
            const p = Array.isArray(quoteData.parent) ? quoteData.parent[0] : quoteData.parent;
            return p?.full_name ? { name: p.full_name, avatar_url: p.avatar_url } : undefined;
          })(),
          photo_url: quoteData.media_url || undefined,
        },
      };
    }).filter(Boolean) as BookPageData[];

    const allPages: BookPageData[] = [
      { page_number: 0, layout_style: "cover", title: book.title },
      ...innerPages,
      { page_number: innerPages.length + 1, layout_style: "back_cover" },
    ];

    const renderedPages = allPages.map((p) => renderPage(p, dim)).join("\n");

    const bookBuilderUrl = Deno.env.get("BOOK_BUILDER_URL") ?? "https://vertizonticalstudios.com";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=${dim.w}, initial-scale=1.0" />
  <title>Babbl Book Print</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Aleo:wght@700&family=Rosario:wght@400;700&family=Yomogi&family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${bookBuilderUrl}/assets/css/book.css" />
  <style>
    @page {
      margin: 0;
      size: ${dim.inW}in ${dim.inH}in;
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${dim.w}px;
      background: white;
    }
    .print-page {
      width: ${dim.w}px;
      height: ${dim.h}px;
      overflow: hidden;
      position: relative;
      display: block;
      page-break-after: always;
      break-after: page;
    }
    .print-page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }
    img { max-width: none; }
  </style>
</head>
<body>
${renderedPages}
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
});
