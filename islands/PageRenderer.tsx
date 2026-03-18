import {
  BOOK_DIMENSIONS,
  BookFormat,
  BookPageData,
  THEMES,
} from "../routes/apps/babbl/book/_data.ts";

interface PageRendererProps {
  format: BookFormat;
  page: BookPageData;
  themeId?: string;
}

export default function PageRenderer(
  { format, page, themeId = "playful_pastel" }: PageRendererProps,
) {
  const dimensions = BOOK_DIMENSIONS[format];
  const theme = THEMES[themeId] || THEMES.babbl_theme;

  // Gelato recommends a safe print area (e.g., margins to avoid crucial text being cut off)
  // Usually around 0.125" to 0.25". Let's use 0.25" for a comfortable safe zone.
  const safeAreaMarginInches = 0.25;

  return (
    <div
      class={`relative shadow-2xl overflow-hidden flex flex-col ${theme.bgColor} ${theme.textColor} ${theme.fontFamily}`}
      style={{
        width: `${dimensions.widthInches}in`,
        height: `${dimensions.heightInches}in`,
        padding: "0.25in",
        // To simulate paper texture slightly
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Safe Area Guide (Visible in Preview Mode only usually, but good for visualizing now) */}
      <div
        class="absolute border border-dashed border-red-300 pointer-events-none opacity-50 z-50"
        style={{
          top: `${safeAreaMarginInches}in`,
          left: `${safeAreaMarginInches}in`,
          right: `${safeAreaMarginInches}in`,
          bottom: `${safeAreaMarginInches}in`,
        }}
      />

      {
        /*
        Inner Content Area
        We subtract the safe area margins from the physical size to give the content
        a padded container that guarantees safety from trim lines.
      */
      }
      <div
        class="absolute"
        style={{
          top: `${safeAreaMarginInches}in`,
          left: `${safeAreaMarginInches}in`,
          width: `calc(${dimensions.widthInches}in - ${
            safeAreaMarginInches * 2
          }in)`,
          height: `calc(${dimensions.heightInches}in - ${
            safeAreaMarginInches * 2
          }in)`,
          // Flex layout for the content wrapper
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        {/* --- 1. Cover --- */}
        {page.layout_style === "cover" && (
          <div class="relative w-full h-full bg-[#B63198] flex flex-col items-center justify-center -mx-4 -my-4 px-4 py-4 rounded-xl overflow-hidden">
            <div class="absolute inset-0 bg-[#E8C4E7] opacity-20 transform -rotate-12 scale-150 origin-bottom-left rounded-[100px]" />
            <div class="absolute inset-0 bg-[#E8C4E7] opacity-20 transform rotate-45 scale-150 origin-top-right rounded-[100px]" />

            <div class="z-10 text-center mb-8 w-4/5 pt-8">
              <h1
                class="text-[#9663D7] font-[Fredoka] font-bold leading-none tracking-tight bg-[#EAD5F0] px-6 py-4 rounded-[40px] shadow-sm transform -rotate-2"
                style={{ fontSize: format === "mini" ? "2.5rem" : "3.5rem" }}
              >
                {page.title || "Emi's Best Quotes"}
              </h1>
              <div
                class="text-[#C11079] font-bold mt-2"
                style={{ fontSize: format === "mini" ? "1.2rem" : "1.8rem" }}
              >
                2020–2026
              </div>
            </div>

            <div class="z-10 relative flex-1 w-full flex items-center justify-center pb-8">
              <div class="absolute right-0 bottom-0 bg-[#FF6B6B] rounded-full w-48 h-48 transform translate-x-12 translate-y-12" />
              <img
                src={page.quote?.photo_url ||
                  "https://placehold.co/400x400/FFB6C1/FFF"}
                alt="Cover"
                class="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-8 border-white shadow-xl z-20 relative"
              />
            </div>
          </div>
        )}

        {/* --- 2. Back Cover --- */}
        {page.layout_style === "back_cover" && (
          <div class="relative w-full h-full bg-[#B63198] flex flex-col items-center justify-center -mx-4 -my-4 px-4 py-4 rounded-xl overflow-hidden">
            {/* Note: User image shows a specific bubble background, approximating with CSS circles here until actual asset is provided */}
            <div class="absolute inset-0 opacity-10">
              <div class="w-24 h-24 rounded-full bg-white absolute top-10 left-10" />
              <div class="w-16 h-16 rounded-full bg-white absolute bottom-20 right-10" />
              <div class="w-32 h-32 rounded-full bg-white absolute top-1/3 right-1/4" />
            </div>

            <div class="z-10 bg-[#EAD5F0] rounded-[60px] px-8 py-6 flex flex-col items-center justify-center shadow-lg relative transform -rotate-2 hover:rotate-0 transition-transform">
              <div class="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-[#EAD5F0] border-4 border-[#B63198]" />
              <h2
                class="text-[#9663D7] font-[Fredoka] font-bold"
                style={{ fontSize: format === "mini" ? "2.5rem" : "3.5rem" }}
              >
                Babbl
              </h2>
              <div class="w-full h-1 bg-white/50 rounded-full my-1" />
              <span
                class="text-white font-[Fredoka] font-medium"
                style={{ fontSize: format === "mini" ? "1.5rem" : "2rem" }}
              >
                Book
              </span>
            </div>
          </div>
        )}

        {/* --- 1. Circle Image --- */}
        {page.layout_style === "circle_image" && page.quote && (
          <div class="relative w-full h-full -mx-4 -my-4 rounded-xl overflow-hidden">
            <img
              src={page.quote?.photo_url ||
                "https://placehold.co/600x600/ddd/999"}
              alt="Background"
              class="absolute inset-0 w-full h-full object-cover"
            />
            {/* Darker overlay to make text readable */}
            <div class="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

            <div class="absolute bottom-6 left-6 right-6 top-auto z-10 bg-white rounded-3xl p-6 shadow-2xl">
              <div class="absolute -top-6 -right-2 w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                <img
                  src={page.quote?.child?.avatar_url ||
                    "https://placehold.co/100x100/A020F0/FFF"}
                  class="w-full h-full object-cover"
                />
              </div>

              <h3
                class="font-[Fredoka] text-[#9663D7] leading-snug mb-4 pr-10"
                style={{ fontSize: format === "mini" ? "1.5rem" : "2rem" }}
              >
                "{page.quote.text}"
              </h3>

              <div class="flex items-center gap-2">
                <span class="text-[#FF6B6B] font-bold text-sm">
                  {new Date(page.quote.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} at Home
                </span>
                <span class="text-[#FF6B6B] opacity-50 mx-1">-</span>
                <span class="text-[#9663D7] font-bold text-sm">
                  {page.quote.child?.name} (5 yrs)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. Quote top, image bottom --- */}
        {page.layout_style === "quote_top_image_bottom" && page.quote && (
          <div class="relative w-full h-full -mx-4 -my-4 rounded-xl overflow-hidden bg-white flex flex-col">
            <div class="h-[60%] w-full relative">
              <img
                src={page.quote?.photo_url ||
                  "https://placehold.co/600x400/ddd/999"}
                alt="Top Photo"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="h-[40%] w-full bg-[#B63198] rounded-t-[40px] -mt-10 relative z-10 px-8 py-8 flex flex-col justify-center">
              <div class="absolute -top-6 right-8 w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                <img
                  src={page.quote?.child?.avatar_url ||
                    "https://placehold.co/100x100/A020F0/FFF"}
                  class="w-full h-full object-cover"
                />
              </div>

              <h3
                class="font-[Fredoka] text-white leading-snug mb-4"
                style={{ fontSize: format === "mini" ? "1.2rem" : "1.6rem" }}
              >
                "{page.quote.text}"
              </h3>
              <div class="text-[#FFB6C1] font-medium text-xs">
                {new Date(page.quote.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })} at Home
              </div>
              
              {page.quote.context && page.show_context !== false && (
                <div class="mt-4 bg-white/20 p-3 rounded-lg">
                  <p class="text-white text-xs italic">{page.quote.context}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 3. Full page photo, quote centered --- */}
        {page.layout_style === "full_page_photo_quote_centered" && page.quote && (
          <div class="relative w-full h-full -mx-4 -my-4 rounded-xl overflow-hidden bg-white flex flex-col">
            <div class="h-[55%] w-full relative px-8 pt-8 flex flex-col justify-center">
              <h3
                class="font-[Fredoka] text-[#9663D7] leading-snug mb-2 z-10"
                style={{ fontSize: format === "mini" ? "1.5rem" : "2rem" }}
              >
                "{page.quote.text}"
              </h3>
              {page.quote.context && page.show_context !== false && (
                <p class="text-gray-500 text-xs italic z-10 mb-2">{page.quote.context}</p>
              )}
            </div>
            <div class="absolute top-[48%] left-8 z-20 flex items-center bg-white px-4 py-2 rounded-full border-2 border-slate-100 shadow-sm">
              <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img
                  src={page.quote?.child?.avatar_url ||
                    "https://placehold.co/100x100/A020F0/FFF"}
                  class="w-full h-full object-cover"
                />
              </div>
              <span class="text-[#FF6B6B] font-bold text-sm">
                {page.quote.child?.name} (5 yrs)
              </span>
            </div>

            <div class="h-[45%] w-full relative z-10">
              <div
                class="absolute inset-x-0 -top-8 h-16 bg-white shrink-0"
                style={{ clipPath: "ellipse(60% 100% at 50% 0%)" }}
              />
              <img
                src={page.quote?.photo_url ||
                  "https://placehold.co/600x400/ddd/999"}
                alt="Bottom Photo"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* --- 4. Full width photo top, quote bottom --- */}
        {page.layout_style === "full_width_photo_top_quote_bottom" && page.quote && (
          <div class="relative w-full h-full -mx-4 -my-4 rounded-xl overflow-hidden bg-white flex flex-col px-4 pt-12 pb-6">
            <div class="h-[65%] w-full relative rounded-[40px] overflow-hidden border-4 border-[#C11079] shadow-lg">
              <img
                src={page.quote?.photo_url ||
                  "https://placehold.co/600x500/ddd/999"}
                alt="Main Photo"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="flex-1 w-full flex flex-col justify-center px-4 relative mt-2">
              <h3
                class="font-[Fredoka] text-[#9663D7] leading-snug mb-2 text-center"
                style={{ fontSize: format === "mini" ? "1.2rem" : "1.6rem" }}
              >
                "{page.quote.text}"
              </h3>

              {page.quote.context && page.show_context !== false && (
                <p class="text-xs text-gray-500 italic text-center mb-2 px-6">{page.quote.context}</p>
              )}

              <div class="flex items-center justify-end gap-3 w-full">
                <div class="text-[#FF6B6B] font-bold text-sm text-right">
                  {page.quote.child?.name} (5 yrs) <br />
                  <span class="text-xs font-normal opacity-70">
                    {new Date(page.quote.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} at Home
                  </span>
                </div>
                <div class="w-12 h-12 rounded-full border-2 border-[#FF6B6B] overflow-hidden bg-white shadow-sm shrink-0">
                  <img
                    src={page.quote?.child?.avatar_url ||
                      "https://placehold.co/100x100/A020F0/FFF"}
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 5. Full screen photo, short quote --- */}
        {page.layout_style === "full_screen_photo_short_quote" && page.quote && (
          <div class="relative w-full h-full -mx-4 -my-4 rounded-xl overflow-hidden bg-white flex flex-col">
            <div class="h-[30%] w-full bg-white px-8 pt-6 flex flex-col justify-center relative z-20">
              <div class="absolute -bottom-6 right-8 w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white z-30">
                <img
                  src={page.quote?.child?.avatar_url ||
                    "https://placehold.co/100x100/A020F0/FFF"}
                  class="w-full h-full object-cover"
                />
              </div>
              <h3
                class="font-[Fredoka] text-[#9663D7] leading-snug pr-20"
                style={{ fontSize: format === "mini" ? "1.3rem" : "1.8rem" }}
              >
                "{page.quote.text}"
              </h3>
              <div class="text-[#FFB6C1] font-medium text-xs mt-2">
                {page.quote.child?.name} (5 yrs) <br />
                {new Date(page.quote.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })} at Home
              </div>
            </div>

            <div class="h-[70%] w-full relative z-10">
              <img
                src={page.quote?.photo_url ||
                  "https://placehold.co/600x600/ddd/999"}
                alt="Action Photo"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* --- 6. Photo window top, quote bottom --- */}
        {page.layout_style === "photo_window_top_quote_bottom" && page.quote && (
          <div class="relative w-full h-full -mx-4 -my-4 rounded-xl overflow-hidden bg-white">
            <img
              src={page.quote?.photo_url ||
                "https://placehold.co/600x800/ddd/999"}
              alt="Background"
              class="absolute inset-0 w-full h-full object-cover"
            />

            <div class="absolute bottom-0 inset-x-0 h-[45%] bg-white rounded-t-[100px] shadow-[0_-10px_20px_rgba(0,0,0,0.1)] px-8 py-10 flex flex-col items-center text-center">
              <h3
                class="font-[Fredoka] text-[#9663D7] leading-snug mb-4"
                style={{ fontSize: format === "mini" ? "2rem" : "2.5rem" }}
              >
                "{page.quote.text}"
              </h3>

              <div class="flex items-center gap-3">
                <span class="text-[#9663D7] font-bold">
                  {page.quote.child?.name} (5 yrs)
                </span>
                <span class="text-xs text-gray-400">
                  {new Date(page.quote.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} at Home
                </span>
              </div>
            </div>

            <div class="absolute top-8 left-8 bg-white/20 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full shadow-lg flex items-center">
              <div class="w-6 h-6 rounded-full overflow-hidden mr-2 shrink-0 border border-white">
                <img
                  src={page.quote?.child?.avatar_url ||
                    "https://placehold.co/100x100/A020F0/FFF"}
                  class="w-full h-full object-cover"
                />
              </div>
              <span class="text-white font-bold tracking-wider uppercase text-[10px]">
                {page.quote.child?.name}
              </span>
            </div>
          </div>
        )}

        {/* --- 7. Quote only, centered --- */}
        {page.layout_style === "quote_only_centered" && page.quote && (
          <div class="relative w-full h-full -mx-4 -my-4 rounded-xl overflow-hidden bg-white flex flex-col items-center py-12 px-8">
            <div class="w-32 h-32 rounded-full border-4 border-white shadow-[0_10px_30px_rgba(182,49,152,0.2)] overflow-hidden shrink-0 z-20">
              <img
                src={page.quote?.child?.avatar_url ||
                  "https://placehold.co/200x200/ddd/999"}
                class="w-full h-full object-cover"
              />
            </div>

            <div class="flex-1 flex flex-col items-center justify-center -mt-6">
              <h3
                class="font-[Fredoka] text-[#9663D7] leading-snug text-center mb-6"
                style={{ fontSize: format === "mini" ? "1.8rem" : "2.2rem" }}
              >
                "{page.quote.text}"
              </h3>

              <div
                class="text-[#FF6B6B] font-bold text-center uppercase tracking-widest"
                style={{ fontSize: format === "mini" ? "0.9rem" : "1.1rem" }}
              >
                {page.quote.child?.name} (5 yrs)
              </div>
            </div>

            {page.quote.context && page.show_context !== false && (
              <div class="w-full bg-[#B63198] h-16 absolute bottom-0 inset-x-0 flex items-center px-6 border-t-[6px] border-[#FF6B6B]">
                <div class="w-8 h-8 rounded-full overflow-hidden mr-3 border-2 border-white shrink-0">
                  <img
                    src={page.quote?.parent?.avatar_url ||
                      "https://placehold.co/100x100/ccc/fff"}
                    class="w-full h-full object-cover"
                  />
                </div>
                <p class="text-white text-[10px] leading-tight flex-1 opacity-90">
                  {page.quote.context ||
                    `Where to even begin with this one. I was just sitting there, looking at Facebook on my phone, when all of a sudden she says this. I was disturbed, but it also made me think.`}
                </p>
                <span class="text-white font-bold text-[9px] ml-4 shrink-0 bg-white/20 px-2 py-1 rounded">
                  {new Date(page.quote.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Fallback layout if unrecognized or missing quote and not a cover */}
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
          <p class="text-gray-400 italic text-center">
            Unrecognized Layout: {page.layout_style}
          </p>
        )}
      </div>
    </div>
  );
}
