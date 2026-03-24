import {
  BOOK_DIMENSIONS,
  BookFormat,
  BookPageData,
} from "../routes/apps/babbl/book/_data.ts";

interface PageRendererProps {
  format: BookFormat;
  page: BookPageData;
  themeId?: string;
  yearRange?: string;
  childrenProfiles?: Array<
    { id: string; name: string; nickname?: string; avatar_url?: string }
  >;
}

export default function PageRenderer(
  {
    format,
    page,
    themeId = "default",
    yearRange = "2024",
    childrenProfiles = [],
  }: PageRendererProps,
) {
  const dimensions = BOOK_DIMENSIONS[format];

  // Gelato recommends a safe print area (e.g., margins to avoid crucial text being cut off)
  // Usually around 0.125" to 0.25". Let's use 0.25" for a comfortable safe zone.
  const safeAreaMarginInches = 0.25;

  return (
    <div
      class={`relative shadow-2xl overflow-hidden flex flex-col theme-${themeId} format-${format}`}
      style={{
        width: `${dimensions.widthInches}in`,
        height: `${dimensions.heightInches}in`,
        padding: "0.25in",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Safe Area Guide */}
      <div
        class="absolute border border-dashed pointer-events-none z-500 opacity-50"
        style={{
          top: `${safeAreaMarginInches}in`,
          left: `${safeAreaMarginInches}in`,
          right: `${safeAreaMarginInches}in`,
          bottom: `${safeAreaMarginInches}in`,
        }}
      />

      <div
        class={`page-layout layout-${page.layout_style}`}
        style={{
          top: `${safeAreaMarginInches}in`,
          left: `${safeAreaMarginInches}in`,
          // width: `calc(${dimensions.widthInches}in - ${
          //   safeAreaMarginInches * 2
          // }in)`,
          // height: `calc(${dimensions.heightInches}in - ${
          //   safeAreaMarginInches * 2
          // }in)`,
          position: "absolute",
        }}
      >
        {/* --- 1. Cover --- */}
        {page.layout_style === "cover" && (
          <>
            {themeId === "babbl_theme" && (
              <>
                <div class="bg-shape-1" />
                <div class="bg-shape-2" />
                <div class="bg-shape-3" />
              </>
            )}
            <div class="title-container">
              <div class="text">
                <h1>{page.title || "Book Title"}</h1>
                <div class="date-range">{yearRange}</div>
              </div>
            </div>
            {childrenProfiles.length > 0
              ? (
                [...childrenProfiles].reverse().map((child) => (
                  child.avatar_url && (
                    <div key={child.id} class="child-avatar-container">
                      <img src={child.avatar_url} alt={child.name} />
                    </div>
                  )
                ))
              )
              : (
                page.quote?.photo_url && (
                  <div class="child-avatar-container">
                    <img src={page.quote.photo_url} alt="Cover Default" />
                  </div>
                )
              )}
          </>
        )}

        {/* --- 2. Back Cover --- */}
        {page.layout_style === "back_cover" && (
          <>
            <img
              src="/images/babbl-book.svg"
              alt="Back Cover"
              class="back-cover"
            />
          </>
        )}

        {/* --- 1. Circle Image --- */}
        {page.layout_style === "circle_image" && page.quote && (
          <>
            <img
              src={page.quote?.photo_url ||
                "https://placehold.co/600x600/ddd/999"}
              alt="Background"
              class="bg-image"
            />
            <div class="gradient-overlay" />
            <div class="content-card">
              {page.quote?.child?.avatar_url && (
                <div class="avatar-container">
                  <img
                    src={page.quote?.child?.avatar_url}
                    alt="Child Avatar"
                  />
                </div>
              )}
              <h3>"{page.quote.text}"</h3>
              <div class="meta-container">
                <span class="meta-date">
                  {new Date(page.quote.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {page.quote.location ? ` at ${page.quote.location}` : ""}
                </span>
                <span class="meta-separator">-</span>
                <span class="meta-author">
                  {page.quote.child?.nickname || page.quote.child?.name} (5 yrs)
                </span>
              </div>
            </div>
          </>
        )}

        {/* --- 2. Quote top, image bottom --- */}
        {page.layout_style === "quote_top_image_bottom" && page.quote && (
          <>
            {page.quote?.photo_url && (
              <div class="image-section">
                <img
                  src={page.quote.photo_url}
                  alt="Top Photo"
                />
              </div>
            )}
            <div class="quote-section">
              {page.quote?.child?.avatar_url && (
                <div class="avatar-container">
                  <img src={page.quote.child.avatar_url} alt="Child Avatar" />
                </div>
              )}
              <h3>"{page.quote.text}"</h3>
              <div class="meta-date">
                {new Date(page.quote.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {page.quote.location ? ` at ${page.quote.location}` : ""}
              </div>
              {page.quote.context && page.show_context !== false && (
                <div class="context-box">
                  <p class="context-text">{page.quote.context}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* --- 3. Full page photo, quote centered --- */}
        {page.layout_style === "full_page_photo_quote_centered" && page.quote &&
          (
            <>
              <div class="quote-section">
                <h3>"{page.quote.text}"</h3>
                {page.quote.context && page.show_context !== false && (
                  <p class="context-text">{page.quote.context}</p>
                )}
              </div>
              <div class="author-pill">
                {page.quote?.child?.avatar_url && (
                  <div class="author-avatar">
                    <img src={page.quote.child.avatar_url} alt="Child Avatar" />
                  </div>
                )}
                <span class="author-name">
                  {page.quote.child?.nickname || page.quote.child?.name} (5 yrs)
                </span>
              </div>
              <div class="image-section">
                <div class="ellipse-clip" />
                <img
                  src={page.quote?.photo_url ||
                    "https://placehold.co/600x400/ddd/999"}
                  alt="Bottom Photo"
                  class="main-photo"
                />
              </div>
            </>
          )}

        {/* --- 4. Full width photo top, quote bottom --- */}
        {page.layout_style === "full_width_photo_top_quote_bottom" &&
          page.quote && (
          <>
            <div class="image-section">
              <img
                src={page.quote?.photo_url ||
                  "https://placehold.co/600x500/ddd/999"}
                alt="Main Photo"
              />
            </div>
            <div class="quote-section">
              <h3>"{page.quote.text}"</h3>
              {page.quote.context && page.show_context !== false && (
                <p class="context-text">{page.quote.context}</p>
              )}
              <div class="author-row">
                <div class="author-details">
                  {page.quote.child?.nickname || page.quote.child?.name} (5 yrs)
                  {" "}
                  <br />
                  <span class="author-meta">
                    {new Date(page.quote.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {page.quote.location ? ` at ${page.quote.location}` : ""}
                  </span>
                </div>
                {page.quote?.child?.avatar_url && (
                  <div class="author-avatar">
                    <img src={page.quote.child.avatar_url} alt="Child Avatar" />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* --- 5. Full screen photo, short quote --- */}
        {page.layout_style === "full_screen_photo_short_quote" && page.quote &&
          (
            <>
              <div class="quote-section">
                {page.quote?.child?.avatar_url && (
                  <div class="avatar-container">
                    <img src={page.quote.child.avatar_url} alt="Child Avatar" />
                  </div>
                )}
                <h3>"{page.quote.text}"</h3>
                <div class="author-details">
                  {page.quote.child?.nickname || page.quote.child?.name} (5 yrs)
                  {" "}
                  <br />
                  {new Date(page.quote.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {page.quote.location ? ` at ${page.quote.location}` : ""}
                </div>
              </div>
              <div class="image-section">
                <img
                  src={page.quote?.photo_url ||
                    "https://placehold.co/600x600/ddd/999"}
                  alt="Action Photo"
                />
              </div>
            </>
          )}

        {/* --- 6. Photo window top, quote bottom --- */}
        {page.layout_style === "photo_window_top_quote_bottom" && page.quote &&
          (
            <>
              <img
                src={page.quote?.photo_url ||
                  "https://placehold.co/600x800/ddd/999"}
                alt="Background"
                class="bg-photo"
              />
              <div class="quote-card">
                <h3>"{page.quote.text}"</h3>
                <div class="meta-row">
                  <span class="author-name">
                    {page.quote.child?.nickname || page.quote.child?.name}{" "}
                    (5 yrs)
                  </span>
                  <span class="author-date">
                    {new Date(page.quote.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {page.quote.location ? ` at ${page.quote.location}` : ""}
                  </span>
                </div>
              </div>
              <div class="top-pill">
                {page.quote?.child?.avatar_url && (
                  <div class="pill-avatar">
                    <img src={page.quote.child.avatar_url} alt="Child Avatar" />
                  </div>
                )}
                <span class="pill-name">
                  {page.quote.child?.nickname || page.quote.child?.name}
                </span>
              </div>
            </>
          )}

        {/* --- 7. Quote only, centered --- */}
        {page.layout_style === "quote_only_centered" && page.quote && (
          <>
            {page.quote?.child?.avatar_url && (
              <div class="avatar-container">
                <img src={page.quote.child.avatar_url} alt="Child Avatar" />
              </div>
            )}
            <div class="quote-section">
              <h3>"{page.quote.text.trim()}"</h3>
              <div class="author-name">
                {page.quote.child?.nickname || page.quote.child?.name} (5 yrs)
              </div>
            </div>
            {page.quote.context && page.show_context !== false && (
              <div class="context-bar">
                <div class="context-row">
                  {page.quote?.parent?.avatar_url && (
                    <div class="parent-avatar">
                      <img
                        src={page.quote.parent.avatar_url}
                        alt="Parent Avatar"
                      />
                    </div>
                  )}
                  <div class="text-container">
                    <p class="context-text">
                      {page.quote.context.trim()}
                    </p>
                    <span class="context-date">
                      {new Date(page.quote.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {page.quote.location ? ` at ${page.quote.location}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Fallback layout */}
        {![
          "cover",
          "back_cover",
          "circle_image",
          "quote_top_image_bottom",
          "full_page_photo_quote_centered",
          "full_width_photo_top_quote_bottom",
          "full_screen_photo_short_quote",
          "photo_window_top_quote_bottom",
          "quote_only_centered",
        ].includes(page.layout_style) && (
          <p class="unrecognized-layout">
            Unrecognized Layout: {page.layout_style}
          </p>
        )}
      </div>
    </div>
  );
}
