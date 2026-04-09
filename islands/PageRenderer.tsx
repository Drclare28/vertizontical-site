import {
  BOOK_DIMENSIONS,
  BookFormat,
  BookPageData,
} from "../routes/apps/babbl/book/_data.ts";

function getAgeLabel(dobString?: string, quoteDateString?: string) {
  if (!dobString || !quoteDateString) return "";
  const dob = new Date(dobString);
  const quoteDate = new Date(quoteDateString);
  if (isNaN(dob.getTime()) || isNaN(quoteDate.getTime())) return "";

  let age = quoteDate.getFullYear() - dob.getFullYear();
  const m = quoteDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && quoteDate.getDate() < dob.getDate())) {
    age--;
  }

  if (age < 0) return "";
  if (age === 0) return " (< 1 yr)";
  return ` (${age} yr${age > 1 ? "s" : ""})`;
}

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

        {/* --- 3. Circle Image --- */}
        {page.layout_style === "circle_image" && page.quote && (
          <>
            <div class="bg-image">
              {page.quote?.photo_url
                ? <img src={page.quote.photo_url} alt="Background" />
                : (
                  <span class="no-image-text">
                    This Babbl doesn't have an image. Please select a different
                    page layout, or add an image to the Babbl.
                  </span>
                )}
            </div>
            <div class="content-card">
              {page.quote?.child?.avatar_url && (
                <div class="avatar-container">
                  <img
                    src={page.quote?.child?.avatar_url}
                    alt="Child Avatar"
                  />
                </div>
              )}
              <h3
                style={{
                  fontSize: `${
                    Math.max(
                      1.0,
                      Math.min(2.5, 60 / (page.quote.text.length + 2)),
                    )
                  }em`,
                  top: `-${
                    3.5 /
                    Math.max(
                      1.0,
                      Math.min(2.5, 60 / (page.quote.text.length + 2)),
                    )
                  }em`,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  whiteSpace: "normal",
                }}
              >
                "{page.quote.text}"
              </h3>
              {page.quote.context && (
                <div class="context-box">
                  <p class="context-text">{page.quote.context}</p>
                </div>
              )}
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
                  {page.quote.child?.nickname || page.quote.child?.name}
                  {getAgeLabel(
                    page.quote.child?.date_of_birth,
                    page.quote.date,
                  )}
                </span>
              </div>
            </div>
          </>
        )}

        {/* --- 4. Quote top, image bottom --- */}
        {page.layout_style === "quote_top_image_bottom" && page.quote && (
          <>
            <div class="quote-section">
              {page.quote?.child?.avatar_url && (
                <div class="avatar-container">
                  <img src={page.quote.child.avatar_url} alt="Child Avatar" />
                </div>
              )}
              <div class="quote-text">
                <h3>"{page.quote.text}"</h3>
                <div class="author-details">
                  {page.quote.child?.nickname || page.quote.child?.name}
                  {getAgeLabel(
                    page.quote.child?.date_of_birth,
                    page.quote.date,
                  )}
                </div>
                {!(page.quote.context && page.show_context !== false) && (
                  <div class="meta-date">
                    {new Date(page.quote.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {page.quote.location ? ` at ${page.quote.location}` : ""}
                  </div>
                )}
              </div>
            </div>
            <div class="image-context-wrapper">
              {page.quote.context && page.show_context !== false && (
                <div class="context-box">
                  {page.quote.parent?.avatar_url && (
                    <div class="parent-avatar">
                      <img
                        src={page.quote.parent.avatar_url}
                        alt="Parent Avatar"
                      />
                    </div>
                  )}
                  <p class="context-text">{page.quote.context}</p>
                  <div class="meta-date">
                    {new Date(page.quote.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {page.quote.location ? ` at ${page.quote.location}` : ""}
                  </div>
                </div>
              )}
              <div class="image-section">
                {page.quote?.photo_url
                  ? <img src={page.quote.photo_url} alt="Top Photo" />
                  : (
                    <span class="no-image-text">
                      This Babbl doesn't have an image. Please select a different
                      page layout, or add an image to the Babbl.
                    </span>
                  )}
              </div>
            </div>
          </>
        )}

        {/* --- 5. Full page photo, quote centered --- */}
        {page.layout_style === "full_page_photo_quote_centered" && page.quote &&
          (
            <>
              <div class="author-pill">
                {page.quote?.child?.avatar_url && (
                  <div class="author-avatar">
                    <img src={page.quote.child.avatar_url} alt="Child Avatar" />
                  </div>
                )}
                <span class="author-name">
                  {page.quote.child?.nickname || page.quote.child?.name}
                  {getAgeLabel(
                    page.quote.child?.date_of_birth,
                    page.quote.date,
                  )}
                </span>
              </div>
              <div class="quote-section">
                <h3>"{page.quote.text}"</h3>
              </div>
              {page.quote.context && page.show_context !== false && (
                <div class="context-container">
                  <p class="context-text">{page.quote.context}</p>
                  <div class="meta-row">
                    {page.quote.parent?.avatar_url && (
                      <div class="parent-avatar">
                        <img
                          src={page.quote.parent.avatar_url}
                          alt="Parent"
                        />
                      </div>
                    )}
                    <div class="meta-details">
                      <span class="meta-date">
                        {new Date(page.quote.date).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                        {page.quote.location
                          ? ` at ${page.quote.location}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div class="image-section">
                {page.quote?.photo_url
                  ? (
                    <img
                      src={page.quote.photo_url}
                      alt="Bottom Photo"
                      class="main-photo"
                    />
                  )
                  : (
                    <span class="no-image-text">
                      This Babbl doesn't have an image. Please select a
                      different page layout, or add an image to the Babbl.
                    </span>
                  )}
              </div>
            </>
          )}

        {/* --- 6. Full width photo top, quote bottom --- */}
        {page.layout_style === "full_width_photo_top_quote_bottom" &&
          page.quote && (
          <>
            <div class="image-section">
              {page.quote?.photo_url
                ? <img src={page.quote.photo_url} alt="Main Photo" />
                : (
                  <span class="no-image-text">
                    This Babbl doesn't have an image. Please select a different
                    page layout, or add an image to the Babbl.
                  </span>
                )}
            </div>
            <div class="quote-section">
              <h3>"{page.quote.text}"</h3>
              <span class="meta-date">
                {new Date(page.quote.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {page.quote.location ? ` at ${page.quote.location}` : ""}
              </span>
              <div class="author-row">
                <div class="author-details">
                  {page.quote.child?.nickname || page.quote.child?.name}
                  {getAgeLabel(
                    page.quote.child?.date_of_birth,
                    page.quote.date,
                  )}
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

        {/* --- 7. Full screen photo, short quote --- */}
        {page.layout_style === "full_screen_photo_short_quote" && page.quote &&
          (
            <>
              <div class="quote-section">
                <div class="main-text">
                  <h3>"{page.quote.text}"</h3>
                  <div class="meta-row">
                    {new Date(page.quote.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {page.quote.location ? ` at ${page.quote.location}` : ""}
                  </div>
                </div>
                <div class="author-pill">
                  <span class="author-name">
                    {page.quote.child?.nickname || page.quote.child?.name}
                    {getAgeLabel(
                      page.quote.child?.date_of_birth,
                      page.quote.date,
                    )}
                  </span>
                  {page.quote?.child?.avatar_url && (
                    <div class="author-avatar">
                      <img
                        src={page.quote.child.avatar_url}
                        alt="Child Avatar"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div class="image-section">
                {page.quote?.photo_url
                  ? <img src={page.quote.photo_url} alt="Action Photo" />
                  : (
                    <span class="no-image-text">
                      This Babbl doesn't have an image. Please select a
                      different page layout, or add an image to the Babbl.
                    </span>
                  )}
              </div>
            </>
          )}

        {/* --- 8. Photo window top, quote bottom --- */}
        {page.layout_style === "photo_window_top_quote_bottom" && page.quote &&
          (
            <>
              <div class="bg-photo">
                {page.quote?.photo_url
                  ? <img src={page.quote.photo_url} alt="Background" />
                  : (
                    <span class="no-image-text">
                      This Babbl doesn't have an image. Please select a
                      different page layout, or add an image to the Babbl.
                    </span>
                  )}
              </div>
              <div class="quote-card">
                <div class="quote-text">
                  <h3>"{page.quote.text}"</h3>
                  <div class="meta-row">
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
                {page.quote.context && page.show_context !== false && (
                  <div class="context-container">
                    {page.quote.parent?.avatar_url && (
                      <div class="parent-avatar">
                        <img
                          src={page.quote.parent.avatar_url}
                          alt="Parent Avatar"
                        />
                      </div>
                    )}
                    <p class="context-text">{page.quote.context}</p>
                  </div>
                )}
              </div>
              <div class="author-pill">
                <span class="author-name">
                  {page.quote.child?.nickname || page.quote.child?.name}
                  {getAgeLabel(
                    page.quote.child?.date_of_birth,
                    page.quote.date,
                  )}
                </span>
                {page.quote?.child?.avatar_url && (
                  <div class="author-avatar">
                    <img
                      src={page.quote.child.avatar_url}
                      alt="Child Avatar"
                    />
                  </div>
                )}
              </div>
            </>
          )}

        {/* --- 9. Quote only, centered --- */}
        {page.layout_style === "quote_only_centered" && page.quote && (
          <>
            {page.quote?.child?.avatar_url && (
              <div class="avatar-container">
                <img src={page.quote.child.avatar_url} alt="Child Avatar" />
              </div>
            )}
            <div class="quote-section">
              <h3>"{page.quote.text.trim()}"</h3>
              <div class="author-details">
                {page.quote.child?.nickname || page.quote.child?.name}
                {getAgeLabel(page.quote.child?.date_of_birth, page.quote.date)}
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
