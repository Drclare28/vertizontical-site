import { BOOK_DIMENSIONS, BookFormat, BookPageData, THEMES } from "../_data.ts";

interface PageRendererProps {
  format: BookFormat;
  page: BookPageData;
  themeId?: string;
}

export default function PageRenderer(
  { format, page, themeId = "playful_pastel" }: PageRendererProps,
) {
  const dimensions = BOOK_DIMENSIONS[format];
  const theme = THEMES[themeId] || THEMES.playful_pastel;

  // Gelato recommends a safe print area (e.g., margins to avoid crucial text being cut off)
  // Usually around 0.125" to 0.25". Let's use 0.25" for a comfortable safe zone.
  const safeAreaMarginInches = 0.25;

  return (
    <div
      class={`shadow-xl relative overflow-hidden shrink-0 ${theme.bgColor} ${theme.fontFamily}`}
      style={{
        width: `${dimensions.widthInches}in`,
        height: `${dimensions.heightInches}in`,
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
        {/* Placeholder Layout Logic */}
        {page.layout_style === "single_quote_large" && page.quote && (
          <div class="text-center">
            <h2
              class={`${theme.textColor} leading-relaxed`}
              style={{ fontSize: format === "mini" ? "1.5rem" : "2.2rem" }}
            >
              "{page.quote.text}"
            </h2>
            <div
              class={`mt-6 ${theme.textColor} opacity-60 font-sans tracking-wide uppercase text-sm`}
            >
              — {page.quote.child?.name || "Anonymous"},{" "}
              {new Date(page.quote.date).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </div>
            {page.quote.context && (
              <p class={`mt-4 ${theme.textColor} opacity-40 italic text-sm`}>
                Context: {page.quote.context}
              </p>
            )}
          </div>
        )}

        {page.layout_style === "quote_with_avatar" && page.quote && (
          <div class="flex flex-col items-center text-center">
            {page.quote.child?.avatar_url && (
              <img
                src={page.quote.child.avatar_url}
                class="w-24 h-24 rounded-full border-4 border-white shadow-lg mb-6 object-cover"
                alt={page.quote.child.name}
              />
            )}
            <h2
              class={`${theme.textColor} italic font-serif leading-relaxed mb-4`}
              style={{ fontSize: format === "mini" ? "1.25rem" : "1.75rem" }}
            >
              "{page.quote.text}"
            </h2>
            <div class={`font-bold ${theme.textColor} tracking-tight`}>
              {page.quote.child?.name}
            </div>
          </div>
        )}

        {page.layout_style === "text_only_split" && page.quote && (
          <div class="w-full h-full flex flex-col justify-between py-8">
            <div class="text-left w-3/4">
              <h3
                class="font-serif text-gray-800 leading-normal"
                style={{ fontSize: format === "mini" ? "1.25rem" : "1.75rem" }}
              >
                "{page.quote.text}"
              </h3>
            </div>
            <div class="text-right self-end mt-auto opacity-70">
              <span class="font-bold text-gray-700 block">
                {page.quote.child?.name}
              </span>
              <span class="text-sm text-gray-500">
                {new Date(page.quote.date).getFullYear()}
              </span>
            </div>
          </div>
        )}

        {/* Fallback layout if unrecognized or missing quote */}
        {!page.quote && (
          <p class="text-gray-400 italic">
            Empty Page Component [{page.layout_style}]
          </p>
        )}
      </div>
    </div>
  );
}
